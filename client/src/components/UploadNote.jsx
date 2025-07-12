import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const UploadNote = ({ editNote, onSuccess }) => {
  const [title, setTitle] = useState(editNote?.fileName || "");
  const [description, setDescription] = useState(editNote?.fileDescription || "");
  const [tags, setTags] = useState(editNote?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState(editNote?.category || "");
  const [categories, setCategories] = useState([]);
  const user = useSelector((state) => state.user.userData);
  const userId = user?._id;
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:6969/categories").then(res => setCategories(res.data));
  }, []);

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

  const submitFile = async (e) => {
    try {
      e.preventDefault();
      if (!userId) return alert("Login required");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      tags.forEach(tag => formData.append("tags[]", tag));
      formData.append("category", category);
      if (file) formData.append("file", file);
      if (thumbnail) formData.append("thumbnail", thumbnail);
      formData.append("userId", userId);
      let url = "http://localhost:6969/notes/upload";
      let method = "post";
      if (editNote) {
        url = `http://localhost:6969/notes/${editNote._id}`;
        method = "put";
      }
      const res = await axios[method](url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!editNote && res.data && res.data._id) {
        navigate(`/notes/${res.data._id}`);
      } else if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.log("Failed to submit file: ", error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4 py-12">
      <form
        onSubmit={submitFile}
        className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl border border-gray-200 flex flex-col gap-6"
      >
        <h1 className="text-3xl font-extrabold text-gray-800 text-center">
          {editNote ? "Edit Note" : "Upload Your Notes"}
        </h1>
  
        {/* Title */}
        <input
          type="text"
          placeholder="Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
  
        {/* Description */}
        <textarea
          placeholder="Description"
          required
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        ></textarea>
  
        {/* Category */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="" disabled>
              Select category
            </option>
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
                  className="ml-1 text-red-500 hover:text-red-700"
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
  
        {/* Thumbnail */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Thumbnail (optional)
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
            className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 focus:outline-none"
          />
          {thumbnailPreview && (
            <img
              src={thumbnailPreview}
              alt="Thumbnail Preview"
              className="mt-3 h-32 w-full rounded-lg border object-cover"
            />
          )}
        </div>
  
        {/* File Upload */}
        <div className="w-full">
          <label
            htmlFor="dropzone-file"
            className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition"
          >
            <div className="flex flex-col items-center justify-center pb-6 pt-5">
              <svg
                className="mb-4 h-10 w-10 text-gray-500"
                aria-hidden="true"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5A5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag & drop
              </p>
              <p className="text-xs text-gray-500">PDF only</p>
              <input
                type="file"
                accept="application/pdf"
                id="dropzone-file"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
            </div>
          </label>
        </div>
  
        <button
          type="submit"
          className="w-full rounded-xl bg-blue-600 py-3 text-base font-bold text-white transition hover:bg-blue-700"
        >
          {editNote ? "Update Note" : "Submit Note"}
        </button>
      </form>
    </div>
  );
};

export default UploadNote;
