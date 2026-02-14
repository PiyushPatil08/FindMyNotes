import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../config/api.js';
import { fetchNoteById } from '../services/noteService';

const EditNote = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user.userData);

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [category, setCategory] = useState("");
    const [categories, setCategories] = useState([]);

    // File handling
    const [file, setFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);

    // Fetch categories
    useEffect(() => {
        axios.get(`${API_BASE_URL}/categories`)
            .then(res => setCategories(res.data))
            .catch(err => console.error("Failed to fetch categories", err));
    }, []);

    // Fetch note details
    useEffect(() => {
        const getNote = async () => {
            try {
                setLoading(true);
                const data = await fetchNoteById(id);

                if (!data) {
                    toast.error("Note not found");
                    navigate("/notes");
                    return;
                }

                // Owner check
                const ownerId = data.uploadedBy?._id || data.uploadedBy;
                if (user?._id && ownerId && user._id !== ownerId) {
                    toast.error("You are not authorized to edit this note");
                    navigate("/notes");
                    return;
                }

                // Pre-fill form
                setTitle(data.fileName || "");
                setDescription(data.fileDescription || "");
                setTags(data.tags || []);
                setCategory(data.category || "");

                // Show existing thumbnail preview if needed? 
                // For now, we only show preview if user selects a NEW thumbnail.

            } catch (error) {
                console.error("Error fetching note:", error);
                toast.error("Failed to load note details");
                navigate("/notes");
            } finally {
                setLoading(false);
            }
        };

        if (user?._id) {
            getNote();
        } else {
            // If checking auth in useEffect has delay, might need proper protected route wrapper.
            // For now, simple redirect if no user after brief delay or handle via Redux persist check.
            // But if `user` is null initially then loads... 
            // We'll assume user is loaded if we reached here from a protected action, 
            // but if direct link, we might need to wait. 
            // Simplest: if (!user) ...
        }
    }, [id, user, navigate]);


    const handleAddTag = (e) => {
        e.preventDefault();
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (tag) => {
        setTags(tags.filter(t => t !== tag));
    };

    const submitForm = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            // IMPORTANT: Backend updateNote expects 'fileName', NOT 'title'
            formData.append("fileName", title);
            formData.append("fileDescription", description);
            formData.append("category", category);

            // Append tags
            tags.forEach(tag => formData.append("tags[]", tag));

            // Optional files
            if (file) formData.append("file", file);
            if (thumbnail) formData.append("thumbnail", thumbnail);

            await axios.put(`${API_BASE_URL}/notes/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("Note updated successfully!");

            // Redirect back to details
            setTimeout(() => {
                navigate(`/notes/${id}`);
            }, 1500);

        } catch (error) {
            console.error("Update failed:", error);
            toast.error(error.response?.data?.error || "Failed to update note");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
            <form
                onSubmit={submitForm}
                className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl border border-gray-100 flex flex-col gap-6"
            >
                <h1 className="text-3xl font-extrabold text-gray-800 text-center">
                    Edit Note
                </h1>

                {/* Title */}
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        placeholder="Title"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
                    <textarea
                        placeholder="Description"
                        required
                        rows="4"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    ></textarea>
                </div>

                {/* Category */}
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <select
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                        <option value="" disabled>Select category</option>
                        {categories.map((cat, idx) => (
                            <option key={cat.name + idx} value={cat.name}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tags */}
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700"
                            >
                                #{tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="ml-1 text-red-500 hover:text-red-700 font-bold"
                                >
                                    &times;
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Add tag"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            className="flex-1 rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                        <button
                            onClick={handleAddTag}
                            type="button"
                            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* Update File (Optional) */}
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Update PDF File (Optional)
                    </label>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>

                {/* Update Thumbnail (Optional) */}
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Update Thumbnail (Optional)
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            setThumbnail(e.target.files[0]);
                            setThumbnailPreview(
                                e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : null
                            );
                        }}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {thumbnailPreview && (
                        <img
                            src={thumbnailPreview}
                            alt="Thumbnail Preview"
                            className="mt-3 h-32 w-full rounded-lg border object-cover"
                        />
                    )}
                </div>

                <div className="flex gap-4 mt-4">
                    <button
                        type="button"
                        onClick={() => navigate(`/notes/${id}`)}
                        className="flex-1 rounded-xl bg-gray-200 py-3 text-base font-bold text-gray-700 transition hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 rounded-xl bg-blue-600 py-3 text-base font-bold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Saving Changes..." : "Save Changes"}
                    </button>
                </div>

            </form>
            <ToastContainer position="top-center" autoClose={2000} hideProgressBar={true} />
        </div>
    );
};

export default EditNote;
