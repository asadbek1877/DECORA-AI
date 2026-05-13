import React from 'react';

export default function MaterialsPage() {
  return (
    <div className="w-full">
      <div className="text-center py-15 px-5 bg-gradient-to-b from-teal-50 to-white">
        <h1 className="text-5xl text-teal-500 mb-3 font-bold">🎨 Material Explorer</h1>
        <p className="text-lg text-gray-700">Browse and compare materials for your next project</p>
      </div>
      <div className="max-w-4xl mx-auto px-12 py-12">
        <div className="flex gap-3 mb-7.5 flex-wrap">
          {['All', 'Wood', 'Tile', 'Fabric', 'Paint', 'Stone'].map((filter) => (
            <button key={filter} className={`px-6 py-2.5 border-2 rounded-full text-base font-medium cursor-pointer transition-all font-poppins ${filter === 'All' ? 'border-teal-500 bg-teal-50 text-teal-500' : 'border-gray-300 text-gray-700 hover:border-teal-500 hover:bg-teal-50'}`}>
              {filter}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { name: 'Oak Hardwood', price: '$8.99 /sq ft', bg: 'from-orange-400 to-orange-600' },
            { name: 'Marble Tile', price: '$12.50 /sq ft', bg: 'from-gray-400 to-gray-700' },
            { name: 'Ocean Blue Fabric', price: '$24.99 /yard', bg: 'from-blue-400 to-blue-600' },
            { name: 'Cream Paint', price: '$35.00 /gallon', bg: 'from-yellow-100 to-yellow-300' },
          ].map((mat) => (
            <div key={mat.name} className="border-2 border-gray-200 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl hover:border-teal-500 cursor-pointer">
              <div className={`h-35 bg-gradient-to-br ${mat.bg}`}></div>
              <div className="p-4">
                <h4 className="text-base mb-1 text-gray-800 font-bold">{mat.name}</h4>
                <div className="text-base font-bold text-teal-500">{mat.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
