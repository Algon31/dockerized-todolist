const request = require("supertest");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./middleware/auth");

// Mock Redis client
jest.mock("./config/redisClient", () => ({
  isReady: true,
  incr: jest.fn().mockResolvedValue(1),
  expire: jest.fn().mockResolvedValue(1),
  ttl: jest.fn().mockResolvedValue(60),
}));

// In-memory mock database for todos with 'mock' prefix for Jest
let mockTodosTable = [
  {
    id: "1",
    user_id: "user-1",
    todo: "Learn Local Testing",
    iscompleted: false,
    createdAt: new Date().toISOString(),
  },
];

// Mock pg db pool query
jest.mock("./config/db", () => ({
  query: jest.fn(async (text, params) => {
    // SELECT todos
    if (text.includes("SELECT id, todo, iscompleted") && text.includes("FROM todos WHERE user_id")) {
      const [userId] = params;
      const filtered = mockTodosTable.filter((t) => t.user_id === userId);
      return { rows: filtered };
    }

    // SELECT single todo
    if (text.includes("SELECT id, todo, iscompleted FROM todos WHERE id = $1 AND user_id = $2")) {
      const [id, userId] = params;
      const found = mockTodosTable.filter((t) => t.id === id && t.user_id === userId);
      return { rows: found };
    }

    // INSERT todo
    if (text.includes("INSERT INTO todos")) {
      let newTodo;
      if (params.length === 4) {
        const [id, userId, todo, iscompleted] = params;
        newTodo = {
          id: id || "generated-uuid",
          user_id: userId,
          todo,
          iscompleted: !!iscompleted,
          createdAt: new Date().toISOString(),
        };
      } else {
        const [userId, todo, iscompleted] = params;
        newTodo = {
          id: "generated-uuid",
          user_id: userId,
          todo,
          iscompleted: !!iscompleted,
          createdAt: new Date().toISOString(),
        };
      }
      mockTodosTable.push(newTodo);
      return { rows: [newTodo] };
    }

    // UPDATE todo
    if (text.includes("UPDATE todos SET todo = $1")) {
      const [todo, iscompleted, id, userId] = params;
      const idx = mockTodosTable.findIndex((t) => t.id === id && t.user_id === userId);
      if (idx !== -1) {
        mockTodosTable[idx] = {
          ...mockTodosTable[idx],
          todo,
          iscompleted,
        };
        return { rows: [mockTodosTable[idx]] };
      }
      return { rows: [] };
    }

    // DELETE single todo
    if (text.includes("DELETE FROM todos WHERE id = $1 AND user_id = $2")) {
      const [id, userId] = params;
      const prevLength = mockTodosTable.length;
      mockTodosTable = mockTodosTable.filter((t) => !(t.id === id && t.user_id === userId));
      return { rows: mockTodosTable.length < prevLength ? [{ id }] : [] };
    }

    // DELETE all todos for user
    if (text.includes("DELETE FROM todos WHERE user_id = $1")) {
      const [userId] = params;
      mockTodosTable = mockTodosTable.filter((t) => t.user_id !== userId);
      return { rows: [] };
    }

    return { rows: [] };
  }),
  initDb: jest.fn().mockResolvedValue(true),
}));

const app = require("./app");

const user1Token = jwt.sign({ id: "user-1", email: "user1@example.com" }, JWT_SECRET);
const user2Token = jwt.sign({ id: "user-2", email: "user2@example.com" }, JWT_SECRET);

describe("Todo API Endpoints with Authentication & PostgreSQL", () => {
  test("GET /todo without token should return 401 Unauthorized", async () => {
    const res = await request(app).get("/todo");
    expect(res.statusCode).toEqual(401);
  });

  test("GET /todo with valid token should return user's todos", async () => {
    const res = await request(app)
      .get("/todo")
      .set("Authorization", `Bearer ${user1Token}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty("todo", "Learn Local Testing");
  });

  test("GET /todo for another user should isolate data", async () => {
    const res = await request(app)
      .get("/todo")
      .set("Authorization", `Bearer ${user2Token}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test("POST /todo should create a new todo for authenticated user", async () => {
    const newTodo = {
      id: "2",
      todo: "Master PostgreSQL & Redis",
      iscompleted: false,
    };
    const res = await request(app)
      .post("/todo")
      .set("Authorization", `Bearer ${user1Token}`)
      .send(newTodo);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("message", "Todo saved");
    expect(res.body.todo).toHaveProperty("todo", "Master PostgreSQL & Redis");
  });

  test("PUT /todo/:id should update a todo", async () => {
    const updated = {
      todo: "Master PostgreSQL & Redis (Completed)",
      iscompleted: true,
    };
    const res = await request(app)
      .put("/todo/2")
      .set("Authorization", `Bearer ${user1Token}`)
      .send(updated);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Todo updated");
    expect(res.body.todo).toHaveProperty("iscompleted", true);
  });

  test("DELETE /todo/:id should delete a todo", async () => {
    const res = await request(app)
      .delete("/todo/2")
      .set("Authorization", `Bearer ${user1Token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Todo deleted");
  });

  test("POST /todo/clear should clear all todos for user", async () => {
    const res = await request(app)
      .post("/todo/clear")
      .set("Authorization", `Bearer ${user1Token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "All todos cleared");
  });
});
