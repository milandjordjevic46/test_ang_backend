const User = require("../models/user.model.js");


// Create and Save a new User
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  // Create a User
  const user = new User({
    name: req.body.name,
    last_name: req.body.lastName,
    service_name: req.body.serviceName,
    address: req.body.address,
    email: req.body.email,
    country: req.body.country,
  });

  // Save User in the database
  User.create(user, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while creating the User.",
      });
    else res.send(data);
  });
};

// Retrieve all Users from the database.
exports.findAll = (req, res, next) => {
  User.getAll((err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users.",
      });
    else res.send(data);
  });
};

// Find a single User with a userId
exports.findOne = (req, res) => {
  User.findById(req.params.userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found User with id ${req.params.userId}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving User with id " + req.params.userId,
        });
      }
    } else res.send(data);
  });
};

// Login authentication
exports.loginAuth = (req, res) => {
  const user = {
    email: req.body.email,
    pass: req.body.password,
  };

  User.login(user, (err, data) => {
    if (err)
      res.status(err.status).send({
        message: err.message || "Some error occurred while creating the User.",
      });
    else res.status(200).send(data);
  });
};

exports.signOut = (req, res) => {
  const user = {
    token: req.body.token,
  };

  User.removeToken(user, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while sign out.",
      });
    } else res.status(200).send(data);
  });
};

// Update a User identified by the userId in the request
exports.update = (req, res) => {};

// Delete a User with the specified userId in the request
exports.delete = (req, res) => {};

// Delete all Users from the database.
exports.deleteAll = (req, res) => {};

// Send email
// exports.sendEmail = (req, res, next) => {
//   User.sendVerificationEmail()
// };
