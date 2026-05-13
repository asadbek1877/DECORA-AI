import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="w-full">
      <div className="text-center py-15 px-5 bg-gradient-to-b from-teal-50 to-white">
        <h1 className="text-5xl text-teal-500 mb-3 font-bold">About Decore</h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
          We're passionate about making beautiful interior design accessible to everyone, regardless of budget.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 items-center">
          <div>
            <h2 className="text-3xl text-gray-800 mb-4 font-bold">Our Mission 🎯</h2>
            <p className="text-base text-gray-700 leading-relaxed mb-3">
              At Decore, we believe everyone deserves a beautiful living space. Our AI-powered tools help you design, plan, and execute stunning room makeovers without breaking the bank.
            </p>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              Founded in 2024, we've helped over 50,000 homeowners transform their spaces with budget-friendly solutions and creative design ideas.
            </p>
            <Link
              to="/start-project"
              className="inline-block bg-teal-500 text-white border-none px-9 py-3.5 rounded-full font-semibold text-base cursor-pointer transition-all shadow-lg hover:bg-teal-600 hover:shadow-2xl"
            >
              Start Designing
            </Link>
          </div>
          <div className="w-full h-75 bg-gradient-to-br from-teal-500 to-sky-300 rounded-5 flex items-center justify-center text-9xl">
            🏠
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="text-center p-7.5 rounded-2xl bg-gray-50 transition-all hover:-translate-y-1 hover:shadow-2xl">
            <div className="text-5xl mb-3.5">💡</div>
            <h3 className="text-lg mb-2 text-gray-800 font-bold">Innovation</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              Using AI technology to make design decisions easier and smarter for everyone.
            </p>
          </div>
          <div className="text-center p-7.5 rounded-2xl bg-gray-50 transition-all hover:-translate-y-1 hover:shadow-2xl">
            <div className="text-5xl mb-3.5">💰</div>
            <h3 className="text-lg mb-2 text-gray-800 font-bold">Affordability</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              Beautiful design shouldn't cost a fortune. We find budget-friendly alternatives.
            </p>
          </div>
          <div className="text-center p-7.5 rounded-2xl bg-gray-50 transition-all hover:-translate-y-1 hover:shadow-2xl">
            <div className="text-5xl mb-3.5">🌍</div>
            <h3 className="text-lg mb-2 text-gray-800 font-bold">Community</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              A supportive community of DIY enthusiasts sharing ideas and inspiration.
            </p>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-7.5">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {[
            { name: 'Sarah Johnson', role: 'CEO & Founder', emoji: '👩‍💻', bgColor: 'bg-orange-100' },
            { name: 'Mike Chen', role: 'Lead Designer', emoji: '👨‍🎨', bgColor: 'bg-blue-100' },
            { name: 'Emily Davis', role: 'AI Engineer', emoji: '👩‍🔬', bgColor: 'bg-green-100' },
          ].map((member) => (
            <div key={member.name} className="text-center p-7.5 rounded-2xl border-2 border-gray-200 transition-all hover:border-teal-500 hover:shadow-2xl">
              <div className={`w-20 h-20 rounded-full ${member.bgColor} mx-auto mb-4 flex items-center justify-center text-5xl`}>
                {member.emoji}
              </div>
              <h3 className="text-lg mb-1 text-gray-800 font-bold">{member.name}</h3>
              <p className="text-sm text-teal-500 font-semibold mb-2.5">{member.role}</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Passionate professional bringing expertise to Decore.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
