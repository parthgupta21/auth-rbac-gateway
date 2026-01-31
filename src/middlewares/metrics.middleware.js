const { httpRequestDuration } = require("../utils/metrics");

module.exports = async (ctx, next) => {
  const start = Date.now();

  try {
    await next();
  } finally {
    const durationMs = Date.now() - start;
    const route = ctx._matchedRoute || ctx.path;

    httpRequestDuration.observe(
      {
        method: ctx.method,
        route,
        status: ctx.status,
      },
      durationMs
    );
  }
};
