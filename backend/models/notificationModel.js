import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'new_user', 'new_order', 'order_placed', 'order_status_update', 
      'order_delayed', 'order_update', 'new_product', 'new_category',
      'review_submitted', 'low_stock', 'product_review'
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  relatedId: {
    type: String, // Order ID, User ID, etc.
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Notification', notificationSchema);