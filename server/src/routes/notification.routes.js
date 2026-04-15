import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/auth.middleware.js";
import Notification from "../models/Notification.model.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const notifications = await Notification.find({
      recipient: req.userId,
    })
      .populate("actor", "username name avatar")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      recipient: req.userId,
      isRead: false,
    });

    const totalCount = await Notification.countDocuments({
      recipient: req.userId,
    });

    res.json({
      items: notifications,
      unreadCount,
      totalCount,
      hasMore: offset + notifications.length < totalCount,
      nextOffset: offset + notifications.length,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

router.post("/read", protect, async (req, res) => {
  try {
    const { notificationId } = req.body;

    if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ message: "Valid notificationId required" });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipient: req.userId,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const unreadCount = await Notification.countDocuments({
      recipient: req.userId,
      isRead: false,
    });

    res.json({
      notification,
      unreadCount,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
});

router.post("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );

    res.json({
      message: "All notifications marked as read",
      unreadCount: 0,
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({ message: "Failed to mark all as read" });
  }
});

export default router;
