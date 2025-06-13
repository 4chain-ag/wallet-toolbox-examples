import { Router, Request, Response } from "express";
import { faucet } from "../functions/faucet";

const router = Router();

// Hardcoded key for validation
const VALID_KEY = "4chain";

interface FaucetRequestBody {
  outputs: { address: string; satoshis: number }[];
  key: string;
}

// POST /api/faucet - Create a P2PKH transaction
router.post(
  "/faucet",
  async (
    req: Request<{}, any, FaucetRequestBody>,
    res: Response
  ): Promise<void> => {
    console.log("Faucet route called");
    try {
      const { outputs, key } = req.body;

      // Validate key
      if (!key || key !== VALID_KEY) {
        res.status(401).json({
          status: "error",
          message: "Invalid key provided",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate outputs array
      if (!outputs || !Array.isArray(outputs) || outputs.length === 0) {
        res.status(400).json({
          status: "error",
          message: "Outputs array is required and must not be empty",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate each output object
      let totalSatoshis = 0;
      for (const output of outputs) {
        if (!output.address || typeof output.address !== "string") {
          res.status(400).json({
            status: "error",
            message: "Each output must have a valid address string",
            timestamp: new Date().toISOString(),
          });
          return;
        }
        if (
          !output.satoshis ||
          typeof output.satoshis !== "number" ||
          output.satoshis <= 0
        ) {
          res.status(400).json({
            status: "error",
            message: "Each output must have a valid positive satoshis number",
            timestamp: new Date().toISOString(),
          });
          return;
        }
        totalSatoshis += output.satoshis;
      }

      if(totalSatoshis > 5000) {
        res.status(400).json({
          status: "error",
          message: "Total satoshis cannot exceed 5000, dont be so greedy :D",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const response = await faucet(outputs);

      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        data: {
          txid: response.txid,
          beef: response.beef,
          vout: response.vout,
        },
      });
    } catch (error) {
      console.error("Error creating faucet transaction:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to create faucet transaction",
        timestamp: new Date().toISOString(),
      });
    }
  }
);

export default router;
