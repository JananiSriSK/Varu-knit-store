from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

MONGODB_API_BASE = 'http://localhost:5000/api/v1'

# Simple caching
cache = {'products': [], 'last_updated': None}

def get_all_products():
    """Fetch products with simple caching"""
    try:
        if (cache['last_updated'] and 
            datetime.now() - cache['last_updated'] < timedelta(minutes=30)):
            return cache['products']
        
        all_products = []
        page = 1
        
        while True:
            url = f"{MONGODB_API_BASE}/products?page={page}&limit=20"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if 'products' in data and data['products']:
                    all_products.extend(data['products'])
                    if page >= data.get('totalPages', 1):
                        break
                    page += 1
                else:
                    break
            else:
                break
        
        cache['products'] = all_products
        cache['last_updated'] = datetime.now()
        
        print(f"Fetched {len(all_products)} products")
        return all_products
    except Exception as e:
        print(f"Error fetching products: {e}")
        return cache['products'] if cache['products'] else []

def calculate_similarity(text1, text2):
    """Simple text similarity"""
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())
    
    if not words1 or not words2:
        return 0
    
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    
    return len(intersection) / len(union) if union else 0

def analyze_sentiment(text):
    """Simple sentiment analysis"""
    positive_words = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'beautiful', 'wonderful', 'fantastic', 'awesome']
    negative_words = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst', 'disappointing', 'poor', 'useless']
    
    text_lower = text.lower()
    pos_count = sum(1 for word in positive_words if word in text_lower)
    neg_count = sum(1 for word in negative_words if word in text_lower)
    
    if pos_count > neg_count:
        return 'POSITIVE', 0.7 + (pos_count - neg_count) * 0.1
    elif neg_count > pos_count:
        return 'NEGATIVE', 0.7 + (neg_count - pos_count) * 0.1
    else:
        return 'NEUTRAL', 0.5

def classify_intent(text):
    """Enhanced intent classification"""
    text_lower = text.lower()
    
    if any(word in text_lower for word in ['order', 'purchase', 'buy', 'track', 'delivery', 'status']):
        return 'order_inquiry', 0.8
    elif any(word in text_lower for word in ['shipping', 'delivery', 'when', 'arrive', 'ship']):
        return 'shipping_question', 0.8
    elif any(word in text_lower for word in ['product', 'item', 'quality', 'material', 'size']):
        return 'product_question', 0.8
    elif any(word in text_lower for word in ['payment', 'pay', 'qr', 'upi', 'money']):
        return 'payment_question', 0.8
    elif any(word in text_lower for word in ['return', 'refund', 'exchange', 'replace']):
        return 'return_refund', 0.8
    elif any(word in text_lower for word in ['account', 'login', 'password', 'profile']):
        return 'account_help', 0.8
    elif any(word in text_lower for word in ['store', 'contact', 'phone', 'email', 'address']):
        return 'store_info', 0.8
    elif any(word in text_lower for word in ['problem', 'issue', 'complaint', 'wrong', 'error']):
        return 'complaint', 0.8
    elif any(word in text_lower for word in ['thank', 'thanks', 'great', 'excellent', 'love']):
        return 'compliment', 0.8
    elif any(word in text_lower for word in ['hello', 'hi', 'hey', 'good morning', 'good evening']):
        return 'greeting', 0.9
    elif any(word in text_lower for word in ['help', 'assist', 'support', 'guide']):
        return 'help_request', 0.7
    else:
        return 'unknown', 0.3

@app.route('/recommendations/frequently-bought-together/<product_id>')
def frequently_bought_together(product_id):
    try:
        products = get_all_products()
        if not products:
            return jsonify({'success': True, 'recommendations': []})
        
        target_product = next((p for p in products if str(p['_id']) == product_id), None)
        if not target_product:
            return jsonify({'success': True, 'recommendations': []})
        
        target_text = f"{target_product['name']} {target_product['description']} {target_product['category']}"
        
        scored_products = []
        for product in products:
            if str(product['_id']) == product_id:
                continue
            
            product_text = f"{product['name']} {product['description']} {product['category']}"
            similarity = calculate_similarity(target_text, product_text)
            
            if product['category'] == target_product['category']:
                similarity += 0.3
            
            if similarity > 0.1:
                scored_products.append((str(product['_id']), similarity))
        
        scored_products.sort(key=lambda x: x[1], reverse=True)
        recommendations = [pid for pid, score in scored_products[:5]]
        
        return jsonify({'success': True, 'recommendations': recommendations})
    except Exception as e:
        return jsonify({'success': False, 'recommendations': [], 'error': str(e)})

@app.route('/recommendations/personalized/<user_id>')
def personalized_recommendations(user_id):
    try:
        products = get_all_products()
        if not products:
            return jsonify({'success': True, 'recommendations': []})
        
        # Popular products for now
        sorted_products = sorted(products, 
                               key=lambda x: (x.get('ratings', 0) * x.get('numberOfReviews', 1)), 
                               reverse=True)
        recommendations = [str(p['_id']) for p in sorted_products[:8]]
        
        return jsonify({'success': True, 'recommendations': recommendations})
    except Exception as e:
        return jsonify({'success': False, 'recommendations': [], 'error': str(e)})

@app.route('/search/smart', methods=['POST'])
def smart_search():
    try:
        data = request.get_json(force=True)
        query = data.get('query', '').lower().strip()
        
        if not query:
            return jsonify({'success': False, 'products': []})
        
        products = get_all_products()
        if not products:
            return jsonify({'success': False, 'products': []})
        
        results = []
        for product in products:
            score = 0
            name_lower = product['name'].lower()
            desc_lower = product['description'].lower()
            
            if query in name_lower:
                score += 10
            if query in desc_lower:
                score += 5
            
            for word in query.split():
                if word in name_lower:
                    score += 3
                if word in desc_lower:
                    score += 1
            
            if score > 0:
                results.append((product, score))
        
        results.sort(key=lambda x: x[1], reverse=True)
        final_results = [product for product, score in results[:20]]
        
        return jsonify({'success': True, 'products': final_results, 'count': len(final_results)})
    except Exception as e:
        return jsonify({'success': False, 'products': [], 'error': str(e)})

@app.route('/search/suggestions', methods=['POST'])
def search_suggestions():
    try:
        data = request.get_json(force=True)
        query = data.get('query', '').lower().strip()
        
        if len(query) < 2:
            return jsonify({'success': True, 'suggestions': []})
        
        products = get_all_products()
        suggestions = set()
        
        for product in products:
            if query in product['name'].lower():
                suggestions.add(product['name'])
            if query in product['category'].lower():
                suggestions.add(product['category'])
        
        final_suggestions = sorted(list(suggestions))[:8]
        return jsonify({'success': True, 'suggestions': final_suggestions})
    except Exception as e:
        return jsonify({'success': True, 'suggestions': []})

@app.route('/chat', methods=['POST'])
def chatbot():
    try:
        data = request.get_json(force=True)
        message = data.get('message', '').strip()
        user_id = data.get('userId')
        
        if not message:
            return jsonify({'success': False, 'response': 'Please enter a message'})
        
        sentiment, sentiment_score = analyze_sentiment(message)
        intent, intent_confidence = classify_intent(message)
        
        message_lower = message.lower()
        
        if intent == 'greeting':
            response = "Hello! Welcome to Varu's Knit Store! I'm your AI assistant, here to help you with any questions about our handmade crochet and knitted items. How can I assist you today?"
            suggestions = ["View products", "Order help", "Shipping info", "Contact support"]
        
        elif intent == 'order_inquiry':
            if user_id:
                response = "I can help you with your orders! You can view all your orders in the 'My Profile' section. For order tracking or status updates, please check your order details there."
                suggestions = ["View my orders", "Track order", "Order status", "Contact support"]
            else:
                response = "To check your orders, please log in to your account and visit the 'My Profile' section. If you need immediate help, contact our support team."
                suggestions = ["Login", "Create account", "Contact support", "Order help"]
        
        elif intent == 'shipping_question':
            response = "We offer FREE shipping on orders above ₹999! Orders typically arrive within 3-5 business days. For orders below ₹999, shipping costs ₹100. Need more details? Contact our support team."
            suggestions = ["Shipping policy", "Delivery time", "Track package", "Contact support"]
        
        elif intent == 'product_question':
            response = "All our products are handmade with love and care! Each item is crafted using high-quality materials. You can find detailed descriptions and customer reviews on each product page. Need specific product info? Contact our team."
            suggestions = ["View products", "Material info", "Size guide", "Contact support"]
        
        elif intent == 'payment_question':
            response = "We accept payments via UPI using our QR code (varuknits@paytm). After payment, please upload the screenshot for verification. Our team will confirm your order once payment is verified."
            suggestions = ["Payment help", "QR code info", "Upload screenshot", "Contact support"]
        
        elif intent == 'return_refund':
            response = "For returns, refunds, or exchanges, please contact our support team at varalakshmikutti76@gmail.com or call +91 9944610600. We'll be happy to assist you with your specific situation."
            suggestions = ["Return policy", "Refund info", "Contact support", "Exchange help"]
        
        elif intent == 'account_help':
            response = "For account-related issues like login problems, password reset, or profile updates, please contact our support team. They can help you resolve any account issues quickly."
            suggestions = ["Login help", "Password reset", "Contact support", "Account info"]
        
        elif intent == 'store_info':
            response = "Varu's Knit Store specializes in handmade crochet and knitted items. Contact us at varalakshmikutti76@gmail.com or +91 9944610600. We're here to help with any questions!"
            suggestions = ["Contact details", "About us", "Store hours", "Email support"]
        
        elif intent == 'help_request':
            response = "I'm here to help! You can ask me about orders, shipping, products, payments, returns, or anything else. For complex issues, our support team is available at varalakshmikutti76@gmail.com or +91 9944610600."
            suggestions = ["Order help", "Product info", "Shipping info", "Contact support"]
        
        elif sentiment == 'NEGATIVE' or intent == 'complaint':
            response = "I'm sorry to hear about your concern. Our team takes all feedback seriously. Please contact our support team at varalakshmikutti76@gmail.com or call +91 9944610600 for immediate assistance."
            suggestions = ["Contact support", "Return policy", "Refund info", "Complaint form"]
        
        elif sentiment == 'POSITIVE' or intent == 'compliment':
            response = "Thank you so much for your kind words! We're delighted that you're happy with our products. Your satisfaction means the world to us!"
            suggestions = ["Leave a review", "Share with friends", "Browse more", "Contact support"]
        
        elif intent == 'unknown' or intent_confidence < 0.5:
            response = "I'd love to help you, but I'm not sure I understand your question completely. For the best assistance, please contact our support team at varalakshmikutti76@gmail.com or call +91 9944610600. They can help with any specific questions or concerns you have."
            suggestions = ["Contact support", "Email us", "Call us", "Try again"]
        
        else:
            response = "I'm here to help with questions about Varu's Knit Store! For detailed assistance or specific queries, please contact our support team at varalakshmikutti76@gmail.com or +91 9944610600."
            suggestions = ["View products", "Order help", "Contact support", "Store info"]
        
        print(f"Chatbot response generated - Intent: {intent} ({intent_confidence:.2f}), Sentiment: {sentiment}")
        
        return jsonify({
            'success': True, 
            'response': response, 
            'suggestions': suggestions,
            'analysis': {
                'sentiment': sentiment,
                'sentiment_score': round(sentiment_score, 2),
                'intent': intent,
                'confidence': round(intent_confidence, 2)
            }
        })
    except Exception as e:
        print(f"Chatbot error: {e}")
        return jsonify({
            'success': True, 
            'response': 'I apologize, but I encountered an error. Please contact our support team at varalakshmikutti76@gmail.com or call +91 9944610600 for assistance.',
            'suggestions': ["Contact support", "Email us", "Call us", "Try again"]
        })

@app.route('/health')
def health():
    return jsonify({
        'status': 'Simple ML service running', 
        'success': True,
        'version': '1.0.0'
    })

if __name__ == '__main__':
    print('Starting Simple ML Service...')
    print('Service running on http://localhost:5001')
    app.run(debug=True, port=5001, host='0.0.0.0')