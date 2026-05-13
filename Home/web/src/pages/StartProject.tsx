import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/toastStore';

export default function StartProjectPage() {
  const { showToast } = useStore();

  const projectTypes = [
    { emoji: '🛋️', name: 'Living Room', desc: 'Cozy gathering spaces' },
    { emoji: '🍳', name: 'Kitchen', desc: 'Functional cooking areas' },
    { emoji: '🛏️', name: 'Bedroom', desc: 'Relaxing retreat spaces' },
    { emoji: '🛁', name: 'Bathroom', desc: 'Spa-like sanctuaries' },
    { emoji: '💻', name: 'Home Office', desc: 'Productive work spaces' },
    { emoji: '🏠', name: 'Full Home', desc: 'Complete home makeover' },
  ];

  return (
    <div className="w-full">
      <div className="text-center py-15 px-5 bg-gradient-to-b from-teal-50 to-white">
        <h1 className="text-5xl text-teal-500 mb-3 font-bold">🚀 Start Your Project</h1>
        <p className="text-lg text-gray-700">Choose your project type and let's begin your design journey</p>
      </div>

      <div className="max-w-4xl mx-auto px-12 py-12">
        <h3 className="text-2xl text-center mb-5 text-gray-800 font-bold">How It Works</h3>

        <div className="grid grid-cols-1 gap-6 mb-10">
          {[
            { num: 1, title: 'Choose Your Space', desc: 'Select the room or area you want to redesign. Living room, bedroom, kitchen, bathroom, or entire home.' },
            { num: 2, title: 'Set Your Budget', desc: 'Tell us your budget range and we will suggest the best materials and design options within your price range.' },
            { num: 3, title: 'Get AI Recommendations', desc: 'Our AI analyzes your preferences and budget to create personalized design recommendations just for you.' },
            { num: 4, title: 'Start Building', desc: 'Follow step-by-step guides, track your budget, and share your progress with the community!' },
          ].map((step) => (
            <div key={step.num} className="flex gap-5 p-7 border-2 border-gray-200 rounded-5 transition-all hover:border-teal-500 hover:bg-teal-50 hover:translate-x-1">
              <div className="w-12.5 h-12.5 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold text-5 flex-shrink-0">
                {step.num}
              </div>
              <div>
                <h3 className="text-lg mb-1.5 text-gray-800 font-bold">{step.title}</h3>
                <p className="text-base text-gray-700 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-2xl text-center mb-5 text-gray-800 font-bold mt-10">Choose Your Project Type</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {projectTypes.map((type) => (
            <div
              key={type.name}
              onClick={() => showToast(`${type.name} project created!`, 'success')}
              className="text-center p-7.5 border-4 border-gray-200 rounded-5 cursor-pointer transition-all hover:border-orange-500 hover:bg-orange-50 hover:-translate-y-1"
            >
              <div className="text-6xl mb-3">{type.emoji}</div>
              <h3 className="text-lg mb-1.5 text-gray-800 font-bold">{type.name}</h3>
              <p className="text-sm text-gray-600">{type.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
