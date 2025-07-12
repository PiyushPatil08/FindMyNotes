import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import NoteCard from "../components/NoteCard";
import API_BASE_URL from '../config/api.js';


const AuthorDetails = () => {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryIndexes, setCategoryIndexes] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuthorAndNotes = async () => {
      setLoading(true);
      try {
        // Use the correct endpoint for getting author profile
        const authorRes = await axios.get(`${API_BASE_URL}/authors/${id}`);
        const authorData = authorRes.data;
        
        // Set author data (the API returns { user, notes })
        setAuthor(authorData.user);
        setNotes(authorData.notes || []);
      } catch (err) {
        console.error('Error fetching author:', err);
        setAuthor(null);
        setNotes([]);
      }
      setLoading(false);
    };
    
    if (id) {
      fetchAuthorAndNotes();
    }
  }, [id]);

  // Group notes by category
  const notesByCategory = notes.reduce((acc, note) => {
    const cat = note.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(note);
    return acc;
  }, {});

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

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!author) return <div className="text-center py-10 text-red-500">Author not found.</div>;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Link to="/authors" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Back to Authors</Link>
      <div className="flex flex-col sm:flex-row items-center bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-100">
        <img
          src={author.profileImage || '/logo.png'}
          alt="avatar"
          className="h-20 w-20 rounded-full object-cover border-2 border-blue-100 shadow-sm mb-3 sm:mb-0 sm:mr-6"
        />
        <div className="flex-1 w-full">
          <div className="text-xl font-bold text-blue-700">{author.userName}</div>
          <div className="text-sm text-gray-500 mb-1">{author.userEmail}</div>
          <div className="text-xs text-gray-500">{author.userBio}</div>
          <button
            className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            onClick={() => navigate(`/inbox`)}
          >
            Chat with Author
          </button>
        </div>
      </div>
      <h3 className="font-bold mb-2">Notes by {author.userName}</h3>
      {Object.keys(notesByCategory).length === 0 ? (
        <div className="text-gray-400">No notes yet.</div>
      ) : (
        Object.entries(notesByCategory).map(([category, notes]) => {
          const idx = categoryIndexes[category] || 0;
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
                      <NoteCard note={{...note, showCategory:true}} />
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

export default AuthorDetails; 