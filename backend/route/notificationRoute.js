import express from 'express';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../controller/notificationController.js';
import { verifyUserAuth } from '../middleware/userAuth.js';

const router = express.Router();

router.route('/notifications').get(verifyUserAuth, getNotifications);
router.route('/notification/:id/read').put(verifyUserAuth, markNotificationRead);
router.route('/notifications/read-all').put(verifyUserAuth, markAllNotificationsRead);

export default router;