const { AuditLog } = require("../../models");

module.exports = async (ctx, next) => {
  await next();

  // only audit authenticated requests
  if (!ctx.state.user) return;

  try {
    await AuditLog.create({
      requestId: ctx.state.requestId,
      userId: ctx.state.user.id,
      method: ctx.method,
      path: ctx.path,
      status: ctx.status,
    });
  } catch (err) {
    // audit failures must never break request flow
    console.error("Audit log failed", err.message);
  }
};
