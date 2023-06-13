const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const signUp = async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    await user.save();
    res.redirect("/");
  } catch (err) {
    return next(err);
  }
};

// passport will run the localStrategy, create the session cookie and redirect passing the cookie
const logIn = (req, res, next) => {
  return passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
    failureMessage: true,
  });
};

const logOut = (req, res) => {
  req.session.destroy(function (err) {
    res.redirect("/");
  });
};

module.exports = { signUp, logIn, logOut };
