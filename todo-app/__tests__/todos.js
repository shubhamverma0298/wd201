const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");
const { Json } = require("sequelize/types/utils");

let server, agent;
function extractCsrfToken(res){
    var $ =cheerio.load(res.text);
    return $("[name=_csrf]").val();
}

describe("Todo test suite",()=>{
    beforeAll(async ()=>
    {
        await db.sequelize.sync({force:true});
        server=app.listen(4000, ()=>{});
        agent =request.agent(server);
    });
    afterAll(async () => {
        await db.sequelize.close();
        server.close();
    });
    test("create a new Todo", async ()=>{
        const res = await agent.get("/");
        const csrfToken = extractCsrfToken(res);
        const response = await agent.post('todos').send({
            'title':"by milk",
            dueDate: new Date().toISOString(),
            completed: false,
            "_csrf": csrfToken
        })
        expect(response.statusCode).toBe(302);
        // expect(response.header["content-type"]).toBe("application/json; charset=utf-8");
        // const parsedResponse = JSON.parse(response.text);
        // expect(parsedResponse.id).toBeDefined();
    });
    test("Mark as todo as complete", async ()=>{
        let res = await agent.get("/");
        let csrfToken = extractCsrfToken(res);
        const response = await agent.post('todos').send({
            'title':"by milk",
            dueDate: new Date().toISOString(),
            completed: false,
            "_csrf": csrfToken,
        });
        expect(response.statusCode).toBe(302);
        const groupedTodosResponse = await agent
        .get("/")
        .set("Accept","application/json");
        const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
        const dueDateCount = parsedGroupedResponse.dueToday.length;
        const latestTodo = parsedGroupedResponse.dueToday[dueDateCount - 1];
        
        res = await agent.get("/");
        csrfToken =  extractCsrfToken(res);
        const markCompleteResponse = await agent.put(`/todos/${latestTodo.id}/markAsCompleted`).send({
          _csrf: csrfToken,
        });
        const parsadUpdateResponse = Json.parse(markCompleteResponse.text);
        expect(parsadUpdateResponse.completed).toBe(true);

    });
    // test("Fetches all todo in the database using /todo endpoint", async () => {
    //     await agent.post("/todos").send({
    //       title: "Buy xbox",
    //       dueDate: new Date().toISOString(),
    //       completed: false,
    //     });
    //     await agent.post("/todos").send({
    //       title: "Buy ps3",
    //       dueDate: new Date().toISOString(),
    //       completed: false,
    //     });
    //     const response = await agent.get("/todos");
    //     const parsedResponse = JSON.parse(response.text);
    
    //     expect(parsedResponse.length).toBe(4);
    //     expect(parsedResponse[3]["title"]).toBe("Buy ps3");
    //   });
    test("Deletes a todo with the given ID", async () => {
      let res = await agent.get("/todos");
      let csrfToken = extractCsrfToken(res);
      await agent.post("/todos").send({
        title: "Buy Bread",
        dueDate: new Date().toISOString(),
        completed: true,
        _csrf: csrfToken,
      });
  
      const groupedTodoResponse = await agent
        .get("/todos")
        .set("Accept", "application/json");
      const parsedGroupedResponse = JSON.parse(groupedTodoResponse.text);
      const dueTodayCount = parsedGroupedResponse.dueToday.length;
      const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];
  
      res = await agent.get("/todos");
      csrfToken = extractCsrfToken(res);
  
      const deleteResponse = await agent.delete(`/todos/${latestTodo.id}`).send({
        _csrf: csrfToken,
      });
      expect(deleteResponse.statusCode).toBe(200);
  
      const checkDeleteResponse = await agent
        .get("/todos")
        .set("Accept", "application/json");
      const parsedCheckDeleteResponse = JSON.parse(checkDeleteResponse.text);
      const deleteTodo = parsedCheckDeleteResponse.dueToday.find(
        (todo) => todo.id === latestTodo,
      );
      expect(deleteTodo).toBeUndefined();
    });
    test("Marks a todo with the given ID as Incomplete", async () => {
      let res = await agent.get("/todos");
      let csrfToken = extractCsrfToken(res);
      await agent.post("/todos").send({
        title: "Buy Internet",
        dueDate: new Date().toISOString().split("T")[0],
        completed: true,
        _csrf: csrfToken,
      });
  
      const groupedTodoResponse = await agent
        .get("/todos")
        .set("Accept", "application/json");
      const parsedGroupedResponse = JSON.parse(groupedTodoResponse.text);
      const dueTodayCount = parsedGroupedResponse.completed.length;
      const latestTodo = parsedGroupedResponse.completed[dueTodayCount - 1];
  
      res = await agent.get("/todos");
      csrfToken = extractCsrfToken(res);
  
      const markCompleteResponse = await agent
        .put(`/todos/${latestTodo.id}`)
        .send({
          _csrf: csrfToken,
        });
      const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
      expect(parsedUpdateResponse.completed).toBe(false);
    });
});
