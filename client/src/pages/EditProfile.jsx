import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../config/api.js';
import { updateUserProfile, uploadProfileImage } from '../services/userService';
import { setUserData } from '../Redux/slices/user-slice';

const EditProfile = () => {
    const user = useSelector((state) => state.user.userData);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        userName: '',
        userBio: '',
        userEmail: '',
        userMobile: ''
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Pre-fill form on mount or when user data changes
    useEffect(() => {
        if (user) {
            setForm({
                userName: user.userName || '',
                userBio: user.userBio || '',
                userEmail: user.userEmail || '',
                userMobile: user.userMobile || ''
            });
        } else {
            // If no user, redirect to login
            navigate("/login");
        }
    }, [user, navigate]);


    const handleProfileChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSubmit = async e => {
        e.preventDefault();

        if (!form.userName.trim() || !form.userEmail.trim()) {
            toast.error("Name and Email are required");
            return;
        }

        setProfileLoading(true);
        try {
            let updateData = { ...form };
            if (selectedImage) {
                updateData.profileImage = await uploadProfileImage(selectedImage);
            }

            const res = await updateUserProfile(user._id, updateData);
            dispatch(setUserData(res));

            toast.success('Profile updated successfully!');

            // Redirect back to profile after delay
            setTimeout(() => {
                navigate("/profile");
            }, 1500);

        } catch (err) {
            const message = err.response?.data?.error || err.message || 'Failed to update profile';
            toast.error(message);
        } finally {
            setProfileLoading(false);
        }
    };

    if (!user) return <div className="text-center py-10">Loading...</div>;

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
            <form
                onSubmit={handleProfileSubmit}
                className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl border border-gray-100 flex flex-col gap-5"
            >
                <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-2">
                    Edit Profile
                </h1>

                {/* Profile Image Upload */}
                <div className="flex flex-col items-center gap-4 mb-2">
                    <div className="relative">
                        <img
                            src={imagePreview || user.profileImage || '/logo.png'}
                            alt="Profile preview"
                            className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-md"
                        />
                        <label htmlFor="imageUpload" className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 shadow-sm transition">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </label>
                        <input
                            id="imageUpload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </div>
                    <p className="text-sm text-gray-400">Click icon to change picture</p>
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                    <input
                        name="userName"
                        value={form.userName}
                        onChange={handleProfileChange}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                        placeholder="Name"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                    <input
                        name="userEmail"
                        value={form.userEmail}
                        onChange={handleProfileChange}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                        placeholder="Email"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Mobile Number</label>
                    <input
                        name="userMobile"
                        value={form.userMobile}
                        onChange={handleProfileChange}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                        placeholder="Mobile"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                        name="userBio"
                        value={form.userBio}
                        onChange={handleProfileChange}
                        rows="3"
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
                        placeholder="Tell us about yourself"
                    />
                </div>

                <div className="flex gap-4 mt-4">
                    <button
                        type="button"
                        onClick={() => navigate("/profile")}
                        className="flex-1 rounded-xl bg-gray-200 py-3 text-base font-bold text-gray-700 transition hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={profileLoading}
                        className="flex-1 rounded-xl bg-blue-600 py-3 text-base font-bold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {profileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

            </form>
            <ToastContainer position="top-center" autoClose={2000} hideProgressBar={true} />
        </div>
    );
};

export default EditProfile;
