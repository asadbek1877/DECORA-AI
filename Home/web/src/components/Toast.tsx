import React, { useEffect, useState } from 'react';
import { useStore } from '../store/toastStore';

export default function Toast() {
  const { message, type, isVisible, hideToast } = useStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        hideToast();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, hideToast]);

  const bgColor = type === 'success' ? 'bg-teal-500' : type === 'warning' ? 'bg-orange-500' : 'bg-gray-800';

  return (
    <div
      className={`fixed bottom-7.5 right-7.5 bg-gray-800 text-white px-7 py-3.5 rounded-lg text-base font-medium z-9999 opacity-0 transform translate-y-5 transition-all duration-400 shadow-2xl ${
        show ? 'opacity-100 translate-y-0' : ''
      } ${bgColor}`}
    >
      {message}
    </div>
  );
}
