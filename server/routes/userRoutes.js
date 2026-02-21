import express from "express";
import { getAllUsers} from "../controllers/userControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all users
router.get("/", protect, getAllUsers);


export default router