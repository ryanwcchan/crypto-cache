import { Router } from "express";
import { addCoin, getHoldings } from "../controllers/holdings.controllers";
import protectRoute from "../middleware/protectedRoute";

const router = Router();

router.post("/", protectRoute, addCoin);
router.get("/", protectRoute, getHoldings);

export default router;
