// const todoList = require("../todo");

// const{all,markAsComplete,add,overdue,dueToday,dueLater} = todoList();


// describe("todolist Test suite", ()=>{
//     beforeAll(()=>{
//       add({
//         title:"Test todo",
//         completed: false,
//         dueDate: new Date().toISOString().slice(0,10)
//       });
//     })
//     test("Should add new todo", ()=>{
//       const todoItemCount = all.lenght;
//       add({
//         title:"Test todo",
//         completed: false,
//         dueDate: new Date().toISOString().slice(0,10)
//       });
//       expect(all.lenght).toBe(todoItemCount+1);
//     });
//     test("should mark a todo as complete",()=>{
//       expect(all[0].completed).tobe(false);
//       markAsComplete(0);
//       expect(all[0].completed).toBe(true);
//     });
//     test("should retrieval of overdue items",()=>{
//       expect(all[0].overdue).toBe(false);
//       overdue(0);
//       expect(all[0].overdue).toBe(true)
//     });
//     test("should retrivel of due today items",()=>{
//       expect(all[0].dueToday).tobe(false);
//       dueToday(0);
//       expect(all[0].dueToday).toBe(true);
//     });
//     test("should retrivel of due later items",()=>{
//       expect(all[0].dueLater).tobe(false);
//       dueLater(0);
//       expect(all[0].dueLater).toBe(true);
//     });
//  })
// //  checks retrieval of overdue items.
// // ...checks retrieval of due today items.
// // ...checks retrieval of due later items.
const db = require("../models");

describe("Todolist Test Suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  test("Should add new todo", async () => {
    const todoItemsCount = await db.Todo.count();
    await db.Todo.addTask({
      title: "Test todo",
      completed: false,
      dueDate: new Date(),
    });
    const newTodoItemsCount = await db.Todo.count();
    expect(newTodoItemsCount).toBe(todoItemsCount + 1);
  });
});