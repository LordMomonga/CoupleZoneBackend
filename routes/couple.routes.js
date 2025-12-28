import express from "express";
import { createCouple, joinCouple } from "../controllers/couple.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { getProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/create", protect, createCouple);

router.post("/join", protect, joinCouple);

router.get("/myProfile", protect, getProfile);

export default router;