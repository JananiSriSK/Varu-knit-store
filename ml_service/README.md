# AI/ML Service for Varu's Knit Store

## Overview
Advanced machine learning service providing intelligent recommendations, smart search, and AI-powered chatbot functionality.

## Features

### 🤖 AI-Powered Recommendations
- **Content-Based Filtering**: Uses TF-IDF vectorization and cosine similarity
- **Collaborative Filtering**: Analyzes user behavior patterns
- **Personalized Suggestions**: ML-driven user preference analysis

### 🔍 Smart Search
- **Semantic Search**: NLP-powered query understanding
- **Intent Classification**: BART model for query intent detection
- **Fuzzy Matching**: Handles typos and partial matches
- **Contextual Suggestions**: AI-generated search suggestions

### 💬 Intelligent Chatbot
- **Sentiment Analysis**: DistilBERT for emotion detection
- **Intent Recognition**: Zero-shot classification
- **Contextual Responses**: Personalized based on user history
- **Multi-turn Conversations**: Maintains conversation context

### 📊 User Behavior Analytics
- **Clustering Analysis**: K-means for user segmentation
- **Engagement Scoring**: ML-based user engagement metrics
- **Behavioral Patterns**: Advanced pattern recognition

## ML Models Used

1. **TF-IDF Vectorizer**: Text feature extraction
2. **Cosine Similarity**: Product similarity calculation
3. **DistilBERT**: Sentiment analysis
4. **BART**: Zero-shot text classification
5. **K-Means**: User clustering and segmentation

## Installation

```bash
pip install -r requirements.txt
python app.py
```

## API Endpoints

### Recommendations
- `GET /recommendations/frequently-bought-together/<product_id>` - AI product recommendations
- `GET /recommendations/personalized/<user_id>` - Personalized user recommendations

### Search
- `POST /search/smart` - AI-powered semantic search
- `POST /search/suggestions` - Intelligent search suggestions

### Chatbot
- `POST /chat` - AI chatbot with sentiment analysis

### Analytics
- `POST /analytics/user-behavior` - User behavior analysis

### Health
- `GET /health` - Service status and model information

## Performance Features

- **Caching**: 30-minute product cache for performance
- **Batch Processing**: Efficient bulk operations
- **Model Optimization**: Lightweight models for fast inference
- **Fallback Logic**: Rule-based fallbacks for ML failures

## Technical Stack

- **Flask**: Web framework
- **scikit-learn**: Machine learning algorithms
- **Transformers**: Pre-trained NLP models
- **NumPy/Pandas**: Data processing
- **CORS**: Cross-origin support