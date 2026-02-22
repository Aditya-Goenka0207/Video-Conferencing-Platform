import { User } from "../models/user.model.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";


// ================= LOGIN =================
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Please provide all details" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User Not Found!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid credentials" });
    }

    const token = crypto.randomBytes(20).toString("hex");

    user.token = token;
    await user.save();

    return res
      .status(httpStatus.OK)
      .json({ token: token });

  } catch (e) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: `Something went wrong ${e.message}` });
  }
};


// ================= REGISTER =================
export const register = async (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Please provide all details" });
  }

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res
        .status(httpStatus.CONFLICT)
        .json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    return res
      .status(httpStatus.CREATED)
      .json({ message: "User Registered Successfully" });

  } catch (e) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: `Something went wrong ${e.message}` });
  }
};


// ================= GET USER HISTORY =================
export const getUserHistory = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Token is required" });
  }

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid token" });
    }

    const meetings = await Meeting.find({ user_id: user.username });

    return res
      .status(httpStatus.OK)
      .json(meetings);

  } catch (e) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: `Something went wrong ${e.message}` });
  }
};


// ================= ADD TO HISTORY =================
export const addToHistory = async (req, res) => {
  const { token, meetingCode } = req.body;

  if (!token || !meetingCode) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Token and meetingCode are required" });
  }

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid token" });
    }

    const newMeeting = new Meeting({
      user_id: user.username,
      meetingCode: meetingCode
    });

    await newMeeting.save();

    return res
      .status(httpStatus.CREATED)
      .json({ message: "Added meeting to history" });

  } catch (e) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: `Something went wrong ${e.message}` });
  }
};