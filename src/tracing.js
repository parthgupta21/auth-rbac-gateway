const { NodeSDK } = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");

if (process.env.OTEL_TRACING_ENABLED === "true") {
  const sdk = new NodeSDK({
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();

  process.on("SIGTERM", () => {
    sdk
      .shutdown()
      .catch((err) => console.error("Tracing shutdown error", err));
  });
}
