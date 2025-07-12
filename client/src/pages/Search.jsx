import React from "react";
import SearchBar from "../components/SearchBar";

const Search = () => {
  return (
    <div className="flex justify-center items-center min-h-[40vh]">
      <div className="relative w-full max-w-md">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </span>
        <SearchBar className="pl-10" />
      </div>
    </div>
  );
};

export default Search;
