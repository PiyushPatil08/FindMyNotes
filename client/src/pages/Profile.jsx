import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NoteCard from "../components/NoteCard";
import API_BASE_URL from '../config/api.js';
import { updateUserProfile, uploadProfileImage } from '../services/userService';
import { fetchAllComments } from '../services/commentService';
import { setUserData } from '../Redux/slices/user-slice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Profile = () => {
  const user = useSelector((state) => state.user.userData);
  const [notes, setNotes] = useState([]);
  const [likedNotes, setLikedNotes] = useState([]);
  const [comments, setComments] = useState([]);
  const navigate = useNavigate();


  const [uploadedIdx, setUploadedIdx] = useState(0);

  useEffect(() => {
    if (!user?._id) return;
    // Get uploaded notes
    axios.get(`${API_BASE_URL}/notes/getFiles?`).then(res => {
      setNotes(res.data.filter(n => n.uploadedBy?._id === user._id));
      setLikedNotes(res.data.filter(n => n.likes && n.likes.includes(user._id)));
    });
    // Get comments by user
    axios.get(`${API_BASE_URL}/comments`).then(res => {
      setComments(res.data.filter(c => c.user?._id === user._id));
    }).catch(() => setComments([]));
  }, [user]);

  // Handle left/right navigation for uploaded notes
  const canScrollUploaded = notes.length > 3;
  const maxUploadedIdx = Math.max(0, notes.length - 3);
  const canScrollLeftUploaded = canScrollUploaded && uploadedIdx > 0;
  const canScrollRightUploaded = canScrollUploaded && uploadedIdx < maxUploadedIdx;
  const visibleUploadedNotes = canScrollUploaded ? notes.slice(uploadedIdx, uploadedIdx + 3) : notes;

  const handleScrollUploaded = (dir) => {
    setUploadedIdx(prev => {
      let next = dir === "right" ? prev + 1 : prev - 1;
      if (next < 0) next = 0;
      if (next > maxUploadedIdx) next = maxUploadedIdx;
      return next;
    });
  };

  // Keep liked notes as categorized sections (or you can make it horizontal too if you want)
  const groupByCategory = (notesArr) => notesArr.reduce((acc, note) => {
    const cat = note.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(note);
    return acc;
  }, {});
  const likedByCategory = groupByCategory(likedNotes);
  const [likedCategoryIndexes, setLikedCategoryIndexes] = useState({});
  const handleScrollLiked = (cat, dir, notesLength) => {
    setLikedCategoryIndexes(prev => {
      const current = prev[cat] || 0;
      let maxIdx = Math.max(0, notesLength - 3);
      let next = dir === "right" ? current + 1 : current - 1;
      if (next < 0) next = 0;
      if (next > maxIdx) next = maxIdx;
      return { ...prev, [cat]: next };
    });
  };

  const renderLikedSections = (notesByCategory, categoryIndexes, setIndexes, sectionTitle) => (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2">{sectionTitle}</h2>
      {Object.keys(notesByCategory).length === 0 ? (
        <div className="text-gray-400 mb-6">No notes found.</div>
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
                    onClick={() => handleScrollLiked(category, "left", notes.length)}
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                )}
                {/* Cards with animation */}
                <div className={`flex gap-12 w-full justify-start overflow-hidden`}>
                  {visibleNotes.map(note => (
                    <div key={note._id} className="flex-shrink-0" style={{ width: 320 }}>
                      <NoteCard note={{ ...note, showCategory: true }} />
                    </div>
                  ))}
                </div>
                {/* Right Arrow */}
                {canScroll && canScrollRight && (
                  <button
                    className="absolute right-0 z-10 bg-white rounded-full shadow p-2 hover:bg-blue-100 transition-all"
                    style={{ transform: "translateX(50%)" }}
                    onClick={() => handleScrollLiked(category, "right", notes.length)}
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



  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-6 mb-8">
        <img src={user?.profileImage?.startsWith('http') ? user.profileImage : (user?.profileImage ? `${API_BASE_URL}/images/${user.profileImage}` : '/logo.png')} alt="avatar" className="h-20 w-20 rounded-full object-cover border" />
        <div>
          <div className="text-2xl font-bold">{user?.userName}</div>
          <div className="text-gray-600">{user?.userEmail}</div>
          <div className="text-gray-500 text-sm">{user?.userBio}</div>

          <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs" onClick={() => navigate("/profile/edit")}>Edit Profile</button>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-2">Your Uploaded Notes</h2>
      <div className="flex gap-8 overflow-x-auto scrollbar-hide py-2 px-1 w-full mb-8">
        {notes.length === 0 ? (
          <div className="text-gray-400">No notes uploaded.</div>
        ) : (
          notes.map(note => (
            <div key={note._id} className="flex-shrink-0 w-[280px] md:w-[320px]">
              <NoteCard note={{ ...note, showCategory: true }} />
            </div>
          ))
        )}
      </div>
      <h2 className="text-xl font-bold mb-2">Notes You Liked</h2>
      <div className="flex gap-8 overflow-x-auto scrollbar-hide py-2 px-1 w-full mb-8">
        {likedNotes.length === 0 ? (
          <div className="text-gray-400">No liked notes.</div>
        ) : (
          likedNotes.map(note => (
            <div key={note._id} className="flex-shrink-0 w-[280px] md:w-[320px]">
              <NoteCard note={{ ...note, showCategory: true }} />
            </div>
          ))
        )}
      </div>
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar={true} />
    </div>
  );
};

export default Profile;
