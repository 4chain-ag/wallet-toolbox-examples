import { Router, Request, Response } from "express";
import { getUser1Balance, getUser2Balance } from "../functions/balance";

const router = Router();

// Get both user balances
router.get("/balance", async (req: Request, res: Response) => {
  console.log("Balance route called");
  try {
    const user1Balance = await getUser1Balance();
    const user2Balance = await getUser2Balance();

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      data: {
        user1: {
          balance: user1Balance,
        },
        user2: {
          balance: user2Balance,
        },
      },
    });
  } catch (error) {
    console.error("Error getting user balances:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve user balances",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
