import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
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
    videoLink: {
      type: String,
      default: "",
      trim: true,
    },
    instructions: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "Exercises",
  },
);

exerciseSchema.index({ name: 1, createdBy: 1 }, { unique: false });

export default mongoose.model("Exercise", exerciseSchema);
