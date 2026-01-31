# Auth/RBAC Gateway - Design Document

## Summary
This project is a Koa-based API gateway that provides authentication, role-based
access control (RBAC), rate limiting, auditing, observability, and proxying to
upstream services. It centralizes security and operational concerns so upstream
services can trust identity and focus on business logic.

## Goals
- Authenticate users and issue JWT access/refresh tokens.
- Enforce RBAC permissions for protected routes.
- Apply Redis-backed rate limiting.
- Record audit logs for authenticated requests.
- Proxy selected routes to an upstream service with identity headers.
- Provide observability via structured logs, Prometheus metrics, and optional tracing.

## Non-Goals
- Full user management (registration, password reset, account lockout).
- Multi-tenant authorization model beyond roles/permissions.
- Fine-grained per-resource authorization (ABAC).
- Comprehensive API validation for every endpoint.

## High-Level Architecture

Client
  -> Koa Gateway
       -> Auth + RBAC + Rate Limit + Audit + Observability
       -> Upstream Service (via /proxy/*)

Core infrastructure dependencies:
- MySQL (users/roles/permissions/audit logs)
- Redis (rate limiting counters)

## Request Lifecycle (Protected Route)
1. `requestId.middleware` generates `X-Request-ID`.
2. `requestLogger.middleware` logs request start.
3. `metrics.middleware` records latency/labels.
4. `error.middleware` wraps downstream and formats errors.
5. `auth.middleware` validates JWT, sets `ctx.state.user`.
6. `rateLimit.middleware` applies per-user or anonymous policy.
7. `requirePermission.middleware` loads roles+permissions and enforces access.
8. `audit.middleware` writes audit record (post-handler).
9. Handler responds or proxy forwards to upstream.
10. `requestLogger.middleware` logs request end.

Public routes skip RBAC and auth, but still use per-route rate limiting.

## Components

### Authentication
- `POST /auth/login`: validates credentials, returns access + refresh tokens.
- `POST /auth/refresh`: validates refresh token, returns new access token.
- `POST /auth/logout`: invalidates refresh token.

Access token is used as `Authorization: Bearer <token>`.
Refresh token is stored on the User model in MySQL.

### RBAC
`requirePermission.middleware`:
- Loads the user and their roles/permissions via Sequelize.
- Builds a permission set.
- Returns `403` if required permission is missing.

Permissions are defined in `rbac/requirePermission.js` and seeded in DB.

### Rate Limiting
`rateLimit.middleware`:
- Uses Redis `INCR` + `EXPIRE` with fixed time windows.
- Key format: `rate:<policy>:<identity>:<windowKey>`.
- Per-policy limits defined in `config/rateLimits.js`.
- Fails open if Redis errors occur.

Identity is `ctx.state.user.id` if authenticated, else `ctx.ip`.
When authenticated, the policy defaults to `"user"` unless `ctx.state.user.role`
is present or `options.policy` is provided.

### Auditing
`audit.middleware`:
- Writes `AuditLog` entries with requestId, userId, path, method, and status.
- Runs after downstream handler, and never blocks the request if logging fails.

### Proxying
`/proxy/*` routes are forwarded to `UPSTREAM_BASE_URL`.
The gateway injects:
- `X-User-Id`
- `X-Request-ID`

Non-2xx responses are forwarded as-is.
Network failures return `502`.

### Observability
- Structured request logs (`request_start`, `request_end`) with requestId/userId.
- Prometheus metrics exposed at `/metrics`.
- Optional OpenTelemetry tracing via `src/tracing.js` (enabled by env).

### Error Handling
`error.middleware` catches errors and returns a JSON response:
```
{ message, requestId }
```
It logs via `utils/logger`.

## Data Model

### Users
- `id`, `email`, `password`, `refreshToken`, `createdAt`, `updatedAt`

### Roles
- `id`, `name`, timestamps

### Permissions
- `id`, `name`, timestamps

### Join Tables
- `UserRoles`: userId, roleId
- `RolePermissions`: roleId, permissionId

### AuditLogs
- `requestId`, `userId`, `method`, `path`, `status`, timestamps

## Routes Overview

Public:
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /health`
- `GET /metrics`

Protected:
- `GET /users` (requires `USER_READ`)
- `GET /audit/logs` (requires `AUDIT_READ`)
- `ALL /proxy/*` (requires `USER_READ`)

## Configuration

Key env vars:
- `PORT`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `ACCESS_TOKEN_TTL`, `REFRESH_TOKEN_TTL`
- `UPSTREAM_BASE_URL`
- `REDIS_HOST`, `REDIS_PORT`
- `OTEL_TRACING_ENABLED` (set to `true` to enable tracing)

MySQL configuration is in `config/config.json` for Sequelize.

## Operational Behavior
- `app.proxy = true` enables `X-Forwarded-For` for client IPs.
- Rate limit uses fixed-window counters with TTL equal to policy window.
- Metrics and logs are available without authentication (by design).

## Failure Modes
- Redis unavailable: rate limiter fails open.
- DB unavailable: auth/RBAC will fail closed (401/500) depending on where it occurs.
- Upstream unavailable: `/proxy/*` returns 502.

## Known Limitations / Improvements
- Per-role rate limiting requires `ctx.state.user.role` to be set; currently only
  user id is added in auth middleware.
- No validation for request payloads (login/refresh/logout).
- No tests or CI in the current setup.
- No tracing exporter configured (only instrumentation).

## Future Enhancements
- Add input validation and security hardening (lockouts, brute-force protection).
- Add OpenAPI docs.
- Add integration tests for auth/RBAC/rate limiting/proxy.
- Add tracing exporter (Jaeger/OTLP) and dashboards for metrics/logs.
