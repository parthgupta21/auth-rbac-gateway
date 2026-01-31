const logger = require("../utils/logger");

module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    logger.error("Unhandled error", {
      requestId: ctx.state.requestId,
      error: err.message,
    });

    ctx.status = err.status || 500;
    ctx.body = {
      message: err.message || "Internal Server Error",
      requestId: ctx.state.requestId,
    };
  }
};
