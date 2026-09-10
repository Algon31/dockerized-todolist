const express = require("express");
const request = require("supertest");
const { createRateLimiter } = require("./middleware/rateLimiter");
const redisClient = require("./config/redisClient");

jest.mock("./config/redisClient", () => {
  let count = 0;
  return {
    isReady: true,
    incr: jest.fn(() => {
      count++;
      return Promise.resolve(count);
    }),
    expire: jest.fn().mockResolvedValue(1),
    ttl: jest.fn().mockResolvedValue(45),
    _resetCount: () => {
      count = 0;
    },
  };
});

describe("Redis Rate Limiter Middleware", () => {
  let app;

  beforeEach(() => {
    redisClient._resetCount();
    app = express();
    const testLimiter = createRateLimiter({
      windowSeconds: 60,
      maxRequests: 3,
      prefix: "ratelimit:test:",
    });

    app.get("/test-limited", testLimiter, (req, res) => {
      res.json({ message: "Success" });
    });
  });

  test("Allows requests under the rate limit and sets headers", async () => {
    const res1 = await request(app).get("/test-limited");
    expect(res1.statusCode).toBe(200);
    expect(res1.headers["x-ratelimit-limit"]).toBe("3");
    expect(res1.headers["x-ratelimit-remaining"]).toBe("2");

    const res2 = await request(app).get("/test-limited");
    expect(res2.statusCode).toBe(200);
    expect(res2.headers["x-ratelimit-remaining"]).toBe("1");

    const res3 = await request(app).get("/test-limited");
    expect(res3.statusCode).toBe(200);
    expect(res3.headers["x-ratelimit-remaining"]).toBe("0");
  });

  test("Returns 429 Too Many Requests when limit is exceeded", async () => {
    // 3 requests allowed
    await request(app).get("/test-limited");
    await request(app).get("/test-limited");
    await request(app).get("/test-limited");

    // 4th request exceeds limit
    const res4 = await request(app).get("/test-limited");
    expect(res4.statusCode).toBe(429);
    expect(res4.body).toHaveProperty("error", "Too many requests. Please try again later.");
    expect(res4.body).toHaveProperty("retryAfter");
    expect(res4.headers).toHaveProperty("retry-after");
  });
});
