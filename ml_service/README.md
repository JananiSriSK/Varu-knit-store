# 🤖 ML Service - Advanced AI/ML for Varu's Knit Store

This Flask-based ML service provides advanced AI/ML capabilities for the ecommerce platform.

## 🚀 Features

### 1. **Advanced Product Recommendations**
- **Collaborative Filtering**: Uses SVD (Singular Value Decomposition) for matrix factorization
- **Content-Based Filtering**: TF-IDF vectorization for product similarity
- **Market Basket Analysis**: Association rules for frequently bought together items
- **Fallback Systems**: Ensures recommendations even with minimal data

### 2. **Smart Search Engine**
- **Semantic Search**: TF-IDF + Cosine similarity for meaning-based search
- **Fuzzy Matching**: Levenshtein distance for typo tolerance
- **Multi-field Search**: Searches across name, description, category
- **Real-time Suggestions**: NLP-powered autocomplete

### 3. **Intelligent Chatbot**
- **Intent Recognition**: Keyword-based intent classification
- **Contextual Responses**: Dynamic response generation
- **Multi-turn Conversations**: Maintains conversation context
- **Extensible**: Easy to add new intents and responses

## 📦 Installation

### Prerequisites
- Python 3.8+
- pip package manager

### Quick Start
```bash
# Navigate to ml_service directory
cd ml_service

# Install dependencies and run
python run.py --install

# Or manually:
pip install -r requirements.txt
python app.py
```

## 🔧 API Endpoints

### Recommendations
```http
GET /recommendations/frequently-bought-together/<product_id>
GET /recommendations/personalized/<user_id>
```

### Search
```http
POST /search/smart
Content-Type: application/json
{
  "query": "blue sweater",
  "category": "women"
}

POST /search/suggestions
Content-Type: application/json
{
  "query": "swe"
}
```

### Chatbot
```http
POST /chat
Content-Type: application/json
{
  "message": "What's my order status?",
  "userId": "user123"
}
```

## 🧠 ML Algorithms Used

### 1. **Collaborative Filtering**
- **Algorithm**: Truncated SVD (Singular Value Decomposition)
- **Library**: scikit-learn
- **Purpose**: Find users with similar purchase patterns
- **Advantage**: Discovers hidden patterns in user behavior

### 2. **Content-Based Filtering**
- **Algorithm**: TF-IDF + Cosine Similarity
- **Library**: scikit-learn
- **Purpose**: Find products similar to user's preferences
- **Advantage**: Works well for new products

### 3. **Semantic Search**
- **Algorithm**: TF-IDF Vectorization + Cosine Similarity
- **Library**: scikit-learn
- **Purpose**: Understand search intent beyond keywords
- **Advantage**: Handles synonyms and related terms

### 4. **Fuzzy String Matching**
- **Algorithm**: Levenshtein Distance
- **Implementation**: Custom Python function
- **Purpose**: Handle typos and spelling errors
- **Advantage**: Improves search recall

## 🔄 Integration Architecture

```
React Frontend → Node.js API → Flask ML Service → MongoDB
                     ↓              ↓
              (Business Logic)  (ML Processing)
```

## 📊 Performance Features

- **Caching**: Results cached for better performance
- **Fallback Systems**: Always returns results even with minimal data
- **Scalable**: Can be deployed on separate ML servers
- **Extensible**: Easy to add new ML models

## 🛠 Development

### Adding New ML Models
1. Create new class in `app.py`
2. Add endpoint route
3. Update Node.js proxy in `aiRoutes.js`
4. Test with sample data

### Enhancing Algorithms
- Replace TF-IDF with Word2Vec/BERT embeddings
- Add deep learning models with TensorFlow/PyTorch
- Implement reinforcement learning for recommendations
- Add A/B testing framework

## 🚀 Production Deployment

### Docker Deployment
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5001
CMD ["python", "app.py"]
```

### Environment Variables
```bash
MONGODB_API_BASE=http://localhost:5000/api/v1
FLASK_ENV=production
FLASK_DEBUG=False
```

## 📈 Monitoring & Analytics

- **Request Logging**: All ML requests logged
- **Performance Metrics**: Response times tracked
- **Model Accuracy**: Recommendation click-through rates
- **Error Handling**: Graceful fallbacks for all failures

## 🔮 Future Enhancements

1. **Deep Learning Models**
   - Neural Collaborative Filtering
   - Transformer-based search
   - BERT for chatbot NLU

2. **Advanced Features**
   - Real-time personalization
   - Multi-armed bandit optimization
   - Seasonal trend analysis
   - Cross-domain recommendations

3. **MLOps Integration**
   - Model versioning
   - A/B testing framework
   - Automated retraining
   - Performance monitoring