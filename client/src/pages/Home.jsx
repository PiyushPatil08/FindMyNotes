import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const FEATURES = [
    {
      title: "Upload & Organize Notes",
      description: "Upload handwritten or digital notes and categorize them by subject, topic, or course.",
    },
    {
      title: "Smart Search",
      description: "Use keyword-based search to quickly find relevant notes and study materials.",
    },
    {
      title: "Author Profiles",
      description: "Create author profiles to showcase your uploaded notes and contributions.",
    },
    {
      title: "Likes & Comments",
      description: "Like and comment on notes to appreciate and discuss ideas with other students.",
    },
    {
      title: "Real-Time Messaging",
      description: "Chat with other students directly using the built-in inbox and messaging system.",
    },
    {
      title: "Live Notifications",
      description: "Stay updated with instant notifications for new messages, comments, or uploads.",
    },
  ];


  const STEPS = [
    {
      label: "1",
      title: "Sign Up",
      description: "Create your free account in seconds.",
    },
    {
      label: "2",
      title: "Upload",
      description: "Add your notes to help others learn.",
    },
    {
      label: "3",
      title: "Explore",
      description: "Browse and download notes anytime.",
    },
  ];

  const TESTIMONIALS = [
    {
      quote: "This platform helped me ace my exams!",
      name: "Alice",
      role: "Computer Science Student",
    },
    {
      quote: "Sharing my notes has never been easier.",
      name: "John",
      role: "Engineering Student",
    },
    {
      quote: "A must-have tool for all students. Loving it",
      name: "Priya",
      role: "Business Student",
    },
  ];

  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen pt-16">
      <main className="flex-1 flex flex-col">
        {/* ───── Hero ───── */}
        <section className="mt-20 pb-12 space-y-10 md:space-y-15 px-2 sm:px-5">
          <div className="container mx-auto px-2 sm:px-4 md:px-6 text-center space-y-6">
            <span className="inline-block rounded-full px-4 py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm font-semibold">
              Share. Learn. Grow.
            </span>
            <h1 className="mx-auto max-w-4xl text-2xl sm:text-4xl font-heading font-bold md:text-6xl text-gray-900">
              The easiest way to share and discover study notes
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-600 text-sm sm:text-base md:text-xl font-serif">
              Upload your notes, find resources, and help other students succeed.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row justify-center">
              <button
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-cta font-semibold shadow transition-transform duration-200 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 text-base sm:text-lg"
                onClick={() => navigate(isAuthenticated ? "/notes" : "/login")}
              >
                Get Started
              </button>
            </div>
          </div>

          <div className="container mx-auto max-w-5xl overflow-hidden rounded-xl shadow-xl mt-10">
            <div className="aspect-[16/9]">
              <img
                src="/bg.jpg"
                alt="Students sharing notes"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* ───── Features ───── */}
        <section className="bg-gray-50 py-16 sm:py-20">
          <div className="container mx-auto px-2 sm:px-4 md:px-6 text-center">
            <span className="inline-block rounded-full px-4 py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm font-semibold">
              Features
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-gray-900">
              All-In-One Notes Sharing Platform
            </h2>
            <p className="mx-auto mt-3 max-w-[700px] text-gray-600 text-sm sm:text-base md:text-xl font-serif">
              Find the right study materials, share your knowledge, and help
              others succeed.
            </p>

            <div className="mx-auto mt-12 grid max-w-5xl gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ title, description }) => (
                <div
                  key={title}
                  className="flex flex-col items-center space-y-3 p-6 bg-white rounded-lg border-2 border-blue-300 shadow hover:shadow-lg transition-shadow duration-200"
                >
                  <h3 className="text-xl font-heading font-bold text-blue-700">{title}</h3>
                  <p className="text-gray-500 text-center">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───── How it works ───── */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-2 sm:px-4 md:px-6 text-center">
            <span className="inline-block rounded-full px-4 py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm font-semibold">
              How It Works
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-gray-900">
              Sharing notes is simple
            </h2>
            <p className="mx-auto mt-3 max-w-[700px] text-gray-600 text-sm sm:text-base md:text-xl font-serif">
              Get started in just a few easy steps.
            </p>

            <div className="mx-auto mt-12 grid max-w-5xl gap-8 grid-cols-1 md:grid-cols-3">
              {STEPS.map(({ label, title, description }) => (
                <div
                  key={label}
                  className="flex flex-col items-center space-y-3"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
                    {label}
                  </div>
                  <h3 className="text-xl font-heading font-bold">{title}</h3>
                  <p className="text-gray-500 text-center">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───── Testimonials ───── */}
        <section className="bg-gray-50 py-16 sm:py-20">
          <div className="container mx-auto px-2 sm:px-4 md:px-6 text-center">
            <span className="inline-block rounded-full px-4 py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm font-semibold">
              Testimonials
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-gray-900">
              What students say
            </h2>

            <div className="mx-auto mt-12 grid max-w-5xl gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {TESTIMONIALS.map(({ quote, name, role }) => (
                <div
                  key={name}
                  className="flex flex-col p-6 bg-white rounded-lg border-2 border-blue-300 shadow hover:shadow-lg transition-shadow duration-200"
                >
                  <p className="text-gray-500 mb-4 italic">“{quote}”</p>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-blue-700">{name}</p>
                    <p className="text-sm text-gray-500">{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───── Call to Action ───── */}
        <section className="py-16 sm:py-20 bg-blue-600 text-white text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">
            Ready to share your notes?
          </h2>
          <p className="mx-auto max-w-[600px] mt-4 text-sm sm:text-base md:text-xl">
            Join thousands of students and make learning easier for everyone.
          </p>
          <button
            className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-lg font-cta font-semibold shadow transition-transform duration-200 hover:bg-blue-50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 text-base sm:text-lg"
            onClick={() => navigate(isAuthenticated ? "/notes" : "/login")}
          >
            Get Started
          </button>
      </section>
    </main>
    </div >
  );
}
