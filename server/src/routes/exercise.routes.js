import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import Exercise from "../models/Exercise.model.js";

const router = express.Router();

const defaultExercises = [
  {
    name: "Barbell Back Squat",
    muscleGroup: "Legs",
    equipment: ["Barbell", "Rack"],
    description: "Compound lower body movement focused on quads and glutes.",
    image: "",
    instructions: [
      "Brace core",
      "Sit back and down",
      "Drive through the floor",
    ],
    isSystem: true,
  },
  {
    name: "Romanian Deadlift",
    muscleGroup: "Hamstrings",
    equipment: ["Barbell"],
    description: "Hip hinge movement for hamstrings and glutes.",
    image: "",
    instructions: ["Soft knees", "Hinge hips back", "Keep bar close"],
    isSystem: true,
  },
  {
    name: "Bench Press",
    muscleGroup: "Chest",
    equipment: ["Barbell", "Bench"],
    description: "Main chest press movement.",
    image: "",
    instructions: ["Set shoulders", "Control descent", "Press explosively"],
    isSystem: true,
  },
  {
    name: "Incline Dumbbell Press",
    muscleGroup: "Chest",
    equipment: ["Dumbbells", "Bench"],
    description: "Upper chest pressing movement.",
    image: "",
    instructions: ["Set bench incline", "Lower with control", "Drive upward"],
    isSystem: true,
  },
  {
    name: "Lat Pulldown",
    muscleGroup: "Back",
    equipment: ["Cable Machine"],
    description: "Vertical pull for lats and upper back.",
    image: "",
    instructions: ["Lean back slightly", "Pull elbows down", "Control return"],
    isSystem: true,
  },
  {
    name: "Seated Cable Row",
    muscleGroup: "Back",
    equipment: ["Cable Machine"],
    description: "Horizontal pull for mid-back.",
    image: "",
    instructions: ["Stay upright", "Pull to torso", "Squeeze shoulder blades"],
    isSystem: true,
  },
  {
    name: "Overhead Press",
    muscleGroup: "Shoulders",
    equipment: ["Barbell"],
    description: "Compound shoulder press.",
    image: "",
    instructions: ["Brace core", "Press overhead", "Lock out under control"],
    isSystem: true,
  },
  {
    name: "Lateral Raise",
    muscleGroup: "Shoulders",
    equipment: ["Dumbbells"],
    description: "Isolation movement for side delts.",
    image: "",
    instructions: ["Slight elbow bend", "Raise to side", "Lower slowly"],
    isSystem: true,
  },
  {
    name: "Barbell Curl",
    muscleGroup: "Biceps",
    equipment: ["Barbell"],
    description: "Isolation movement for biceps.",
    image: "",
    instructions: ["Keep elbows tucked", "Curl upward", "Lower with control"],
    isSystem: true,
  },
  {
    name: "Tricep Pushdown",
    muscleGroup: "Triceps",
    equipment: ["Cable Machine"],
    description: "Isolation movement for triceps.",
    image: "",
    instructions: ["Pin elbows", "Push down fully", "Return slowly"],
    isSystem: true,
  },
  {
    name: "Plank",
    muscleGroup: "Core",
    equipment: [],
    description: "Core stability hold.",
    image: "",
    instructions: ["Brace abs", "Keep body straight", "Hold position"],
    isSystem: true,
  },
  {
    name: "Walking Lunges",
    muscleGroup: "Legs",
    equipment: ["Dumbbells"],
    description: "Unilateral lower body movement.",
    image: "",
    instructions: ["Long stride", "Drop rear knee", "Drive through front foot"],
    isSystem: true,
  },
];

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
