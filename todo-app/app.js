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
const {Todo,User}= require("./models");
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

app.get('/', async (request, response) => {
      response.render("index", {
        title: "Todo application",
        csrfToken: request.csrfToken(),
      })
     });
app.get("/todos", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const loggedInUser = request.user.id;
  const allTodos = await Todo.getTodos(loggedInUser);
  const overdue = await Todo.overdue(loggedInUser);
  const dueToday = await Todo.dueToday(loggedInUser);
  const dueLater = await Todo.dueLater(loggedInUser);
  const completed = await Todo.completed(loggedInUser);
  if (request.accepts("html")) {
    response.render("todos", {
      title: "Todo application",
      overdue,
      dueToday,
      dueLater,
      allTodos,
      completed,
      messages: request.flash(),
      csrfToken: request.csrfToken(),
    })
  } else {
    response.json({
      overdue,
      dueToday,
      dueLater,
      completed,
    })
    } });
// app.get("/", async (request,response) =>{
//     const allTodos = await Todo.getTodos();
//     try{if (request.accepts("html")){
//         response.render('index',{allTodos});
//      }else{response.json({allTodos})}
//     }catch(error){
//         response.error(error);
//     };
// });

// app.get("/todos", async (request,response)=>{
//     console.log("Todo list")
//     try{
//         const todo = await Todo.findAll();
//     return response.json(todo);
//     }catch(error){
//         console.error(error);
//         return response.status(422).json(error);  
//     }
// });
app.get("/signup",(request,response)=>{
  response.render("signup", {csrfToken: request.csrfToken()})
})

app.post("/users", async(request,response)=>{
  const hashedPwd =  await bcrypt.hash(request.body.password, saltRounds)
  console.log(hashedPwd)
  try{
    if (request.body.password === "") {
      throw new Error("Validation notEmpty on password failed");
    }
      const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hashedPwd,
    });
    request.login(user, (err) =>{
      if(err){
        console.log(err)
        request.flash("error", "Login Failed");
      }
      request.flash("success", "Signup Success");
      response.redirect("/todos");
    })
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
  response.redirect("/todos");
})

app.get("/signout",(request,response,next)=>{
  request.logout((err)=>{
    if (err){ return next(err);}
    response.redirect("/");
  })
});

app.post("/todos",connectEnsureLogin.ensureLoggedIn(),async(request,response)=>{
    console.log("Creating a todo",request.body);
    try{
    await Todo.addTodo({
      title: request.body.title, 
      dueDate: request.body.dueDate , 
      completed: false, 
      userId: request.user.id
    });
    return response.redirect("/todos");
    }catch(error){
        console.error(error);
        return response.status(422).json(error);
    }
});
app.get("/test-flash", (req, res) => {
  req.flash("success", "Flash message test!");
  res.redirect("/todos");
});
app.put("/todos/:id",connectEnsureLogin.ensureLoggedIn(),async ( request,response)=>{
    console.log("We have to update a todo with ID:",request.params.id);
    try {
      const todo = await Todo.findByPk(request.params.id);
      if (!todo) {
        return response.status(404).json({ message: "Todo not found" });
      }
    return response.json(updatedTodo);
    }catch(error){
        console.error(error);
        return response.status(422).json(error);
    }
});
app.delete("/todos/:id",connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    console.log("We have to delete a Todo with ID: ", request.params.id);
    try {
      const userId = request.user.id;
      await Todo.remove(request.params.id, userId);
      return response.json({ success: true });
    } catch (error) {
      return response.status(422).json(error);
    }
});

module.exports= app;
