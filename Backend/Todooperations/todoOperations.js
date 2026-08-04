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
  try {
    const todos = await client.hGetAll(REDIS_KEY);
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
    await client.hSet(REDIS_KEY, id, JSON.stringify({ todo, iscompleted: !!iscompleted }));
    res.status(201).json({ message: "Todo saved" });
  } catch (error) {
    console.error("Error saving todo:", error);
    res.status(500).json({ error: "Failed to save todo" });
  }
});

// Delete a todo
router.delete("/:id", async (req, res) => {
  try {
    await client.hDel(REDIS_KEY, req.params.id);
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
    await client.hSet(
      REDIS_KEY,
      req.params.id,
      JSON.stringify({ todo, iscompleted: !!iscompleted })
    );
    res.json({ message: "Todo updated" });
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// Clear all todos
router.post("/clear", async (req, res) => {
  try {
    await client.del(REDIS_KEY);
    res.json({ message: "All todos cleared" });
  } catch (error) {
    console.error("Error clearing todos:", error);
    res.status(500).json({ error: "Failed to clear todos" });
  }
});

module.exports = router;