import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/toastStore';

export default function LoginPage() {
  const { showToast } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields!', 'warning');
      return;
    }
    showToast('✅ Login successful! Welcome back!', 'success');
    setTimeout(() => navigate('/'), 1500);
  };

  return (
    <div className="w-full">
      <div className="text-center py-15 px-5 bg-gradient-to-b from-teal-50 to-white">
        <h1 className="text-5xl text-teal-500 mb-3 font-bold">Welcome Back!</h1>
        <p className="text-lg text-gray-700">Log in to continue designing your dream space</p>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-12">
        <div className="bg-white border-2 border-gray-200 rounded-6 p-10 shadow-lg">
          <h2 className="text-3xl text-center text-gray-800 font-bold mb-2">Log In</h2>
          <p className="text-center text-gray-600 text-base mb-7.5">Enter your credentials to access your account</p>

          <form onSubmit={handleLogin}>
            <div className="mb-4.5">
              <label className="block text-base font-semibold mb-1.5 text-gray-700">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-3 text-base transition-all focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="mb-5">
              <label className="block text-base font-semibold mb-1.5 text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-3 text-base transition-all focus:outline-none focus:border-teal-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-teal-500 text-white border-none rounded-2xl font-bold text-lg cursor-pointer transition-all shadow-lg hover:bg-teal-600"
            >
              Log In
            </button>
          </form>

          <div className="text-center mt-5 text-base text-gray-700">
            Don't have an account? <Link to="/signup" className="text-teal-500 font-bold cursor-pointer no-underline hover:underline">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
