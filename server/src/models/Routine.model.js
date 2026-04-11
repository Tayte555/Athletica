import mongoose from "mongoose";

const customExerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    muscleGroup: {
      type: String,
      default: "",
      trim: true,
    },
    equipment: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    instructions: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const routineExerciseSchema = new mongoose.Schema(
  {
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
      default: null,
    },
    customExercise: {
      type: customExerciseSchema,
      default: null,
    },
    order: {
      type: Number,
      required: true,
      default: 1,
    },
    sets: {
      type: Number,
      default: 3,
    },
    reps: {
      type: String,
      default: "8-12",
      trim: true,
    },
    restSeconds: {
      type: Number,
      default: 60,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false },
);

const routineSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    difficulty: {
      type: String,
      default: "Beginner",
      trim: true,
    },
    durationMinutes: {
      type: Number,
      default: 45,
    },
    focus: {
      type: String,
      default: "",
      trim: true,
    },
    workoutType: {
      type: String,
      default: "",
      trim: true,
    },
    targetMuscles: {
      type: [String],
      default: [],
    },
    equipment: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    exercises: {
      type: [routineExerciseSchema],
      default: [],
    },
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    collection: "Routines",
  },
);

export default mongoose.model("Routine", routineSchema);
