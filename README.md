# Varu's Knit Store - MERN Stack Ecommerce

A full-stack ecommerce application for handmade crochet and knitted items with QR code payment integration.

## Features

### Frontend (React + Vite)
- User authentication (login/register)
- Product catalog with filtering and pagination
- Shopping cart functionality
- Product detail pages with reviews
- QR code payment with screenshot upload
- User profile and order management
- Admin dashboard for managing products, orders, and users
- Responsive design with TailwindCSS

### Backend (Node.js + Express)
- JWT authentication with password reset
- Product management with image upload
- Order processing with payment verification
- User management with role-based access
- Review and rating system
- Email notifications
- Error handling and validation

## Tech Stack

**Frontend:**
- React 19
- Vite
- TailwindCSS
- React Router DOM
- Context API for state management
- Lucide React Icons

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Nodemailer for emails
- Multer for file uploads

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
# Create .env file in backend/config/ directory
touch config/.env
```

4. Add environment variables to `config/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/varuknits
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# Email configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

5. Seed the database with sample data:
```bash
npm run seed
```

6. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Default Admin Credentials

After running the seed script, you can login as admin with:
- **Email:** admin@varuknits.com
- **Password:** admin123

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