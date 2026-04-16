import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.model.js";
import Routine from "../models/Routine.model.js";
import Exercise from "../models/Exercise.model.js";

dotenv.config();

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function makeFakeIds(count) {
  return Array.from({ length: count }, () => new mongoose.Types.ObjectId());
}

function pickExercise(exerciseMap, names) {
  for (const name of names) {
    const found = exerciseMap.get(name.toLowerCase());
    if (found) return found;
  }
  return null;
}

function buildRoutineExercise({
  exerciseDoc = null,
  customName = "",
  muscleGroup = "",
  equipment = [],
  description = "",
  order = 1,
  sets = 3,
  reps = "8-12",
  restSeconds = 60,
  notes = "",
}) {
  if (exerciseDoc) {
    return {
      exercise: exerciseDoc._id,
      customExercise: null,
      order,
      sets,
      reps,
      restSeconds,
      notes,
    };
  }

  return {
    exercise: null,
    customExercise: {
      name: customName,
      muscleGroup,
      equipment,
      description,
      image: "",
      instructions: [],
    },
    order,
    sets,
    reps,
    restSeconds,
    notes,
  };
}

async function buildExerciseLibrary() {
  const exercises = await Exercise.find().lean();
  const map = new Map();

  for (const exercise of exercises) {
    if (exercise.name) {
      map.set(String(exercise.name).toLowerCase(), exercise);
    }
  }

  return map;
}

function exerciseOrCustom(exerciseMap, possibleNames, fallback) {
  const match = pickExercise(exerciseMap, possibleNames);

  if (match) {
    return { exerciseDoc: match };
  }

  return {
    exerciseDoc: null,
    customName: fallback.name,
    muscleGroup: fallback.muscleGroup,
    equipment: fallback.equipment,
    description: fallback.description,
  };
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const owner = await User.findOne().select("_id username");
    if (!owner) {
      throw new Error("No users found. Create at least one user first.");
    }

    const exerciseMap = await buildExerciseLibrary();
    const fakeIds = makeFakeIds(20);

    const bench = exerciseOrCustom(
      exerciseMap,
      ["Bench Press", "Barbell Bench Press"],
      {
        name: "Bench Press",
        muscleGroup: "Chest",
        equipment: ["Barbell", "Bench"],
        description: "Flat barbell press for chest strength and hypertrophy.",
      },
    );

    const inclineDb = exerciseOrCustom(
      exerciseMap,
      ["Incline Dumbbell Press", "Incline DB Press"],
      {
        name: "Incline Dumbbell Press",
        muscleGroup: "Chest",
        equipment: ["Dumbbell", "Bench"],
        description: "Upper chest pressing movement.",
      },
    );

    const shoulderPress = exerciseOrCustom(
      exerciseMap,
      ["Shoulder Press", "Seated Dumbbell Shoulder Press", "Overhead Press"],
      {
        name: "Shoulder Press",
        muscleGroup: "Shoulders",
        equipment: ["Dumbbell"],
        description: "Vertical press targeting the deltoids.",
      },
    );

    const lateralRaise = exerciseOrCustom(
      exerciseMap,
      ["Lateral Raise", "Dumbbell Lateral Raise"],
      {
        name: "Lateral Raise",
        muscleGroup: "Shoulders",
        equipment: ["Dumbbell"],
        description: "Isolation movement for side delts.",
      },
    );

    const cableFly = exerciseOrCustom(
      exerciseMap,
      ["Cable Fly", "Cable Chest Fly"],
      {
        name: "Cable Fly",
        muscleGroup: "Chest",
        equipment: ["Cable"],
        description: "Chest fly variation using cable resistance.",
      },
    );

    const tricepPushdown = exerciseOrCustom(
      exerciseMap,
      ["Tricep Pushdown", "Cable Tricep Pushdown"],
      {
        name: "Tricep Pushdown",
        muscleGroup: "Triceps",
        equipment: ["Cable"],
        description: "Triceps isolation exercise.",
      },
    );

    const dips = exerciseOrCustom(exerciseMap, ["Dips", "Parallel Bar Dips"], {
      name: "Dips",
      muscleGroup: "Chest/Triceps",
      equipment: ["Bodyweight"],
      description: "Compound pushing exercise.",
    });

    const skullCrushers = exerciseOrCustom(
      exerciseMap,
      ["Skull Crushers", "EZ Bar Skull Crushers"],
      {
        name: "Skull Crushers",
        muscleGroup: "Triceps",
        equipment: ["Barbell"],
        description: "Triceps extension variation.",
      },
    );

    const frontRaise = exerciseOrCustom(
      exerciseMap,
      ["Front Raise", "Dumbbell Front Raise"],
      {
        name: "Front Raise",
        muscleGroup: "Shoulders",
        equipment: ["Dumbbell"],
        description: "Anterior delt isolation movement.",
      },
    );

    const squat = exerciseOrCustom(
      exerciseMap,
      ["Back Squat", "Barbell Back Squat", "Squat"],
      {
        name: "Back Squat",
        muscleGroup: "Quads",
        equipment: ["Barbell"],
        description: "Compound lower body movement.",
      },
    );

    const rdl = exerciseOrCustom(exerciseMap, ["Romanian Deadlift", "RDL"], {
      name: "Romanian Deadlift",
      muscleGroup: "Hamstrings",
      equipment: ["Barbell"],
      description: "Hip hinge for posterior chain development.",
    });

    const legPress = exerciseOrCustom(exerciseMap, ["Leg Press"], {
      name: "Leg Press",
      muscleGroup: "Quads",
      equipment: ["Machine"],
      description: "Machine-based lower body press.",
    });

    const latPulldown = exerciseOrCustom(
      exerciseMap,
      ["Lat Pulldown", "Lat Pulldowns"],
      {
        name: "Lat Pulldown",
        muscleGroup: "Back",
        equipment: ["Cable"],
        description: "Vertical pulling movement.",
      },
    );

    const barbellRow = exerciseOrCustom(
      exerciseMap,
      ["Barbell Row", "Bent Over Row"],
      {
        name: "Barbell Row",
        muscleGroup: "Back",
        equipment: ["Barbell"],
        description: "Horizontal row for upper back.",
      },
    );

    const bicepCurl = exerciseOrCustom(
      exerciseMap,
      ["Bicep Curl", "Dumbbell Curl"],
      {
        name: "Bicep Curl",
        muscleGroup: "Biceps",
        equipment: ["Dumbbell"],
        description: "Biceps isolation movement.",
      },
    );

    const targetRoutineTitle = "My Push Routine Test";

    const routines = [
      {
        title: targetRoutineTitle,
        description:
          "Base owner routine used to test optimisation suggestions.",
        difficulty: "Intermediate",
        durationMinutes: 60,
        focus: "Hypertrophy",
        workoutType: "Push",
        targetMuscles: ["Chest", "Shoulders", "Triceps"],
        equipment: ["Barbell", "Dumbbell", "Cable"],
        tags: ["push", "hypertrophy", "upper-body"],
        notes: "Target routine for optimiser testing.",
        image: "",
        isPublic: true,
        createdBy: owner._id,
        exercises: [
          buildRoutineExercise({
            ...bench,
            order: 1,
            sets: 4,
            reps: "6-8",
            restSeconds: 90,
          }),
          buildRoutineExercise({
            ...inclineDb,
            order: 2,
            sets: 3,
            reps: "8-10",
            restSeconds: 75,
          }),
          buildRoutineExercise({
            ...shoulderPress,
            order: 3,
            sets: 3,
            reps: "8-10",
            restSeconds: 75,
          }),
          buildRoutineExercise({
            ...tricepPushdown,
            order: 4,
            sets: 3,
            reps: "10-12",
            restSeconds: 60,
          }),
          buildRoutineExercise({
            ...frontRaise,
            order: 5,
            sets: 2,
            reps: "12-15",
            restSeconds: 45,
          }),
        ],
        likes: [fakeIds[0]],
        savedBy: [fakeIds[1]],
        createdAt: daysAgo(10),
        updatedAt: daysAgo(10),
      },

      {
        title: "Popular Push A",
        description: "Recent high-performing push workout.",
        difficulty: "Intermediate",
        durationMinutes: 65,
        focus: "Hypertrophy",
        workoutType: "Push",
        targetMuscles: ["Chest", "Shoulders", "Triceps"],
        equipment: ["Barbell", "Dumbbell", "Cable"],
        tags: ["push", "hypertrophy", "upper-body"],
        notes: "",
        image: "",
        isPublic: true,
        createdBy: owner._id,
        exercises: [
          buildRoutineExercise({
            ...bench,
            order: 1,
            sets: 4,
            reps: "6-8",
            restSeconds: 90,
          }),
          buildRoutineExercise({
            ...inclineDb,
            order: 2,
            sets: 3,
            reps: "8-10",
            restSeconds: 75,
          }),
          buildRoutineExercise({
            ...lateralRaise,
            order: 3,
            sets: 3,
            reps: "12-15",
            restSeconds: 45,
          }),
          buildRoutineExercise({
            ...cableFly,
            order: 4,
            sets: 3,
            reps: "12-15",
            restSeconds: 45,
          }),
          buildRoutineExercise({
            ...tricepPushdown,
            order: 5,
            sets: 3,
            reps: "10-12",
            restSeconds: 60,
          }),
        ],
        likes: [fakeIds[0], fakeIds[1], fakeIds[2], fakeIds[3], fakeIds[4]],
        savedBy: [fakeIds[5], fakeIds[6], fakeIds[7]],
        createdAt: daysAgo(12),
        updatedAt: daysAgo(12),
      },

      {
        title: "Popular Push B",
        description: "Trending push workout with strong shoulder volume.",
        difficulty: "Intermediate",
        durationMinutes: 58,
        focus: "Hypertrophy",
        workoutType: "Push",
        targetMuscles: ["Chest", "Shoulders", "Triceps"],
        equipment: ["Dumbbell", "Cable", "Bodyweight"],
        tags: ["push", "upper-body", "mass"],
        notes: "",
        image: "",
        isPublic: true,
        createdBy: owner._id,
        exercises: [
          buildRoutineExercise({
            ...bench,
            order: 1,
            sets: 4,
            reps: "6-8",
            restSeconds: 90,
          }),
          buildRoutineExercise({
            ...shoulderPress,
            order: 2,
            sets: 3,
            reps: "8-10",
            restSeconds: 75,
          }),
          buildRoutineExercise({
            ...lateralRaise,
            order: 3,
            sets: 4,
            reps: "12-15",
            restSeconds: 45,
          }),
          buildRoutineExercise({
            ...dips,
            order: 4,
            sets: 3,
            reps: "8-12",
            restSeconds: 60,
          }),
          buildRoutineExercise({
            ...skullCrushers,
            order: 5,
            sets: 3,
            reps: "10-12",
            restSeconds: 60,
          }),
        ],
        likes: [fakeIds[0], fakeIds[1], fakeIds[2], fakeIds[3]],
        savedBy: [fakeIds[8], fakeIds[9], fakeIds[10]],
        createdAt: daysAgo(18),
        updatedAt: daysAgo(18),
      },

      {
        title: "Popular Push C",
        description: "Recent push session built around classic compounds.",
        difficulty: "Intermediate",
        durationMinutes: 62,
        focus: "Strength + Hypertrophy",
        workoutType: "Push",
        targetMuscles: ["Chest", "Shoulders", "Triceps"],
        equipment: ["Barbell", "Dumbbell", "Cable"],
        tags: ["push", "upper-body", "strength"],
        notes: "",
        image: "",
        isPublic: true,
        createdBy: owner._id,
        exercises: [
          buildRoutineExercise({
            ...bench,
            order: 1,
            sets: 5,
            reps: "5",
            restSeconds: 120,
          }),
          buildRoutineExercise({
            ...inclineDb,
            order: 2,
            sets: 3,
            reps: "8-10",
            restSeconds: 75,
          }),
          buildRoutineExercise({
            ...lateralRaise,
            order: 3,
            sets: 3,
            reps: "12-15",
            restSeconds: 45,
          }),
          buildRoutineExercise({
            ...cableFly,
            order: 4,
            sets: 3,
            reps: "12-15",
            restSeconds: 45,
          }),
          buildRoutineExercise({
            ...tricepPushdown,
            order: 5,
            sets: 3,
            reps: "12",
            restSeconds: 60,
          }),
        ],
        likes: [fakeIds[0], fakeIds[1], fakeIds[2]],
        savedBy: [fakeIds[3], fakeIds[4]],
        createdAt: daysAgo(25),
        updatedAt: daysAgo(25),
      },

      {
        title: "Popular Push D",
        description: "Balanced push routine from the last 90 days.",
        difficulty: "Intermediate",
        durationMinutes: 55,
        focus: "Hypertrophy",
        workoutType: "Push",
        targetMuscles: ["Chest", "Shoulders", "Triceps"],
        equipment: ["Barbell", "Dumbbell", "Cable"],
        tags: ["push", "hypertrophy"],
        notes: "",
        image: "",
        isPublic: true,
        createdBy: owner._id,
        exercises: [
          buildRoutineExercise({
            ...bench,
            order: 1,
            sets: 4,
            reps: "6-8",
            restSeconds: 90,
          }),
          buildRoutineExercise({
            ...inclineDb,
            order: 2,
            sets: 3,
            reps: "8-10",
            restSeconds: 75,
          }),
          buildRoutineExercise({
            ...lateralRaise,
            order: 3,
            sets: 3,
            reps: "15",
            restSeconds: 45,
          }),
          buildRoutineExercise({
            ...tricepPushdown,
            order: 4,
            sets: 3,
            reps: "12",
            restSeconds: 60,
          }),
          buildRoutineExercise({
            ...dips,
            order: 5,
            sets: 2,
            reps: "10",
            restSeconds: 60,
          }),
        ],
        likes: [fakeIds[11], fakeIds[12], fakeIds[13]],
        savedBy: [fakeIds[14], fakeIds[15]],
        createdAt: daysAgo(40),
        updatedAt: daysAgo(40),
      },

      {
        title: "Popular Push E",
        description: "Recent shoulder-dominant push routine.",
        difficulty: "Intermediate",
        durationMinutes: 57,
        focus: "Volume",
        workoutType: "Push",
        targetMuscles: ["Shoulders", "Chest", "Triceps"],
        equipment: ["Dumbbell", "Cable"],
        tags: ["push", "shoulders", "upper-body"],
        notes: "",
        image: "",
        isPublic: true,
        createdBy: owner._id,
        exercises: [
          buildRoutineExercise({
            ...shoulderPress,
            order: 1,
            sets: 4,
            reps: "8-10",
            restSeconds: 75,
          }),
          buildRoutineExercise({
            ...lateralRaise,
            order: 2,
            sets: 4,
            reps: "12-15",
            restSeconds: 45,
          }),
          buildRoutineExercise({
            ...bench,
            order: 3,
            sets: 3,
            reps: "6-8",
            restSeconds: 90,
          }),
          buildRoutineExercise({
            ...cableFly,
            order: 4,
            sets: 3,
            reps: "12-15",
            restSeconds: 45,
          }),
          buildRoutineExercise({
            ...skullCrushers,
            order: 5,
            sets: 3,
            reps: "10-12",
            restSeconds: 60,
          }),
        ],
        likes: [
          fakeIds[1],
          fakeIds[2],
          fakeIds[3],
          fakeIds[4],
          fakeIds[5],
          fakeIds[6],
        ],
        savedBy: [fakeIds[7], fakeIds[8]],
        createdAt: daysAgo(52),
        updatedAt: daysAgo(52),
      },

      {
        title: "Push Fallback Older A",
        description: "Older fallback routine still relevant to push training.",
        difficulty: "Intermediate",
        durationMinutes: 60,
        focus: "Strength",
        workoutType: "Push",
        targetMuscles: ["Chest", "Shoulders", "Triceps"],
        equipment: ["Barbell", "Dumbbell"],
        tags: ["push", "upper-body"],
        notes: "",
        image: "",
        isPublic: true,
        createdBy: owner._id,
        exercises: [
          buildRoutineExercise({
            ...bench,
            order: 1,
            sets: 5,
            reps: "5",
            restSeconds: 120,
          }),
          buildRoutineExercise({
            ...inclineDb,
            order: 2,
            sets: 4,
            reps: "8",
            restSeconds: 90,
          }),
          buildRoutineExercise({
            ...lateralRaise,
            order: 3,
            sets: 3,
            reps: "15",
            restSeconds: 45,
          }),
          buildRoutineExercise({
            ...tricepPushdown,
            order: 4,
            sets: 3,
            reps: "12",
            restSeconds: 60,
          }),
        ],
        likes: [fakeIds[0], fakeIds[1], fakeIds[2]],
        savedBy: [fakeIds[3]],
        createdAt: daysAgo(140),
        updatedAt: daysAgo(140),
      },

      {
        title: "Push Fallback Older B",
        description: "Older routine that should only be used when needed.",
        difficulty: "Intermediate",
        durationMinutes: 63,
        focus: "Hypertrophy",
        workoutType: "Push",
        targetMuscles: ["Chest", "Shoulders", "Triceps"],
        equipment: ["Barbell", "Cable", "Dumbbell"],
        tags: ["push", "hypertrophy", "classic"],
        notes: "",
        image: "",
        isPublic: true,
        createdBy: owner._id,
        exercises: [
          buildRoutineExercise({
            ...bench,
            order: 1,
            sets: 4,
            reps: "6-8",
            restSeconds: 90,
          }),
          buildRoutineExercise({
            ...inclineDb,
            order: 2,
            sets: 3,
            reps: "8-10",
            restSeconds: 75,
          }),
          buildRoutineExercise({
            ...cableFly,
            order: 3,
            sets: 3,
            reps: "12-15",
            restSeconds: 45,
          }),
          buildRoutineExercise({
            ...dips,
            order: 4,
            sets: 3,
            reps: "10",
            restSeconds: 60,
          }),
          buildRoutineExercise({
            ...tricepPushdown,
            order: 5,
            sets: 3,
            reps: "12",
            restSeconds: 60,
          }),
        ],
        likes: [fakeIds[4], fakeIds[5]],
        savedBy: [fakeIds[6], fakeIds[7]],
        createdAt: daysAgo(175),
        updatedAt: daysAgo(175),
      },

      {
        title: "Pull Routine Noise",
        description: "Unrelated pull routine to test filtering.",
        difficulty: "Intermediate",
        durationMinutes: 58,
        focus: "Hypertrophy",
        workoutType: "Pull",
        targetMuscles: ["Back", "Biceps"],
        equipment: ["Barbell", "Cable"],
        tags: ["pull", "back", "upper-body"],
        notes: "",
        image: "",
        isPublic: true,
        createdBy: owner._id,
        exercises: [
          buildRoutineExercise({
            ...latPulldown,
            order: 1,
            sets: 4,
            reps: "8-12",
            restSeconds: 60,
          }),
          buildRoutineExercise({
            ...barbellRow,
            order: 2,
            sets: 4,
            reps: "8-10",
            restSeconds: 75,
          }),
          buildRoutineExercise({
            ...bicepCurl,
            order: 3,
            sets: 3,
            reps: "10-12",
            restSeconds: 45,
          }),
        ],
        likes: [fakeIds[0], fakeIds[1]],
        savedBy: [fakeIds[2]],
        createdAt: daysAgo(14),
        updatedAt: daysAgo(14),
      },

      {
        title: "Leg Routine Noise",
        description: "Unrelated leg routine to test filtering.",
        difficulty: "Intermediate",
        durationMinutes: 70,
        focus: "Hypertrophy",
        workoutType: "Legs",
        targetMuscles: ["Quads", "Glutes", "Hamstrings"],
        equipment: ["Barbell", "Machine"],
        tags: ["legs", "lower-body"],
        notes: "",
        image: "",
        isPublic: true,
        createdBy: owner._id,
        exercises: [
          buildRoutineExercise({
            ...squat,
            order: 1,
            sets: 4,
            reps: "6-8",
            restSeconds: 120,
          }),
          buildRoutineExercise({
            ...rdl,
            order: 2,
            sets: 4,
            reps: "8-10",
            restSeconds: 90,
          }),
          buildRoutineExercise({
            ...legPress,
            order: 3,
            sets: 3,
            reps: "10-12",
            restSeconds: 75,
          }),
        ],
        likes: [fakeIds[3], fakeIds[4]],
        savedBy: [fakeIds[5]],
        createdAt: daysAgo(20),
        updatedAt: daysAgo(20),
      },

      {
        title: "Beginner Full Body Noise",
        description: "Different difficulty and broader workout type.",
        difficulty: "Beginner",
        durationMinutes: 45,
        focus: "General Fitness",
        workoutType: "Full Body",
        targetMuscles: ["Chest", "Back", "Legs"],
        equipment: ["Dumbbell"],
        tags: ["beginner", "full-body"],
        notes: "",
        image: "",
        isPublic: true,
        createdBy: owner._id,
        exercises: [
          buildRoutineExercise({
            ...bench,
            order: 1,
            sets: 3,
            reps: "10-12",
            restSeconds: 60,
          }),
          buildRoutineExercise({
            ...latPulldown,
            order: 2,
            sets: 3,
            reps: "10-12",
            restSeconds: 60,
          }),
          buildRoutineExercise({
            ...squat,
            order: 3,
            sets: 3,
            reps: "10",
            restSeconds: 75,
          }),
        ],
        likes: [fakeIds[6]],
        savedBy: [],
        createdAt: daysAgo(7),
        updatedAt: daysAgo(7),
      },
    ];

    await Routine.deleteMany({
      createdBy: owner._id,
      title: {
        $in: routines.map((r) => r.title),
      },
    });

    await Routine.insertMany(routines);

    console.log("Optimiser seed data inserted successfully.");
    console.log(`Owner user: ${owner.username}`);
    console.log(`Target routine title: ${targetRoutineTitle}`);
    console.log("You can now test the optimiser on that routine.");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed script failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

run();
