import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from '../config/api.js';


const AuthorCard = ({ author }) => (
  <div className="flex flex-col sm:flex-row items-center bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition w-full max-w-2xl mx-auto border border-gray-100 mb-4">
    <img
      src={author.profileImage || '/logo.png'}
      alt="avatar"
      className="h-20 w-20 rounded-full object-cover border-2 border-blue-100 shadow-sm mb-3 sm:mb-0 sm:mr-6"
    />
    <div className="flex-1 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
        <div>
          <div className="text-xl font-bold text-blue-700">{author.userName}</div>
          <div className="text-sm text-gray-500 mb-1">{author.userEmail}</div>
        </div>
        <div className="flex gap-6 mt-2 sm:mt-0">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400">Total Notes</span>
            <span className="font-bold text-blue-600 text-lg">{author.totalNotes}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400">Total Likes</span>
            <span className="font-bold text-blue-600 text-lg">{author.totalLikes}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuthors = async () => {
      setLoading(true);
      try {
        let url = `${API_BASE_URL}/authors`;
        if (search) url += `?search=${encodeURIComponent(search)}`;
        
        const res = await axios.get(url);
        
        // For each author, fetch their notes to compute totals
        const authorsWithStats = await Promise.all(res.data.map(async author => {
          try {
            const notesRes = await axios.get(`${API_BASE_URL}/notes/getFiles?`);
            const userNotes = notesRes.data.filter(n => n.uploadedBy?._id === author._id);
            const totalNotes = userNotes.length;
            const totalLikes = userNotes.reduce((sum, n) => sum + (n.likes ? n.likes.length : 0), 0);
            return { ...author, totalNotes, totalLikes, notes: userNotes };
          } catch (error) {
            console.error(`Error fetching notes for author ${author._id}:`, error);
            return { ...author, totalNotes: 0, totalLikes: 0, notes: [] };
          }
        }));
        
        setAuthors(authorsWithStats);
      } catch (error) {
        console.error('Error fetching authors:', error);
        setAuthors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, [search]);

  const handleAuthorClick = (authorId) => {
    navigate(`/authors/${authorId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="text-center py-10">Loading authors...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex justify-center">
        <div className="relative w-full max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </span>
          <input
            type="text"
            placeholder="Search authors..."
            className="w-full pl-10 rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {authors.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">
            {search ? 'No authors found matching your search.' : 'No authors found.'}
          </div>
        ) : (
          authors.map(author => (
            <div 
              key={author._id} 
              onClick={() => handleAuthorClick(author._id)} 
              className="cursor-pointer hover:scale-[1.02] transition-transform duration-200"
            >
              <AuthorCard author={author} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Authors; 