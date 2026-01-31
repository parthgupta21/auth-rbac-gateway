const client = require("prom-client");

const register = new client.Registry();

client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_ms",
  help: "HTTP request duration in ms",
  labelNames: ["method", "route", "status"],
  buckets: [10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
});

register.registerMetric(httpRequestDuration);

module.exports = {
  register,
  httpRequestDuration,
};
