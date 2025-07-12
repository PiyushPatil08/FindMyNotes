import React, { useEffect, useState } from "react";
import axios from "axios";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [notes, setNotes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    axios.get("http://localhost:6969/categories").then(res => setCategories(res.data));
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    await axios.post("http://localhost:6969/categories", { name: newCategory });
    setNewCategory("");
    axios.get("http://localhost:6969/categories").then(res => setCategories(res.data));
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    if (cat) {
      axios.get(`http://localhost:6969/notes/getFiles?category=${encodeURIComponent(cat)}`).then(res => setNotes(res.data));
    } else {
      setNotes([]);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <div className="mb-6 flex justify-center">
        <div className="relative w-full max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </span>
          <input
            type="text"
            placeholder="Search categories..."
            className="w-full pl-10 rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      <form className="flex gap-2 mb-6" onSubmit={handleAddCategory}>
        <input
          type="text"
          placeholder="Add new category"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Add</button>
      </form>
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => handleSelectCategory("")} className={`px-3 py-1 rounded ${!selectedCategory ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}>All</button>
        {categories.map(cat => (
          <button key={cat._id} onClick={() => handleSelectCategory(cat.name)} className={`px-3 py-1 rounded ${selectedCategory === cat.name ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}>{cat.name}</button>
        ))}
      </div>
      {selectedCategory && (
        <div>
          <h2 className="text-lg font-bold mb-2">Notes in "{selectedCategory}"</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {notes.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">No notes found.</div>
            ) : (
              notes.map(note => (
                <div key={note._id} className="bg-white rounded-lg shadow p-4 flex flex-col">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-blue-700">{note.fileName}</h2>
                    <span className="text-xs text-gray-500">{note.category}</span>
                  </div>
                  <p className="mt-2 text-gray-700 line-clamp-3">{note.fileDescription}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {note.tags && note.tags.map((tag, i) => (
                      <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <a href={`http://localhost:6969/files/${note.files}`} target="_blank" rel="noopener noreferrer" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Download</a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories; 