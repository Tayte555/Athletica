import express from "express";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/auth.middleware.js";
import Routine from "../models/Routine.model.js";
import Exercise from "../models/Exercise.model.js";
import User from "../models/User.model.js";
import Comment from "../models/Comment.model.js";

const router = express.Router();

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
      page = 1,
      limit = 10,
    } = req.query;

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const query = {
      isPublic: true,
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

    const [items, total] = await Promise.all([
      Routine.find(query)
        .populate("createdBy", "username name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit),
      Routine.countDocuments(query),
    ]);

    const formattedItems = await attachCommentCounts(items, currentUserId);

    res.json({
      items: formattedItems,
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

    const userId = req.userId.toString();
    const alreadyLiked = routine.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      routine.likes = routine.likes.filter((id) => id.toString() !== userId);
    } else {
      routine.likes.push(req.userId);
    }

    await routine.save();

    res.json({
      _id: routine._id,
      likesCount: routine.likes.length,
      isLiked: routine.likes.some((id) => id.toString() === userId),
    });
  } catch (error) {
    console.error("Like routine error:", error);
    res.status(500).json({ message: "Failed to update like" });
  }
});

router.get("/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ routine: req.params.id })
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

    const routine = await Routine.findById(req.params.id);
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

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ message: "Failed to create comment" });
  }
});

router.get("/public", protect, async (req, res) => {
  try {
    const routines = await Routine.find({ isPublic: true })
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
      .populate("createdBy", "username name avatar")
      .populate("exercises.exercise");

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
    const routine = await Routine.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { savedBy: req.userId } },
      { new: true },
    )
      .populate("createdBy", "username name avatar")
      .populate("exercises.exercise");

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    res.json(formatRoutineForResponse(routine, req.userId));
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
