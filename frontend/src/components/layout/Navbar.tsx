import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, PlusCircle, ShieldAlert, Sparkles, User as UserIcon, 
  LogOut, Menu, X, ArrowUpRight, ShieldCheck, CheckSquare, Layers, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from '../common/NotificationDropdown';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-campus-ivory/95 backdrop-blur-md border-b-2 border-campus-charcoal">
      {/* Top micro metadata ticker */}
      <div className="bg-campus-charcoal text-campus-ivory px-4 py-1 flex items-center justify-between text-[11px] font-mono tracking-widest uppercase">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-campus-lime">
            <span className="w-1.5 h-1.5 bg-campus-lime rounded-full mr-1.5 animate-pulse" />
            Live Network Status: Online
          </span>
          <span className="hidden sm:inline text-campus-ivory/40">|</span>
          <span className="hidden sm:inline text-campus-ivory/70">Campus Safety Protocol Active</span>
        </div>
        <div className="flex items-center space-x-3 text-campus-ivory/80">
          <span>Official University Portal</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-campus-charcoal text-campus-lime flex items-center justify-center font-mono font-black text-lg border-2 border-campus-charcoal shadow-brutal group-hover:bg-campus-forest transition-colors">
                CF
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-xl sm:text-2xl tracking-tight text-campus-charcoal group-hover:text-campus-forest transition-colors leading-none">
                  CampusFind
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-campus-charcoal/60 mt-0.5">
                  Verified Lost & Found
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 pl-4 border-l border-campus-charcoal/20">
              <Link
                to="/items"
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                  isActive('/items')
                    ? 'bg-campus-charcoal text-campus-lime font-bold shadow-[2px_2px_0px_#1B211F]'
                    : 'text-campus-charcoal hover:bg-campus-grey'
                }`}
              >
                Browse Items
              </Link>
              {user && (
                <>
                  <Link
                    to="/my-reports"
                    className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors flex items-center ${
                      isActive('/my-reports')
                        ? 'bg-campus-charcoal text-campus-lime font-bold shadow-[2px_2px_0px_#1B211F]'
                        : 'text-campus-charcoal hover:bg-campus-grey'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" />
                    My Reports
                  </Link>
                  <Link
                    to="/dashboard"
                    className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                      isActive('/dashboard')
                        ? 'bg-campus-charcoal text-campus-lime font-bold shadow-[2px_2px_0px_#1B211F]'
                        : 'text-campus-charcoal hover:bg-campus-grey'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/matches"
                    className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors flex items-center ${
                      isActive('/matches')
                        ? 'bg-campus-charcoal text-campus-lime font-bold shadow-[2px_2px_0px_#1B211F]'
                        : 'text-campus-charcoal hover:bg-campus-grey'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-campus-lime" />
                    Matches
                  </Link>
                  <Link
                    to="/claims"
                    className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                      isActive('/claims')
                        ? 'bg-campus-charcoal text-campus-lime font-bold shadow-[2px_2px_0px_#1B211F]'
                        : 'text-campus-charcoal hover:bg-campus-grey'
                    }`}
                  >
                    My Claims
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors flex items-center ${
                    isActive('/admin')
                      ? 'bg-campus-forest text-campus-lime font-bold shadow-[2px_2px_0px_#1B211F]'
                      : 'text-campus-forest font-bold hover:bg-campus-grey'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Admin Portal
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Quick Report CTAs */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/report/lost')}
                leftIcon={<PlusCircle className="w-3.5 h-3.5 text-red-600" />}
              >
                Report Lost
              </Button>
              <Button
                variant="lime"
                size="sm"
                onClick={() => navigate('/report/found')}
                leftIcon={<PlusCircle className="w-3.5 h-3.5 text-campus-charcoal" />}
              >
                Report Found
              </Button>
            </div>

            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-campus-charcoal/20">
                <NotificationDropdown />
                
                {/* User menu */}
                <div className="flex items-center space-x-2 bg-campus-white border border-campus-charcoal/30 px-2.5 py-1">
                  <div className="w-6 h-6 bg-campus-charcoal text-campus-lime font-mono text-[10px] flex items-center justify-center font-bold">
                    {user.full_name.charAt(0)}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-campus-charcoal leading-none truncate max-w-[100px]">
                      {user.full_name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] font-mono uppercase text-campus-charcoal/60 mt-0.5">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-1 text-campus-charcoal/60 hover:text-red-600 transition-colors ml-1"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2 border-l border-campus-charcoal/20">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Log In
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden items-center space-x-2">
            {user && <NotificationDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border border-campus-charcoal bg-campus-white text-campus-charcoal"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t-2 border-campus-charcoal bg-campus-ivory p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                navigate('/report/lost');
                setMobileMenuOpen(false);
              }}
            >
              + Report Lost
            </Button>
            <Button
              variant="lime"
              size="sm"
              className="w-full"
              onClick={() => {
                navigate('/report/found');
                setMobileMenuOpen(false);
              }}
            >
              + Report Found
            </Button>
          </div>

          <div className="flex flex-col space-y-2 border-t border-campus-charcoal/20 pt-3">
            <Link
              to="/items"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-mono uppercase tracking-wider text-campus-charcoal hover:bg-campus-grey"
            >
              Browse All Items
            </Link>
            {user ? (
              <>
                <Link
                  to="/my-reports"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-mono uppercase tracking-wider text-campus-charcoal hover:bg-campus-grey flex items-center justify-between"
                >
                  <span>My Incident Reports</span>
                  <FileText className="w-4 h-4 text-campus-forest" />
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-mono uppercase tracking-wider text-campus-charcoal hover:bg-campus-grey"
                >
                  Personal Dashboard
                </Link>
                <Link
                  to="/matches"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-mono uppercase tracking-wider text-campus-charcoal hover:bg-campus-grey flex items-center justify-between"
                >
                  <span>Smart Matches</span>
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </Link>
                <Link
                  to="/claims"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-mono uppercase tracking-wider text-campus-charcoal hover:bg-campus-grey"
                >
                  My Claims & Handovers
                </Link>
                <Link
                  to="/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-mono uppercase tracking-wider text-campus-charcoal hover:bg-campus-grey"
                >
                  Notifications
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-mono uppercase tracking-wider text-campus-forest font-bold hover:bg-campus-grey"
                  >
                    Admin Moderation Panel
                  </Link>
                )}
                <div className="border-t border-campus-charcoal/20 pt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-campus-charcoal">{user.full_name}</p>
                    <p className="text-[10px] font-mono text-campus-charcoal/60">{user.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Log Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    navigate('/register');
                    setMobileMenuOpen(false);
                  }}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
