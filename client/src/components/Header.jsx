import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { removeUserData } from "../Redux/slices/user-slice";
import LiveNotifications from "./LiveNotifications";

const Header = () => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const user = useSelector((state) => state.user.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Add state for mobile menu and profile dropdown
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const handleLogout = () => {
    dispatch(removeUserData());
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-md border-b border-gray-100">
      <nav className="container mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4 sm:py-5">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="FindMyNotes Logo"
            className="h-10 w-10 rounded-full shadow group-hover:scale-110 transition-transform"
          />
          <span className="text-2xl sm:text-3xl font-heading font-extrabold text-blue-700 tracking-wide group-hover:text-blue-600 transition-colors">
            FindMyNotes
          </span>
        </Link>
        {/* Hamburger for mobile */}
        <button
          className="sm:hidden flex items-center px-3 py-2 border rounded text-blue-700 border-blue-200 hover:bg-blue-50 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/* Nav Links */}
        <div className="hidden sm:flex items-center gap-4 md:gap-6 font-cta">
          {isAuthenticated ? (
            <>
              {location.pathname !== "/" && (
                <>
                  <Link
                    to="/notes"
                    className="text-blue-700 font-cta font-medium px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    Notes
                  </Link>
                  <Link
                    to="/authors"
                    className="text-blue-700 font-cta font-medium px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    Authors
                  </Link>
                  <Link
                    to="/upload"
                    className="text-blue-700 font-cta font-medium px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    Upload
                  </Link>
                  <Link
                    to="/inbox"
                    className="text-blue-700 font-cta font-medium px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    Inbox
                  </Link>
                </>
              )}

              {/* Live Notifications */}
              <LiveNotifications />

              {/* Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center gap-2 cursor-pointer list-none focus:outline-none"
                >
                  <img
                    src={user?.profileImage || "/logo.png"}
                    alt="Profile"
                    className="h-10 w-10 rounded-full border-2 border-blue-200 object-cover shadow"
                  />
                  <span className="hidden sm:inline font-semibold text-gray-700">
                    {user?.userName || "Profile"}
                  </span>
                  <svg
                    className={`w-4 h-4 ml-1 text-gray-500 transition-transform duration-200 ${
                      profileDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-md border border-gray-100 bg-white py-2 shadow-lg z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-blue-700 font-cta hover:bg-blue-50 transition"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setProfileDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-blue-700 font-cta hover:bg-blue-50 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white bg-blue-600 font-cta font-semibold rounded-lg px-5 py-2 shadow transition-transform duration-200 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-white bg-blue-600 font-cta font-semibold rounded-lg px-5 py-2 shadow transition-transform duration-200 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Signup
              </Link>
            </>
          )}
        </div>
        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-md border-b border-gray-100 flex flex-col items-center py-4 sm:hidden z-50 animate-fade-in">
            {isAuthenticated ? (
              <>
                {location.pathname !== "/" && (
                  <>
                    <Link to="/notes" className="w-full text-center py-2 text-blue-700 font-cta font-medium hover:bg-blue-50" onClick={() => setMobileMenuOpen(false)}>Notes</Link>
                    <Link to="/authors" className="w-full text-center py-2 text-blue-700 font-cta font-medium hover:bg-blue-50" onClick={() => setMobileMenuOpen(false)}>Authors</Link>
                    <Link to="/upload" className="w-full text-center py-2 text-blue-700 font-cta font-medium hover:bg-blue-50" onClick={() => setMobileMenuOpen(false)}>Upload</Link>
                    <Link to="/inbox" className="w-full text-center py-2 text-blue-700 font-cta font-medium hover:bg-blue-50" onClick={() => setMobileMenuOpen(false)}>Inbox</Link>
                  </>
                )}
                <Link to="/profile" className="w-full text-center py-2 text-blue-700 font-cta font-medium hover:bg-blue-50" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-center py-2 text-blue-700 font-cta font-medium hover:bg-blue-50">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="w-full text-center py-2 text-blue-700 font-cta font-medium hover:bg-blue-50" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="w-full text-center py-2 text-blue-700 font-cta font-medium hover:bg-blue-50" onClick={() => setMobileMenuOpen(false)}>Signup</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
