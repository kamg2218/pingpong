require("dotenv").config();
// const session = require("express-session");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
// const logger = require("morgan");
const passport = require("passport");

const passportConfig = require("./passport.js");
const indexRouter = require("./route.js");
// const usersRouter = require("./routes/users");

const app = express();
const cors = require("cors");

app.use(
    cookieSession({
        maxAge: 60 * 60 * 1000,
        keys: [process.env.COOKIE_KEY],
    })
);

// app.use(logger("dev")); //??
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(passport.initialize());
app.use(passport.session());
passportConfig();

app.use(
    cors({
        origin: "http://localhost:3000",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
    })
);

app.use("/", indexRouter);
// app.use("/users", usersRouter);

module.exports = app;