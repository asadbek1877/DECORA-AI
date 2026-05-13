import React from 'react';

export default function BudgetPage() {
  return (
    <div className="w-full">
      <div className="text-center py-15 px-5 bg-gradient-to-b from-teal-50 to-white">
        <h1 className="text-5xl text-teal-500 mb-3 font-bold">💰 Budget Planner</h1>
        <p className="text-lg text-gray-700">Plan and track your renovation budget with smart AI recommendations</p>
      </div>
      <div className="max-w-4xl mx-auto px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-50 rounded-2xl p-6 text-center border-2 border-gray-200">
            <div className="text-4xl mb-2.5">💵</div>
            <div className="text-3xl font-bold text-teal-500">$1,500</div>
            <div className="text-sm text-gray-600 mt-1">Total Budget</div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 text-center border-2 border-gray-200">
            <div className="text-4xl mb-2.5">📊</div>
            <div className="text-3xl font-bold text-teal-500">$500</div>
            <div className="text-sm text-gray-600 mt-1">Spent So Far</div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 text-center border-2 border-gray-200">
            <div className="text-4xl mb-2.5">✅</div>
            <div className="text-3xl font-bold text-teal-500">$1,000</div>
            <div className="text-sm text-gray-600 mt-1">Remaining</div>
          </div>
        </div>
      </div>
    </div>
  );
}
