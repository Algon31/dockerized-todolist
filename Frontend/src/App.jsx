import React from "react";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Body from "./components/Body";
import AuthModal from "./components/AuthModal";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-amber-50 text-gray-900 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Body />
        </main>
        <AuthModal />
      </div>
    </AuthProvider>
  );
}

export default App;
