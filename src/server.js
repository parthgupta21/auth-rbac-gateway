require("dotenv").config();
const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const { koaSwagger } = require("koa2-swagger-ui");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

const authController = require("./auth/auth.controller");
const errorMiddleware = require("./middlewares/error.middleware");
const requestIdMiddleware = require("./middlewares/requestId.middleware");
const requestLoggerMiddleware = require("./middlewares/requestLogger.middleware");
const metricsMiddleware = require("./middlewares/metrics.middleware");
const authMiddleware = require("./middlewares/auth.middleware");
const requirePermission = require("../rbac/requirePermission.middleware");
const PERMISSIONS = require("../rbac/requirePermission");
const auditMiddleware = require("./middlewares/audit.middleware");
const proxyMiddleware = require("./middlewares/proxy.middleware");
const rateLimiter = require("./middlewares/rateLimit.middleware");
const { register } = require("./utils/metrics");

const { sequelize, AuditLog } = require("../models");

// Load OpenAPI spec
const openApiSpec = yaml.load(
  fs.readFileSync(path.join(__dirname, "../openapi/openapi.yaml"), "utf8")
);

const app = new Koa();
app.proxy = true;
const router = new Router();

/* ----------- Global Middlewares ----------- */
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);
app.use(metricsMiddleware);
app.use(errorMiddleware);
app.use(bodyParser());

/* ----------- Swagger UI ----------- */
app.use(
  koaSwagger({
    routePrefix: "/api-docs",
    swaggerOptions: {
      spec: openApiSpec,
    },
  })
);

/* ----------- Public Routes ----------- */
router.post("/auth/login", rateLimiter({ policy: "login" }), authController.login);
router.post("/auth/refresh", rateLimiter(), authController.refresh);
router.post("/auth/logout", rateLimiter(), authController.logout);
router.get("/health", rateLimiter(), (ctx) => {
  ctx.status = 200;
  ctx.body = { status: "ok" };
});
router.get("/metrics", async (ctx) => {
  ctx.set("Content-Type", register.contentType);
  ctx.body = await register.metrics();
});
router.get("/openapi.json", (ctx) => {
  ctx.body = openApiSpec;
});

/* ----------- Protected Routes ----------- */
router.get(
  "/users",
  authMiddleware,
  rateLimiter(),
  requirePermission(PERMISSIONS.USER_READ),
  auditMiddleware,
  (ctx) => {
    ctx.body = { message: "User list accessed" };
  },
);
router.get(
  "/audit/logs",
  authMiddleware,
  rateLimiter(),
  requirePermission(PERMISSIONS.AUDIT_READ),
  async (ctx) => {
    const logs = await AuditLog.findAll({
      order: [["createdAt", "DESC"]],
      limit: 100,
    });

    ctx.body = logs;
  }
);
router.all(
  /^\/proxy\/.*$/,
  authMiddleware,
  rateLimiter(),
  requirePermission(PERMISSIONS.USER_READ),
  auditMiddleware,
  proxyMiddleware
);



app.use(router.routes());
app.use(router.allowedMethods());

/* ----------- Server & DB ----------- */
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("DB connection failed", err);
    process.exit(1);
  }
})();
