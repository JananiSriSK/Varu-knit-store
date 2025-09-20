# Varu's Knit Store - Advanced MERN Stack Ecommerce

A full-stack ecommerce application for handmade crochet and knitted items with Redis caching, AI/ML recommendations, and QR code payment integration.

## Features

### Frontend (React + Vite)
- User authentication with OTP verification
- Product catalog with smart search and filtering
- AI-powered product recommendations
- Shopping cart with real-time updates
- Product detail pages with reviews and ratings
- QR code payment with screenshot upload
- User profile and order management
- Admin dashboard with analytics
- Responsive design with TailwindCSS
- Real-time notifications

### Backend (Node.js + Express)
- JWT authentication with password reset
- Redis caching for performance optimization
- Product management with Cloudinary integration
- Order processing with payment verification
- User management with role-based access
- Review and rating system
- Email notifications with SMTP
- Auto-start service management
- Comprehensive error handling

### AI/ML Service (Flask)
- Product recommendation engine
- Smart search with suggestions
- Chatbot integration
- Personalized user experience

## Tech Stack

**Frontend:**
- React 19
- Vite
- TailwindCSS
- React Router DOM
- Context API for state management
- Lucide React Icons

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose
- Redis for caching
- JWT authentication
- bcryptjs for password hashing
- Nodemailer for emails
- Cloudinary for media storage
- Node-cron for scheduled tasks

**AI/ML Service:**
- Flask (Python)
- Machine Learning algorithms
- Natural Language Processing

**Infrastructure:**
- Auto-start service management
- Process monitoring
- Error logging and handling

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+ (for ML service)
- MongoDB (local or Atlas)
- Git

### Quick Start (Recommended)

1. **Clone the repository:**
```bash
git clone <repository-url>
cd Varu's_knit_store
```

2. **Auto-start all services:**
```bash
# Double-click start-dev.bat (Windows)
# OR run manually:
cd backend && npm install && npm start
```

This automatically starts:
- Redis server (port 6379)
- ML service (port 5001)
- Backend API (port 5000)

3. **Start frontend separately:**
```bash
cd frontend
npm install
npm run dev
```

### Manual Setup

#### Backend Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Environment configuration:**
```env
# backend/config/.env
PORT=5000
MONGO_URI=mongodb://localhost:27017/varuknits
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

3. **Database seeding:**
```bash
npm run seed
```

4. **Start with auto-services:**
```bash
npm start  # Starts Redis + ML + Backend automatically
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

#### ML Service Setup

```bash
cd ml_service
pip install -r requirements.txt
python app.py
```

## Service URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **ML Service:** http://localhost:5001
- **Redis:** localhost:6379

## Default Admin Credentials

After running the seed script:
- **Email:** admin@varuknits.com
- **Password:** admin123

## Performance Features

### Redis Caching
- **Product listings:** 1 hour cache
- **Individual products:** 2 hour cache
- **Auto-invalidation:** On product updates
- **Performance gain:** 70-80% faster API responses

### Auto-Start Services
- **Single command startup:** `npm start` in backend
- **Automatic Redis launch:** No manual Redis startup needed
- **ML service integration:** Auto-starts with backend
- **Process management:** Proper cleanup on exit

## API Endpoints

### Authentication
- `POST /api/v1/register` - User registration
- `POST /api/v1/login` - User login
- `GET /api/v1/logout` - User logout
- `POST /api/v1/password/forgot` - Forgot password
- `PUT /api/v1/password/reset/:token` - Reset password

### Products
- `GET /api/v1/products` - Get all products (with pagination and filters)
- `GET /api/v1/product/:id` - Get single product
- `GET /api/v1/subcategories` - Get subcategories by category
- `PUT /api/v1/review` - Create/update product review

### Orders
- `POST /api/v1/order/new` - Create new order
- `GET /api/v1/orders/me` - Get user orders
- `GET /api/v1/order/:id` - Get single order

### Admin Routes
- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/orders` - Get all orders
- `PUT /api/v1/admin/order/:id` - Update order status
- `POST /api/v1/admin/product/new` - Create product
- `PUT /api/v1/admin/product/:id` - Update product
- `DELETE /api/v1/admin/product/:id` - Delete product

## Payment Integration

The application uses QR code payment system:

1. Customer adds items to cart and proceeds to checkout
2. QR code is displayed for payment (UPI: varuknits@paytm)
3. Customer pays and uploads payment screenshot
4. Admin verifies payment and confirms order
5. Order status is updated accordingly

## Project Structure

```
├── backend/
│   ├── config/
│   │   ├── .env
│   │   └── db.js
│   ├── controller/
│   ├── middleware/
│   ├── models/
│   ├── route/
│   ├── utils/
│   ├── seedData.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@varuknits.com or create an issue in the repository.