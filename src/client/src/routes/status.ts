import { Router, Request, Response } from "express";

const router = Router();

// Status endpoint
router.get("/status", (req: Request, res: Response) => {
  console.log("Status route called");
  try {
    const status = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: "1.0.0",
      service: "wallet-toolbox-server-codebase",
    };

    res.json(status);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
