import React, { useState, useEffect } from "react";
import NoteCard from "../components/NoteCard";
import axios from "axios";
import API_BASE_URL from '../config/api.js';


const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryIndexes, setCategoryIndexes] = useState({}); // Track scroll index per category

  useEffect(() => {
    axios.get(`${API_BASE_URL}/notes/getFiles?`).then(res => {
      setNotes(res.data);
    });
  }, []);

  // Group notes by category
  const notesByCategory = notes.reduce((acc, note) => {
    const cat = note.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(note);
    return acc;
  }, {});

  // Filter notes by search
  const filteredNotesByCategory = Object.fromEntries(
    Object.entries(notesByCategory).map(([cat, notes]) => [
      cat,
      notes.filter(
        n =>
          n.fileName.toLowerCase().includes(search.toLowerCase()) ||
          n.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())) ||
          (n.category && n.category.toLowerCase().includes(search.toLowerCase()))
      ),
    ])
  );

  // Helper: find if search matches a category exactly (case-insensitive)
  const matchedCategory = search.trim() && Object.keys(notesByCategory).find(cat => cat.toLowerCase() === search.trim().toLowerCase());

  // Handle left/right navigation
  const handleScroll = (cat, dir, notesLength) => {
    setCategoryIndexes(prev => {
      const current = prev[cat] || 0;
      let maxIdx = Math.max(0, notesLength - 3);
      let next = dir === "right" ? current + 1 : current - 1;
      if (next < 0) next = 0;
      if (next > maxIdx) next = maxIdx;
      return { ...prev, [cat]: next };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans px-2 sm:px-4 md:px-8 py-8 max-w-7xl mx-auto">
      <div className="mb-6 flex justify-center px-2 sm:px-0">
        <div className="relative w-full max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </span>
          <input
            type="text"
            placeholder="Search notes by name, tag, or category..."
            className="w-full pl-10 rounded-lg border border-gray-300 bg-white p-2.5 text-sm sm:text-base text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      {search.trim() ? (
        matchedCategory ? (
          // If search matches a category exactly, show that category section with all its notes
          (() => {
            const notes = notesByCategory[matchedCategory] || [];
            if (notes.length === 0) {
              return <div className="text-center text-gray-500">No notes found in this category.</div>;
            }
            const idx = categoryIndexes[matchedCategory] || 0;
            const canScroll = notes.length > 3;
            const canScrollLeft = canScroll && idx > 0;
            let maxIdx = Math.max(0, notes.length - 3);
            const canScrollRight = canScroll && idx < maxIdx;
            let visibleNotes;
            if (canScroll) {
              const startIdx = idx >= maxIdx ? maxIdx : idx;
              visibleNotes = notes.slice(startIdx, startIdx + 3);
            } else {
              visibleNotes = notes;
            }
            return (
              <section key={matchedCategory} className="mb-12">
                <div className="w-full mb-6">
                  <div className="bg-blue-500 rounded-lg px-6 py-3 flex items-center shadow-sm">
                    <h2 className="text-2xl font-bold text-white tracking-wide">{matchedCategory}</h2>
                  </div>
                </div>
                <div className="relative flex items-center">
                  {/* Left Arrow */}
                  {canScroll && canScrollLeft && (
                    <button
                      className="absolute left-0 z-10 bg-white rounded-full shadow p-2 hover:bg-blue-100 transition-all"
                      style={{ transform: "translateX(-50%)" }}
                      onClick={() => handleScroll(matchedCategory, "left", notes.length)}
                    >
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                  )}
                  {/* Cards with animation */}
                  <div className={`flex gap-12 w-full justify-start overflow-hidden`}>
                    {visibleNotes.map(note => (
                      <div key={note._id} className="flex-shrink-0" style={{ width: 320 }}>
                        <NoteCard note={note} />
                      </div>
                    ))}
                  </div>
                  {/* Right Arrow */}
                  {canScroll && canScrollRight && (
                    <button
                      className="absolute right-0 z-10 bg-white rounded-full shadow p-2 hover:bg-blue-100 transition-all"
                      style={{ transform: "translateX(50%)" }}
                      onClick={() => handleScroll(matchedCategory, "right", notes.length)}
                    >
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  )}
                </div>
              </section>
            );
          })()
        ) : (
          // If searching, show a flat grid of all matching notes (no categories)
          (() => {
            // Flatten all filtered notes into a single array
            const allFilteredNotes = Object.values(filteredNotesByCategory).flat();
            if (allFilteredNotes.length === 0) {
              return <div className="text-center text-gray-500">No notes found.</div>;
            }
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                {allFilteredNotes.map(note => (
                  <NoteCard key={note._id} note={note} />
                ))}
              </div>
            );
          })()
        )
      ) : (
        // If not searching, show notes grouped by category (current behavior)
        Object.entries(filteredNotesByCategory).map(([category, notes]) => {
          const idx = categoryIndexes[category] || 0;
          const canScroll = notes.length > 3;
          const canScrollLeft = canScroll && idx > 0;
          // Always show 3 at a time, and for the last group, shift window so last group is full if possible
          let maxIdx = Math.max(0, notes.length - 3);
          const canScrollRight = canScroll && idx < maxIdx;
          let visibleNotes;
          if (canScroll) {
            // If at the end, show the last 3 notes
            const startIdx = idx >= maxIdx ? maxIdx : idx;
            visibleNotes = notes.slice(startIdx, startIdx + 3);
          } else {
            visibleNotes = notes;
          }
          return (
            <section key={category} className="mb-12">
              <div className="w-full mb-6">
                <div className="bg-blue-500 rounded-lg px-6 py-3 flex items-center shadow-sm">
                  <h2 className="text-2xl font-bold text-white tracking-wide">{category}</h2>
                </div>
              </div>
              <div className="relative flex items-center">
                {/* Left Arrow */}
                {canScroll && canScrollLeft && (
                  <button
                    className="absolute left-0 z-10 bg-white rounded-full shadow p-2 hover:bg-blue-100 transition-all"
                    style={{ transform: "translateX(-50%)" }}
                    onClick={() => handleScroll(category, "left", notes.length)}
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                )}
                {/* Cards with animation */}
                <div className={`flex gap-12 w-full justify-start overflow-hidden`}>
                  {visibleNotes.map(note => (
                    <div key={note._id} className="flex-shrink-0" style={{ width: 320 }}>
                      <NoteCard note={note} />
                    </div>
                  ))}
                </div>
                {/* Right Arrow */}
                {canScroll && canScrollRight && (
                  <button
                    className="absolute right-0 z-10 bg-white rounded-full shadow p-2 hover:bg-blue-100 transition-all"
                    style={{ transform: "translateX(50%)" }}
                    onClick={() => handleScroll(category, "right", notes.length)}
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                )}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
};

export default Notes; 