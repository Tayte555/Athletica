import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import mongoose from "mongoose";
import { protect, optionalProtect } from "../middleware/auth.middleware.js";
import User from "../models/User.model.js";
import { createNotification } from "../utils/notification.utils.js";
import Notification from "../models/Notification.model.js";
import Routine from "../models/Routine.model.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "server/uploads/avatars");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.userId}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images allowed"));
  },
});

function getRelationship(viewedUser, currentUserId) {
  if (!currentUserId) {
    return {
      isOwnProfile: false,
      isFollowing: false,
      isRequested: false,
    };
  }

  const currentIdStr = String(currentUserId);

  return {
    isOwnProfile: String(viewedUser._id) === currentIdStr,
    isFollowing: viewedUser.followers.some((id) => String(id) === currentIdStr),
    isRequested: viewedUser.followRequests.some(
      (id) => String(id) === currentIdStr,
    ),
  };
}

function formatRoutineCard(routine, currentUserId = null) {
  const routineObj = routine.toObject ? routine.toObject() : routine;

  return {
    ...routineObj,
    exercisesCount: routineObj.exercises?.length || 0,
    likesCount: routineObj.likes?.length || 0,
    savedByCount: routineObj.savedBy?.length || 0,
    isSaved: currentUserId
      ? routineObj.savedBy?.some((id) => String(id) === String(currentUserId))
      : false,
    isPinned: false,
  };
}

function dedupeRoutinesById(routines = []) {
  const seen = new Set();

  return routines.filter((routine) => {
    const id = String(routine._id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function getActivityLabel(type) {
  switch (type) {
    case "routine_created":
      return "Created a routine";
    case "routine_liked":
      return "Liked a routine";
    case "routine_saved":
      return "Saved a routine";
    case "routine_commented":
      return "Commented on a routine";
    case "follow":
      return "Started following someone";
    case "follow_request":
      return "Requested to follow someone";
    case "follow_accepted":
      return "Accepted a follow request";
    default:
      return "Recent activity";
  }
}

router.get("/dashboard", protect, (req, res) => {
  res.json({ message: `Welcome to your dashboard, user ${req.userId}` });
});

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      ...user.toObject(),
      followerCount: user.followers.length,
      followingCount: user.following.length,
      pendingFollowRequestCount: user.followRequests.length,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/me", protect, upload.single("avatar"), async (req, res) => {
  try {
    const {
      name,
      bio,
      location,
      pronouns,
      link,
      isPrivate,
      notificationPreferences,
    } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {
      name: name ?? user.name,
      bio: bio ?? user.bio,
      location: location ?? user.location,
      pronouns: pronouns ?? user.pronouns,
      link: link ?? user.link,
      isPrivate:
        typeof isPrivate !== "undefined"
          ? isPrivate === "true" || isPrivate === true
          : user.isPrivate,
    };

    if (notificationPreferences) {
      try {
        const parsed =
          typeof notificationPreferences === "string"
            ? JSON.parse(notificationPreferences)
            : notificationPreferences;

        updateData.notificationPreferences = {
          ...user.notificationPreferences?.toObject?.(),
          ...parsed,
        };
      } catch {}
    }

    if (req.file) {
      if (user.avatar) {
        const oldPath = path.join(process.cwd(), user.avatar.replace("/", ""));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
    }).select("-password");

    res.json({
      ...updatedUser.toObject(),
      followerCount: updatedUser.followers.length,
      followingCount: updatedUser.following.length,
      pendingFollowRequestCount: updatedUser.followRequests.length,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me/follow-requests", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate(
      "followRequests",
      "username name avatar",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.followRequests);
  } catch (error) {
    console.error("Error fetching follow requests:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/follow-requests/:requestUserId/:action",
  protect,
  async (req, res) => {
    try {
      const { requestUserId, action } = req.params;

      if (!["accept", "decline"].includes(action)) {
        return res.status(400).json({ message: "Invalid action" });
      }

      if (!mongoose.Types.ObjectId.isValid(requestUserId)) {
        return res.status(400).json({ message: "Invalid user id" });
      }

      const currentUser = await User.findById(req.userId);
      const requestingUser = await User.findById(requestUserId);

      if (!currentUser || !requestingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const hasRequest = currentUser.followRequests.some(
        (id) => String(id) === String(requestUserId),
      );

      if (!hasRequest) {
        return res.status(400).json({ message: "No follow request found" });
      }

      currentUser.followRequests = currentUser.followRequests.filter(
        (id) => String(id) !== String(requestUserId),
      );

      if (action === "accept") {
        const alreadyFollower = currentUser.followers.some(
          (id) => String(id) === String(requestUserId),
        );

        const alreadyFollowing = requestingUser.following.some(
          (id) => String(id) === String(req.userId),
        );

        if (!alreadyFollower) {
          currentUser.followers.push(requestingUser._id);
        }

        if (!alreadyFollowing) {
          requestingUser.following.push(currentUser._id);
        }

        await requestingUser.save();

        await Notification.deleteMany({
          recipient: currentUser._id,
          actor: requestingUser._id,
          type: "follow_request",
          entityType: "profile",
        });

        await createNotification({
          recipient: currentUser._id,
          actor: requestingUser._id,
          type: "follow",
          title: "New follower",
          message: `${requestingUser.username} started following you`,
          entityType: "profile",
          entityId: currentUser._id,
        });

        await createNotification({
          recipient: requestingUser._id,
          actor: currentUser._id,
          type: "follow_accepted",
          title: "Follow request accepted",
          message: `${currentUser.username} accepted your follow request`,
          entityType: "profile",
          entityId: requestingUser._id,
        });
      }

      if (action === "decline") {
        await Notification.deleteMany({
          recipient: currentUser._id,
          actor: requestingUser._id,
          type: "follow_request",
          entityType: "profile",
        });
      }

      await currentUser.save();

      res.json({
        message:
          action === "accept"
            ? "Follow request accepted"
            : "Follow request declined",
        followerCount: currentUser.followers.length,
        pendingFollowRequestCount: currentUser.followRequests.length,
      });
    } catch (error) {
      console.error("Error handling follow request:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

router.post("/:username/follow", protect, async (req, res) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username });
    const currentUser = await User.findById(req.userId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (String(targetUser._id) === String(currentUser._id)) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const alreadyFollowing = currentUser.following.some(
      (id) => String(id) === String(targetUser._id),
    );

    if (alreadyFollowing) {
      return res.status(400).json({ message: "Already following this user" });
    }

    if (targetUser.isPrivate) {
      const alreadyRequested = targetUser.followRequests.some(
        (id) => String(id) === String(currentUser._id),
      );

      if (alreadyRequested) {
        return res.status(400).json({ message: "Follow request already sent" });
      }

      targetUser.followRequests.push(currentUser._id);
      await targetUser.save();

      await createNotification({
        recipient: targetUser._id,
        actor: currentUser._id,
        type: "follow_request",
        title: "New follow request",
        message: `${currentUser.username} requested to follow you`,
        entityType: "profile",
        entityId: targetUser._id,
      });

      return res.json({
        message: "Follow request sent",
        requested: true,
        isFollowing: false,
        followerCount: targetUser.followers.length,
      });
    }

    targetUser.followers.push(currentUser._id);
    currentUser.following.push(targetUser._id);

    await targetUser.save();
    await currentUser.save();

    await createNotification({
      recipient: targetUser._id,
      actor: currentUser._id,
      type: "follow",
      title: "New follower",
      message: `${currentUser.username} started following you`,
      entityType: "profile",
      entityId: targetUser._id,
    });

    res.json({
      message: "Now following user",
      requested: false,
      isFollowing: true,
      followerCount: targetUser.followers.length,
    });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:username/follow", protect, async (req, res) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username });
    const currentUser = await User.findById(req.userId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const wasFollowing = currentUser.following.some(
      (id) => String(id) === String(targetUser._id),
    );

    const hadPendingRequest = targetUser.followRequests.some(
      (id) => String(id) === String(currentUser._id),
    );

    if (!wasFollowing && !hadPendingRequest) {
      return res.status(400).json({ message: "No follow relationship found" });
    }

    currentUser.following = currentUser.following.filter(
      (id) => String(id) !== String(targetUser._id),
    );

    targetUser.followers = targetUser.followers.filter(
      (id) => String(id) !== String(currentUser._id),
    );

    targetUser.followRequests = targetUser.followRequests.filter(
      (id) => String(id) !== String(currentUser._id),
    );

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: hadPendingRequest
        ? "Follow request cancelled"
        : "Unfollowed user",
      requested: false,
      isFollowing: false,
      followerCount: targetUser.followers.length,
    });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:username/profile-content", optionalProtect, async (req, res) => {
  try {
    const viewedUser = await User.findOne({ username: req.params.username })
      .select(
        "_id username name avatar isPrivate followers following followRequests pinnedRoutines",
      )
      .lean();

    if (!viewedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const relationship = getRelationship(viewedUser, req.userId);
    const canViewFullProfile =
      !viewedUser.isPrivate ||
      relationship.isOwnProfile ||
      relationship.isFollowing;

    if (!canViewFullProfile) {
      return res.json({
        pinnedRoutines: [],
        createdRoutines: [],
        availableToPin: [],
        recentActivity: [],
      });
    }

    const createdRoutinesRaw = await Routine.find({
      createdBy: viewedUser._id,
    })
      .populate("createdBy", "username name avatar")
      .sort({ createdAt: -1 })
      .lean();

    const createdRoutines = createdRoutinesRaw.map((routine) =>
      formatRoutineCard(routine, req.userId),
    );

    let savedRoutines = [];
    if (relationship.isOwnProfile) {
      const savedRoutinesRaw = await Routine.find({
        savedBy: viewedUser._id,
      })
        .populate("createdBy", "username name avatar")
        .sort({ updatedAt: -1 })
        .lean();

      savedRoutines = savedRoutinesRaw.map((routine) =>
        formatRoutineCard(routine, req.userId),
      );
    }

    const pinnedRoutineDocs = viewedUser.pinnedRoutines?.length
      ? await Routine.find({
          _id: { $in: viewedUser.pinnedRoutines },
        })
          .populate("createdBy", "username name avatar")
          .lean()
      : [];

    const pinnedMap = new Map(
      pinnedRoutineDocs.map((routine) => [String(routine._id), routine]),
    );

    const visiblePinnedRoutines = (viewedUser.pinnedRoutines || [])
      .map((id) => pinnedMap.get(String(id)))
      .filter(Boolean)
      .filter((routine) => {
        if (relationship.isOwnProfile) return true;

        return (
          routine.isPublic ||
          String(routine.createdBy?._id || routine.createdBy) ===
            String(viewedUser._id)
        );
      })
      .map((routine) => ({
        ...formatRoutineCard(routine, req.userId),
        isPinned: true,
      }));

    const pinnedIds = new Set(
      visiblePinnedRoutines.map((routine) => String(routine._id)),
    );

    const createdWithPins = createdRoutines.map((routine) => ({
      ...routine,
      isPinned: pinnedIds.has(String(routine._id)),
    }));

    const availableToPin = relationship.isOwnProfile
      ? dedupeRoutinesById([...createdRoutines, ...savedRoutines])
          .filter((routine) => !pinnedIds.has(String(routine._id)))
          .map((routine) => ({
            ...routine,
            isPinned: false,
          }))
      : [];

    const activityRaw = await Notification.find({
      actor: viewedUser._id,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("actor", "username name")
      .lean();

    const seenRoutineCreated = new Set();

    const routineActivityIds = activityRaw
      .filter(
        (item) =>
          item.entityType === "routine" &&
          item.entityId &&
          mongoose.Types.ObjectId.isValid(item.entityId),
      )
      .map((item) => item.entityId);

    const profileActivityIds = activityRaw
      .filter(
        (item) =>
          item.entityType === "profile" &&
          item.entityId &&
          mongoose.Types.ObjectId.isValid(item.entityId),
      )
      .map((item) => item.entityId);

    const relatedRoutines = routineActivityIds.length
      ? await Routine.find({
          _id: { $in: routineActivityIds },
        })
          .select("title createdBy")
          .populate("createdBy", "username name")
          .lean()
      : [];

    const relatedProfiles = profileActivityIds.length
      ? await User.find({
          _id: { $in: profileActivityIds },
        })
          .select("username name")
          .lean()
      : [];

    const routineMap = new Map(
      relatedRoutines.map((routine) => [String(routine._id), routine]),
    );

    const profileMap = new Map(
      relatedProfiles.map((user) => [String(user._id), user]),
    );

    function buildActivityMessage(item) {
      const actorUsername = item.actor?.username
        ? `@${item.actor.username}`
        : "Someone";

      const relatedRoutine = item.entityId
        ? routineMap.get(String(item.entityId))
        : null;

      const relatedProfile = item.entityId
        ? profileMap.get(String(item.entityId))
        : null;

      const routineTitle = relatedRoutine?.title
        ? `"${relatedRoutine.title}"`
        : "a routine";

      const routineOwnerUsername = relatedRoutine?.createdBy?.username
        ? `@${relatedRoutine.createdBy.username}`
        : "a user";

      const targetUsername = relatedProfile?.username
        ? `@${relatedProfile.username}`
        : "someone";

      switch (item.type) {
        case "routine_created":
          return `${actorUsername} created a new routine ${routineTitle}`;

        case "routine_liked":
          return `${actorUsername} liked ${routineOwnerUsername}'s routine ${routineTitle}`;

        case "routine_saved":
          return `${actorUsername} saved ${routineOwnerUsername}'s routine ${routineTitle}`;

        case "routine_commented":
          return `${actorUsername} commented on ${routineOwnerUsername}'s routine ${routineTitle}`;

        case "follow":
          return `${actorUsername} started following ${targetUsername}`;

        case "follow_request":
          return `${actorUsername} requested to follow ${targetUsername}`;

        case "follow_accepted":
          return `${actorUsername} accepted ${targetUsername}'s follow request`;

        default:
          return item.message || "Recent activity";
      }
    }

    const recentActivity = activityRaw
      .filter((item) => {
        if (item.type !== "routine_created") return true;

        const key = String(item.entityId || "");
        if (seenRoutineCreated.has(key)) return false;
        seenRoutineCreated.add(key);
        return true;
      })
      .slice(0, 10)
      .map((item) => ({
        _id: String(item._id),
        type: item.type,
        title: getActivityLabel(item.type),
        message: buildActivityMessage(item),
        entityType: item.entityType,
        entityId: item.entityId,
        createdAt: item.createdAt,
      }));

    res.json({
      pinnedRoutines: visiblePinnedRoutines,
      createdRoutines: createdWithPins,
      availableToPin,
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching profile content:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/me/pinned-routines/:routineId", protect, async (req, res) => {
  try {
    const { routineId } = req.params;

    const user = await User.findById(req.userId).select("pinnedRoutines");
    const routine =
      await Routine.findById(routineId).select("createdBy savedBy");

    if (!user || !routine) {
      return res.status(404).json({ message: "Routine or user not found" });
    }

    const isCreatedByUser = String(routine.createdBy) === String(req.userId);

    const isSavedByUser = (routine.savedBy || []).some(
      (id) => String(id) === String(req.userId),
    );

    if (!isCreatedByUser && !isSavedByUser) {
      return res.status(403).json({
        message: "You can only pin routines you created or saved",
      });
    }

    const alreadyPinned = user.pinnedRoutines.some(
      (id) => String(id) === String(routineId),
    );

    if (alreadyPinned) {
      return res.status(400).json({ message: "Routine is already pinned" });
    }

    if (user.pinnedRoutines.length >= 4) {
      return res.status(400).json({
        message: "You can pin up to 4 routines",
      });
    }

    user.pinnedRoutines.push(routineId);
    await user.save();

    res.json({
      message: "Routine pinned",
      pinnedRoutineIds: user.pinnedRoutines,
    });
  } catch (error) {
    console.error("Error pinning routine:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/me/pinned-routines/:routineId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("pinnedRoutines");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.pinnedRoutines = user.pinnedRoutines.filter(
      (id) => String(id) !== String(req.params.routineId),
    );

    await user.save();

    res.json({
      message: "Routine unpinned",
      pinnedRoutineIds: user.pinnedRoutines,
    });
  } catch (error) {
    console.error("Error unpinning routine:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:username", optionalProtect, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const relationship = getRelationship(user, req.userId);
    const canViewFullProfile =
      !user.isPrivate || relationship.isOwnProfile || relationship.isFollowing;

    res.json({
      _id: user._id,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      bio: canViewFullProfile ? user.bio : "",
      location: canViewFullProfile ? user.location : "",
      pronouns: canViewFullProfile ? user.pronouns : "",
      link: canViewFullProfile ? user.link : "",
      isPrivate: user.isPrivate,
      isOwnProfile: relationship.isOwnProfile,
      isFollowing: relationship.isFollowing,
      isRequested: relationship.isRequested,
      canViewFullProfile,
      followerCount: user.followers.length,
      followingCount: user.following.length,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
