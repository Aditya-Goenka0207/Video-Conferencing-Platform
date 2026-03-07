import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true, // improves login query performance
    },

    //select:false so password is not returned in queries by default
    password: {
      type: String,
      required: true,
      select: false,
    },

    //added index for faster token lookup
    token: {
      type: String,
      index: true,
      default: null,
    },
  },
  {
    //automatically stores createdAt and updatedAt
    timestamps: true,
  },
);

userSchema.index({ username: 1 }, { unique: true });

const User = mongoose.model("user", userSchema);

export { User };