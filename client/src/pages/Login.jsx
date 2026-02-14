import React, { useState } from "react";
import { setUserData } from "../Redux/slices/user-slice";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { loginUser } from '../services/userService';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginUserHandler = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!userEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!userPassword) {
      toast.error("Please enter your password");
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginUser(userEmail.trim(), userPassword);

      // Check if the response has the error status (backward compat)
      if (result.status === "Error") {
        toast.error(result.error || "Invalid email or password");
        return;
      }

      toast.success("Login successful!");
      dispatch(setUserData(result));
      setTimeout(() => navigate("/"), 500);

    } catch (error) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-8 px-2">
      <form className="w-full max-w-md flex flex-col gap-4 rounded-xl bg-white p-8 shadow-xl" onSubmit={loginUserHandler}>
        <h1 className="text-2xl font-bold text-center mb-2">Login</h1>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-start justify-center">
            <label className="font-bold" htmlFor="userEmail">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              id="userEmail"
              name="userEmail"
              required
              className="w-full rounded-lg border border-gray-400 p-2 focus:ring focus:ring-blue-500"
              placeholder="your.email@example.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col items-start justify-center">
            <label className="font-bold" htmlFor="userPassword">Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              id="userPassword"
              name="userPassword"
              required
              className="w-full rounded-lg border border-gray-400 p-2 focus:ring focus:ring-blue-500"
              placeholder="*********"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        <button
          className="rounded-lg bg-blue-500 px-5 py-2 font-bold text-white hover:bg-blue-600 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Log In"}
        </button>
        <div className="flex items-center justify-between text-sm mt-2">
          <p>New to FindMyNotes?</p>
          <Link to="/signup" className="font-bold text-blue-500 hover:underline">Create an account</Link>
        </div>
      </form>
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar={true} />
    </div>
  );
};

export default Login;
