const request = require("supertest");
const db = require("../models/index");
const app = require("../app");

let server, agent;

describe("Todo test suite",()=>{
    beforeAll(async ()=>
    {
        await db.sequelize.sync({force:true});
        server=app.listen(3000, ()=>{});
        agent =request.agent(server);
    });
    afterAll(async () => {
        await db.sequelize.close();
        server.close();
    });
    test("response with json at/todos", async ()=>{
        const response = await agent.post('todos').send({
            'title':"by milk",
            dueDate: new Date().toISOString(),
            completed: false
        })
        expect(response.statusCode).toBe(200);
        expect(response.header["content-type"]).toBe("application/json; charset=utf-8");
        const parsedResponse = JSON.parse(response.text);
        expect(parsedResponse.id).toBeDefined();
    });
    test("Mark as todo as complete", async ()=>{
        const response = await agent.post('todos').send({
            'title':"by milk",
            dueDate: new Date().toISOString(),
            completed: false
        });
        const parsedResponse = JSON.parse(response.text);
        const todoID = parsedResponse.id;
        expect(parsedResponse.completed).toBe(false);
        const markascompleteResponse = await agent.put(`todos/${todo.id}/markascomplete`).send();
        const parsedUpdateResponse = JSON.parse(markascompleteResponse.text);
        expect(parsedUpdateResponse.completed).toBe(true);
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
