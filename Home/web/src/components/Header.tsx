import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Icon from './Icon';

export default function Header() {
  const [scrollY, setScrollY] = useState(0);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;

      ticking.current = true;
      requestAnimationFrame(() => {
        const nextScrollY = window.scrollY;
        const delta = nextScrollY - lastScrollY.current;
        const isAtTop = nextScrollY < 18;

        setScrollY(nextScrollY);

        // Hide on confident downward scroll, reveal immediately on upward scroll or page top.
        if (isAtTop) {
          setHidden(false);
        } else if (delta > 8 && nextScrollY > 140) {
          setHidden(true);
        } else if (delta < -4) {
          setHidden(false);
        }

        lastScrollY.current = Math.max(nextScrollY, 0);
        ticking.current = false;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const isTop = scrollY < 18;
  const navClassName = [
    'site-navbar',
    isTop ? 'navbar--top' : 'navbar--floating navbar--mirror',
    hidden ? 'navbar--hidden' : '',
  ].join(' ');

  const navLinks = [
    { label: 'Cloud', path: '/cloud' },
    { label: 'Desktop', path: '/desktop' },
    { label: 'Reviews', path: '/reviews' },
    { label: 'Explore', path: '/explore' },
  ];

  return (
    <header className={navClassName}>
      <div className="site-navbar__inner">
        <Link to="/" className="site-navbar__brand" aria-label="PixelLift home">
          <span className="site-navbar__mark">
            <Icon name="sparkles" className="h-6 w-6 text-white" />
          </span>
          <span className="site-navbar__wordmark">PixelLift</span>
        </Link>

        <nav className="site-navbar__links" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={isActive(link.path) ? 'site-navbar__link is-active' : 'site-navbar__link'}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="site-navbar__actions">
          <Link to="/explore" className="site-navbar__ghost">
            Gallery
          </Link>
          <Link to="/cloud" className="site-navbar__cta">
            Start
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button className="site-navbar__menu" aria-label="Open navigation">
            <Icon name="menu" />
          </button>
        </div>
      </div>
    </header>
  );
}
