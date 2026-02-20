import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { HeartIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import API_BASE_URL from '../config/api.js';
import { fetchNoteById, deleteNote, likeNote, fetchCategories } from '../services/noteService';
import { fetchCommentsByNoteId, postComment } from '../services/commentService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const NoteDetails = () => {
  const { id } = useParams();
  const user = useSelector(state => state.user.userData);
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [likeLoading, setLikeLoading] = useState(false);
  const navigate = useNavigate();

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [categories, setCategories] = useState([]);

  const fetchNoteAndComments = async () => {
    setLoading(true);
    try {
      const foundNote = await fetchNoteById(id);
      setNote(foundNote);
      if (foundNote) {
        const comments = await fetchCommentsByNoteId(foundNote._id);
        setComments(comments);
      } else {
        setComments([]);
      }
    } catch (err) {
      setNote(null);
      setComments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNoteAndComments();
    fetchCategories().then(setCategories);
    // eslint-disable-next-line
  }, [id]);



  const handleLike = async () => {
    if (!user?._id) return alert("Login to like notes");
    setLikeLoading(true);
    const liked = note.likes?.includes(user._id);
    await likeNote(note._id, user._id, liked);
    await fetchNoteAndComments();
    setLikeLoading(false);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user?._id) return alert("Login to comment");
    if (!newComment.trim()) return;
    await postComment(note._id, user._id, newComment);
    const comments = await fetchCommentsByNoteId(note._id);
    setComments(comments);
    setNewComment("");
    await fetchNoteAndComments();
  };



  const handleDeleteNote = async () => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteNote(note._id);
      navigate('/notes');
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Failed to delete note');
    }
    setDeleteLoading(false);
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!note) return <div className="text-center py-10 text-red-500">Note not found.</div>;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Link to="/notes" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Back to Notes</Link>
      <div className="bg-white rounded-2xl shadow-lg p-7 mb-8 border border-gray-100 flex flex-col gap-4">
        <div className="flex items-center gap-4 mb-2">
          <img
            src={note.uploadedBy?.profileImage?.startsWith('http') ? note.uploadedBy.profileImage : (note.uploadedBy?.profileImage ? `${API_BASE_URL}/files/${note.uploadedBy.profileImage}` : logo)}
            alt="avatar"
            className="h-16 w-16 rounded-full object-cover border-2 border-blue-100 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-bold text-blue-700">{note.uploadedBy?.userName || "Unknown"}</div>
              <button
                className="ml-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
                onClick={() => {
                  if (!user?._id) { toast.error('Login to message the author'); return; }
                  if (user._id === note.uploadedBy?._id) { toast.info('This is your own note'); return; }
                  navigate(`/inbox?authorId=${note.uploadedBy?._id}`);
                }}
              >
                Message Author
              </button>
              {user?._id === note.uploadedBy?._id && (
                <>
                  <button className="ml-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-xs" onClick={() => navigate(`/notes/${note._id}/edit`)}>Edit</button>
                  <button className="ml-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs" onClick={handleDeleteNote} disabled={deleteLoading}>{deleteLoading ? 'Deleting...' : 'Delete'}</button>
                </>
              )}
            </div>
            <div className="text-xs text-gray-500">{note.uploadedBy?.userEmail || ""}</div>
            <div className="text-xs text-gray-400">Uploaded {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ''}</div>
            {deleteError && <div className="text-red-500 text-xs mt-1">{deleteError}</div>}
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{note.fileName}</h2>
        <div className="flex flex-wrap gap-2 mb-2">
          {note.tags && note.tags.map((tag, i) => (
            <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">#{tag}</span>
          ))}
        </div>
        <div className="text-base text-gray-700 mb-2 whitespace-pre-line">{note.fileDescription}</div>
        <div className="flex flex-wrap items-center gap-4 text-sm mb-2">
          <span className="bg-gray-100 px-2 py-1 rounded text-blue-700 font-semibold">{note.category}</span>
          <button
            className={`flex items-center gap-1 text-red-500 font-bold focus:outline-none ${note.likes?.includes(user?._id) ? 'opacity-100' : 'opacity-60'}`}
            onClick={handleLike}
            disabled={likeLoading || !user?._id}
            title={user?._id ? (note.likes?.includes(user._id) ? 'Unlike' : 'Like') : 'Login to like'}
          >
            ❤️ {note.likes?.length || 0}
          </button>
          <a href={`${API_BASE_URL}/notes/${note._id}/download`} target="_blank" rel="noopener noreferrer" className="bg-blue-500 text-white px-4 py-1.5 rounded-lg hover:bg-blue-600 font-semibold transition">Download PDF</a>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
        <h3 className="font-bold mb-2 text-lg">Comments</h3>
        {comments.length === 0 ? (
          <div className="text-gray-400">No comments yet.</div>
        ) : (
          <div className="max-h-40 overflow-y-auto space-y-2 mb-2">
            {comments.map((c) => (
              <div key={c._id} className="flex items-start gap-2">
                <img src={c.user?.profileImage?.startsWith('http') ? c.user.profileImage : (c.user?.profileImage ? `${API_BASE_URL}/files/${c.user.profileImage}` : logo)} alt="avatar" className="h-7 w-7 rounded-full object-cover border" />
                <div>
                  <div className="text-xs font-bold">{c.user?.userName || 'User'}</div>
                  <div className="text-sm text-gray-700">{c.text}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <form className="flex gap-2 mt-2" onSubmit={handleAddComment}>
          <input
            type="text"
            className="flex-1 border rounded px-2 py-1 text-sm"
            placeholder={user?._id ? "Add a comment..." : "Login to comment"}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            required
            disabled={!user?._id}
          />
          <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" disabled={!user?._id}>Post</button>
        </form>
      </div>

      <ToastContainer position="top-center" autoClose={2000} hideProgressBar={true} />
    </div>
  );
};

export default NoteDetails; 