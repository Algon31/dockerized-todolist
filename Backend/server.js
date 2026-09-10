const app = require("./app");
const { initDb } = require("./config/db");

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Initialize PostgreSQL schema if not already initialized
    await initDb();

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();