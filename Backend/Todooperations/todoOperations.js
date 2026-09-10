const express = require("express");
const { query } = require("../config/db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Apply JWT authentication to all todo routes
router.use(authenticateToken);

// Fetch all todos for the logged-in user
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await query(
      "SELECT id, todo, iscompleted, created_at AS \"createdAt\" FROM todos WHERE user_id = $1 ORDER BY created_at ASC",
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching todos from PostgreSQL:", error);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// Add new todo for the logged-in user
router.post("/", async (req, res) => {
  try {
    const { id, todo, iscompleted } = req.body;
    const userId = req.user.id;

    if (!todo || typeof todo !== "string" || !todo.trim()) {
      return res.status(400).json({ error: "Todo task content is required" });
    }

    let insertQuery;
    let params;

    if (id) {
      insertQuery =
        "INSERT INTO todos (id, user_id, todo, iscompleted) VALUES ($1, $2, $3, $4) RETURNING id, todo, iscompleted, created_at AS \"createdAt\"";
      params = [id, userId, todo.trim(), !!iscompleted];
    } else {
      insertQuery =
        "INSERT INTO todos (user_id, todo, iscompleted) VALUES ($1, $2, $3) RETURNING id, todo, iscompleted, created_at AS \"createdAt\"";
      params = [userId, todo.trim(), !!iscompleted];
    }

    const result = await query(insertQuery, params);
    res.status(201).json({
      message: "Todo saved",
      todo: result.rows[0],
    });
  } catch (error) {
    console.error("Error saving todo to PostgreSQL:", error);
    res.status(500).json({ error: "Failed to save todo" });
  }
});

// Update a todo for the logged-in user
router.put("/:id", async (req, res) => {
  try {
    const { todo, iscompleted } = req.body;
    const { id } = req.params;
    const userId = req.user.id;

    if (todo === undefined && iscompleted === undefined) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    const currentResult = await query(
      "SELECT id, todo, iscompleted FROM todos WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    const current = currentResult.rows[0];
    const newTodo = todo !== undefined ? todo.trim() : current.todo;
    const newIsCompleted =
      iscompleted !== undefined ? !!iscompleted : current.iscompleted;

    const updateResult = await query(
      "UPDATE todos SET todo = $1, iscompleted = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING id, todo, iscompleted, created_at AS \"createdAt\"",
      [newTodo, newIsCompleted, id, userId]
    );

    res.json({
      message: "Todo updated",
      todo: updateResult.rows[0],
    });
  } catch (error) {
    console.error("Error updating todo in PostgreSQL:", error);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// Delete a todo by ID for the logged-in user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      "DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ message: "Todo deleted", id });
  } catch (error) {
    console.error("Error deleting todo from PostgreSQL:", error);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

// Clear all todos for the logged-in user
router.post("/clear", async (req, res) => {
  try {
    const userId = req.user.id;
    await query("DELETE FROM todos WHERE user_id = $1", [userId]);
    res.json({ message: "All todos cleared" });
  } catch (error) {
    console.error("Error clearing todos from PostgreSQL:", error);
    res.status(500).json({ error: "Failed to clear todos" });
  }
});

module.exports = router;