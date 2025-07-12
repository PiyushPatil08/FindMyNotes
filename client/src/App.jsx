import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import Header from "./components/Header";
import Search from "./pages/Search";
import About from "./pages/About";
import Upload from "./pages/Upload";
import Faq from "./pages/Faq";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Footer from "./components/Footer";
import { useSelector } from "react-redux";

// Placeholder pages for new routes
const Notes = React.lazy(() => import("./pages/Notes"));
const Authors = React.lazy(() => import("./pages/Authors"));
const AuthorDetails = React.lazy(() => import("./pages/AuthorDetails.jsx"));
const NoteDetails = React.lazy(() => import("./pages/NoteDetails.jsx"));
const InboxPage = React.lazy(() => import("./pages/InboxPage.jsx"));
const NotificationsPage = React.lazy(() => import("./pages/NotificationsPage.jsx"));

const App = () => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  return (
    <Router>
      <Header />
      <div className="min-h-[80vh] bg-gray-50">
        <React.Suspense fallback={<div className="text-center py-10">Loading...</div>}>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/notes/:id" element={<NoteDetails />} />
            <Route path="/authors" element={<Authors />} />
            <Route path="/authors/:id" element={<AuthorDetails />} />
            {isAuthenticated ? (
              <>
                <Route path="/upload" element={<Upload />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/search" element={<Search />} />
                <Route path="/notifications" element={<NotificationsPage />} />
              </>
            ) : (
              <>
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
              </>
            )}
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/inbox" element={<InboxPage />} />
          </Routes>
        </React.Suspense>
      </div>
      <Footer />
      <ToastContainer />
    </Router>
  );
};

export default App;
