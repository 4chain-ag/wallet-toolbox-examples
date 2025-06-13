import { Router, Request, Response } from "express";
import { getUser1Setup, getUser2Setup } from "../functions/setup";
import { getAddressFromDerivation } from "../functions/keys";

const router = Router();

// Get both user identity keys and addresses
router.get("/keys", async (req: Request, res: Response) => {
  console.log("Keys route called");
  try {
    const user1Setup = await getUser1Setup();
    const user2Setup = await getUser2Setup();

    const user1Address = getAddressFromDerivation(user1Setup);
    const user2Address = getAddressFromDerivation(user2Setup);

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      data: {
        user1: {
          identityKey: user1Setup.identityKey,
          address: user1Address,
        },
        user2: {
          identityKey: user2Setup.identityKey,
          address: user2Address,
        },
      },
    });
  } catch (error) {
    console.error("Error getting user keys:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve identity keys",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
