const redis = require("../utils/redis");
const RATE_LIMITS = require("../../config/rateLimits");

module.exports = function rateLimiter(options = {}) {
  return async function (ctx, next) {
    const now = Math.floor(Date.now() / 1000);

    let identity;
    let policyKey;

    if (ctx.state.user) {
      identity = ctx.state.user.id;
      policyKey = ctx.state.user.role || "user";
    } else {
      identity = ctx.ip;
      policyKey = "anonymous";
    }

    if (options.policy) {
      policyKey = options.policy;
    }

    const policy = RATE_LIMITS[policyKey];
    if (!policy) {
      await next();
      return;
    }

    const windowKey = Math.floor(now / policy.window);
    const redisKey = `rate:${policyKey}:${identity}:${windowKey}`;

    let count;
    try {
      count = await redis.incr(redisKey);
      if (count === 1) {
        await redis.expire(redisKey, policy.window);
      }
    } catch (err) {
      // Fail open
      await next();
      return;
    }

    if (count > policy.limit) {
      ctx.status = 429;
      ctx.body = {
        error: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests"
      };
      return;
    }

    ctx.set("X-RateLimit-Limit", policy.limit);
    ctx.set(
      "X-RateLimit-Remaining",
      Math.max(0, policy.limit - count)
    );

    await next();
  };
};
