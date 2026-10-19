import { Router } from "express";
import { analyzeController } from "../controllers/analyzeController.js";

const router = Router();
router.post("/", analyzeController);

export default router;
