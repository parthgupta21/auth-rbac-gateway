const axios = require("axios");

const UPSTREAM_BASE_URL = process.env.UPSTREAM_BASE_URL;

module.exports = async (ctx) => {
  const upstreamPath = ctx.path.replace(/^\/proxy/, "");

  const url = `${UPSTREAM_BASE_URL}${upstreamPath}`;

  try {
    const response = await axios({
      method: ctx.method,
      url,
      params: ctx.query,
      data: ctx.request.body,
      headers: {
        "X-User-Id": ctx.state.user.id,
        "X-Request-ID": ctx.state.requestId,
      },
      validateStatus: () => true, // forward non-2xx
    });

    ctx.status = response.status;
    ctx.body = response.data;
  } catch (err) {
    ctx.status = 502;
    ctx.body = { message: "Bad gateway" };
  }
}