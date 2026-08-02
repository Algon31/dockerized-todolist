import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { FaEdit, FaTrash } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;

const Body = () => {
  const [todo, settodo] = useState("");
  const [todos, settodos] = useState([]);

  // Load todos from backend on mount
  useEffect(() => {
    fetch(`${API}/todo/`)
      .then((res) => res.json())
      .then((data) => settodos(data))
      .catch((err) => console.error("Fetching todos failed", err));
  }, []);

  // Handles input changes
  const handleChange = (e) => {
    settodo(e.target.value);
  };

  // Add todo (send to backend)
  const handleAdd = () => {
    if (!todo) return alert("Enter a task!");
    const newTodo = { id: uuidv4(), todo, iscompleted: false };
    fetch(`${API}/todo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo),
    })
      .then((res) => res.json())
      .then(() => {
        settodos([...todos, newTodo]);
        settodo("");
      });
  };

  // Delete todo by ID
  const handleDelete = (id) => {
    fetch(`${API}/todo/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        settodos(todos.filter((item) => item.id !== id));
      });
  };

  // Edit todo (=populate in the input, then delete old)
  const handleEdit = (id) => {
    const item = todos.find((it) => it.id === id);
    settodo(item.todo);
    handleDelete(id);
  };

  // Clear all todos (send to backend)
  const handleClear = () => {
    if (window.confirm("Are You Sure U Wanna Clear The List??")) {
      fetch(`${API}/todos/clear`, {
        method: "POST",
      }).then(() => settodos([]));
    }
  };

  // Toggle completion status, update backend
  const handlecheck = (e) => {
    let id = e.target.name;
    let index = todos.findIndex((item) => item.id === id);
    let newT = [...todos];
    newT[index].iscompleted = !newT[index].iscompleted;
    fetch(`${API}/todo/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newT[index]),
    }).then(() => settodos(newT));
  };

  return (
    <>
      {/* Add Task */}
      <div className="my-5 flex flex-col gap-2">
        <div className="bg-amber-200 mx-auto w-[80vw] h-30 rounded-2xl flex flex-col items-center justify-center gap-2">
          <h1 className="text-2xl font-bold">Add Task</h1>
          <div className="w-full flex justify-center gap-2 ">
            <input
              id="inpu"
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
              value={todo}
              className="w-8/12 border-b-2 bg-amber-300 rounded-t-sm ml-5 h-9 focus:outline-none"
              type="text"
            />
            <button
              onClick={handleAdd}
              className="cursor-pointer bg-amber-600 p-2 rounded-sm"
            >
              Add
            </button>
          </div>
        </div>
        {/* Display Todos */}
        <div className="bg-amber-200 mx-auto w-[80vw] h-[68vh] rounded-2xl flex flex-col items-center gap-2">
          <div className="flex justify-between w-4/5 items-center content-center">
            <h1 className="text-2xl font-bold my-2">Task Yet To Complete</h1>
            {todos.length > 2 && (
              <button
                onClick={handleClear}
                className="cursor-pointer bg-amber-600 p-2 rounded-sm h-9 "
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-col overflow-y-auto w-4/5 mx-2">
            {todos.length === 0 && (
              <div className="self-center">No Todos Display!!</div>
            )}
            {todos.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-6 bg-amber-300 rounded-sm my-1 w-full justify-between p-2 break-words"
              >
                <div className="flex gap-1.5 justify-center">
                  <input
                    name={item.id}
                    type="checkbox"
                    onChange={handlecheck}
                    checked={item.iscompleted}
                  />
                  <div
                    className={`${
                      item.iscompleted ? "line-through" : ""
                    } text-sm md:text-lg`}
                  >
                    {item.todo}
                  </div>
                </div>
                <div className="flex gap-2 mx-2">
                  <button
                    onClick={() => handleEdit(item.id)}
                    className="flex items-center justify-center bg-amber-600 p-2 rounded-sm text-black hover:bg-amber-700 transition-all"
                  >
                    <FaEdit className="block md:hidden text-lg" />
                    <span className="hidden md:block">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center justify-center bg-amber-600 p-2 rounded-sm text-black hover:bg-red-700 transition-all"
                  >
                    <FaTrash className="block md:hidden text-lg text-black" />
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
