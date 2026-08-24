const request = require("supertest");

// Mock redis client so tests can run cleanly without requiring a live Redis server
jest.mock("redis", () => {
  const mClient = {
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(true),
    hGetAll: jest.fn().mockResolvedValue({
      "1": JSON.stringify({ todo: "Learn Local Testing", iscompleted: false }),
    }),
    hSet: jest.fn().mockResolvedValue(1),
    hDel: jest.fn().mockResolvedValue(1),
    del: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
  };
  return {
    createClient: jest.fn(() => mClient),
  };
});

const app = require("./app");

describe("Todo API Endpoints", () => {
  test("GET /todo should return a list of todos", async () => {
    const res = await request(app).get("/todo");
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("todo", "Learn Local Testing");
  });

  test("GET /todo with x-session-id should return a list of todos for that session", async () => {
    const res = await request(app).get("/todo").set("x-session-id", "test-session-123");
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /todo should create a new todo and set session", async () => {
    const newTodo = {
      id: "2",
      todo: "Master Cloud Infra",
      iscompleted: false,
    };
    const res = await request(app)
      .post("/todo")
      .set("x-session-id", "test-session-123")
      .send(newTodo);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("message", "Todo saved");
  });

  test("PUT /todo/:id should update a todo with session", async () => {
    const updated = {
      todo: "Master Cloud Infra (Done)",
      iscompleted: true,
    };
    const res = await request(app)
      .put("/todo/2")
      .set("x-session-id", "test-session-123")
      .send(updated);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Todo updated");
  });

  test("DELETE /todo/:id should delete a todo with session", async () => {
    const res = await request(app)
      .delete("/todo/2")
      .set("x-session-id", "test-session-123");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Todo deleted");
  });

  test("POST /todo/clear should clear todos for the session", async () => {
    const res = await request(app)
      .post("/todo/clear")
      .set("x-session-id", "test-session-123");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "All todos cleared");
  });
});
