import React, { useState } from 'react';
import { useStore } from '../store/toastStore';

export default function ContactPage() {
  const { showToast } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast('Please fill in all required fields!', 'warning');
      return;
    }
    showToast('✅ Message sent successfully!', 'success');
    setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
  };

  return (
    <div className="w-full">
      <div className="text-center py-15 px-5 bg-gradient-to-b from-teal-50 to-white">
        <h1 className="text-5xl text-teal-500 mb-3 font-bold">Contact Us</h1>
        <p className="text-lg text-gray-700">Have a question or feedback? We'd love to hear from you!</p>
      </div>

      <div className="max-w-4xl mx-auto px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="bg-gray-50 p-9 rounded-5 border-2 border-gray-200">
            <h3 className="text-2xl mb-5 text-gray-800 font-bold">Send a Message ✉️</h3>
            
            <div className="mb-4.5">
              <label className="block text-base font-semibold mb-1.5 text-gray-700">Your Name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-3 text-base font-poppins transition-all focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="mb-4.5">
              <label className="block text-base font-semibold mb-1.5 text-gray-700">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-3 text-base font-poppins transition-all focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="mb-4.5">
              <label className="block text-base font-semibold mb-1.5 text-gray-700">Subject</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-3 text-base font-poppins transition-all focus:outline-none focus:border-teal-500 bg-white"
              >
                <option>General Inquiry</option>
                <option>Technical Support</option>
                <option>Partnership</option>
                <option>Feedback</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-base font-semibold mb-1.5 text-gray-700">Message</label>
              <textarea
                name="message"
                placeholder="Tell us what's on your mind..."
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-3 text-base font-poppins transition-all focus:outline-none focus:border-teal-500 h-30 resize-none rounded-3"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-teal-500 text-white border-none rounded-2xl font-bold text-lg cursor-pointer transition-all shadow-lg hover:bg-teal-600 hover:shadow-2xl"
            >
              Send Message
            </button>
          </form>

          {/* Contact Info */}
          <div>
            <h3 className="text-2xl mb-5 text-gray-800 font-bold">Get in Touch</h3>
            
            <div className="p-5 bg-gray-50 border-2 border-gray-200 rounded-3.5 mb-6 transition-all hover:bg-teal-50 hover:translate-x-1">
              <div className="w-12.5 h-12.5 bg-teal-500 text-white rounded-3.5 flex items-center justify-center text-5 mb-4 inline-block">
                ✉️
              </div>
              <h4 className="text-4 mb-1 text-gray-800 font-bold">Email</h4>
              <p className="text-sm text-gray-700">decore-info@gmail.com</p>
            </div>

            <div className="p-5 bg-gray-50 border-2 border-gray-200 rounded-3.5 mb-6 transition-all hover:bg-teal-50 hover:translate-x-1">
              <div className="w-12.5 h-12.5 bg-teal-500 text-white rounded-3.5 flex items-center justify-center text-5 mb-4 inline-block">
                📞
              </div>
              <h4 className="text-4 mb-1 text-gray-800 font-bold">Phone</h4>
              <p className="text-sm text-gray-700">+1 (555) 123-4567</p>
            </div>

            <div className="p-5 bg-gray-50 border-2 border-gray-200 rounded-3.5 mb-6 transition-all hover:bg-teal-50 hover:translate-x-1">
              <div className="w-12.5 h-12.5 bg-teal-500 text-white rounded-3.5 flex items-center justify-center text-5 mb-4 inline-block">
                📍
              </div>
              <h4 className="text-4 mb-1 text-gray-800 font-bold">Address</h4>
              <p className="text-sm text-gray-700">123 Design Street, Creative City, CA 90210</p>
            </div>

            <div className="p-5 bg-gray-50 border-2 border-gray-200 rounded-3.5 transition-all hover:bg-teal-50 hover:translate-x-1">
              <div className="w-12.5 h-12.5 bg-teal-500 text-white rounded-3.5 flex items-center justify-center text-5 mb-4 inline-block">
                🕐
              </div>
              <h4 className="text-4 mb-1 text-gray-800 font-bold">Working Hours</h4>
              <p className="text-sm text-gray-700">Mon - Fri: 9:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
