import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/auth.middleware.js";
import Routine from "../models/Routine.model.js";
import Exercise from "../models/Exercise.model.js";
import User from "../models/User.model.js";
import Comment from "../models/Comment.model.js";
import {
  createNotification,
  createNotificationsForFollowers,
} from "../utils/notification.utils.js";
import fs from "fs";
import path from "path";
import multer from "multer";

const router = express.Router();

const routineCoverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "server/uploads/routines");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `routine-${req.userId}-${Date.now()}${ext}`);
  },
});

const routineCoverUpload = multer({
  storage: routineCoverStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images allowed"));
  },
});

function parseCsvOrArray(value) {
  if (Array.isArray(value))
    return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

function getOptionalUserId(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch {
    return null;
  }
}

function normaliseRoutineExercises(exercises) {
  if (!Array.isArray(exercises)) return [];

  return exercises.map((item, index) => {
    const hasPresetExercise = !!item.exercise;
    const hasCustomExercise = !!item.customExercise?.name?.trim();

    return {
      exercise: hasPresetExercise ? item.exercise : null,
      customExercise: hasCustomExercise
        ? {
            name: item.customExercise.name.trim(),
            muscleGroup: item.customExercise.muscleGroup || "",
            equipment: parseCsvOrArray(item.customExercise.equipment),
            description: item.customExercise.description || "",
            image: item.customExercise.image || "",
            instructions: parseCsvOrArray(item.customExercise.instructions),
          }
        : null,
      order: item.order || index + 1,
      sets: Number(item.sets) || 3,
      reps: item.reps || "8-12",
      restSeconds: Number(item.restSeconds) || 60,
      notes: item.notes || "",
    };
  });
}

async function validateRoutineExercises(exercises) {
  if (!Array.isArray(exercises) || exercises.length === 0) {
    return "Routine must contain at least one exercise";
  }

  for (const item of exercises) {
    const hasPresetExercise = !!item.exercise;
    const hasCustomExercise = !!item.customExercise?.name?.trim();

    if (!hasPresetExercise && !hasCustomExercise) {
      return "Each routine item must contain either a preset exercise or a custom exercise";
    }

    if (hasPresetExercise && hasCustomExercise) {
      return "A routine item cannot contain both a preset exercise and a custom exercise";
    }
  }

  const presetExerciseIds = exercises
    .filter((item) => !!item.exercise)
    .map((item) => item.exercise);

  if (presetExerciseIds.length > 0) {
    const existingExercises = await Exercise.find({
      _id: { $in: presetExerciseIds },
    });

    if (existingExercises.length !== presetExerciseIds.length) {
      return "One or more preset exercises are invalid";
    }
  }

  return null;
}

async function attachCommentCounts(routines, currentUserId = null) {
  const routineIds = routines.map((routine) => routine._id).filter(Boolean);

  if (routineIds.length === 0) {
    return routines.map((routine) =>
      formatRoutineForResponse(routine, currentUserId),
    );
  }

  const commentCounts = await Comment.aggregate([
    {
      $match: {
        routine: { $in: routineIds },
      },
    },
    {
      $group: {
        _id: "$routine",
        count: { $sum: 1 },
      },
    },
  ]);

  const commentCountMap = new Map(
    commentCounts.map((item) => [String(item._id), item.count]),
  );

  return routines.map((routine) =>
    formatRoutineForResponse(
      {
        ...(routine.toObject ? routine.toObject() : routine),
        commentsCount: commentCountMap.get(String(routine._id)) || 0,
      },
      currentUserId,
    ),
  );
}

function formatRoutineForResponse(routine, currentUserId = null) {
  const routineObj = routine.toObject ? routine.toObject() : routine;

  return {
    ...routineObj,
    exercises: (routineObj.exercises || []).map((item) => ({
      ...item,
      exerciseData: item.exercise || item.customExercise || null,
      exerciseSource: item.exercise ? "library" : "custom",
    })),
    savedByCount: routineObj.savedBy?.length || 0,
    isSaved: currentUserId
      ? routineObj.savedBy?.some((id) => String(id) === String(currentUserId))
      : false,
    isOwner: currentUserId
      ? String(routineObj.createdBy?._id || routineObj.createdBy) ===
        String(currentUserId)
      : false,
    likesCount: routineObj.likes?.length || 0,
    isLiked: currentUserId
      ? routineObj.likes?.some((id) => id.toString() === currentUserId)
      : false,
    commentsCount: routineObj.commentsCount || 0,
  };
}

function toObjectIdString(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value._id) return String(value._id);
  return String(value);
}

function getExerciseName(exerciseItem) {
  if (!exerciseItem) return "";

  if (exerciseItem.customExercise?.name?.trim()) {
    return exerciseItem.customExercise.name.trim();
  }

  if (exerciseItem.exercise?.name?.trim()) {
    return exerciseItem.exercise.name.trim();
  }

  return "";
}

function getExerciseIdOrKey(exerciseItem) {
  if (!exerciseItem) return "";

  if (exerciseItem.exercise) {
    return `db:${toObjectIdString(exerciseItem.exercise)}`;
  }

  if (exerciseItem.customExercise?.name?.trim()) {
    return `custom:${exerciseItem.customExercise.name.trim().toLowerCase()}`;
  }

  return "";
}

function normaliseStringArray(arr = []) {
  return (arr || [])
    .map((item) => String(item).trim().toLowerCase())
    .filter(Boolean);
}

function countOverlap(arrA = [], arrB = []) {
  const setB = new Set(normaliseStringArray(arrB));
  return normaliseStringArray(arrA).filter((item) => setB.has(item)).length;
}

function calculateRoutinePopularityScore(routine) {
  const likes = routine.likes?.length || 0;
  const saves = routine.savedBy?.length || 0;
  const comments = routine.commentCount || 0;

  return likes * 3 + saves * 4 + comments * 2;
}

function calculateSimilarityScore(baseRoutine, candidateRoutine) {
  let score = 0;

  if (
    baseRoutine.difficulty &&
    candidateRoutine.difficulty &&
    String(baseRoutine.difficulty).toLowerCase() ===
      String(candidateRoutine.difficulty).toLowerCase()
  ) {
    score += 5;
  }

  if (
    baseRoutine.workoutType &&
    candidateRoutine.workoutType &&
    String(baseRoutine.workoutType).toLowerCase() ===
      String(candidateRoutine.workoutType).toLowerCase()
  ) {
    score += 4;
  }

  score += countOverlap(baseRoutine.tags, candidateRoutine.tags) * 3;
  score +=
    countOverlap(baseRoutine.targetMuscles, candidateRoutine.targetMuscles) * 2;
  score += countOverlap(baseRoutine.equipment, candidateRoutine.equipment) * 1;

  return score;
}

router.post(
  "/upload-cover",
  protect,
  routineCoverUpload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      res.json({
        imageUrl: `/uploads/routines/${req.file.filename}`,
      });
    } catch (error) {
      console.error("Error uploading routine cover:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

router.post("/:id/optimise", protect, async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("exercises.exercise", "name");

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    if (
      String(routine.createdBy._id || routine.createdBy) !== String(req.userId)
    ) {
      return res.status(403).json({
        message: "You can only optimise your own routines",
      });
    }

    const now = new Date();
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(now.getDate() - 90);

    const currentExerciseKeys = new Set(
      (routine.exercises || [])
        .map((item) => getExerciseIdOrKey(item))
        .filter(Boolean),
    );

    const baseQuery = {
      _id: { $ne: routine._id },
      isPublic: true,
      $or: [
        { difficulty: routine.difficulty },
        { workoutType: routine.workoutType },
        { tags: { $in: routine.tags || [] } },
        { targetMuscles: { $in: routine.targetMuscles || [] } },
      ],
    };

    const recentCandidatesRaw = await Routine.find({
      ...baseQuery,
      createdAt: { $gte: ninetyDaysAgo },
    })
      .populate("exercises.exercise", "name")
      .lean();

    let usedFallback = false;
    let candidatePool = recentCandidatesRaw;

    if (recentCandidatesRaw.length < 5) {
      usedFallback = true;

      candidatePool = await Routine.find(baseQuery)
        .populate("exercises.exercise", "name")
        .lean();
    }

    if (!candidatePool.length || candidatePool.length < 3) {
      return res.json({
        success: true,
        couldOptimise: false,
        noData: true,
        message: "Could not optimise this routine due to lack of data.",
        usedFallback,
        addSuggestions: [],
        removeSuggestions: [],
        analysedRoutineCount: candidatePool.length || 0,
      });
    }

    const scoredCandidates = candidatePool
      .map((candidate) => ({
        ...candidate,
        similarityScore: calculateSimilarityScore(routine, candidate),
        popularityScore: calculateRoutinePopularityScore(candidate),
      }))
      .filter((candidate) => candidate.similarityScore > 0)
      .sort((a, b) => {
        const scoreA = a.similarityScore * 10 + a.popularityScore;
        const scoreB = b.similarityScore * 10 + b.popularityScore;
        return scoreB - scoreA;
      })
      .slice(0, 10);

    if (scoredCandidates.length < 3) {
      return res.json({
        success: true,
        couldOptimise: false,
        noData: true,
        message: "Could not optimise this routine due to lack of data.",
        usedFallback,
        addSuggestions: [],
        removeSuggestions: [],
        analysedRoutineCount: scoredCandidates.length,
      });
    }

    const frequencyMap = new Map();

    for (const candidate of scoredCandidates) {
      for (const exerciseItem of candidate.exercises || []) {
        const key = getExerciseIdOrKey(exerciseItem);
        const name = getExerciseName(exerciseItem);

        if (!key || !name) continue;

        if (!frequencyMap.has(key)) {
          frequencyMap.set(key, {
            key,
            name,
            count: 0,
            presentInCurrentRoutine: currentExerciseKeys.has(key),
          });
        }

        frequencyMap.get(key).count += 1;
      }
    }

    const addSuggestions = [];
    const removeSuggestions = [];

    const candidateCount = scoredCandidates.length;
    const strongIncludeThreshold = Math.max(3, Math.ceil(candidateCount * 0.4));
    const weakIncludeThreshold = Math.max(1, Math.floor(candidateCount * 0.2));

    for (const [, item] of frequencyMap.entries()) {
      if (
        !item.presentInCurrentRoutine &&
        item.count >= strongIncludeThreshold
      ) {
        addSuggestions.push({
          key: item.key,
          name: item.name,
          frequency: item.count,
          reason: `Appears in ${item.count} of ${candidateCount} similar popular routines.`,
        });
      }
    }

    for (const exerciseItem of routine.exercises || []) {
      const key = getExerciseIdOrKey(exerciseItem);
      const name = getExerciseName(exerciseItem);

      if (!key || !name) continue;

      const frequency = frequencyMap.get(key)?.count || 0;

      if (frequency <= weakIncludeThreshold) {
        removeSuggestions.push({
          key,
          name,
          frequency,
          reason:
            frequency === 0
              ? "Did not appear in the similar routines analysed."
              : `Only appeared in ${frequency} of ${candidateCount} similar popular routines.`,
        });
      }
    }

    addSuggestions.sort((a, b) => b.frequency - a.frequency);
    removeSuggestions.sort((a, b) => a.frequency - b.frequency);

    const hasSuggestions =
      addSuggestions.length > 0 || removeSuggestions.length > 0;

    res.json({
      success: true,
      couldOptimise: hasSuggestions,
      noData: false,
      message: hasSuggestions
        ? "Optimisation suggestions generated successfully."
        : "No strong optimisation suggestions were found.",
      usedFallback,
      analysedRoutineCount: scoredCandidates.length,
      addSuggestions: addSuggestions.slice(0, 8),
      removeSuggestions: removeSuggestions.slice(0, 6),
    });
  } catch (error) {
    console.error("Optimise routine error:", error);
    res.status(500).json({ message: "Failed to optimise routine" });
  }
});

router.get("/recommended", protect, async (req, res) => {
  try {
    const context =
      String(req.query.context || "dashboard").toLowerCase() === "routines"
        ? "routines"
        : "dashboard";

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 3, 1), 10);

    const user = await User.findById(req.userId).select("following");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let routines = [];

    if (context === "routines") {
      const followingIds = user.following || [];

      routines = await Routine.find({
        isPublic: true,
        createdBy: { $in: followingIds, $ne: req.userId },
      })
        .populate("createdBy", "username name avatar")
        .populate("exercises.exercise")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      const withCounts = await attachCommentCounts(routines, req.userId);

      return res.json(withCounts);
    }

    // Dashboard recommendations:
    routines = await Routine.find({
      isPublic: true,
      createdBy: { $ne: req.userId },
    })
      .populate("createdBy", "username name avatar")
      .populate("exercises.exercise")
      .lean();

    const scored = routines
      .map((routine) => {
        const likes = routine.likes?.length || 0;
        const saves = routine.savedBy?.length || 0;
        const popularityScore = likes * 2 + saves * 3;

        return {
          ...routine,
          popularityScore,
        };
      })
      .sort((a, b) => {
        if (b.popularityScore !== a.popularityScore) {
          return b.popularityScore - a.popularityScore;
        }

        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      })
      .slice(0, limit);

    const withCounts = await attachCommentCounts(scored, req.userId);

    return res.json(withCounts);
  } catch (error) {
    console.error("Recommended routines error:", error);
    res.status(500).json({ message: "Failed to load recommendations" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const currentUserId = getOptionalUserId(req);

    const {
      q = "",
      difficulty = "",
      recency = "",
      workoutType = "",
      muscle = "",
      minDuration,
      maxDuration,
      sort = "recent",
      page = 1,
      limit = 10,
    } = req.query;

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const query = {
      isPublic: true,
      isHidden: false,
    };

    if (q.trim()) {
      const searchRegex = new RegExp(q.trim(), "i");

      const matchedUsers = await User.find({
        $or: [{ username: searchRegex }, { name: searchRegex }],
      }).select("_id");

      const userIds = matchedUsers.map((u) => u._id);

      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { focus: searchRegex },
        { workoutType: searchRegex },
        { targetMuscles: searchRegex },
        { createdBy: { $in: userIds } },
      ];
    }

    if (difficulty) {
      query.difficulty = new RegExp(`^${difficulty}$`, "i");
    }

    if (workoutType) {
      const typeRegex = new RegExp(workoutType, "i");

      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { workoutType: typeRegex },
          { tags: typeRegex },
          { focus: typeRegex },
          { targetMuscles: typeRegex },
        ],
      });
    }

    if (muscle) {
      const muscleRegex = new RegExp(muscle, "i");

      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { targetMuscles: muscleRegex },
          { tags: muscleRegex },
          { focus: muscleRegex },
          { workoutType: muscleRegex },
        ],
      });
    }

    if (minDuration !== undefined || maxDuration !== undefined) {
      query.durationMinutes = {};

      if (minDuration !== undefined && minDuration !== "") {
        query.durationMinutes.$gte = Number(minDuration);
      }

      if (maxDuration !== undefined && maxDuration !== "") {
        query.durationMinutes.$lte = Number(maxDuration);
      }
    }

    if (recency) {
      const now = new Date();
      let cutoffDate = null;

      if (recency === "7d") {
        cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - 7);
      } else if (recency === "30d") {
        cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - 30);
      } else if (recency === "90d") {
        cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - 90);
      }

      if (cutoffDate) {
        query.createdAt = { $gte: cutoffDate };
      }
    }

    let mongoSort = { createdAt: -1 };

    if (sort === "oldest") {
      mongoSort = { createdAt: 1 };
    }

    const routines = await Routine.find(query)
      .populate("createdBy", "username name avatar")
      .sort(mongoSort);

    let formattedRoutines = await attachCommentCounts(routines, currentUserId);

    if (sort === "popular") {
      formattedRoutines = [...formattedRoutines].sort((a, b) => {
        const likeDifference = (b.likesCount || 0) - (a.likesCount || 0);

        if (likeDifference !== 0) return likeDifference;

        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      });
    }

    const total = formattedRoutines.length;
    const paginatedItems = formattedRoutines.slice(skip, skip + parsedLimit);

    res.json({
      items: paginatedItems,
      pagination: {
        page: parsedPage,
        totalPages: Math.max(1, Math.ceil(total / parsedLimit)),
        total,
      },
    });
  } catch (error) {
    console.error("Search route error:", error);
    res.status(500).json({ message: "Failed to search routines" });
  }
});

router.post("/:id/like", protect, async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id).populate(
      "createdBy",
      "username name avatar",
    );

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    const userId = String(req.userId);

    const alreadyLiked = routine.likes.some(
      (likeUserId) => String(likeUserId) === userId,
    );

    let updatedRoutine;

    if (alreadyLiked) {
      updatedRoutine = await Routine.findByIdAndUpdate(
        req.params.id,
        { $pull: { likes: req.userId } },
        { new: true },
      );
    } else {
      updatedRoutine = await Routine.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { likes: req.userId } },
        { new: true },
      );

      const actorUser = await User.findById(req.userId).select("username");

      await createNotification({
        recipient: routine.createdBy._id || routine.createdBy,
        actor: req.userId,
        type: "routine_liked",
        title: "Routine liked",
        message: `${actorUser.username} liked your routine "${routine.title}"`,
        entityType: "routine",
        entityId: routine._id,
      });
    }

    const isLiked = updatedRoutine.likes.some(
      (likeUserId) => String(likeUserId) === userId,
    );

    res.json({
      _id: updatedRoutine._id,
      likesCount: updatedRoutine.likes.length,
      isLiked,
    });
  } catch (error) {
    console.error("Like routine error:", error);
    res.status(500).json({ message: "Failed to update like" });
  }
});

router.get("/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find({
      routine: req.params.id,
      isHidden: false,
    })
      .populate("user", "username name avatar")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

router.post("/:id/comments", protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const routine = await Routine.findById(req.params.id).populate(
      "createdBy",
      "username name avatar",
    );

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    const comment = await Comment.create({
      routine: req.params.id,
      user: req.userId,
      text: text.trim(),
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      "user",
      "username name avatar",
    );

    const actorUser = await User.findById(req.userId).select("username");

    await createNotification({
      recipient: routine.createdBy._id || routine.createdBy,
      actor: req.userId,
      type: "routine_commented",
      title: "New comment",
      message: `${actorUser.username} commented on your routine "${routine.title}"`,
      entityType: "routine",
      entityId: routine._id,
    });

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ message: "Failed to create comment" });
  }
});

router.get("/public", protect, async (req, res) => {
  try {
    const routines = await Routine.find({ isPublic: true, isHidden: false })
      .populate("createdBy", "username name avatar")
      .populate("exercises.exercise")
      .sort({ createdAt: -1 });

    res.json(await attachCommentCounts(routines, req.userId));
  } catch (error) {
    console.error("Error fetching public routines:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/mine", protect, async (req, res) => {
  try {
    const routines = await Routine.find({ createdBy: req.userId })
      .populate("createdBy", "username name avatar")
      .populate("exercises.exercise")
      .sort({ updatedAt: -1 });

    res.json(await attachCommentCounts(routines, req.userId));
  } catch (error) {
    console.error("Error fetching user routines:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/saved/list", protect, async (req, res) => {
  try {
    const routines = await Routine.find({ savedBy: req.userId })
      .populate("createdBy", "username name avatar")
      .populate("exercises.exercise")
      .sort({ updatedAt: -1 });

    res.json(await attachCommentCounts(routines, req.userId));
  } catch (error) {
    console.error("Error fetching saved routines:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const currentUserId = getOptionalUserId(req);

    const routine = await Routine.findById(req.params.id)
      .populate("createdBy", "username name avatar")
      .populate("exercises.exercise");

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    if (routine.isHidden) {
      const viewer = currentUserId
        ? await User.findById(currentUserId).select("isAdmin")
        : null;

      const isOwner =
        currentUserId &&
        String(routine.createdBy?._id || routine.createdBy) ===
          String(currentUserId);

      const isAdmin = Boolean(viewer?.isAdmin);

      if (!isOwner && !isAdmin) {
        return res.status(404).json({ message: "Routine not found" });
      }
    }

    const isOwner =
      currentUserId &&
      String(routine.createdBy?._id || routine.createdBy) ===
        String(currentUserId);

    if (!routine.isPublic && !isOwner) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this routine" });
    }

    const commentsCount = await Comment.countDocuments({
      routine: routine._id,
    });

    res.json(
      formatRoutineForResponse(
        {
          ...routine.toObject(),
          commentsCount,
        },
        currentUserId,
      ),
    );
  } catch (error) {
    console.error("Error fetching routine:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      durationMinutes,
      focus,
      workoutType,
      targetMuscles,
      equipment,
      tags,
      notes,
      image,
      isPublic,
      exercises,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Routine title is required" });
    }

    const validationError = await validateRoutineExercises(exercises);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const routine = await Routine.create({
      title: title.trim(),
      description: description || "",
      difficulty: difficulty || "Beginner",
      durationMinutes: Number(durationMinutes) || 45,
      focus: focus || "",
      workoutType: workoutType || "",
      targetMuscles: parseCsvOrArray(targetMuscles),
      equipment: parseCsvOrArray(equipment),
      tags: parseCsvOrArray(tags),
      notes: notes || "",
      image: image || "",
      isPublic: Boolean(isPublic),
      createdBy: req.userId,
      exercises: normaliseRoutineExercises(exercises),
    });

    const populated = await Routine.findById(routine._id)
      .populate("createdBy", "username name avatar followers")
      .populate("exercises.exercise");

    const creator = await User.findById(req.userId).select(
      "username followers",
    );

    if (creator?.followers?.length) {
      await createNotificationsForFollowers({
        actorId: req.userId,
        followers: creator.followers,
        routineId: routine._id,
        actorUsername: creator.username,
        routineTitle: routine.title,
      });
    }

    res.status(201).json(formatRoutineForResponse(populated, req.userId));
  } catch (error) {
    console.error("Error creating routine:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    if (String(routine.createdBy) !== String(req.userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updateData = {
      title: req.body.title?.trim() || routine.title,
      description: req.body.description ?? routine.description,
      difficulty: req.body.difficulty ?? routine.difficulty,
      durationMinutes:
        req.body.durationMinutes !== undefined
          ? Number(req.body.durationMinutes)
          : routine.durationMinutes,
      focus: req.body.focus ?? routine.focus,
      workoutType: req.body.workoutType ?? routine.workoutType,
      targetMuscles:
        req.body.targetMuscles !== undefined
          ? parseCsvOrArray(req.body.targetMuscles)
          : routine.targetMuscles,
      equipment:
        req.body.equipment !== undefined
          ? parseCsvOrArray(req.body.equipment)
          : routine.equipment,
      tags:
        req.body.tags !== undefined
          ? parseCsvOrArray(req.body.tags)
          : routine.tags,
      notes: req.body.notes ?? routine.notes,
      image: req.body.image ?? routine.image,
      isPublic:
        req.body.isPublic !== undefined
          ? Boolean(req.body.isPublic)
          : routine.isPublic,
    };

    if (Array.isArray(req.body.exercises)) {
      const validationError = await validateRoutineExercises(
        req.body.exercises,
      );
      if (validationError) {
        return res.status(400).json({ message: validationError });
      }

      updateData.exercises = normaliseRoutineExercises(req.body.exercises);
    }

    const updated = await Routine.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    })
      .populate("createdBy", "username name avatar")
      .populate("exercises.exercise");

    res.json(formatRoutineForResponse(updated, req.userId));
  } catch (error) {
    console.error("Error updating routine:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    if (String(routine.createdBy) !== String(req.userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Routine.findByIdAndDelete(req.params.id);

    res.json({ message: "Routine deleted" });
  } catch (error) {
    console.error("Error deleting routine:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/save", protect, async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id).populate(
      "createdBy",
      "username name avatar",
    );

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    const alreadySaved = routine.savedBy.some(
      (id) => String(id) === String(req.userId),
    );

    if (!alreadySaved) {
      routine.savedBy.push(req.userId);

      const actorUser = await User.findById(req.userId).select("username");

      await createNotification({
        recipient: routine.createdBy._id || routine.createdBy,
        actor: req.userId,
        type: "routine_saved",
        title: "Routine saved",
        message: `${actorUser.username} saved your routine "${routine.title}"`,
        entityType: "routine",
        entityId: routine._id,
      });
    }

    await routine.save();

    const updatedRoutine = await Routine.findById(routine._id)
      .populate("createdBy", "username name avatar")
      .populate("exercises.exercise");

    res.json(formatRoutineForResponse(updatedRoutine, req.userId));
  } catch (error) {
    console.error("Error saving routine:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id/save", protect, async (req, res) => {
  try {
    const routine = await Routine.findByIdAndUpdate(
      req.params.id,
      { $pull: { savedBy: req.userId } },
      { new: true },
    )
      .populate("createdBy", "username name avatar")
      .populate("exercises.exercise");

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    res.json(formatRoutineForResponse(routine, req.userId));
  } catch (error) {
    console.error("Error unsaving routine:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
