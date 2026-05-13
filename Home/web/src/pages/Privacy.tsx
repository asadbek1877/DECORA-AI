import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="w-full">
      <div className="text-center py-15 px-5 bg-gradient-to-b from-teal-50 to-white">
        <h1 className="text-5xl text-teal-500 mb-3 font-bold">🔒 Privacy Policy</h1>
        <p className="text-lg text-gray-700">Your privacy matters to us. Here's how we protect your data.</p>
      </div>

      <div className="max-w-3xl mx-auto px-12 py-12">
        <h2 className="text-2xl text-gray-800 mb-4 font-bold mt-7.5">1. Information We Collect</h2>
        <p className="text-base text-gray-700 leading-relaxed mb-3">
          We collect information you provide directly to us, such as when you create an account, take our style quiz, use our budget planner, or contact us for support.
        </p>
        <ul className="text-base text-gray-700 leading-relaxed mb-3 ml-6">
          <li>Name and email address</li>
          <li>Design preferences and quiz responses</li>
          <li>Budget and project information</li>
          <li>Photos you upload to the gallery</li>
        </ul>

        <h2 className="text-2xl text-gray-800 mb-4 font-bold mt-7.5">2. How We Use Your Information</h2>
        <p className="text-base text-gray-700 leading-relaxed mb-3">
          We use the information we collect to provide, maintain, and improve our services, including personalizing your design recommendations and budget suggestions.
        </p>

        <h2 className="text-2xl text-gray-800 mb-4 font-bold mt-7.5">3. Information Sharing</h2>
        <p className="text-base text-gray-700 leading-relaxed mb-3">
          We do not sell, trade, or otherwise transfer your personal information to outside parties. Your data is used solely to improve your experience on Decore.
        </p>

        <h2 className="text-2xl text-gray-800 mb-4 font-bold mt-7.5">4. Data Security</h2>
        <p className="text-base text-gray-700 leading-relaxed mb-3">
          We implement a variety of security measures to maintain the safety of your personal information. All data is encrypted using industry-standard SSL technology.
        </p>

        <h2 className="text-2xl text-gray-800 mb-4 font-bold mt-7.5">5. Contact Us</h2>
        <p className="text-base text-gray-700 leading-relaxed mb-3">
          If you have any questions about this Privacy Policy, please contact us at: decore-info@gmail.com
        </p>

        <p className="text-sm text-gray-600 mt-7.5">Last updated: January 2025</p>
      </div>
    </div>
  );
}
