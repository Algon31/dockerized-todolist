import React, { useState } from "react";
import { useAuth } from "../context/useAuth";
import { FaTimes, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserCheck, FaUserPlus } from "react-icons/fa";

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, setAuthModalMode, login, register, rateLimitState } =
    useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isAuthModalOpen) return null;

  const isLogin = authModalMode === "login";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    if (!isLogin && password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);

    const result = isLogin ? await login(email, password) : await register(email, password);

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error);
    } else {
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
      onClick={closeAuthModal}
    >
      <div
        className="relative w-full max-w-md bg-amber-50 border border-amber-300 rounded-2xl shadow-2xl overflow-hidden p-6 text-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-amber-900/60 hover:text-amber-900 transition-colors p-2 rounded-full hover:bg-amber-200"
          aria-label="Close modal"
        >
          <FaTimes className="text-lg" />
        </button>

        {/* Header Tabs */}
        <div className="flex border-b border-amber-200 mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthModalMode("login");
              setErrorMessage("");
            }}
            className={`flex-1 pb-3 font-semibold text-center text-sm md:text-base transition-all flex items-center justify-center gap-2 ${
              isLogin
                ? "border-b-2 border-amber-600 text-amber-900"
                : "text-amber-700/60 hover:text-amber-900"
            }`}
          >
            <FaUserCheck /> Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalMode("register");
              setErrorMessage("");
            }}
            className={`flex-1 pb-3 font-semibold text-center text-sm md:text-base transition-all flex items-center justify-center gap-2 ${
              !isLogin
                ? "border-b-2 border-amber-600 text-amber-900"
                : "text-amber-700/60 hover:text-amber-900"
            }`}
          >
            <FaUserPlus /> Create Account
          </button>
        </div>

        {/* Rate Limit Warning if active */}
        {rateLimitState && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 text-xs md:text-sm rounded-lg flex items-center justify-between">
            <span>Rate limit active: Slow down</span>
            <span className="font-bold font-mono px-2 py-0.5 bg-red-200 rounded">
              {rateLimitState.retryAfter}s
            </span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-xs md:text-sm rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-amber-900 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <FaEnvelope className="absolute left-3 text-amber-700/60" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 bg-amber-100/70 border border-amber-300 rounded-lg text-sm text-gray-900 placeholder-amber-800/40 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-900 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <FaLock className="absolute left-3 text-amber-700/60" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? "Enter your password" : "At least 6 characters"}
                className="w-full pl-9 pr-10 py-2 bg-amber-100/70 border border-amber-300 rounded-lg text-sm text-gray-900 placeholder-amber-800/40 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-amber-700/60 hover:text-amber-900"
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || (rateLimitState && rateLimitState.retryAfter > 0)}
            className="w-full mt-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold rounded-lg shadow transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div className="mt-5 text-center text-xs text-amber-800/70">
          {isLogin ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode("register");
                  setErrorMessage("");
                }}
                className="font-bold text-amber-800 hover:underline"
              >
                Sign up here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode("login");
                  setErrorMessage("");
                }}
                className="font-bold text-amber-800 hover:underline"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
