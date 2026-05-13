import React from 'react';

export default function DiagramsPage() {
  return (
    <div className="w-full">
      <div className="text-center py-15 px-5 bg-gradient-to-b from-teal-50 to-white">
        <h1 className="text-5xl text-teal-500 mb-3 font-bold">📐 Design Diagrams</h1>
        <p className="text-lg text-gray-700">Floor plans and layout diagrams for your renovation projects</p>
      </div>
      <div className="max-w-5xl mx-auto px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Studio Apartment', '2BR Apartment', 'Family Home', 'L-Shape Kitchen', 'Master Bedroom', 'Open Office'].map((name) => (
            <div key={name} className="border-2 border-gray-200 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl hover:border-orange-500 cursor-pointer">
              <div className="h-50 bg-gray-100 flex items-center justify-center">
                <svg viewBox="0 0 120 120" className="w-24 h-24">
                  <rect x="5" y="5" width="110" height="110" fill="none" stroke="#555" strokeWidth="3"/>
                  <rect x="10" y="10" width="20" height="12" fill="#e0e0e0" stroke="#999"/>
                  <circle cx="75" cy="35" r="8" fill="#e0e0e0" stroke="#999"/>
                </svg>
              </div>
              <div className="p-4">
                <h4 className="text-base mb-0.5 text-gray-800 font-bold">{name}</h4>
                <p className="text-sm text-gray-600">Professional layout diagram</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
