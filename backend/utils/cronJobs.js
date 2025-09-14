import cron from 'node-cron';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import sendEmail from './sendEmail.js';
import { createAdminNotification } from '../controller/notificationController.js';

// Check for shipping delays every day at 9 AM
export const checkShippingDelays = () => {
  cron.schedule('0 9 * * *', async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Find orders shipped 7+ days ago that aren't delivered
      const delayedOrders = await Order.find({
        orderStatus: 'Shipped',
        shippedAt: { $lte: sevenDaysAgo },
        delayNotificationSent: false
      }).populate('user', 'name email');

      for (const order of delayedOrders) {
        // Update status to shipping delayed
        order.orderStatus = 'Shipping Delayed';
        order.delayNotificationSent = true;
        await order.save();

        // Create admin notification for delayed order
        await createAdminNotification(
          'order_delayed',
          'Order Shipping Delayed',
          `Order #${order._id.toString().slice(-8)} for ${order.user.name} is delayed (shipped ${Math.ceil((new Date() - order.shippedAt) / (1000 * 60 * 60 * 24))} days ago)`,
          order._id
        );

        // Send delay notification email
        try {
          await sendEmail({
            email: order.user.email,
            subject: 'Shipping Delay Notification - Varu\'s Knit Store',
            message: `
              <h2>Shipping Delay Notice</h2>
              <p>Dear ${order.user.name},</p>
              <p>We sincerely apologize for the delay in delivering your order.</p>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p>Your order was shipped on ${new Date(order.shippedAt).toLocaleDateString()} but seems to be taking longer than expected.</p>
              <p>We are working with our shipping partners to resolve this issue.</p>
              <p>For any queries or concerns, please contact us at:</p>
              <p><strong>Email:</strong> support@varuknits.com</p>
              <p>Thank you for your patience and understanding.</p>
              <p>Best regards,<br>Varu's Knit Store Team</p>
            `
          });
          console.log(`Delay notification sent for order ${order._id}`);
        } catch (emailError) {
          console.error(`Failed to send delay notification for order ${order._id}:`, emailError);
        }
      }

      if (delayedOrders.length > 0) {
        console.log(`Processed ${delayedOrders.length} delayed orders`);
      }
    } catch (error) {
      console.error('Error checking shipping delays:', error);
    }
  });
};