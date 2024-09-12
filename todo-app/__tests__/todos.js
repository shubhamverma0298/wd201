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
const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

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
    test("Sign up", async () => {
      let res = await agent.get("/signup");
      const csrfToken = extractCsrfToken(res);
      res = await agent.post("/users").send({
        firstName: "test",
        lastName: "User A",
        email: "user@test.com",
        password: "password",
        _csrf: csrfToken,
      });
      expect(res.statusCode).toBe(302);
    });
    test("Should redirect to /todos page when a logged in user visits root url", async () => {
      await agent
        .post("/session")
        .send({ email: "user@test.com", password: "password" });
  
      const response = await agent.get("/");
      expect(response.status).toBe(302);
      expect(response.header.location).toBe("/todos");
    });
  
    test("Sign Out", async () => {
      let res = await agent.get("/todos");
      expect(res.statusCode).toBe(200);
      res = await agent.get("/signout");
      expect(res.statusCode).toBe(302);
      res = await agent.get("/todos");
      expect(res.statusCode).toBe(302);
    });
    test("create a new Todo", async ()=>{
        const agent = request.agent(server);
        await login(agent, "user@test.com", "password");
        const res = await agent.get("/todos");
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
        const agent = request.agent(server);
        await login(agent, "user@test.com", "password");
        const res = await agent.get("/todos");
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
        
        res = await agent.get("/todos");
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
      const agent = request.agent(server);
      await login(agent, "user@test.com", "password");
      
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
      const agent = request.agent(server);
      await login(agent, "user@test.com", "password");
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
    test("should render index if the user is not logged in", async () => {
      const response = await request(app).get("/");
      expect(response.status).toBe(200);
      expect(response.text).toContain("Todo Application"); // Adjust based on your actual index content
    });
  
    test("Should be able to add a todo item and logout", async () => {
      await login(agent, "user@test.com", "password");
      const res = await agent.get("/todos");
      const csrfToken = extractCsrfToken(res);
  
      const addTodoResponse = await agent.post("/todos").send({
        title: "Test Todo",
        dueDate: new Date().toISOString(),
        completed: false,
        _csrf: csrfToken,
      });
  
      expect(addTodoResponse.statusCode).toBe(302);
  
      const todosResponse = await agent
        .get("/todos")
        .set("Accept", "application/json");
      const todos = JSON.parse(todosResponse.text);
      const addedTodo = todos.dueToday.find((todo) => todo.title === "Test Todo");
      expect(addedTodo).toBeDefined();
  
      const logoutResponse = await agent.get("/signout");
      expect(logoutResponse.statusCode).toBe(302);
      const todosAfterLogoutResponse = await agent.get("/todos");
      expect(todosAfterLogoutResponse.statusCode).toBe(302);
      expect(todosAfterLogoutResponse.header.location).toBe("/login");
    });
});
