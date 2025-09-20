from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

MONGODB_API_BASE = 'http://localhost:5000/api/v1'

def get_all_products():
    try:
        all_products = []
        page = 1
        
        while True:
            url = f"{MONGODB_API_BASE}/products?page={page}&limit=20"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if 'products' in data and data['products']:
                    all_products.extend(data['products'])
                    # Check if there are more pages
                    if page >= data.get('totalPages', 1):
                        break
                    page += 1
                else:
                    break
            else:
                break
        
        print(f"Fetched {len(all_products)} products total")
        return all_products
    except Exception as e:
        print(f"Error fetching products: {e}")
        return []

@app.route('/recommendations/frequently-bought-together/<product_id>')
def frequently_bought_together(product_id):
    try:
        products = get_all_products()
        if not products:
            return jsonify({'success': True, 'recommendations': []})
        
        target_product = next((p for p in products if str(p['_id']) == product_id), None)
        if not target_product:
            return jsonify({'success': True, 'recommendations': []})
        
        recommendations = []
        target_category = target_product['category']
        target_subcategory = target_product.get('subcategory', '')
        
        # Priority 1: Same subcategory, different products
        if target_subcategory:
            same_subcategory = [str(p['_id']) for p in products 
                              if p.get('subcategory') == target_subcategory and str(p['_id']) != product_id]
            recommendations.extend(same_subcategory[:3])
        
        # Priority 2: Same category, different subcategory
        if len(recommendations) < 5:
            same_category = [str(p['_id']) for p in products 
                           if p['category'] == target_category and 
                           p.get('subcategory') != target_subcategory and 
                           str(p['_id']) != product_id and 
                           str(p['_id']) not in recommendations]
            recommendations.extend(same_category[:5-len(recommendations)])
        
        # Priority 3: Popular products from other categories
        if len(recommendations) < 5:
            other_products = [str(p['_id']) for p in products 
                            if p['category'] != target_category and 
                            str(p['_id']) not in recommendations]
            recommendations.extend(other_products[:5-len(recommendations)])
        
        return jsonify({'success': True, 'recommendations': recommendations[:5]})
    except Exception as e:
        return jsonify({'success': False, 'recommendations': [], 'error': str(e)})

@app.route('/recommendations/personalized/<user_id>')
def personalized_recommendations(user_id):
    try:
        products = get_all_products()
        if not products:
            return jsonify({'success': True, 'recommendations': []})
        
        # Return top rated products
        sorted_products = sorted(products, key=lambda x: x.get('ratings', 0), reverse=True)
        recommended_ids = [str(p['_id']) for p in sorted_products[:8]]
        
        return jsonify({'success': True, 'recommendations': recommended_ids})
    except Exception as e:
        return jsonify({'success': False, 'recommendations': [], 'error': str(e)})

@app.route('/search/smart', methods=['POST'])
def smart_search():
    try:
        data = request.get_json(force=True)
        query = data.get('query', '').lower()
        
        if not query:
            return jsonify({'success': False, 'products': []})
        
        products = get_all_products()
        if not products:
            return jsonify({'success': False, 'products': []})
        
        # Enhanced text search with partial matching
        results = []
        query_words = query.split()
        
        for product in products:
            score = 0
            name_lower = product['name'].lower()
            desc_lower = product['description'].lower()
            category_lower = product['category'].lower()
            subcategory_lower = product.get('subcategory', '').lower()
            
            # Exact match in name (highest priority)
            if query in name_lower:
                score += 10
            
            # Word matches in name
            for word in query_words:
                if word in name_lower:
                    score += 5
            
            # Category/subcategory matches
            if query in category_lower or query in subcategory_lower:
                score += 3
            
            # Description matches
            if query in desc_lower:
                score += 2
            
            # Partial word matches
            for word in query_words:
                if any(word in w for w in name_lower.split()):
                    score += 1
            
            if score > 0:
                results.append((product, score))
        
        # Sort by relevance score
        results.sort(key=lambda x: x[1], reverse=True)
        final_results = [product for product, score in results]
        
        return jsonify({'success': True, 'products': final_results, 'count': len(final_results)})
    except Exception as e:
        return jsonify({'success': False, 'products': [], 'error': str(e)})

@app.route('/search/suggestions', methods=['POST'])
def search_suggestions():
    try:
        data = request.get_json(force=True)
        query = data.get('query', '').lower()
        
        if len(query) < 2:
            return jsonify({'success': True, 'suggestions': []})
        
        products = get_all_products()
        suggestions = set()
        
        # Get suggestions from actual products
        for product in products:
            name_words = product['name'].lower().split()
            for word in name_words:
                if query in word and len(word) > 2:
                    suggestions.add(word)
            
            if query in product['name'].lower():
                suggestions.add(product['name'])
        
        # Add common terms
        common_terms = ['sweater', 'scarf', 'hat', 'blanket', 'cardigan', 'mittens', 'top', 'polo']
        for term in common_terms:
            if query in term:
                suggestions.add(term)
        
        return jsonify({'success': True, 'suggestions': list(suggestions)[:8]})
    except Exception as e:
        return jsonify({'success': True, 'suggestions': []})

@app.route('/chat', methods=['POST'])
def chatbot():
    try:
        data = request.get_json(force=True)
        message = data.get('message', '').lower()
        
        if 'order' in message:
            response = "Check your orders in 'My Profile' section."
            suggestions = ["View orders", "Track order"]
        elif 'shipping' in message:
            response = "Free shipping on orders above ₹1000. Delivery in 3-5 days."
            suggestions = ["Shipping info", "Delivery time"]
        else:
            response = "Hello! How can I help you today?"
            suggestions = ["Order status", "Shipping info"]
        
        return jsonify({'success': True, 'response': response, 'suggestions': suggestions})
    except:
        return jsonify({'success': False, 'response': 'Error occurred'})

@app.route('/health')
def health():
    return jsonify({'status': 'ML service running', 'success': True})

if __name__ == '__main__':
    print('Starting simple ML service on port 5001...')
    app.run(debug=True, port=5001, host='0.0.0.0')