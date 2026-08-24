const express = require("express");
const router = express.Router();
const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_URL,
});


client.on("error", (err) => {
  console.error("Redis Error:", err);
});

client.connect();

const TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days (604,800 seconds)

const getRedisKey = (req) => {
  const sessionId = req.headers["x-session-id"] || req.query.sessionId;
  return sessionId ? `todos:${sessionId}` : "todos:default";
};

// Fetch all todos for the session
router.get("/", async (req, res) => {
  try {
    const key = getRedisKey(req);
    const todos = await client.hGetAll(key);
    const todoList = Object.entries(todos || {}).map(([id, value]) => ({
      id,
      ...JSON.parse(value),
    }));
    res.json(todoList);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// Add new todo
router.post("/", async (req, res) => {
  try {
    const { id, todo, iscompleted } = req.body;
    if (!id || !todo) {
      return res.status(400).json({ error: "Missing required fields (id, todo)" });
    }
    const key = getRedisKey(req);
    await client.hSet(key, id, JSON.stringify({ todo, iscompleted: !!iscompleted }));
    await client.expire(key, TTL_SECONDS);
    res.status(201).json({ message: "Todo saved" });
  } catch (error) {
    console.error("Error saving todo:", error);
    res.status(500).json({ error: "Failed to save todo" });
  }
});

// Delete a todo
router.delete("/:id", async (req, res) => {
  try {
    const key = getRedisKey(req);
    await client.hDel(key, req.params.id);
    res.json({ message: "Todo deleted" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

// Update a todo
router.put("/:id", async (req, res) => {
  try {
    const { todo, iscompleted } = req.body;
    const key = getRedisKey(req);
    await client.hSet(
      key,
      req.params.id,
      JSON.stringify({ todo, iscompleted: !!iscompleted })
    );
    await client.expire(key, TTL_SECONDS);
    res.json({ message: "Todo updated" });
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// Clear all todos for the session
router.post("/clear", async (req, res) => {
  try {
    const key = getRedisKey(req);
    await client.del(key);
    res.json({ message: "All todos cleared" });
  } catch (error) {
    console.error("Error clearing todos:", error);
    res.status(500).json({ error: "Failed to clear todos" });
  }
});

module.exports = router;