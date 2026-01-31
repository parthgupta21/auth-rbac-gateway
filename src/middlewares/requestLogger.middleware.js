const logger = require("../utils/logger");

module.exports = async (ctx, next) => {
  const start = Date.now();
  const requestId = ctx.state.requestId;
  const userId = ctx.state.user?.id;

  logger.info("request_start", {
    requestId,
    userId,
    method: ctx.method,
    path: ctx.path,
  });

  try {
    await next();
  } finally {
    const durationMs = Date.now() - start;

    logger.info("request_end", {
      requestId,
      userId,
      method: ctx.method,
      path: ctx.path,
      status: ctx.status,
      durationMs,
    });
  }
};
