import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/toastStore';

export default function HomePage() {
  const { showToast } = useStore();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setTimeout(() => setProgress(33), 300);
  }, []);

  return (
    <div className="w-full">
      {/* HERO */}
      <section className="text-center py-20 px-5 bg-gradient-to-b from-teal-50 to-white">
        <h1 className="font-serif italic text-5xl text-teal-500 mb-3.5 font-bold">
          Design Your Dream on a Dime
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          AI-Powered, Budget-Friendly DIY Tools
        </p>
        <Link
          to="/start-project"
          className="inline-block bg-orange-500 text-white border-none px-10 py-3.75 rounded-full font-semibold text-lg cursor-pointer no-underline transition-all shadow-lg hover:bg-orange-600 hover:-translate-y-0.75 hover:shadow-2xl"
        >
          Start Your Project
        </Link>
      </section>

      {/* FEATURES */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-5xl mx-auto px-12 py-10 md:py-12">
        {/* Budget Planner Card */}
        <Link
          to="/budget"
          className="border-4 border-teal-500 rounded-2xl p-7 min-h-50 transition-all cursor-pointer hover:-translate-y-1.5 hover:shadow-2xl no-underline text-gray-800"
        >
          <div className="bg-teal-500 text-white px-5 py-3.5 rounded-2xl rounded-b-none mb-5 -mx-7 mb-5">
            <h3 className="text-xl font-bold">Budget Planner</h3>
          </div>
          <p className="text-base text-gray-700 mb-4">
            Progress and new planner to manage your dream budget!
          </p>
          <div className="w-full h-3 bg-gray-300 rounded-2.5 mb-3.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-2.5 transition-all duration-1500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-base font-semibold">
            Projected Cost: <span className="text-teal-500 font-bold">$500</span> / $1500
          </div>
        </Link>

        {/* Style Quiz Card */}
        <Link
          to="/quiz"
          className="border-4 border-orange-500 rounded-2xl p-7 min-h-50 transition-all cursor-pointer hover:-translate-y-1.5 hover:shadow-2xl no-underline text-gray-800"
        >
          <div className="bg-orange-500 text-white px-5 py-3.5 rounded-2xl rounded-b-none mb-5 -mx-7 mb-5 flex items-center justify-between">
            <h3 className="text-xl font-bold">Style Quiz 🤔</h3>
            <div className="flex gap-2.5 text-lg">
              <span>💬</span>
              <span>✏️</span>
              <span>📋</span>
            </div>
          </div>
          <p className="text-base text-gray-700 mb-4">
            What are your personal style preferences to design your project?
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                showToast('Taking the Quiz!', 'success');
              }}
              className="bg-orange-500 text-white border-none px-5.5 py-2.5 rounded-full font-semibold text-base cursor-pointer transition-all hover:bg-orange-600"
            >
              Take the Quiz!
            </button>
            <div className="flex gap-1.5">
              <div className="w-10.5 h-10.5 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                👨‍💼
              </div>
              <div className="w-10.5 h-10.5 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                🛋️
              </div>
            </div>
          </div>
        </Link>

        {/* Material Explorer Card */}
        <Link
          to="/materials"
          className="border-4 border-sky-300 bg-sky-50 rounded-2xl p-7 min-h-50 transition-all cursor-pointer hover:-translate-y-1.5 hover:shadow-2xl no-underline text-gray-800"
        >
          <div className="bg-sky-300 text-gray-700 px-5 py-3.5 rounded-2xl rounded-b-none mb-5 -mx-7 mb-5">
            <h3 className="text-xl font-bold">Material Explorer</h3>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-gradient-to-br from-orange-300 to-orange-600 rounded-2.5 h-17.5"></div>
            <div className="bg-gradient-to-br from-gray-300 to-gray-500 rounded-2.5 h-17.5"></div>
            <div className="bg-gradient-to-br from-orange-600 to-orange-900 rounded-2.5 h-17.5"></div>
            <div className="bg-gradient-to-br from-blue-300 to-blue-500 rounded-2.5 h-17.5 col-span-2"></div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2.5 h-17.5"></div>
          </div>
        </Link>
      </section>

      {/* COMMUNITY */}
      <section className="max-w-5xl mx-auto px-12 pb-15">
        <h2 className="text-3xl font-bold mb-6">Community Creations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {/* Gallery Card */}
          <Link
            to="/gallery"
            className="border-4 border-teal-500 rounded-2xl p-7 transition-all cursor-pointer hover:-translate-y-1.5 hover:shadow-2xl no-underline text-gray-800"
          >
            <h3 className="text-2xl font-bold mb-1.5">Before & After Gallery</h3>
            <p className="text-base text-gray-700 mb-5">
              User-submitted photos of room transformations.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-40 rounded-3xl bg-gradient-to-br from-orange-200 to-orange-400 flex items-center justify-center">
                <span className="text-5xl">🛋️</span>
              </div>
              <span className="text-3xl text-gray-400">→</span>
              <div className="flex-1 h-40 rounded-3xl bg-gradient-to-br from-amber-100 to-amber-300 flex items-center justify-center">
                <span className="text-5xl">✨</span>
              </div>
            </div>
          </Link>

          {/* Design Diagrams Card */}
          <Link
            to="/diagrams"
            className="border-4 border-orange-500 rounded-2xl p-7 transition-all cursor-pointer hover:-translate-y-1.5 hover:shadow-2xl no-underline text-gray-800"
          >
            <h3 className="text-2xl font-bold mb-1.5">Design Diagrams</h3>
            <p className="text-base text-gray-700 mb-5">
              Design diagrams and material combinations.
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-gray-100 border-2 border-gray-300 rounded-2.5 h-30 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-20 h-20">
                  <rect x="5" y="5" width="90" height="90" fill="none" stroke="#555" strokeWidth="3"/>
                  <rect x="10" y="10" width="20" height="12" fill="#e0e0e0" stroke="#999"/>
                  <circle cx="75" cy="35" r="8" fill="#e0e0e0" stroke="#999"/>
                </svg>
              </div>
              <div className="bg-gray-100 border-2 border-gray-300 rounded-2.5 h-30 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-20 h-20">
                  <rect x="5" y="5" width="90" height="90" fill="none" stroke="#555" strokeWidth="3"/>
                  <rect x="10" y="10" width="30" height="15" fill="#e0e0e0" stroke="#999"/>
                  <rect x="55" y="10" width="18" height="30" fill="#e0e0e0" stroke="#999"/>
                </svg>
              </div>
              <div className="bg-gray-100 border-2 border-gray-300 rounded-2.5 h-30 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-20 h-20">
                  <rect x="5" y="5" width="90" height="90" fill="none" stroke="#555" strokeWidth="3"/>
                  <rect x="10" y="10" width="15" height="10" fill="#e0e0e0" stroke="#999"/>
                  <path d="M60 60 L70 60 L70 80 L60 80 Z" fill="#d4a87a" stroke="#b8906a"/>
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
