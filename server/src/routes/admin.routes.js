import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import User from "../models/User.model.js";
import Routine from "../models/Routine.model.js";
import Comment from "../models/Comment.model.js";
import AdminLog from "../models/AdminLog.model.js";

const router = express.Router();

async function createAdminLog({
  adminId,
  action,
  targetType,
  targetId = null,
  details = "",
}) {
  await AdminLog.create({
    admin: adminId,
    action,
    targetType,
    targetId,
    details,
  });
}

function formatUser(user) {
  return {
    _id: user._id,
    username: user.username,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    isAdmin: Boolean(user.isAdmin),
    isPrivate: Boolean(user.isPrivate),
    isSuspended: Boolean(user.isSuspended),
    suspendedAt: user.suspendedAt,
    suspensionReason: user.suspensionReason || "",
    followerCount: user.followers?.length || 0,
    followingCount: user.following?.length || 0,
    createdAt: user.createdAt,
  };
}

function routineMatchesFilter(routine, filter) {
  const needsRemoderation =
    !routine.lastModeratedAt ||
    new Date(routine.updatedAt).getTime() >
      new Date(routine.lastModeratedAt).getTime();

  if (filter === "flagged") return routine.isFlagged;
  if (filter === "hidden") return routine.isHidden;
  if (filter === "queue") {
    return routine.isFlagged || routine.isHidden || needsRemoderation;
  }

  return true;
}

function commentMatchesFilter(comment, filter) {
  const needsRemoderation =
    !comment.lastModeratedAt ||
    new Date(comment.updatedAt).getTime() >
      new Date(comment.lastModeratedAt).getTime();

  if (filter === "flagged") return comment.isFlagged;
  if (filter === "hidden") return comment.isHidden;
  if (filter === "queue") {
    return comment.isFlagged || comment.isHidden || needsRemoderation;
  }

  return true;
}

router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const query = {};

    if (q) {
      const regex = new RegExp(q, "i");
      query.$or = [{ username: regex }, { name: regex }, { email: regex }];
    }

    const users = await User.find(query)
      .select(
        "username name email avatar isAdmin isPrivate isSuspended suspendedAt suspensionReason followers following createdAt",
      )
      .sort({ createdAt: -1 });

    res.json(users.map(formatUser));
  } catch (error) {
    console.error("Admin get users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.patch("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (String(user._id) === String(req.userId) && req.body.isAdmin === false) {
      return res
        .status(400)
        .json({ message: "You cannot remove your own admin access" });
    }

    if (req.body.isAdmin !== undefined) {
      user.isAdmin = Boolean(req.body.isAdmin);

      await createAdminLog({
        adminId: req.userId,
        action: user.isAdmin ? "grant_admin" : "remove_admin",
        targetType: "user",
        targetId: user._id,
        details: `${user.username} admin status changed to ${user.isAdmin}`,
      });
    }

    if (req.body.isSuspended !== undefined) {
      user.isSuspended = Boolean(req.body.isSuspended);
      user.suspendedAt = user.isSuspended ? new Date() : null;
      user.suspensionReason = user.isSuspended
        ? String(req.body.suspensionReason || "").trim()
        : "";

      await createAdminLog({
        adminId: req.userId,
        action: user.isSuspended ? "suspend_user" : "unsuspend_user",
        targetType: "user",
        targetId: user._id,
        details: user.isSuspended
          ? `${user.username} suspended${
              user.suspensionReason ? `: ${user.suspensionReason}` : ""
            }`
          : `${user.username} unsuspended`,
      });
    }

    await user.save();

    const updated = await User.findById(user._id).select(
      "username name email avatar isAdmin isPrivate isSuspended suspendedAt suspensionReason followers following createdAt",
    );

    res.json(formatUser(updated));
  } catch (error) {
    console.error("Admin update user error:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (String(id) === String(req.userId)) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account here" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(id);

    await createAdminLog({
      adminId: req.userId,
      action: "delete_user",
      targetType: "user",
      targetId: id,
      details: `Deleted user ${user.username}`,
    });

    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

router.get("/moderation/routines", protect, adminOnly, async (req, res) => {
  try {
    const filter = String(req.query.filter || "queue");
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 20, 1),
      100,
    );

    const allRoutines = await Routine.find()
      .populate("createdBy", "username name avatar")
      .sort({ updatedAt: -1 });

    const matchingRoutines = allRoutines.filter((routine) =>
      routineMatchesFilter(routine, filter),
    );

    const routines = matchingRoutines.slice(0, limit);

    res.json({
      items: routines.map((routine) => ({
        _id: routine._id,
        title: routine.title,
        description: routine.description,
        isPublic: routine.isPublic,
        isHidden: routine.isHidden,
        isFlagged: routine.isFlagged,
        moderationNote: routine.moderationNote || "",
        lastModeratedAt: routine.lastModeratedAt,
        createdAt: routine.createdAt,
        updatedAt: routine.updatedAt,
        createdBy: routine.createdBy,
      })),
      total: matchingRoutines.length,
      limit,
      filter,
    });
  } catch (error) {
    console.error("Admin get routines error:", error);
    res.status(500).json({ message: "Failed to fetch routines" });
  }
});

router.get("/moderation/comments", protect, adminOnly, async (req, res) => {
  try {
    const filter = String(req.query.filter || "queue");
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 20, 1),
      100,
    );

    const allComments = await Comment.find()
      .populate("user", "username name avatar")
      .populate("routine", "title")
      .sort({ updatedAt: -1 });

    const matchingComments = allComments.filter((comment) =>
      commentMatchesFilter(comment, filter),
    );

    const comments = matchingComments.slice(0, limit);

    res.json({
      items: comments.map((comment) => ({
        _id: comment._id,
        text: comment.text,
        isHidden: comment.isHidden,
        isFlagged: comment.isFlagged,
        moderationNote: comment.moderationNote || "",
        lastModeratedAt: comment.lastModeratedAt,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        user: comment.user,
        routine: comment.routine,
      })),
      total: matchingComments.length,
      limit,
      filter,
    });
  } catch (error) {
    console.error("Admin get comments error:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

router.patch("/routines/:id", protect, adminOnly, async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id).populate(
      "createdBy",
      "username name avatar",
    );

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    if (req.body.isHidden !== undefined) {
      routine.isHidden = Boolean(req.body.isHidden);
    }

    if (req.body.isFlagged !== undefined) {
      routine.isFlagged = Boolean(req.body.isFlagged);
    }

    if (req.body.moderationNote !== undefined) {
      routine.moderationNote = String(req.body.moderationNote || "").trim();
    }

    routine.lastModeratedAt = new Date();

    await routine.save();

    await createAdminLog({
      adminId: req.userId,
      action: "moderate_routine",
      targetType: "routine",
      targetId: routine._id,
      details: `Routine "${routine.title}" updated (hidden=${routine.isHidden}, flagged=${routine.isFlagged})`,
    });

    res.json({
      _id: routine._id,
      title: routine.title,
      description: routine.description,
      isPublic: routine.isPublic,
      isHidden: routine.isHidden,
      isFlagged: routine.isFlagged,
      moderationNote: routine.moderationNote || "",
      lastModeratedAt: routine.lastModeratedAt,
      createdAt: routine.createdAt,
      updatedAt: routine.updatedAt,
      createdBy: routine.createdBy,
    });
  } catch (error) {
    console.error("Admin moderate routine error:", error);
    res.status(500).json({ message: "Failed to update routine" });
  }
});

router.delete("/routines/:id", protect, adminOnly, async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id).select("title");

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    await Comment.deleteMany({ routine: routine._id });
    await Routine.findByIdAndDelete(routine._id);

    await createAdminLog({
      adminId: req.userId,
      action: "delete_routine",
      targetType: "routine",
      targetId: routine._id,
      details: `Deleted routine "${routine.title}"`,
    });

    res.json({ message: "Routine deleted" });
  } catch (error) {
    console.error("Admin delete routine error:", error);
    res.status(500).json({ message: "Failed to delete routine" });
  }
});

router.patch("/comments/:id", protect, adminOnly, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate("user", "username name avatar")
      .populate("routine", "title");

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (req.body.isHidden !== undefined) {
      comment.isHidden = Boolean(req.body.isHidden);
    }

    if (req.body.isFlagged !== undefined) {
      comment.isFlagged = Boolean(req.body.isFlagged);
    }

    if (req.body.moderationNote !== undefined) {
      comment.moderationNote = String(req.body.moderationNote || "").trim();
    }

    comment.lastModeratedAt = new Date();

    await comment.save();

    await createAdminLog({
      adminId: req.userId,
      action: "moderate_comment",
      targetType: "comment",
      targetId: comment._id,
      details: `Comment updated (hidden=${comment.isHidden}, flagged=${comment.isFlagged})`,
    });

    res.json({
      _id: comment._id,
      text: comment.text,
      isHidden: comment.isHidden,
      isFlagged: comment.isFlagged,
      moderationNote: comment.moderationNote || "",
      lastModeratedAt: comment.lastModeratedAt,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: comment.user,
      routine: comment.routine,
    });
  } catch (error) {
    console.error("Admin moderate comment error:", error);
    res.status(500).json({ message: "Failed to update comment" });
  }
});

router.delete("/comments/:id", protect, adminOnly, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).select("text");

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await Comment.findByIdAndDelete(comment._id);

    await createAdminLog({
      adminId: req.userId,
      action: "delete_comment",
      targetType: "comment",
      targetId: comment._id,
      details: `Deleted comment "${String(comment.text || "").slice(0, 80)}"`,
    });

    res.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Admin delete comment error:", error);
    res.status(500).json({ message: "Failed to delete comment" });
  }
});

router.get("/logs", protect, adminOnly, async (req, res) => {
  try {
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 50, 1),
      100,
    );

    const logs = await AdminLog.find()
      .populate("admin", "username name")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(
      logs.map((log) => ({
        _id: log._id,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        details: log.details,
        createdAt: log.createdAt,
        admin: log.admin,
      })),
    );
  } catch (error) {
    console.error("Admin logs error:", error);
    res.status(500).json({ message: "Failed to fetch admin logs" });
  }
});

export default router;
