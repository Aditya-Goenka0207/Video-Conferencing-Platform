import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
      trim: true,
    },
    meetingCode: {
      type: String,
      required: true,
      trim: true,
      index: true, //improves search performance
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // automatically creates createdAt & updatedAt
    timestamps: true,
  },
);

//prevent duplicate meeting history for same user
// meetingSchema.index({ user_id: 1, meetingCode: 1 }, { unique: true });

const Meeting = mongoose.model("meeting", meetingSchema);

export { Meeting };
