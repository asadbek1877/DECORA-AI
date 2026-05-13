import React from 'react';

export default function QuizPage() {
  return (
    <div className="w-full">
      <div className="text-center py-15 px-5 bg-gradient-to-b from-teal-50 to-white">
        <h1 className="text-5xl text-teal-500 mb-3 font-bold">🎨 Style Quiz</h1>
        <p className="text-lg text-gray-700">Discover your unique design style in just a few questions</p>
      </div>
      <div className="max-w-2xl mx-auto px-5 py-12">
        <div className="bg-white border-2 border-gray-200 rounded-5 p-10 text-center shadow-lg">
          <h3 className="text-2xl mb-2 text-gray-800 font-bold">Which color palette speaks to you?</h3>
          <p className="text-base text-gray-600 mb-7">Question 1 of 5</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {['🌿 Earth Tones', '🌊 Cool Blues', '🌸 Warm Pastels', '⚡ Bold & Vibrant'].map((option) => (
              <div key={option} className="p-5 border-4 border-gray-200 rounded-4 cursor-pointer transition-all hover:border-orange-500 hover:bg-orange-50">
                <div className="text-4xl mb-2">{option.split(' ')[0]}</div>
                <div className="text-base font-semibold text-gray-800">{option.split(' ').slice(1).join(' ')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
