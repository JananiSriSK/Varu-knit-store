import sendEmail from './sendEmail.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';

export const sendOrderNotification = async (userId, orderId, orderStatus, totalPrice) => {
  try {
    console.log(`Starting order notification for user: ${userId}, order: ${orderId}, status: ${orderStatus}`);
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found for notification');
      return;
    }
    console.log(`Found user: ${user.email}`);

    let emailSubject = '';
    let emailMessage = '';
    let notificationTitle = '';
    let notificationMessage = '';

    switch (orderStatus) {
      case 'Processing':
        emailSubject = "Order Placed Successfully - Varu's Knit Store";
        emailMessage = `
          <h2>Order Confirmation</h2>
          <p>Dear ${user.name},</p>
          <p>Your order has been placed successfully!</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Total Amount:</strong> ₹${totalPrice}</p>
          <p>We will verify your payment and process your order soon.</p>
          <p>Thank you for shopping with us!</p>
        `;
        notificationTitle = 'Order Placed Successfully';
        notificationMessage = `Your order #${orderId.toString().slice(-8)} has been placed successfully for ₹${totalPrice}`;
        break;

      case 'Verified and Confirmed':
        emailSubject = "Order Verified and Confirmed - Varu's Knit Store";
        emailMessage = `
          <h2>Order Confirmed</h2>
          <p>Dear ${user.name},</p>
          <p>Your payment has been verified and order confirmed!</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p>We will start processing your order soon.</p>
        `;
        notificationTitle = 'Order Confirmed';
        notificationMessage = `Your order #${orderId.toString().slice(-8)} has been confirmed and will be processed soon.`;
        break;

      case 'Shipped':
        emailSubject = "Order Shipped - Varu's Knit Store";
        emailMessage = `
          <h2>Order Shipped</h2>
          <p>Dear ${user.name},</p>
          <p>Great news! Your order has been shipped.</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p>Your order is on its way to you!</p>
        `;
        notificationTitle = 'Order Shipped';
        notificationMessage = `Your order #${orderId.toString().slice(-8)} has been shipped and is on its way to you!`;
        break;

      case 'Delivered':
        emailSubject = "Order Delivered - Varu's Knit Store";
        emailMessage = `
          <h2>Order Delivered</h2>
          <p>Dear ${user.name},</p>
          <p>Your order has been delivered successfully!</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p>We'd love to hear your feedback! Please review your products.</p>
          <p>Thank you for shopping with us!</p>
        `;
        notificationTitle = 'Order Delivered';
        notificationMessage = `Your order #${orderId.toString().slice(-8)} has been delivered. Please leave a review!`;
        break;

      case 'Cancelled':
        emailSubject = "Order Cancelled - Varu's Knit Store";
        emailMessage = `
          <h2>Order Cancelled</h2>
          <p>Dear ${user.name},</p>
          <p>Your order has been cancelled.</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p>If you have any questions, please contact us.</p>
        `;
        notificationTitle = 'Order Cancelled';
        notificationMessage = `Your order #${orderId.toString().slice(-8)} has been cancelled.`;
        break;
        
      default:
        // Handle any other status updates
        emailSubject = `Order Status Update - Varu's Knit Store`;
        emailMessage = `
          <h2>Order Status Update</h2>
          <p>Dear ${user.name},</p>
          <p>Your order status has been updated to: <strong>${orderStatus}</strong></p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p>Thank you for shopping with us!</p>
        `;
        notificationTitle = 'Order Status Updated';
        notificationMessage = `Your order #${orderId.toString().slice(-8)} status has been updated to ${orderStatus}.`;
        break;
    }

    // Send email notification
    if (emailSubject) {
      console.log(`Sending email to ${user.email} with subject: ${emailSubject}`);
      await sendEmail({
        email: user.email,
        subject: emailSubject,
        message: emailMessage
      });
      console.log('Email sent successfully');
    }

    // Create database notification
    if (notificationTitle) {
      console.log(`Creating database notification: ${notificationTitle}`);
      await Notification.create({
        user: userId,
        type: 'order_status_update',
        title: notificationTitle,
        message: notificationMessage,
        relatedId: orderId
      });
      console.log('Database notification created successfully');
    }

    console.log(`Order notification completed for ${user.email} - status: ${orderStatus}`);
  } catch (error) {
    console.error('Order notification failed:', error.message);
    console.error('Full error:', error);
  }
};

export const sendProductNotification = async (product) => {
  try {
    const users = await User.find({ role: 'user' });
    
    // Create notifications for all users
    const notifications = users.map(user => ({
      user: user._id,
      type: 'new_product',
      title: 'New Product Added!',
      message: `Check out our new ${product.category} item: ${product.name}`,
      relatedId: product._id
    }));
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Send emails to all users
    for (const user of users) {
      try {
        await sendEmail({
          email: user.email,
          subject: "New Product Added - Varu's Knit Store",
          message: `
            <h2>New Product Alert!</h2>
            <p>Dear ${user.name},</p>
            <p>We've added a beautiful new ${product.category} item to our collection!</p>
            <p><strong>Product:</strong> ${product.name}</p>
            <p><strong>Price:</strong> ₹${product.price}</p>
            <p><a href="http://localhost:5173/product/${product._id}" style="background-color: #7b5fc4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Product</a></p>
            <p>Happy Shopping!</p>
          `
        });
      } catch (emailError) {
        console.log(`Failed to send product email to ${user.email}:`, emailError.message);
      }
    }

    console.log(`Product notifications sent for: ${product.name}`);
  } catch (error) {
    console.error('Product notification failed:', error);
  }
};

export const sendCategoryNotification = async (category, users) => {
  try {
    // Create notifications for new category
    const categoryNotifications = users.map(user => ({
      user: user._id,
      type: 'new_category',
      title: 'New Category Added!',
      message: `Explore our new ${category} collection`,
      relatedId: category
    }));
    
    if (categoryNotifications.length > 0) {
      await Notification.insertMany(categoryNotifications);
    }

    // Send email notifications for new category
    for (const user of users) {
      try {
        await sendEmail({
          email: user.email,
          subject: "New Category Added - Varu's Knit Store",
          message: `
            <h2>New Collection Alert!</h2>
            <p>Dear ${user.name},</p>
            <p>We're excited to introduce our new <strong>${category}</strong> collection!</p>
            <p>Discover beautiful handmade items in this new category.</p>
            <p><a href="http://localhost:5173/products?category=${encodeURIComponent(category)}" style="background-color: #7b5fc4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Explore Collection</a></p>
            <p>Happy Shopping!</p>
          `
        });
      } catch (emailError) {
        console.log(`Failed to send category email to ${user.email}:`, emailError.message);
      }
    }

    console.log(`Category notifications sent for: ${category}`);
  } catch (error) {
    console.error('Category notification failed:', error);
  }
};