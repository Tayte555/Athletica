import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import Exercise from "../models/Exercise.model.js";
import defaultExercises from "../data/defaultExercises.js";

const router = express.Router();

async function ensureDefaultExercises() {
  const count = await Exercise.countDocuments();
  if (count === 0) {
    await Exercise.insertMany(defaultExercises);
  }
}

router.get("/library", protect, async (req, res) => {
  try {
    await ensureDefaultExercises();

    const exercises = await Exercise.find({}).sort({ name: 1 });

    res.json(exercises);
  } catch (error) {
    console.error("Error fetching exercise library:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
