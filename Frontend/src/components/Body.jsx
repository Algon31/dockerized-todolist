import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { FaEdit, FaTrash } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

const Body = () => {
  const [todo, settodo] = useState("");
  const [todos, settodos] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Load todos from backend on mount
  useEffect(() => {
    fetch(`${API}/todo`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch todos");
        return res.json();
      })
      .then((data) => settodos(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Fetching todos failed", err));
  }, []);

  // Handles input changes
  const handleChange = (e) => {
    settodo(e.target.value);
  };

  // Add or Update todo (send to backend)
  const handleSave = () => {
    if (!todo.trim()) return alert("Enter a task!");

    if (editingId) {
      // Update existing todo
      const existing = todos.find((t) => t.id === editingId);
      const updatedTodo = {
        todo: todo.trim(),
        iscompleted: existing ? existing.iscompleted : false,
      };

      fetch(`${API}/todo/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTodo),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to update todo");
          return res.json();
        })
        .then(() => {
          settodos((prev) =>
            prev.map((item) =>
              item.id === editingId ? { ...item, todo: todo.trim() } : item
            )
          );
          settodo("");
          setEditingId(null);
        })
        .catch((err) => console.error("Updating todo failed", err));
    } else {
      // Add new todo
      const newTodo = { id: uuidv4(), todo: todo.trim(), iscompleted: false };
      fetch(`${API}/todo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTodo),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to save todo");
          return res.json();
        })
        .then(() => {
          settodos((prev) => [...prev, newTodo]);
          settodo("");
        })
        .catch((err) => console.error("Saving todo failed", err));
    }
  };

  // Delete todo by ID
  const handleDelete = (id) => {
    fetch(`${API}/todo/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete todo");
        settodos((prev) => prev.filter((item) => item.id !== id));
        if (editingId === id) {
          setEditingId(null);
          settodo("");
        }
      })
      .catch((err) => console.error("Deleting todo failed", err));
  };

  // Populate input for edit without deleting
  const handleEdit = (id) => {
    const item = todos.find((it) => it.id === id);
    if (item) {
      settodo(item.todo);
      setEditingId(id);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingId(null);
    settodo("");
  };

  // Clear all todos (send to backend)
  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all tasks?")) {
      fetch(`${API}/todo/clear`, {
        method: "POST",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to clear todos");
          settodos([]);
          setEditingId(null);
          settodo("");
        })
        .catch((err) => console.error("Clearing todos failed", err));
    }
  };

  // Toggle completion status, update backend
  const handlecheck = (e) => {
    const id = e.target.name;
    const item = todos.find((it) => it.id === id);
    if (!item) return;

    const updatedItem = {
      todo: item.todo,
      iscompleted: !item.iscompleted,
    };

    fetch(`${API}/todo/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedItem),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update status");
        settodos((prev) =>
          prev.map((it) =>
            it.id === id ? { ...it, iscompleted: updatedItem.iscompleted } : it
          )
        );
      })
      .catch((err) => console.error("Toggling completion status failed", err));
  };

  return (
    <>
      {/* Add / Edit Task */}
      <div className="my-5 flex flex-col gap-2">
        <div className="bg-amber-200 mx-auto w-[80vw] p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
          <h1 className="text-2xl font-bold">
            {editingId ? "Edit Task" : "Add Task"}
          </h1>
          <div className="w-full flex justify-center gap-2">
            <input
              id="todo-input"
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              value={todo}
              placeholder="Enter task description..."
              className="w-8/12 border-b-2 bg-amber-300 rounded-t-sm px-3 h-9 focus:outline-none"
              type="text"
            />
            <button
              onClick={handleSave}
              className="cursor-pointer bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-sm transition-all"
            >
              {editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="cursor-pointer bg-gray-500 hover:bg-gray-600 text-white font-semibold px-3 py-2 rounded-sm transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        {/* Display Todos */}
        <div className="bg-amber-200 mx-auto w-[80vw] h-[68vh] rounded-2xl flex flex-col items-center gap-2 p-4">
          <div className="flex justify-between w-4/5 items-center">
            <h1 className="text-2xl font-bold my-2">Your Tasks</h1>
            {todos.length > 2 && (
              <button
                onClick={handleClear}
                className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1 rounded-sm"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="flex flex-col overflow-y-auto w-4/5 mx-2">
            {todos.length === 0 && (
              <div className="self-center text-gray-700 mt-4">
                No tasks available!
              </div>
            )}
            {todos.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-6 bg-amber-300 rounded-sm my-1 w-full justify-between p-2 break-words"
              >
                <div className="flex gap-2 items-center">
                  <input
                    name={item.id}
                    type="checkbox"
                    onChange={handlecheck}
                    checked={item.iscompleted}
                    className="cursor-pointer h-4 w-4"
                  />
                  <div
                    className={`${
                      item.iscompleted ? "line-through text-gray-600" : ""
                    } text-sm md:text-lg`}
                  >
                    {item.todo}
                  </div>
                </div>
                <div className="flex gap-2 mx-2">
                  <button
                    onClick={() => handleEdit(item.id)}
                    className="flex items-center justify-center bg-amber-600 hover:bg-amber-700 p-2 rounded-sm text-black transition-all"
                  >
                    <FaEdit className="block md:hidden text-lg" />
                    <span className="hidden md:block">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center justify-center bg-amber-600 hover:bg-red-700 p-2 rounded-sm text-black transition-all"
                  >
                    <FaTrash className="block md:hidden text-lg" />
                    <span className="hidden md:block">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Body;
