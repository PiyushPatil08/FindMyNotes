import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Hero = ({ className = "" }) => {

  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  return (
    <div className={`bg-unsplashBgImage relative flex h-[60vh] sm:h-[70vh] md:h-[80vh] items-center justify-center bg-cover bg-center ${className}`}>
      <div className="absolute inset-0 bg-black bg-opacity-70" />
      <div className="relative z-10 w-full max-w-[860px] text-center text-white px-4 sm:px-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black">FIND MY NOTES</h1>
        <p className="mt-4 text-xs sm:text-base md:text-xl font-light md:font-normal">
          Welcome to Find My Notes – where students unite for effortless
          organization, access, and sharing of PDF notes. Say goodbye to
          scattered notebooks; streamline your study routine and embark on a
          journey to academic excellence. Simplify your student life, make your
          notes work for you – discover a new era of innovation, start today
        </p>
        <div className="mt-5">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            {isAuthenticated ? (
              <Link to="/notes" className="rounded-xl bg-blue-500 px-6 py-3 text-base sm:text-lg font-bold text-white transition-all duration-200 hover:bg-blue-600 hover:scale-105 shadow-md">Get Started</Link>
            ) : (
              <>
                <Link to="/login" className="rounded-xl bg-blue-500 px-7 py-3 sm:py-4 font-black text-white text-base sm:text-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 shadow-md">Login</Link>
                <Link to="/signup" className="rounded-xl bg-blue-500 px-7 py-3 sm:py-4 font-black text-white text-base sm:text-lg transition-all duration-200 hover:bg-blue-600 hover:scale-105 shadow-md">Signup</Link>
              </>
            )}
          </div>
        </div >
      </div >
    </div >
  );
};

export default Hero;
