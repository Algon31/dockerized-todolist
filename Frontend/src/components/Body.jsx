import { useState, useEffect, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaCheck,
  FaTimes,
  FaFilter,
  FaSearch,
  FaLock,
  FaShieldAlt,
  FaDatabase,
  FaBolt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useAuth } from "../context/useAuth";
import { API_URL } from "../config/api";

const Body = () => {
  const { user, token, isAuthenticated, openAuthModal, rateLimitState, triggerRateLimit } =
    useAuth();

  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all' | 'active' | 'completed'
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingTodos, setIsLoadingTodos] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'info' }

  // Show temporary toast notification
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  // Fetch todos when authenticated
  const fetchTodos = useCallback(async () => {
    if (!token) return;

    setIsLoadingTodos(true);
    try {
      const res = await fetch(`${API_URL}/todo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        triggerRateLimit(data.retryAfter, data.error);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch todos");
      }

      const data = await res.json();
      setTodos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetching todos error:", err);
      showToast("Error loading todos from PostgreSQL", "error");
    } finally {
      setIsLoadingTodos(false);
    }
  }, [token, triggerRateLimit, showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTodos();
    } else {
      setTodos([]);
    }
  }, [isAuthenticated, fetchTodos]);

  // Handle Add / Update Task
  const handleSave = async () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    if (!todo.trim()) {
      showToast("Please enter a task description!", "error");
      return;
    }

    if (rateLimitState && rateLimitState.retryAfter > 0) {
      showToast(`Rate limited. Please wait ${rateLimitState.retryAfter}s.`, "error");
      return;
    }

    if (editingId) {
      // Update existing todo
      const existing = todos.find((t) => t.id === editingId);
      const updatedTodo = {
        todo: todo.trim(),
        iscompleted: existing ? existing.iscompleted : false,
      };

      try {
        const res = await fetch(`${API_URL}/todo/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedTodo),
        });

        const data = await res.json().catch(() => ({}));

        if (res.status === 429) {
          triggerRateLimit(data.retryAfter, data.error);
          return;
        }

        if (!res.ok) throw new Error(data.error || "Failed to update todo");

        setTodos((prev) =>
          prev.map((item) =>
            item.id === editingId ? { ...item, todo: todo.trim() } : item
          )
        );
        setTodo("");
        setEditingId(null);
        showToast("Task updated successfully!");
      } catch (err) {
        console.error("Updating todo error:", err);
        showToast(err.message || "Could not update task", "error");
      }
    } else {
      // Add new todo
      const newId = uuidv4();
      const payload = { id: newId, todo: todo.trim(), iscompleted: false };

      try {
        const res = await fetch(`${API_URL}/todo`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));

        if (res.status === 429) {
          triggerRateLimit(data.retryAfter, data.error);
          return;
        }

        if (!res.ok) throw new Error(data.error || "Failed to save todo");

        const savedTodo = data.todo || payload;
        setTodos((prev) => [...prev, savedTodo]);
        setTodo("");
        showToast("New task added to PostgreSQL!");
      } catch (err) {
        console.error("Saving todo error:", err);
        showToast(err.message || "Could not save task", "error");
      }
    }
  };

  // Toggle todo completion
  const handleToggle = async (id) => {
    const item = todos.find((it) => it.id === id);
    if (!item) return;

    const newCompleted = !item.iscompleted;

    // Optimistic UI update
    setTodos((prev) =>
      prev.map((it) => (it.id === id ? { ...it, iscompleted: newCompleted } : it))
    );

    try {
      const res = await fetch(`${API_URL}/todo/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ todo: item.todo, iscompleted: newCompleted }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429) {
        triggerRateLimit(data.retryAfter, data.error);
        // Revert optimistic update
        setTodos((prev) =>
          prev.map((it) => (it.id === id ? { ...it, iscompleted: item.iscompleted } : it))
        );
        return;
      }

      if (!res.ok) throw new Error("Update failed");
    } catch (err) {
      console.error("Toggling completion failed:", err);
      // Revert optimistic update
      setTodos((prev) =>
        prev.map((it) => (it.id === id ? { ...it, iscompleted: item.iscompleted } : it))
      );
      showToast("Failed to update status", "error");
    }
  };

  // Delete single todo
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/todo/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429) {
        triggerRateLimit(data.retryAfter, data.error);
        return;
      }

      if (!res.ok) throw new Error("Delete failed");

      setTodos((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setTodo("");
      }
      showToast("Task deleted");
    } catch (err) {
      console.error("Deleting todo failed:", err);
      showToast("Failed to delete task", "error");
    }
  };

  // Clear all todos
  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to permanently clear all your tasks?")) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/todo/clear`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429) {
        triggerRateLimit(data.retryAfter, data.error);
        return;
      }

      if (!res.ok) throw new Error("Clear failed");

      setTodos([]);
      setEditingId(null);
      setTodo("");
      showToast("All tasks cleared from PostgreSQL");
    } catch (err) {
      console.error("Clearing todos failed:", err);
      showToast("Failed to clear tasks", "error");
    }
  };

  // Filter and search computation
  const filteredTodos = useMemo(() => {
    return todos.filter((item) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "active"
          ? !item.iscompleted
          : item.iscompleted;

      const matchesSearch = item.todo
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());

      return matchesFilter && matchesSearch;
    });
  }, [todos, filter, searchQuery]);

  // Statistics
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.iscompleted).length;
  const pendingCount = totalCount - completedCount;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 transition-all ${
            toast.type === "error"
              ? "bg-red-900 text-white border-red-700"
              : "bg-amber-900 text-amber-50 border-amber-800"
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* Rate Limit Alert Banner */}
      {rateLimitState && (
        <div className="p-4 bg-red-100 border-l-4 border-red-500 rounded-xl shadow-xs text-red-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-xl text-red-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Rate Limit Exceeded</p>
              <p className="text-xs text-red-700">
                Too many requests in a short time. Redis rate limiter cooldown active.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono font-bold text-lg px-2.5 py-1 bg-red-200 rounded-lg">
              {rateLimitState.retryAfter}s
            </span>
          </div>
        </div>
      )}

      {/* Unauthenticated Landing / Call To Action */}
      {!isAuthenticated ? (
        <div className="bg-amber-100 border border-amber-300 rounded-3xl p-8 md:p-12 text-center shadow-lg space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-amber-200 rounded-2xl text-amber-800 mb-2">
            <FaLock className="text-3xl" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-amber-950 tracking-tight">
            Secure Todo Management V2
          </h2>
          <p className="text-amber-900/80 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Experience reliable task tracking backed by <strong>PostgreSQL</strong> relational storage, 
            instant session authentication with <strong>JWT</strong>, and protected by distributed 
            <strong> Redis</strong> rate limiting.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto py-2">
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-left">
              <FaShieldAlt className="text-amber-700 text-xl mb-2" />
              <h3 className="font-bold text-sm text-amber-950">JWT Auth</h3>
              <p className="text-xs text-amber-800/80 mt-1">Bcrypt password hashing and secure token sessions.</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-left">
              <FaDatabase className="text-amber-700 text-xl mb-2" />
              <h3 className="font-bold text-sm text-amber-950">PostgreSQL</h3>
              <p className="text-xs text-amber-800/80 mt-1">Durable relational storage with user data isolation.</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-left">
              <FaBolt className="text-amber-700 text-xl mb-2" />
              <h3 className="font-bold text-sm text-amber-950">Redis Rate Limiter</h3>
              <p className="text-xs text-amber-800/80 mt-1">High-speed request throttling & brute-force defense.</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => openAuthModal("register")}
              className="cursor-pointer px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-md transition-all text-sm md:text-base flex items-center gap-2"
            >
              Get Started Free
            </button>
            <button
              onClick={() => openAuthModal("login")}
              className="cursor-pointer px-6 py-3 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-xl border border-amber-300 transition-all text-sm md:text-base"
            >
              Sign In to Your Tasks
            </button>
          </div>
        </div>
      ) : (
        /* Authenticated Task App */
        <div className="space-y-6">
          {/* Progress & Stats Bar */}
          <div className="bg-amber-100/90 border border-amber-300 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-3">
              <div>
                <h2 className="text-lg font-bold text-amber-950">Overview</h2>
                <p className="text-xs text-amber-800/80">
                  Logged in as <span className="font-semibold text-amber-950">{user?.email}</span>
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="px-2.5 py-1 bg-amber-200 text-amber-900 rounded-lg">
                  Total: {totalCount}
                </span>
                <span className="px-2.5 py-1 bg-amber-300 text-amber-950 rounded-lg">
                  Pending: {pendingCount}
                </span>
                <span className="px-2.5 py-1 bg-emerald-200 text-emerald-900 rounded-lg">
                  Completed: {completedCount}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-amber-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-amber-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Add / Edit Task Card */}
          <div className="bg-amber-100 border border-amber-300 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-900">
                {editingId ? "Edit Task" : "Create New Task"}
              </h3>
              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setTodo("");
                  }}
                  className="text-xs text-amber-700 hover:text-amber-950 font-semibold cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={todo}
                onChange={(e) => setTodo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape" && editingId) {
                    setEditingId(null);
                    setTodo("");
                  }
                }}
                placeholder="What needs to be done?"
                className="flex-1 px-4 py-2.5 bg-amber-50 border border-amber-300 rounded-xl text-sm text-gray-900 placeholder-amber-800/50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-inner"
              />
              <button
                onClick={handleSave}
                disabled={rateLimitState && rateLimitState.retryAfter > 0}
                className="cursor-pointer px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-bold rounded-xl shadow transition-all flex items-center gap-2 text-sm shrink-0"
              >
                {editingId ? <FaCheck /> : <FaPlus />}
                <span>{editingId ? "Update" : "Add"}</span>
              </button>
            </div>
          </div>

          {/* Search, Filter & List Container */}
          <div className="bg-amber-100 border border-amber-300 rounded-2xl p-5 shadow-sm space-y-4">
            {/* Filter and Search Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pb-3 border-b border-amber-200">
              {/* Filter Tabs */}
              <div className="flex bg-amber-200/80 p-1 rounded-xl gap-1 self-start">
                {["all", "active", "completed"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`cursor-pointer px-3 py-1 text-xs font-bold rounded-lg capitalize transition-all ${
                      filter === tab
                        ? "bg-amber-600 text-white shadow-xs"
                        : "text-amber-900 hover:text-amber-950"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative flex items-center">
                <FaSearch className="absolute left-3 text-amber-700/60 text-xs" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="pl-8 pr-3 py-1.5 bg-amber-50 border border-amber-300 rounded-lg text-xs text-gray-900 placeholder-amber-800/50 focus:outline-none focus:ring-1 focus:ring-amber-500 w-full sm:w-48"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 text-amber-700 hover:text-amber-950 text-xs"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-2.5 min-h-[220px]">
              {isLoadingTodos ? (
                <div className="flex items-center justify-center py-12 text-amber-800/70 text-sm gap-2">
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-amber-700 border-t-transparent"></span>
                  Loading tasks from database...
                </div>
              ) : filteredTodos.length === 0 ? (
                <div className="text-center py-12 text-amber-800/70 text-sm">
                  {searchQuery
                    ? "No tasks match your search filter."
                    : filter === "completed"
                    ? "No completed tasks yet. Finish a task!"
                    : filter === "active"
                    ? "No pending tasks. Great job!"
                    : "No tasks created yet. Add one above!"}
                </div>
              ) : (
                filteredTodos.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      item.iscompleted
                        ? "bg-amber-200/60 border-amber-300/80 opacity-80"
                        : "bg-amber-50 border-amber-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <input
                        type="checkbox"
                        checked={item.iscompleted}
                        onChange={() => handleToggle(item.id)}
                        className="cursor-pointer h-4 w-4 accent-amber-600 rounded"
                      />
                      <span
                        className={`text-sm md:text-base font-medium break-words ${
                          item.iscompleted
                            ? "line-through text-gray-500"
                            : "text-gray-900"
                        }`}
                      >
                        {item.todo}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setTodo(item.todo);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="cursor-pointer p-2 text-amber-800 hover:text-amber-950 hover:bg-amber-200 rounded-lg transition-colors"
                        title="Edit Task"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="cursor-pointer p-2 text-amber-800 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete Task"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Clear All Footer */}
            {todos.length > 0 && (
              <div className="pt-3 border-t border-amber-200 flex justify-end">
                <button
                  onClick={handleClear}
                  className="cursor-pointer text-xs font-semibold text-red-700 hover:text-red-900 hover:underline transition-colors"
                >
                  Clear All Tasks
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Body;
