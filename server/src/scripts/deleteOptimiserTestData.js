import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.model.js";
import Routine from "../models/Routine.model.js";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const owner = await User.findOne().select("_id username");

    if (!owner) {
      throw new Error("No users found.");
    }

    const titlesToDelete = [
      "My Push Routine Test",
      "Popular Push A",
      "Popular Push B",
      "Popular Push C",
      "Popular Push D",
      "Popular Push E",
      "Push Fallback Older A",
      "Push Fallback Older B",
      "Pull Routine Noise",
      "Leg Routine Noise",
      "Beginner Full Body Noise",
    ];

    const result = await Routine.deleteMany({
      createdBy: owner._id,
      title: { $in: titlesToDelete },
    });

    console.log(`Deleted ${result.deletedCount} optimiser test routines.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Delete script failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

run();
