import React from "react";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaDatabase } from "react-icons/fa";

const Navbar = () => {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      logout();
    }
  };

  return (
    <nav className="flex flex-wrap justify-between items-center px-4 md:px-8 py-3.5 bg-amber-400 shadow-md">
      {/* Brand & Logo */}
      <div className="flex gap-3 items-center">
        <div className="p-1.5 bg-amber-500 rounded-lg shadow-xs">
          <img className="w-6 h-6" src="/favicon.svg" alt="TodoList Logo" onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
        <div className="flex items-center gap-2">
          <span className="logo font-black text-xl tracking-tight text-amber-950">
            TaskFlow
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-600 text-white px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            <FaDatabase className="text-[9px]" /> v2.0
          </span>
        </div>
      </div>

      {/* Actions & User State */}
      <div className="flex items-center gap-3 md:gap-4 mt-2 sm:mt-0">
        <a
          href="https://ravibhuvan31.vercel.app/"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-block text-xs font-semibold text-amber-900 hover:text-amber-950 transition-colors"
        >
          Developer Portfolio
        </a>

        {isAuthenticated ? (
          <div className="flex items-center gap-2.5 bg-amber-300/80 px-3 py-1.5 rounded-full border border-amber-400">
            <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
              {user?.email ? user.email.charAt(0).toUpperCase() : <FaUser className="text-xs" />}
            </div>
            <span className="text-xs font-medium text-amber-950 max-w-[140px] md:max-w-[200px] truncate" title={user?.email}>
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="cursor-pointer ml-1 p-1 text-amber-800 hover:text-red-700 transition-colors rounded-full hover:bg-amber-400"
              title="Sign Out"
            >
              <FaSignOutAlt className="text-sm" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAuthModal("login")}
              className="cursor-pointer px-3 py-1.5 text-xs md:text-sm font-semibold text-amber-900 hover:text-black bg-amber-300 hover:bg-amber-200 rounded-lg transition-all flex items-center gap-1.5"
            >
              <FaSignInAlt /> Sign In
            </button>
            <button
              onClick={() => openAuthModal("register")}
              className="cursor-pointer px-3 py-1.5 text-xs md:text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <FaUserPlus /> Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
