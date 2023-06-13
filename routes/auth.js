const express = require("express");
const { signUp, logIn, logOut } = require("../controllers/auth");
const passport = require("passport");

const router = express.Router();

router.get("/sign-up", (req, res) => res.render("sign-up-form"));
router.post("/sign-up", signUp);
router.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
    failureMessage: true,
  })
);
router.get("/log-out", logOut);

module.exports = router;
