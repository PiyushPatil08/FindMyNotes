import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NoteCard from "../components/NoteCard";

const Profile = () => {
  const user = useSelector((state) => state.user.userData);
  const [notes, setNotes] = useState([]);
  const [likedNotes, setLikedNotes] = useState([]);
  const [comments, setComments] = useState([]);
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ userName: user?.userName || '', userBio: user?.userBio || '', userEmail: user?.userEmail || '', userMobile: user?.userMobile || '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const dispatch = useDispatch();
  const [uploadedIdx, setUploadedIdx] = useState(0);

  useEffect(() => {
    if (!user?._id) return;
    // Get uploaded notes
    axios.get(`http://localhost:6969/notes/getFiles?`).then(res => {
      setNotes(res.data.filter(n => n.uploadedBy?._id === user._id));
      setLikedNotes(res.data.filter(n => n.likes && n.likes.includes(user._id)));
    });
    // Get comments by user
    axios.get(`http://localhost:6969/comments`).then(res => {
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
                      <NoteCard note={{...note, showCategory:true}} />
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

  const handleEditProfile = () => {
    setForm({ userName: user?.userName || '', userBio: user?.userBio || '', userEmail: user?.userEmail || '', userMobile: user?.userMobile || '' });
    setSelectedImage(null);
    setImagePreview(null);
    setEditMode(true);
  };

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
    setProfileLoading(true);
    setProfileError('');
    
    try {
      let updateData = { ...form };
      
      // If image is selected, upload it first
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        
        const imageRes = await axios.post('http://localhost:6969/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        updateData.profileImage = imageRes.data.imageUrl;
      }
      
      const res = await axios.put(`http://localhost:6969/authors/${user._id}`, updateData);
      dispatch({ type: 'user/setUserData', payload: res.data });
      setEditMode(false);
      setSelectedImage(null);
      setImagePreview(null);
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Failed to update profile');
    }
    setProfileLoading(false);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-6 mb-8">
        <img src={user?.profileImage || '/logo.png'} alt="avatar" className="h-20 w-20 rounded-full object-cover border" />
        <div>
          <div className="text-2xl font-bold">{user?.userName}</div>
          <div className="text-gray-600">{user?.userEmail}</div>
          <div className="text-gray-500 text-sm">{user?.userBio}</div>
          <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs" onClick={handleEditProfile}>Edit Profile</button>
        </div>
      </div>
      {editMode && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-3 relative" onSubmit={handleProfileSubmit}>
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setEditMode(false)}>&times;</button>
            <h2 className="text-lg font-bold mb-2">Edit Profile</h2>
            
            {/* Profile Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Profile Image</label>
              <div className="flex items-center space-x-4">
                <img 
                  src={imagePreview || user?.profileImage || '/logo.png'} 
                  alt="Profile preview" 
                  className="h-16 w-16 rounded-full object-cover border"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
            
            <input name="userName" value={form.userName} onChange={handleProfileChange} className="w-full border rounded px-2 py-1" placeholder="Name" required />
            <input name="userEmail" value={form.userEmail} onChange={handleProfileChange} className="w-full border rounded px-2 py-1" placeholder="Email" required />
            <input name="userMobile" value={form.userMobile} onChange={handleProfileChange} className="w-full border rounded px-2 py-1" placeholder="Mobile" />
            <textarea name="userBio" value={form.userBio} onChange={handleProfileChange} className="w-full border rounded px-2 py-1" placeholder="Bio" />
            {profileError && <div className="text-red-500 text-sm">{profileError}</div>}
            <button type="submit" className="bg-blue-500 text-white px-4 py-1.5 rounded hover:bg-blue-600 w-full" disabled={profileLoading}>{profileLoading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      )}
      <h2 className="text-xl font-bold mb-2">Your Uploaded Notes</h2>
      <div className="flex gap-8 overflow-x-auto scrollbar-hide py-2 px-1 w-full mb-8">
        {notes.length === 0 ? (
          <div className="text-gray-400">No notes uploaded.</div>
        ) : (
          notes.map(note => (
            <div key={note._id} className="flex-shrink-0 w-[280px] md:w-[320px]">
              <NoteCard note={{...note, showCategory:true}} />
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
              <NoteCard note={{...note, showCategory:true}} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
