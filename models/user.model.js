const sql = require("./db.js");
const table_name = "admins";
const cryptoRandomString = require("crypto-random-string");

const nodemailer = require("nodemailer");
var ejs = require("ejs");
var fs = require("fs");

// constructor
const User = function (user) {
  (this.name = user.name),
    (this.last_name = user.last_name),
    (this.service_name = user.service_name),
    (this.address = user.address),
    (this.email = user.email),
    (this.country = user.country);
};

User.create = (newUser, result) => {
  User.checkIfEmailExist(newUser.email, (err, res) => {
    if (err) {
      console.log("err", err);
      result(err, null);
      return;
    } else {
      newUser.pass = cryptoRandomString({ length: 10 }); //set default password, need for verification
      sql.query(`INSERT INTO ${table_name} SET ?`, newUser, (err, res) => {
        if (err) {
          result(err, null);
          return;
        } else {
          newUser.link = 'http://localhost:4200/admin/verification-account?code=' + newUser.pass;
          User.sendVerificationEmail(newUser, (err, res) => {
            if (err) return err, null;
            else {
              result(null, { user: newUser });
              return;
            }
          });
        }
      });
    }
  });
};

User.checkIfEmailExist = (email, result) => {
  sql.query(
    `SELECT * FROM ${table_name} WHERE email = ?`,
    [email],
    (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.length == 0) {
        //only if result is 0 its ok
        result(null, { message: "successfully" });
        return;
      }
      result({ code: 404, message: "Email already exist!" }, null);
      return;
    }
  );
};

User.findById = (userId, result) => {
  sql.query(
    `SELECT * FROM ${table_name} WHERE userid = ${userId}`,
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }

      if (res.length) {
        console.log(`found ${table_name}: `, res[0]);
        result(null, res[0]);
        return;
      }

      // not found User with the id
      result({ kind: "not_found" }, null);
    }
  );
};

User.getAll = (result) => {
  sql.query(`SELECT * FROM ${table_name}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log(`${table_name}: `, res);
    result(null, res);
  });
};

User.updateById = (id, user, result) => {
  sql.query(
    `UPDATE ${table_name} SET email = ?, name = ?, active = ? WHERE id = ?`,
    [user.email, user.name, user.active, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found User with the id
        result({ kind: "not_found" }, null);
        return;
      }

      result(null, { id: id, ...user });
    }
  );
};

User.remove = (id, result) => {
  sql.query(`DELETE FROM ${table_name} WHERE id = ?`, id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // not found User with the id
      result({ kind: "not_found" }, null);
      return;
    }

    console.log(`deleted ${table_name} with id: `, id);
    result(null, res);
  });
};

User.removeAll = (result) => {
  sql.query(`DELETE FROM ${table_name}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log(`deleted ${res.affectedRows} users`);
    result(null, res);
  });
};

// Login authentication
User.login = (user, result) => {
  var email = user.email;
  var pass = user.pass;
  if (!email || !pass) {
    result({ message: "Wrong credentials", status: 400 }, null);
    return;
  }
  sql.query(
    `SELECT * FROM ${table_name} WHERE email = ?`,
    [email],
    (err, res) => {
      if (!err) {
        if (res.length > 0) {
          if (pass == res[0].pass) {
            User.insertToken(res[0], (err, success) => {
              if (err) {
                User.updateToken(res[0], (err, res) => {
                  if (err) {
                    result(err, null);
                    return;
                  } else {
                    result(null, res);
                    return;
                  }
                });
              } else {
                result(null, res[0]);
                return;
              }
            });
          } else {
            result({ message: "Password doesn't match", status: 404 }, null);
            return;
          }
        } else {
          result({ message: "Email doesnt excist", status: 404 }, null);
          return;
        }
      } else {
        result(err, null);
        return;
      }
    }
  );
};

User.updateToken = (req, result) => {
  sql.query(
    `UPDATE token SET token = ? WHERE userid = ?`,
    [req.token, req.userid],
    (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ message: "not_found", status: 404 }, null);
        return;
      }
      result(null, req);
    }
  );
};

User.insertToken = (req, result) => {
  req.token = cryptoRandomString({ length: 12 });
  sql.query(
    "INSERT INTO token (userid, token) VALUES (?, ?)",
    [req.userid, req.token],
    (err, res) => {
      if (err) {
        result({ code: 454 }, null);
      } else {
        result(null, req);
      }
    }
  );
};

User.checkToken = (token, result) => {
  sql.query(`SELECT * FROM token WHERE token = '${token}'`, (err, res) => {
    if (err) {
      result({ code: 500, message: token }, null);
    } else {
      if (res.length > 0) {
        result(null, { token: token });
      } else {
        result({ code: 500, message: token }, null);
      }
    }
  });
};

User.removeToken = (user, result) => {
  sql.query(`DELETE FROM token WHERE token ='${user.token}'`, (err, res) => {
    if (err) {
      console.log("eeee", err);
      result({ code: 500, message: "Something went wrong" }, null);
      return;
    } else {
      if (res.affectedRows == 0) {
        console.log("r", res);
        result({ kind: "not_found" }, null);
        return;
      }
      console.log("reeees", res);
      result(null, res);
    }
  });
};

User.sendVerificationEmail = (user, result) => {
  var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "service.app.supp.ad@gmail.com",
      pass: "Sifrazaserviceapp1",
    },
  });

  var templateString = fs.readFileSync("./emails/template.ejs", "utf-8");
  var text = ejs.render(templateString, user);

  var mailOptions = {
    from: "service.app.supp.ad@gmail.com", // sender address
    to: user.email, // list of receivers
    subject: "No replay", // Subject line
    text: text, // plain text body
    html: text, // html body
    // attachments: params.attachments
  };

  // send mail with defined transport object
  smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return result(error, null);
    }
    smtpTransport.close(); // shut down the connection pool, no more messages.
    return result(null, info);
  });
};

module.exports = User;
