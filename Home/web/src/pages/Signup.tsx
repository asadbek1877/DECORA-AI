import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/toastStore';

export default function SignupPage() {
  const { showToast } = useStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    agreeTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      showToast('Please fill in all fields!', 'warning');
      return;
    }
    if (formData.password !== formData.password2) {
      showToast('Passwords do not match!', 'warning');
      return;
    }
    if (!formData.agreeTerms) {
      showToast('Please agree to Terms of Service', 'warning');
      return;
    }
    showToast('🎉 Account created successfully!', 'success');
    setTimeout(() => navigate('/'), 1500);
  };

  return (
    <div className="w-full">
      <div className="text-center py-15 px-5 bg-gradient-to-b from-teal-50 to-white">
        <h1 className="text-5xl text-teal-500 mb-3 font-bold">Join Decore</h1>
        <p className="text-lg text-gray-700">Create your free account and start designing today</p>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-12">
        <div className="bg-white border-2 border-gray-200 rounded-6 p-10 shadow-lg">
          <h2 className="text-3xl text-center text-gray-800 font-bold mb-2">Sign Up</h2>
          <p className="text-center text-gray-600 text-base mb-7.5">Start your design journey for free</p>

          <form onSubmit={handleSignup}>
            <div className="mb-4.5">
              <label className="block text-base font-semibold mb-1.5 text-gray-700">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-3 text-base transition-all focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="mb-4.5">
              <label className="block text-base font-semibold mb-1.5 text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-3 text-base transition-all focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="mb-4.5">
              <label className="block text-base font-semibold mb-1.5 text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-3 text-base transition-all focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="mb-5">
              <label className="block text-base font-semibold mb-1.5 text-gray-700">Confirm Password</label>
              <input
                type="password"
                name="password2"
                placeholder="Confirm your password"
                value={formData.password2}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-3 text-base transition-all focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 mb-5">
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="w-4.5 h-4.5"
              />
              <label htmlFor="agreeTerms" className="text-base text-gray-700">
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-orange-500 text-white border-none rounded-2xl font-bold text-lg cursor-pointer transition-all shadow-lg hover:bg-orange-600"
            >
              Create Account
            </button>
          </form>

          <div className="text-center mt-5 text-base text-gray-700">
            Already have an account? <Link to="/login" className="text-teal-500 font-bold cursor-pointer no-underline hover:underline">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
