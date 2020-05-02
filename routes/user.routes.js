module.exports = (app) => {
  const users = require("../controllers/user.controller.js");
  const authS = require("../authentication/authentication.js");

  //    ---AUTH---
  // Login authentication
  app.post("/auth/users", users.loginAuth);

  //Sign out (delete token)
  app.post("/auth/users/signout", authS, users.signOut);
  //    ---AUTH---

  //    ---CREATE ACCOUNT---
  app.post("/auth/users/create", users.create);
  //    ---CREATE ACCOUNT---

  // //    ---Send email---
  // app.get("/auth/users/sendEmail", users.sendEmail);
  // //    ---Send email---

  // Retrieve all Users
  app.get("/users", authS, users.findAll);

  // Retrieve a single User with userId
  app.get("/users/:userId", users.findOne);

  // Update a User with userId
  app.put("/users/:userId", users.update);

  // Delete a User with userId
  app.delete("/users/:userId", users.delete);

  // Delete all users
  app.delete("/users", users.deleteAll);
};
