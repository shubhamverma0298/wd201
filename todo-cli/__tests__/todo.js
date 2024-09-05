const todoList = require("../todo");

const{all,markAsComplete,add,overdue,dueToday,dueLater} = todoList();


describe("todolist Test suite", ()=>{
    beforeAll(()=>{
      add({
        title:"Test todo",
        completed: False,
        dueDate: new Date().toISOString().slice(0,10)
      });
    })
    test("Should add new todo", ()=>{
      const todoItemCount = all.lenght;
      add({
        title:"Test todo",
        completed: False,
        dueDate: new Date().toISOString().slice(0,10)
      });
      expect(all.lenght).toBe(todoItemCount+1);
    });
    test("should mark a todo as complete",()=>{
      expect(all[0].completed).tobe(False);
      markAsComplete(0);
      expect(all[0].completed).toBe(True);
    });
    test("should retrieval of overdue items",()=>{
      expect(all[0].overdue).toBe(False);
      overdue(0);
      expect(all[0].overdue).toBe(True)
    });
    test("should retrivel of due today items",()=>{
      expect(all[0].dueToday).tobe(False);
      dueToday(0);
      expect(all[0].dueToday).toBe(True);
    });
    test("should retrivel of due later items",()=>{
      expect(all[0].dueLater).tobe(False);
      dueLater(0);
      expect(all[0].dueLater).toBe(True);
    });
 })
//  checks retrieval of overdue items.
// ...checks retrieval of due today items.
// ...checks retrieval of due later items.