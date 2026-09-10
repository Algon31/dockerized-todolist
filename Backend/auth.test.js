const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Mock Redis client so tests don't require running redis server
jest.mock("./config/redisClient", () => ({
  isReady: true,
  incr: jest.fn().mockResolvedValue(1),
  expire: jest.fn().mockResolvedValue(1),
  ttl: jest.fn().mockResolvedValue(60),
}));

// Mock pg db pool query
jest.mock("./config/db", () => {
  const usersTable = [];
  return {
    query: jest.fn(async (text, params) => {
      if (text.includes("SELECT id, email, password_hash") || text.includes("SELECT id FROM users WHERE email")) {
        const email = params[0];
        const user = usersTable.find((u) => u.email === email);
        return { rows: user ? [user] : [] };
      }
      if (text.includes("SELECT id, email, created_at FROM users WHERE id = $1")) {
        const id = params[0];
        const user = usersTable.find((u) => u.id === id);
        return { rows: user ? [{ id: user.id, email: user.email, created_at: user.created_at }] : [] };
      }
      if (text.includes("INSERT INTO users")) {
        const [email, password_hash] = params;
        const newUser = {
          id: "mock-user-uuid-123",
          email,
          password_hash,
          created_at: new Date().toISOString(),
        };
        usersTable.push(newUser);
        return { rows: [newUser] };
      }
      return { rows: [] };
    }),
    initDb: jest.fn().mockResolvedValue(true),
  };
});

const app = require("./app");

describe("Auth API Endpoints", () => {
  test("POST /api/auth/register should register a new user and return token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "testuser@example.com", password: "password123" });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", "testuser@example.com");
  });

  test("POST /api/auth/register with duplicate email should return 409", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "testuser@example.com", password: "password123" });

    expect(res.statusCode).toEqual(409);
    expect(res.body).toHaveProperty("error", "Email is already registered");
  });

  test("POST /api/auth/register with invalid email should return 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "not-an-email", password: "password123" });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error", "Invalid email address format");
  });

  test("POST /api/auth/register with short password should return 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "short@example.com", password: "123" });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error", "Password must be at least 6 characters long");
  });

  test("POST /api/auth/login with valid credentials should return 200 and token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "testuser@example.com", password: "password123" });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", "testuser@example.com");
  });

  test("POST /api/auth/login with wrong password should return 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "testuser@example.com", password: "wrongpassword" });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("error", "Invalid email or password");
  });

  test("GET /api/auth/me should return user details when token is valid", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "testuser@example.com", password: "password123" });

    const token = loginRes.body.token;

    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meRes.statusCode).toEqual(200);
    expect(meRes.body.user).toHaveProperty("email", "testuser@example.com");
  });

  test("GET /api/auth/me should return 401 without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toEqual(401);
  });
});
