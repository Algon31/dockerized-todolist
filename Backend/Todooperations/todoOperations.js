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

const REDIS_KEY = "todos";

// Fetch all todos
router.get("/", async (req, res) => {
  const todos = await client.hGetAll(REDIS_KEY);
  const todoList = Object.entries(todos).map(([id, value]) => ({
    id,
    ...JSON.parse(value),
  }));
  res.json(todoList);
});

// Add new todo
router.post("/", async (req, res) => {
  const { id, todo, iscompleted } = req.body;
  await client.hSet(REDIS_KEY, id, JSON.stringify({ todo, iscompleted }));
  res.status(201).json({ message: "Todo saved" });
});

// Delete a todo
router.delete("/:id", async (req, res) => {
  await client.hDel(REDIS_KEY, req.params.id);
  res.json({ message: "Todo deleted" });
});

// Update a todo
router.put("/:id", async (req, res) => {
  const { todo, iscompleted } = req.body;
  await client.hSet(
    REDIS_KEY,
    req.params.id,
    JSON.stringify({ todo, iscompleted })
  );
  res.json({ message: "Todo updated" });
});

// Clear all todos
router.post("/clear", async (req, res) => {
  await client.del(REDIS_KEY);
  res.json({ message: "All todos cleared" });
});

module.exports = router;