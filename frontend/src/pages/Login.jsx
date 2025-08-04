import { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const toggleForm = () => setIsSignUp((prev) => !prev);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f4ff] px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8 border border-[#dcd6f7]">
        <h2 className="text-2xl font-semibold text-center text-[#7b5fc4] mb-6">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>

        <form className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]"
          />

          <button
            type="submit"
            className="w-full bg-[#e1cffb] font-semibold text-[#444444] py-2 rounded-md hover:bg-[#b89ae8] transition"
          >
            {isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>

        {!isSignUp && (
          <div className="text-right mt-2">
            <Link
              to="/forgot-password"
              className="text-sm text-[#a084ca] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        )}

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              onClick={toggleForm}
              className="ml-1 text-[#a084ca] hover:underline"
            >
              {isSignUp ? "Log In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
