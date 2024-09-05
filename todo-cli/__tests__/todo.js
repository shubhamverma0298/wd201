const todoList = require("../todo");

const{all,markAsComplete,add,overdue,dueToday,dueLater} = todoList();


describe("todolist Test suite", ()=>{
    beforeAll(()=>{
      add({
        title:"Test todo",
        completed: false,
        dueDate: newDate().toLocaleDateString("en-CA")
      })
    });
    test("Should add new todo", ()=>{
      const todoItemCount = all.lenght;
      add({
        title:"Test todo",
        dueDate: new Date().toLocaleDateString("en-CA"),
        completed: false,
      })
      expect(all.lenght).toBe(todoItemCount + 1);
    });
    test("should mark a todo as complete",()=>{
      expect(all[0].completed).toBe(false);
      markAsComplete(0);
      expect(all[0].completed).toBe(true);
    });
    test("should retrieval of overdue items",()=>{
      const overdueDateItems = overdue();
      var prev_date = new Date();
      prev_date.setDate(prev_date.getDate() - 1);
      let previous_date =prev_date.toLocaleDateString("en-CA");
      add({
        title:"previous date",
        dueDate:previous_date,
        completed:false,
      })
      expect(overdue().lenght).toBe(overdueDateItems.lenght +1 );

    });
    test("should retrivel of due today items",()=>{
      const itemsDueToday = dueToday();
      var today_date = new Date();
      today_date.setDate(today_date.getDate());
      let today = today_date.toLocaleDateString("en-CA");
      add({
        title:"today date",
        dueDate:today,
        completed:false,
      })
      expect(dueToday().lenght).toBe(itemsDueToday.lenght + 1);
    });
    test("should retrivel of due later items",()=>{
      const itemsDueLater = dueLater();
      var later_date = new Date();
      later_date.setDate(later_date.getDate() + 1);
      let later = later_date.toLocaleDateString("en-CA");
      add({
        title:"later date items",
        dueDate:later,
        completed:false,
      })
      expect(dueLater().lenght).toBe(itemsDueLater.lenght + 1);
    });
 })
//  checks retrieval of overdue items.
// ...checks retrieval of due today items.
// ...checks retrieval of due later items.










// const db = require("../models");

// describe("Todolist Test Suite", () => {
//   beforeAll(async () => {
//     await db.sequelize.sync({ force: true });
//   });

//   test("Should add new todo", async () => {
//     const todoItemsCount = await db.Todo.count();
//     await db.Todo.addTask({
//       title: "Test todo",
//       completed: false,
//       dueDate: new Date(),
//     });
//     const newTodoItemsCount = await db.Todo.count();
//     expect(newTodoItemsCount).toBe(todoItemsCount + 1);
//   });
// });