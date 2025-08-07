import axios from "axios";
import React, { useState } from "react";
import { setUserData } from "../Redux/slices/user-slice";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../config/api.js";
import { loginUser } from '../services/userService';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");

  const loginUserHandler = async (e) => {
    try {
      e.preventDefault();
      const result = await loginUser(userEmail, userPassword);
      if(result.status==="Error") {
        toast.error("wrong credentials ");
        navigate("/login");
      } else {
        dispatch(setUserData(result));
        navigate("/");
      }
    } catch (error) {
      console.log("Cannot Login the User: ", error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-8 px-2">
      <form className="w-full max-w-md flex flex-col gap-4 rounded-xl bg-white p-8 shadow-xl" onSubmit={loginUserHandler}>
        <h1 className="text-2xl font-bold text-center mb-2">Login</h1>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-start justify-center">
            <label className="font-bold" htmlFor="userEmail">Email</label>
            <input
              type="email"
              id="userEmail"
              name="userEmail"
              className="w-full rounded-lg border border-gray-400 p-2 focus:ring focus:ring-blue-500"
              placeholder="your.email@example.com"
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-start justify-center">
            <label className="font-bold" htmlFor="userPassword">Password</label>
            <input
              type="password"
              id="userPassword"
              name="userPassword"
              className="w-full rounded-lg border border-gray-400 p-2 focus:ring focus:ring-blue-500"
              placeholder="*********"
              onChange={(e) => setUserPassword(e.target.value)}
            />
          </div>
        </div>
        <button className="rounded-lg bg-blue-500 px-5 py-2 font-bold text-white hover:bg-blue-600 mt-2" type="submit">
          Log In
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
