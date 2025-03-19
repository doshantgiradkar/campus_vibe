import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Track scroll position to change navbar style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    // Call once to initialize correctly
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen && 
          userMenuRef.current && 
          userButtonRef.current && 
          !userMenuRef.current.contains(event.target as Node) && 
          !userButtonRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      
      if (isMenuOpen && 
          mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target as Node) &&
          event.target !== document.querySelector('[aria-controls="navbar-sticky"]')) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen, isMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav 
      className={`fixed w-full z-30 top-0 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md' 
          : 'bg-gradient-to-r from-primary-900 to-primary-800 text-white'
      }`}
    >
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center z-20">
          <span className={`self-center text-2xl font-bold whitespace-nowrap transition-colors duration-300 ${
            isScrolled ? 'text-primary-600' : 'text-white'
          }`}>
            Campus Vibe
          </span>
        </Link>

        <div className="flex items-center md:order-2 relative z-20">
          {currentUser ? (
            <div className="relative">
              <button
                ref={userButtonRef}
                type="button"
                className={`flex text-sm rounded-full focus:ring-2 focus:ring-primary-300 transition-all duration-300 ${
                  isScrolled 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-white/20 text-white'
                }`}
                onClick={toggleUserMenu}
              >
                <span className="sr-only">Open user menu</span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center">
                  {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>
              
              {isUserMenuOpen && (
                <div 
                  ref={userMenuRef}
                  className="absolute right-0 mt-2 w-56 py-2 bg-white rounded-lg shadow-xl z-20 border border-gray-100 animate-scaleIn"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm text-gray-900 truncate font-medium">
                      {currentUser.email}
                    </p>
                    <p className="text-xs text-primary-600 truncate capitalize">
                      {currentUser.role || 'User'}
                    </p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <Link
                    to="/my-events"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Events
                  </Link>
                  <Link
                    to="/payment-history"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Payment History
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1"
                  >
                    <svg className="w-4 h-4 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login" 
              className={`font-medium rounded-lg text-sm px-5 py-2.5 transition-all duration-300 shadow-sm ${
                isScrolled
                  ? 'text-white bg-primary-600 hover:bg-primary-700'
                  : 'text-primary-900 bg-white hover:bg-gray-100'
              }`}
            >
              Login
            </Link>
          )}
          
          <button
            type="button"
            className={`inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg md:hidden focus:outline-none focus:ring-2 ml-2 transition-colors ${
              isScrolled
                ? 'text-gray-500 hover:bg-gray-100 focus:ring-gray-200'
                : 'text-white hover:bg-white/20 focus:ring-white/30'
            }`}
            aria-controls="navbar-sticky"
            aria-expanded={isMenuOpen ? 'true' : 'false'}
            onClick={toggleMenu}
          >
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        
        <div
          ref={mobileMenuRef}
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
            isMenuOpen ? 'block' : 'hidden'
          }`}
          id="navbar-sticky"
        >
          <ul className={`flex flex-col p-4 mt-4 font-medium rounded-lg md:flex-row md:space-x-6 md:mt-0 md:p-0 transition-colors duration-300 ${
            isScrolled 
              ? 'border border-gray-100 bg-gray-50 md:border-0 md:bg-transparent shadow-lg md:shadow-none' 
              : 'bg-primary-800/95 md:bg-transparent border-0'
          }`}>
            <li>
              <Link
                to="/"
                className={`block py-2 px-3 rounded-md transition-all duration-200 ${
                  isActive('/') 
                    ? (isScrolled ? 'text-primary-600 font-semibold' : 'text-white bg-white/20 md:bg-white/20') 
                    : (isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white/90 hover:text-white hover:bg-white/10')
                } md:px-3 md:py-1.5`}
                aria-current={isActive('/') ? 'page' : undefined}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/events"
                className={`block py-2 px-3 rounded-md transition-all duration-200 ${
                  isActive('/events') 
                    ? (isScrolled ? 'text-primary-600 font-semibold' : 'text-white bg-white/20 md:bg-white/20') 
                    : (isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white/90 hover:text-white hover:bg-white/10')
                } md:px-3 md:py-1.5`}
              >
                Events
              </Link>
            </li>
            <li>
              <Link
                to="/departments"
                className={`block py-2 px-3 rounded-md transition-all duration-200 ${
                  isActive('/departments') 
                    ? (isScrolled ? 'text-primary-600 font-semibold' : 'text-white bg-white/20 md:bg-white/20') 
                    : (isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white/90 hover:text-white hover:bg-white/10')
                } md:px-3 md:py-1.5`}
              >
                Departments
              </Link>
            </li>
            <li>
              <Link
                to="/clubs"
                className={`block py-2 px-3 rounded-md transition-all duration-200 ${
                  isActive('/clubs') 
                    ? (isScrolled ? 'text-primary-600 font-semibold' : 'text-white bg-white/20 md:bg-white/20') 
                    : (isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white/90 hover:text-white hover:bg-white/10')
                } md:px-3 md:py-1.5`}
              >
                Clubs
              </Link>
            </li>
            {/* Only show Dashboard and Profile links in mobile menu for logged in users */}
            {currentUser && (
              <>
                <li className="md:hidden">
                  <Link
                    to="/dashboard"
                    className={`block py-2 px-3 rounded-md transition-all duration-200 ${
                      isActive('/dashboard') 
                        ? (isScrolled ? 'text-primary-600 font-semibold' : 'text-white bg-white/20') 
                        : (isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white/90 hover:text-white hover:bg-white/10')
                    }`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="md:hidden">
                  <Link
                    to="/profile"
                    className={`block py-2 px-3 rounded-md transition-all duration-200 ${
                      isActive('/profile') 
                        ? (isScrolled ? 'text-primary-600 font-semibold' : 'text-white bg-white/20') 
                        : (isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white/90 hover:text-white hover:bg-white/10')
                    }`}
                  >
                    Profile
                  </Link>
                </li>
                <li className="md:hidden">
                  <Link
                    to="/my-events"
                    className={`block py-2 px-3 rounded-md transition-all duration-200 ${
                      isActive('/my-events') 
                        ? (isScrolled ? 'text-primary-600 font-semibold' : 'text-white bg-white/20') 
                        : (isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white/90 hover:text-white hover:bg-white/10')
                    }`}
                  >
                    My Events
                  </Link>
                </li>
                <li className="md:hidden">
                  <Link
                    to="/payment-history"
                    className={`block py-2 px-3 rounded-md transition-all duration-200 ${
                      isActive('/payment-history') 
                        ? (isScrolled ? 'text-primary-600 font-semibold' : 'text-white bg-white/20') 
                        : (isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white/90 hover:text-white hover:bg-white/10')
                    }`}
                  >
                    Payment History
                  </Link>
                </li>
                <li className="md:hidden mt-2 pt-2 border-t border-gray-700/30">
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left block py-2 px-3 rounded-md transition-all duration-200 ${
                      isScrolled ? 'text-red-600 hover:bg-red-50' : 'text-red-300 hover:bg-white/10'
                    }`}
                  >
                    Sign out
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
} 