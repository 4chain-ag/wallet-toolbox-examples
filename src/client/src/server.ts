import express from "express";
import routes from "./routes";

const EXPRESS_PORT = process.env.PORT || 3000;

function setupExpressServer() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS middleware
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Mount routes
  app.use("/", routes);

  // Root endpoint
  app.get("/", (req, res) => {
    res.json({
      message: "Wallet Toolbox Server API",
      version: "1.0.0",
      endpoints: {
        status: "/api/status",
        keys: "/api/keys",
        balance: "/api/balance",
        internalize: "POST /api/internalize",
        opreturn: "POST /api/opreturn",
        outputs: "POST /api/outputs",
        actions: "POST /api/actions",
        faucet: "POST /api/faucet",
      },
    });
  });

  // 404 handler
  app.use("*", (req, res) => {
    res.status(404).json({
      error: "Not Found",
      message: `Route ${req.originalUrl} not found`,
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}

// Main function to start the server
(async () => {
  try {
    // Start the Express API server
    const app = setupExpressServer();
    app.listen(Number(EXPRESS_PORT), () => {
      console.log(`Express API Server started on port ${EXPRESS_PORT}`);
      console.log(`API endpoints available at:`);
      console.log(`  - Root: http://localhost:${EXPRESS_PORT}/`);
      console.log(`  - Status: http://localhost:${EXPRESS_PORT}/api/status`);
      console.log(
        `  - Keys (Both Users): http://localhost:${EXPRESS_PORT}/api/keys`
      );
      console.log(
        `  - Balance (Both Users): http://localhost:${EXPRESS_PORT}/api/balance`
      );
      console.log(
        `  - Internalize Transaction (POST): http://localhost:${EXPRESS_PORT}/api/internalize`
      );
      console.log(
        `  - OP_RETURN Transaction (POST): http://localhost:${EXPRESS_PORT}/api/opreturn`
      );
      console.log(
        `  - Get Outputs (POST): http://localhost:${EXPRESS_PORT}/api/outputs`
      );
      console.log(
        `  - Faucet Transaction (POST): http://localhost:${EXPRESS_PORT}/api/faucet`
      );
      console.log(
        `  - List Actions (POST): http://localhost:${EXPRESS_PORT}/api/actions`
      );
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
})();
