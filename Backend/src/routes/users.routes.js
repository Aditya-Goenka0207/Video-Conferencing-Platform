import { Router } from "express";
import {
  addToHistory,
  getUserHistory,
  login,
  register,
} from "../controllers/user.controller.js";

const router = Router();

// ================= AUTH ROUTES =================

// login user
router.route("/login").post(login);
// register user
router.route("/register").post(register);

// ================= USER ACTIVITY =================

router.route("/add_to_activity").post(addToHistory);
router.route("/get_all_activity").get(getUserHistory);

export default router;