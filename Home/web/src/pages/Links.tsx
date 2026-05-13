import React from 'react';
import { Link } from 'react-router-dom';

export default function LinksPage() {
  const links = [
    { emoji: '💰', name: 'Budget Planner', desc: 'Plan your renovation budget', path: '/budget', bg: 'bg-teal-100' },
    { emoji: '🎨', name: 'Style Quiz', desc: 'Discover your design style', path: '/quiz', bg: 'bg-orange-100' },
    { emoji: '🧱', name: 'Material Explorer', desc: 'Browse materials & prices', path: '/materials', bg: 'bg-blue-100' },
    { emoji: '📸', name: 'Before & After Gallery', desc: 'Community transformations', path: '/gallery', bg: 'bg-teal-100' },
    { emoji: '📐', name: 'Design Diagrams', desc: 'Floor plans & layouts', path: '/diagrams', bg: 'bg-orange-100' },
    { emoji: '🚀', name: 'Start a Project', desc: 'Begin your design journey', path: '/start-project', bg: 'bg-blue-100' },
    { emoji: 'ℹ️', name: 'About Us', desc: 'Learn about our mission', path: '/about', bg: 'bg-teal-100' },
    { emoji: '✉️', name: 'Contact', desc: 'Get in touch with us', path: '/contact', bg: 'bg-orange-100' },
  ];

  return (
    <div className="w-full">
      <div className="text-center py-15 px-5 bg-gradient-to-b from-teal-50 to-white">
        <h1 className="text-5xl text-teal-500 mb-3 font-bold">🔗 Useful Links</h1>
        <p className="text-lg text-gray-700">Explore all the resources and tools available on Decore</p>
      </div>

      <div className="max-w-4xl mx-auto px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-4 no-underline text-gray-800 transition-all hover:border-teal-500 hover:bg-teal-50 hover:-translate-y-0.5"
            >
              <div className={`w-12.5 h-12.5 ${link.bg} rounded-3 flex items-center justify-center text-5.5 flex-shrink-0`}>
                {link.emoji}
              </div>
              <div>
                <h4 className="text-base mb-0.5 text-gray-800 font-bold">{link.name}</h4>
                <p className="text-sm text-gray-600">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
