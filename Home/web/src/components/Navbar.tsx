import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useLanguage } from '../i18n/useLanguage';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      className="fixed top-0 w-full z-50 glass-nav shadow-[0_40px_60px_-15px_rgba(0,0,0,0.4)] dark:shadow-[0_40px_60px_-15px_rgba(0,0,0,0.8)]"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        <NavLink to="/" className="text-2xl font-extrabold tracking-tighter text-on-surface dark:text-white font-headline">
          Decora AI
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 font-headline font-bold tracking-tight">
          <NavLink
            to="/"
            className={`transition-all duration-300 pb-1 ${
              isActive('/') ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant dark:text-gray-400 hover:text-on-surface dark:hover:text-white'
            }`}
          >
            Home
          </NavLink>
          <NavLink
            to="/gallery"
            className={`transition-all duration-300 pb-1 ${
              isActive('/gallery') ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant dark:text-gray-400 hover:text-on-surface dark:hover:text-white'
            }`}
          >
            {t('nav.gallery')}
          </NavLink>
          <NavLink
            to="/features"
            className={`transition-all duration-300 pb-1 ${
              isActive('/features') ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant dark:text-gray-400 hover:text-on-surface dark:hover:text-white'
            }`}
          >
            Features
          </NavLink>
          <NavLink
            to="/admin"
            className={`transition-all duration-300 pb-1 ${
              isActive('/admin') ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant dark:text-gray-400 hover:text-on-surface dark:hover:text-white'
            }`}
          >
            {t('nav.admin')}
          </NavLink>
          <NavLink
            to="/history"
            className={`transition-all duration-300 pb-1 ${
              isActive('/history') ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant dark:text-gray-400 hover:text-on-surface dark:hover:text-white'
            }`}
          >
            History
          </NavLink>
          <NavLink
            to="/settings"
            className={`transition-all duration-300 pb-1 ${
              isActive('/settings') ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant dark:text-gray-400 hover:text-on-surface dark:hover:text-white'
            }`}
          >
            Settings
          </NavLink>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <ThemeToggle />

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button className="text-on-surface-variant dark:text-gray-400 hover:text-on-surface dark:hover:text-white font-headline font-bold text-sm transition-all duration-300 px-4 py-2 hover:bg-white/5 dark:hover:bg-white/10 rounded-lg">
              Login
            </button>
            <button className="bg-gradient-to-r from-primary to-secondary text-on-primary-fixed font-headline font-bold px-6 py-2.5 rounded-xl neon-glow active:scale-95 duration-200">
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div
          className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          <div className="flex flex-col gap-2 px-8 py-4">
            <NavLink
              to="/"
              className="px-4 py-2 text-on-surface dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/gallery"
              className="px-4 py-2 text-on-surface dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.gallery')}
            </NavLink>
            <NavLink
              to="/features"
              className="px-4 py-2 text-on-surface dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </NavLink>
            <NavLink
              to="/admin"
              className="px-4 py-2 text-on-surface dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.admin')}
            </NavLink>
            <button className="w-full text-left px-4 py-2 text-on-surface dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              Login
            </button>
            <button className="w-full bg-gradient-to-r from-primary to-secondary text-on-primary-fixed font-headline font-bold px-4 py-2 rounded-xl">
              Sign Up
            </button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
