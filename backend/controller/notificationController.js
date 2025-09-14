import handleAsyncError from '../middleware/handleAsyncError.js';
import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';

// Create notification for admin
export const createAdminNotification = async (type, title, message, relatedId = null) => {
  try {
    const admins = await User.find({ role: 'admin' });
    
    const notifications = admins.map(admin => ({
      user: admin._id,
      type,
      title,
      message,
      relatedId
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Error creating admin notification:', error);
  }
};

// Get notifications for user
export const getNotifications = handleAsyncError(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({
    success: true,
    notifications,
  });
});

// Mark notification as read
export const markNotificationRead = handleAsyncError(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
  });
});

// Mark all notifications as read
export const markAllNotificationsRead = handleAsyncError(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});