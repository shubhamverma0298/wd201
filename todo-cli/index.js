const {connect} = require("./connectDB.js");
const Todo = require("./TodoModel.js");

const createTodo = async ()=>{
    try{
        await connect();
        const todo = await Todo.addTask({
            title:"second time",
            duedate:new Date(),
            completed: false,
        });
        console.log(`create todo with Id: ${todo.id}`);
        } catch(error){
            console.log(error);
        }
};


const countItems = async()=>{
    try{
        const totalCount = await Todo.count();
        console.log(`found ${totalCount} items in the table!`);
    }catch(error){
        console.error(error);
    }
};

const getallTodos = async()=>{
    try{
        const todos = await Todo.findAll({
            order:[
                ['id','DESC']
            ]
        });
        const todolist = todos.map(todo => todo.displayableString()).join("\n");
        console.log(todolist);
    }catch(error){
        console.error(error)
    }
}
const getsingleTodo = async()=>{
    try{
        const todo = await Todo.findOne({
            order:[
                ['id','DESC']
            ]
        });
        console.log(todo.displayableString());
    }catch(error){
        console.error(error)
    }
}
const updateTodo = async(id)=>{
    try{
        const updatetodo = await Todo.update({
            where:{
             id:id
            }
        });
        console.log(` updated todo ${updatetodo}`);
    }catch(error){
        console.error(error)
    }
}
const deleteTodo = async(id)=>{
    try{
        const deletetodo = await Todo.destroy({
            where:{
             id:id
            }
        });
        console.log(` deleted todo ${deletetodo}`);
    }catch(error){
        console.error(error)
    }
}

(async ()=>{
    // await createTodo();
    // await countItems();
    await getallTodos();
    await updateTodo(1);
    await getsingleTodo();
})();