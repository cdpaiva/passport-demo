const express = require("express");
require("dotenv").config();
const path = require("path");
const session = require("express-session");
const connectDB = require("./db/connect");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
const bcrypt = require("bcryptjs");

const MongoDBStore = require("connect-mongodb-session")(session);
var store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});
// Catch errors
store.on("error", function (error) {
  console.log(error);
});

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
  })
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const correctPassword = await bcrypt.compare(password, user.password);
      if (!correctPassword) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));

const authMiddleware = require("./middleware/authMiddleware");
const addUserMiddleware = require("./middleware/addUserMiddleware");

const authRouter = require("./routes/auth");

app.use(addUserMiddleware);

app.get("/", (req, res) => {
  let messages = [];
  if (req.session.messages) {
    messages = req.session.messages;
    req.session.messages = [];
  }
  res.render("index");
});

app.get("/restricted", authMiddleware, (req, res) => {
  if (!req.session.pageCount) {
    req.session.pageCount = 1;
  } else {
    req.session.pageCount++;
  }
  res.render("restricted", { pageCount: req.session.pageCount });
});

app.use("/auth", authRouter);

const port = 8080;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
