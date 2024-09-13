const {request,response}= require('express')
const express = require('express');
var csrf = require("tiny-csrf");
const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const session = require('express-session');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const flash = require("connect-flash");
const path = require("path");


const saltRounds = 10;

const app = express();
const {User}= require("./models");
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const { title } = require("process");

app.use(session({
  secret: "my-super-secret-key-201728172615261562",
  cookie:{
    maxAge: 24*60*60*1000 //24 hr
    }
}));
app.use(flash());

app.use(function (request, response, next) {
  console.log("Flash messages:", request.flash());
  response.locals.messages = request.flash();
  next();
});
app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (username, password, done) => {
  const user = User.findOne({
    where: {
      email: username,
    },
  })
    .then(async (user) => {
      if (!user) {
        return done(null, false, { message: "User not found" });
      }
      const result = await bcrypt.compare(password, user.password);
      if (result) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Invalid Password" });
      }
    })
    .catch((error) => {
      return done(error);
    });
}));
passport.serializeUser((user, done) =>{
  console.log("Serializing user in session", user.id)
  done(null, user.id)
})
passport.deserializeUser((id, done)=>{
  User.findByPk(id)
  .then(user =>{
    done(null, user)
  }).catch(error =>{
    done(null, error)
  })
});
app.use(bodyParser.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser("shh! some secret string"))
app.use(csrf('this_should_be_32_character_long',["POST","PUT","DELETE"]));
app.use((err, req, res, next) => {
  if (err.code !== "EBADCSRFTOKEN") return next(err);
  res.status(403).json({ error: "Invalid CSRF token" });
});
app.set("views", path.join(__dirname, "views"));
app.set("view engine","ejs");

app.get("/", async (request, response) => {if (request.isAuthenticated()) {
  if (request.user.role == "teacher") {
    return response.redirect("/teacher-dashboard");
  } else {
    return response.redirect("/student-dashboard");
  }
}response.render("index", {
      title: "Learners-Management-System",
      csrfToken: request.csrfToken(),
    });
});

app.get("/signup",(request,response)=>{
  response.render("signup", {csrfToken: request.csrfToken()})
})
app.post("/usersentry", async(request,response)=>{
  const hashedPwd =  await bcrypt.hash(request.body.password, saltRounds)
  console.log(hashedPwd)
  try{
    if (request.body.password === "") {
      throw new Error("Validation notEmpty on password failed");
    }
      const user = await Userentry.create({
      role: request.body.role,
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hashedPwd,
    });
    request.login(user, (err) =>{
      if(err){
        console.log(err)
        request.flash("error", "Login Failed");
      if (user.role === "teacher") {
        response.redirect("/teacher-dashboard");
      } else if (user.role === "student") {
        response.redirect("/student-dashboard");
      } else {
        request.flash("success", "Signup Success");
        response.redirect("/signup");
      }
    }
    });
  }catch(error){
    console.error("User creation error:", error);
    if (error.name === "SequelizeValidationError") {
      const validationErrors = error.errors.map((err) => err.message);
      request.flash("error", validationErrors);
      response.redirect("/signup");
    } else {
      request.flash("error", "An error occured during the user creation");
      response.redirect("/signup");
    }
  }
})
app.get("/login",async(request,response)=>{
  response.render("login",{csrfToken: request.csrfToken()})
});
app.post("/session",passport.authenticate('local',{ failureRedirect:"/login"}), async(request,response)=>{
  console.log(request.user);
  if (request.user.role === "student") {
    response.redirect("/student-dashboard");
  } else if (request.user.role === "teacher") {
    response.redirect("/teacher-dashboard");
  } else {
    response.redirect("/login");
  }
})
app.get("/teacher-dashboard",(request,response)=>{
  response.render("teacher-dashboard", {csrfToken: request.csrfToken()})
})
app.get("/student-dashboard",(request,response)=>{
  response.render("student-dashboard", {csrfToken: request.csrfToken()})
})
app.get("/signout",(request,response,next)=>{
  request.logout((err)=>{
    if (err){ return next(err);}
    response.redirect("/");
  })
});

module.exports= app;
