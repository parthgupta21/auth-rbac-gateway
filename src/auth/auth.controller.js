const bcrypt = require("bcrypt");
const { User } = require("../../models");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

exports.login = async (ctx) => {

  const { email, password } = ctx.request.body;

  const user = await User.findOne({ where: { email } });
  if (!user) ctx.throw(401, "Invalid credentials");


  const valid = await bcrypt.compare(password, user.password);
  if (!valid) ctx.throw(401, "Invalid credentials");

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  await user.update({ refreshToken });

  ctx.body = { accessToken, refreshToken };
};

exports.refresh = async (ctx) => {
  const { refreshToken } = ctx.request.body;
  if (!refreshToken) ctx.throw(401, "Missing refresh token");

  const payload = verifyRefreshToken(refreshToken);

  const user = await User.findByPk(payload.userId);
  if (!user || user.refreshToken !== refreshToken)
    ctx.throw(401, "Invalid refresh token");

  const newAccessToken = signAccessToken({ userId: user.id });

  ctx.body = { accessToken: newAccessToken };
};

exports.logout = async (ctx) => {
  const { refreshToken } = ctx.request.body;
  if (!refreshToken) ctx.throw(400, "Missing refresh token");

  const payload = verifyRefreshToken(refreshToken);
  console.log("mmm", payload);
  const user = await User.findByPk(payload.userId);

  if (user) await user.update({ refreshToken: null });

  ctx.body = {
    message: "user logged out successfully!",
  }

};
