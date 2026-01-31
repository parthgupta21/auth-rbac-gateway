const { v4: uuidv4 } = require("uuid");

module.exports = async (ctx, next) => {
  const requestId = ctx.headers["x-request-id"] || uuidv4();

  ctx.state.requestId = requestId;
  ctx.set("X-Request-ID", requestId);

  await next();
};
