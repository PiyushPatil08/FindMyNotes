import React from "react";

export default function About() {
  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <h1 className="text-3xl font-bold mb-4 text-blue-700">About Us</h1>
      <p className="mb-6 text-gray-700 text-lg">NoteShare is a platform for students and professionals to share, discover, and discuss notes and resources. Our mission is to make learning collaborative and accessible for everyone.</p>
      <h2 className="text-xl font-semibold mb-2">Our Team</h2>
      <div className="flex flex-wrap gap-6">
        <div className="bg-white rounded-xl shadow p-4 flex-1 min-w-[180px]">
          <div className="font-bold text-blue-700">Piyush Patil</div>
          <div className="text-gray-500 text-sm">Founder & Developer</div>
        </div>
        {/* Add more team members here if needed */}
      </div>
    </div>
  );
}
