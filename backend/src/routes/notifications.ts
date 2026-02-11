import express from 'express';
import { notificationController } from '../controllers/notificationController';

const router = express.Router();

router.get('/:userId', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);

export default router;
