const {request,response}= require('express')
const express = require('express');
const app = express();
const {Todo}= require("./models")
const bodyParser = require('body-parser')
const path = require("path");

app.use(bodyParser.json());

app.set("view engine","ejs");

app.get('/', async (request, response) => {
    const allTodos = await Todo.getTodos();
    const overdue = await Todo.overdue();
    const dueToday = await Todo.dueToday();
    const dueLater = await Todo.dueLater();
    if (request.accepts("html")) {
      response.render("index", {
        title: "Todo application",
        overdue,
        dueToday,
        dueLater,
        allTodos,
        // csrfToken: request.csrfToken(),
      })
    } else {
      response.json({
        overdue,
        dueToday,
        dueLater,
      })
      } });

app.get("/", async (request,response) =>{
    const allTodos = await Todo.getTodos();
    try{if (request.accepts("html")){
        response.render('index',{allTodos});
     }else{response.json({allTodos})}
    }catch(error){
        response.error(error);
    };
});

app.use(express.static(path.join(__dirname,'public')));

app.get("/todos", async (request,response)=>{
    console.log("Todo list")
    try{
        const todo = await Todo.findAll();
    return response.json(todo);
    }catch(error){
        console.error(error);
        return response.status(422).json(error);  
    }
});
app.post("/todos",async(request,response)=>{
    console.log("Creating a todo",request.body);
    try{
    const todo =await Todo.addTodo({title: request.body.title, dueDate: request.body.dueDate , completed: false});
    return response.json(todo);
    }catch(error){
        console.error(error);
        return response.status(422).json(error);
    }
});
app.put("/todos/:id/markAsCompleted",async ( request,response)=>{
    console.log("We have to update a todo with ID:",request.params.id);
    const todo = await Todo.findByPk(request.params.id);
    try{
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
    }catch(error){
        console.error(error);
        return response.status(422).json(error);
    }
});
app.delete("/todos/:id", async function (request, response) {
    console.log("We have to delete a Todo with ID: ", request.params.id);
    const todoId = parseInt(request.params.id, 10); // Ensure the ID is an integer
    if (isNaN(todoId)) {
      return response.status(400).send(false); // Return false if the ID is not a valid number
     }
    try {
      const todo = await Todo.findByPk(todoId);
      if (!todo) {
        return response.send(false);
      }
      await todo.destroy();
      return response.send(true);
    } catch (error) {
        console.log(error);
      return response.status(422).json(error);
    }
});

module.exports= app;
