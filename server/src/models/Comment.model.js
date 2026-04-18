import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    routine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Routine",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    moderationNote: {
      type: String,
      default: "",
      trim: true,
    },
    lastModeratedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Comment", commentSchema);
