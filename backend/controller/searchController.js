import Product from "../models/productModel.js";

// Fuzzy search implementation
const fuzzyMatch = (query, text, threshold = 0.6) => {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match
  if (textLower.includes(queryLower)) return 1;
  
  // Levenshtein distance for fuzzy matching
  const distance = levenshteinDistance(queryLower, textLower);
  const maxLength = Math.max(queryLower.length, textLower.length);
  const similarity = 1 - (distance / maxLength);
  
  return similarity >= threshold ? similarity : 0;
};

const levenshteinDistance = (str1, str2) => {
  const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,
        matrix[j][i - 1] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Smart search with fuzzy matching
export const smartSearch = async (req, res) => {
  try {
    const { query, category } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    // Get all products
    let products = await Product.find({});
    
    // Filter by category if provided
    if (category && category !== '') {
      products = products.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Score products based on fuzzy matching
    const scoredProducts = products.map(product => {
      const nameScore = fuzzyMatch(query, product.name);
      const descScore = fuzzyMatch(query, product.description, 0.4);
      const categoryScore = fuzzyMatch(query, product.category, 0.5);
      
      const totalScore = nameScore * 0.6 + descScore * 0.3 + categoryScore * 0.1;
      
      return { product, score: totalScore };
    }).filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    const results = scoredProducts.map(item => item.product);

    res.status(200).json({
      success: true,
      products: results,
      count: results.length,
      query: query
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get search suggestions
export const getSearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(200).json({
        success: true,
        suggestions: []
      });
    }

    const products = await Product.find({}).select('name category');
    
    const suggestions = new Set();
    
    products.forEach(product => {
      // Add product names that match
      if (fuzzyMatch(query, product.name, 0.5) > 0) {
        suggestions.add(product.name);
      }
      
      // Add categories that match
      if (fuzzyMatch(query, product.category, 0.5) > 0) {
        suggestions.add(product.category);
      }
    });

    // Add common search terms
    const commonTerms = ['sweater', 'scarf', 'hat', 'blanket', 'cardigan', 'mittens'];
    commonTerms.forEach(term => {
      if (fuzzyMatch(query, term, 0.6) > 0) {
        suggestions.add(term);
      }
    });

    res.status(200).json({
      success: true,
      suggestions: Array.from(suggestions).slice(0, 8)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};