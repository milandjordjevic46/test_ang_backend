const authController = require("../controllers/user.controller.js");
const User = require("../models/user.model.js");

const authenticateToken = function (req, response, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!authHeader)
    return response.status(401).send({ message: "Unauthorized" });
  User.checkToken(authHeader, (err, res) => {
    if (err) {
      console.log("ERR", err);
      return response.status(401).send({ message: "Unauthorized" });
    } else {
      console.log("RES", res);
      next();
    }
  });
};
module.exports = authenticateToken;
