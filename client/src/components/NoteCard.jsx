import React from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from '../config/api.js';


const NoteCard = ({ note }) => {
  const navigate = useNavigate();
  return (
    <div
      className="relative flex flex-col w-full max-w-xs bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer font-sans transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg group"
      onClick={() => navigate(`/notes/${note._id}`)}
    >
      {/* Thumbnail */}
      <div className="w-full aspect-[3/2] bg-gray-100 overflow-hidden">
        <img
          src={note.thumbnail ? `${API_BASE_URL}/files/${note.thumbnail}` : "/public/logo.png"}
          alt="thumbnail"
          className="object-cover w-full h-full rounded-t-2xl"
        />
      </div>
      {/* Content */}
      <div className="flex-1 flex flex-col px-4 py-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-gray-900 truncate">{note.fileName}</h2>
          {note.category && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 whitespace-nowrap">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 7.293a1 1 0 011.414 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 14.586l7.293-7.293z" /></svg>
              {note.category}
            </span>
          )}
        </div>
        <p className="text-gray-700 text-sm truncate">{note.fileDescription}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {note.tags && note.tags.map((tag, i) => (
            <span key={i} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">#{tag}</span>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 mb-2">
          {/* Uploader */}
          <div className="flex items-center gap-2">
            <img
              src={note.uploadedBy?.profileImage || "/public/logo.png"}
              alt="Uploader"
              className="h-7 w-7 rounded-full border object-cover bg-gray-200"
            />
            <span className="text-sm font-medium text-gray-800">{note.uploadedBy?.userName || "Unknown"}</span>
          </div>
          {/* Like & Comment */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-gray-500 group-hover:text-pink-500 transition-colors">
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
              <span className="text-xs font-semibold">{note.likes?.length || 0}</span>
            </span>
            <span className="flex items-center gap-1 text-gray-500 group-hover:text-blue-500 transition-colors">
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" /></svg>
              <span className="text-xs font-semibold">{note.commentsCount || (note.comments ? note.comments.length : 0) || 0}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard; 