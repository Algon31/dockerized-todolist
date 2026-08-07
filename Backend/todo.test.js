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

  test("POST /todo should create a new todo", async () => {
    const newTodo = {
      id: "2",
      todo: "Master Cloud Infra",
      iscompleted: false,
    };
    const res = await request(app).post("/todo").send(newTodo);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("message", "Todo saved");
  });
});
