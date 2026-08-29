import { Router } from "express";
import {
  addCoin,
  getHoldings,
  updateHolding,
  deleteHolding,
} from "../controllers/holdings.controllers";
import protectRoute from "../middleware/protectedRoute";

const router = Router();

router.post("/", protectRoute, addCoin);
router.get("/", protectRoute, getHoldings);
router.patch("/:holdingId", protectRoute, updateHolding);
router.delete("/:holdingId", protectRoute, deleteHolding);

export default router;
