import { Router, Request, Response, NextFunction } from "express";
import { opreturn } from "../functions/op_return";

const router = Router();

// OP_RETURN endpoint
router.post(
  "/opreturn",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log("OP_RETURN route called");
    try {
      const { text } = req.body;

      if (!text || typeof text !== "string") {
        res.status(400).json({
          status: "error",
          message: "Text parameter is required and must be a string",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const action = await opreturn(text);

      res.json({
        status: "success",
        message: "OP_RETURN transaction created successfully",
        timestamp: new Date().toISOString(),
        data: {
          text,
          txid: action.txid,
        },
      });
    } catch (error) {
      console.error("Error creating OP_RETURN transaction:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to create OP_RETURN transaction",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    }
  }
);

export default router;
