const express = require("express");
const app = express();

app.use(express.json());

app.get("/users/:id", (req, res) => {
  res.json({
    message: "Upstream user data",
    userId: req.params.id,
    forwardedUser: req.headers["x-user-id"],
    requestId: req.headers["x-request-id"],
  });
});

app.listen(4000, () => {
  console.log("Upstream running on 4000");
});
