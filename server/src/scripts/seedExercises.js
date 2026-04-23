import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../db.js";
import Exercise from "../models/Exercise.model.js";
import defaultExercises from "../data/defaultExercises.js";

dotenv.config();

async function seedExercises() {
  try {
    await connectDB(process.env.MONGO_URI);

    for (const exercise of defaultExercises) {
      await Exercise.updateOne(
        { name: exercise.name, isSystem: true },
        { $set: exercise },
        { upsert: true },
      );
    }

    console.log(`Seeded/updated ${defaultExercises.length} exercises`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed exercises:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedExercises();
