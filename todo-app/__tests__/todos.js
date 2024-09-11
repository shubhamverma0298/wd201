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
    test("Fetches all todo in the database using /todo endpoint", async () => {
        await agent.post("/todos").send({
          title: "Buy xbox",
          dueDate: new Date().toISOString(),
          completed: false,
        });
        await agent.post("/todos").send({
          title: "Buy ps3",
          dueDate: new Date().toISOString(),
          completed: false,
        });
        const response = await agent.get("/todos");
        const parsedResponse = JSON.parse(response.text);
    
        expect(parsedResponse.length).toBe(4);
        expect(parsedResponse[3]["title"]).toBe("Buy ps3");
      });
    
     test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
      const response = await agent.post("/todos").send({
        title: "Buy milk",
        dueDate: new Date().toISOString(),
        completed: false,
      });
      const parsedResponse = JSON.parse(response.text);
      const length = Object.keys(parsedResponse).length;
      const todoID = parsedResponse.id;
      
      expect(length).toBeGreaterThan(0);
    
      const deleted = await agent
        .delete(`/todos/${todoID}`)
        .send();
    
      const parsedDeleteResponse = JSON.parse(deleted.text);
      const len = Object.keys(parsedDeleteResponse).length;
      expect(len).toBe(0);
    
    });
});
