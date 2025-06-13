import { Router, Request, Response, NextFunction } from "express";
import { faucetInternalize } from "../functions/internalizeTx";
import { faucetInternalizeBeef } from "../functions/internalizeBeef";

const router = Router();

// Internalize transaction endpoint
router.post(
  "/internalize",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log("Internalize route called");
    try {
      const { txid, identityKey, vout, beef } = req.body;

      // Validate required fields
      if (!txid || !identityKey) {
        res.status(400).json({
          status: "error",
          message: "Both txid and identityKey are required",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // TODO: doesn't return anything but we can validate it by adding if we want?
      if(beef) {
        await faucetInternalizeBeef(
          txid,
          vout || 0,
          identityKey,
          beef
        );
      } else {
        await faucetInternalize(
          txid,
          vout || 0,
          identityKey
        );
      }
      
      res.json({
        status: "success",
        message: "Transaction internalized successfully",
        timestamp: new Date().toISOString(),
        data: {
          txid,
          identityKey,
          vout: vout || 0,
        },
      });
    } catch (error) {
      console.error("Error internalizing transaction:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to internalize transaction",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    }
  }
);

export default router;
