import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { notificationController } from "./notification.controller.js";

const router = Router();
router.use(authenticate);

router.get("/", notificationController.list);
router.get("/unread-count", notificationController.unreadCount);
router.patch("/:id/read", notificationController.markAsRead);
router.patch("/read-all", notificationController.markAllAsRead);

export default router;
