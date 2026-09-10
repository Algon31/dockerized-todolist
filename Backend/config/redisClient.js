const { createClient } = require("redis");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error("Redis max reconnection attempts reached.");
        return new Error("Redis max retries reached");
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("Redis Client connected.");
});

redisClient.on("ready", () => {
  console.log("Redis Client ready for requests.");
});

// Auto-connect if not in test environment or test mock handles it
if (process.env.NODE_ENV !== "test") {
  redisClient.connect().catch((err) => {
    console.error("Failed to initial connect Redis:", err);
  });
}

module.exports = redisClient;
