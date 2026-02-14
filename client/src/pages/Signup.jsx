import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { registerUser } from '../services/userService';

const Signup = () => {
  const [profilePreviewImage, setProfilePreviewImage] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userMobile, setUserMobile] = useState("");
  const [userBio, setUserBio] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const registerUserHandler = async (e) => {
    e.preventDefault();

    // --- Client-side validation ---
    if (!firstName.trim()) {
      toast.error("First name is required");
      return;
    }
    if (!lastName.trim()) {
      toast.error("Last name is required");
      return;
    }
    if (!userEmail.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!userName.trim()) {
      toast.error("Username is required");
      return;
    }
    if (userName.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }
    if (!userPassword) {
      toast.error("Password is required");
      return;
    }
    if (userPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (userPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("firstName", firstName.trim());
      formData.append("lastName", lastName.trim());
      formData.append("userBio", userBio.trim());
      formData.append("userEmail", userEmail.trim());
      formData.append("userMobile", userMobile);
      formData.append("userName", userName.trim());
      formData.append("userPassword", userPassword);
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      await registerUser(formData);
      toast.success("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-8 px-2">
      <form className="w-full max-w-md flex flex-col gap-4 rounded-xl bg-white p-8 shadow-xl" onSubmit={registerUserHandler}>
        <h1 className="text-2xl font-black text-center mb-2">Register</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col items-start justify-center w-full">
            <label className="font-bold" htmlFor="firstName">First Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              className="w-full rounded-lg border p-2 focus:border-blue-500 focus:outline-none"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col items-start justify-center w-full">
            <label className="font-bold" htmlFor="lastName">Last Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              className="w-full rounded-lg border p-2 focus:border-blue-500 focus:outline-none"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="flex flex-col items-start justify-center">
          <label className="font-bold" htmlFor="userBio">Bio <span className="text-gray-400 text-sm font-normal">(optional)</span></label>
          <textarea
            id="userBio"
            name="userBio"
            rows="2"
            className="mt-1 w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none"
            placeholder="Tell us something about yourself"
            value={userBio}
            onChange={(e) => setUserBio(e.target.value)}
            disabled={isLoading}
          ></textarea>
        </div>
        <div className="flex flex-col items-start justify-center">
          <label className="font-bold" htmlFor="userEmail">Email <span className="text-red-500">*</span></label>
          <input
            type="email"
            id="userEmail"
            name="userEmail"
            required
            className="w-full rounded-lg border p-2 focus:border-blue-500 focus:outline-none"
            placeholder="your.email@example.com"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-col items-start justify-center">
          <label className="font-bold" htmlFor="userMobile">Mobile Number <span className="text-gray-400 text-sm font-normal">(optional)</span></label>
          <input
            type="number"
            id="userMobile"
            name="userMobile"
            className="w-full rounded-lg border p-2 focus:border-blue-500 focus:outline-none"
            placeholder="0000000000"
            value={userMobile}
            onChange={(e) => setUserMobile(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-col items-start justify-center">
          <label className="font-bold" htmlFor="userName">Username <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="userName"
            name="userName"
            required
            minLength={3}
            className="w-full rounded-lg border p-2 focus:border-blue-500 focus:outline-none"
            placeholder="johndoe123"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
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
            minLength={6}
            className="w-full rounded-lg border p-2 focus:border-blue-500 focus:outline-none"
            placeholder="Minimum 6 characters"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-col items-start justify-center">
          <label className="font-bold" htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            minLength={6}
            className="w-full rounded-lg border p-2 focus:border-blue-500 focus:outline-none"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />
          {confirmPassword && userPassword !== confirmPassword && (
            <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
          )}
        </div>
        <div className="flex w-full flex-col items-center justify-center">
          <label className="text-sm font-bold mb-1">Profile Image <span className="text-gray-400 text-sm font-normal">(optional)</span></label>
          <div className="mb-4 grid h-[100px] w-[100px] place-content-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-2xl font-black">
            {profilePreviewImage === "" ? (
              <p className="text-xs font-bold text-gray-400">No Image</p>
            ) : (
              <img src={profilePreviewImage} alt="Profile preview" className="object-cover w-full h-full" />
            )}
          </div>
          <label
            htmlFor="dropzone-file"
            className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center py-3">
              <svg
                className="mb-2 h-5 w-5 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2 "
                />
              </svg>
              <p className="text-xs text-gray-500">
                <span className="font-semibold">Click to upload profile image</span>
              </p>
              <input
                type="file"
                accept="image/png, image/jpeg"
                id="dropzone-file"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setProfilePreviewImage(URL.createObjectURL(e.target.files[0]));
                    setProfileImage(e.target.files[0]);
                  }
                }}
                className="hidden"
                disabled={isLoading}
              />
            </div>
          </label>
        </div>
        <button
          className="rounded-lg bg-blue-500 px-5 py-2 font-bold text-white hover:bg-blue-600 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Register"}
        </button>
        <div className="text-sm mt-2 text-center">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-blue-500 hover:underline">
            Login
          </Link>
        </div>
      </form>
      <ToastContainer position="top-center" autoClose={2500} hideProgressBar={true} />
    </div>
  );
};

export default Signup;
