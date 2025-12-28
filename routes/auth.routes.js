import express from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { asyncHandler } from "../middleware/async.middlewaree.js";
import { protect } from "../middleware/auth.middleware.js";
console.log("✅ auth.routes chargé");

const router = express.Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", protect, getMe);

export default router;
