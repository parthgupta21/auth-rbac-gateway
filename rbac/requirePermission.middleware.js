const { User, Role, Permission } = require("../models");

module.exports = function requirePermission(requiredPermission) {
  return async (ctx, next) => {
    console.log("[RBAC] start", {
      requiredPermission,
      requestId: ctx.state.requestId,
      path: ctx.path,
    });

    const user = ctx.state.user;

    if (!user) {
      ctx.throw(401, "Authentication required");
    }

  

    const dbUser = await User.findByPk(user.id, {
      include: {
        model: Role,
        include: Permission,
      },
    });

  

    if (!dbUser) {
      ctx.throw(401, "Invalid user");
    }

    const permissions = new Set();

    for (const role of dbUser.Roles || []) {
      for (const permission of role.Permissions || []) {
        permissions.add(permission.name);
      }
    }

    console.log("[RBAC] permissions", Array.from(permissions));

    if (!permissions.has(requiredPermission)) {
      ctx.throw(403, "Access denied");
    }

    await next();
  };
};
