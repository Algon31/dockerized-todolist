const redisClient = require("../config/redisClient");

/**
 * Creates a rate limiter middleware backed by Redis.
 * @param {Object} options
 * @param {number} options.windowSeconds - Duration of the rate limit window in seconds (default: 60)
 * @param {number} options.maxRequests - Max requests allowed within the window (default: 60)
 * @param {string} options.prefix - Redis key prefix (default: "ratelimit:default:")
 */
const createRateLimiter = ({
  windowSeconds = 60,
  maxRequests = 60,
  prefix = "ratelimit:default:",
} = {}) => {
  return async (req, res, next) => {
    try {
      // Determine client identifier: authenticated user ID or client IP
      const clientIp =
        req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
        req.socket.remoteAddress ||
        req.ip ||
        "127.0.0.1";
      const identifier = req.user?.id ? `user:${req.user.id}` : `ip:${clientIp}`;
      const redisKey = `${prefix}${identifier}`;

      // Check if client is connected and ready
      if (!redisClient.isReady && process.env.NODE_ENV !== "test") {
        // Fail open if Redis is momentarily unavailable
        return next();
      }

      const currentRequests = await redisClient.incr(redisKey);

      if (currentRequests === 1) {
        await redisClient.expire(redisKey, windowSeconds);
      }

      const ttl = await redisClient.ttl(redisKey);
      const resetTime = Math.ceil(Date.now() / 1000) + (ttl > 0 ? ttl : windowSeconds);

      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - currentRequests));
      res.setHeader("X-RateLimit-Reset", resetTime);

      if (currentRequests > maxRequests) {
        res.setHeader("Retry-After", ttl > 0 ? ttl : windowSeconds);
        return res.status(429).json({
          error: "Too many requests. Please try again later.",
          retryAfter: ttl > 0 ? ttl : windowSeconds,
        });
      }

      next();
    } catch (error) {
      console.error("Rate limiter error (falling back to open):", error);
      next();
    }
  };
};

// Preset limiters
const authLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 10,
  prefix: "ratelimit:auth:",
});

const apiLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 100,
  prefix: "ratelimit:api:",
});

module.exports = {
  createRateLimiter,
  authLimiter,
  apiLimiter,
};
