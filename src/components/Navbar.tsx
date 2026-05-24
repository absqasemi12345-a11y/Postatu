import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase } from '../services/supabase';
import { LayoutDashboard, LogOut, Menu, X, Send, UserCircle } from 'lucide-react';
import { useState } from 'react';
import PostatuLogo from './PostatuLogo';

export default function Navbar({ session }: { session: any }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    import('react-hot-toast').then(t => t.default.success('Signed out successfully'));
    navigate('/');
  };

  const navLinks = [
    { name: 'Home',     href: '/'        },
    { name: 'About',    href: '/about'   },
    { name: 'Services', href: '/services'},
    { name: 'Contact',  href: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <PostatuLogo />
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}

            {/* Admin badge — শুধু admin email দেখবে */}
            {session?.user?.email === 'kingmd892@gmail.com' && (
              <Link
                to="/admin"
                className="text-[10px] uppercase tracking-widest text-orange-500 font-bold border border-orange-500/30 px-3 py-1 rounded hover:bg-orange-500/10 transition-colors"
              >
                ADMIN
              </Link>
            )}

            {session ? (
              <div className="flex items-center space-x-4 ml-4">
                {/* Broadcast */}
                <Link
                  to="/publish"
                  className="flex items-center space-x-2 text-white/50 hover:text-white transition-colors"
                >
                  <Send size={18} />
                  <span className="text-sm">Broadcast</span>
                </Link>

                {/* Dashboard */}
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 transition-all"
                >
                  <LayoutDashboard size={18} />
                  <span className="text-sm">Dashboard</span>
                </Link>

                {/* ✅ Account / Upgrade — নতুন লিংক */}
                <Link
                  to="/account"
                  className="flex items-center space-x-2 text-white/50 hover:text-orange-400 transition-colors"
                  title="Account & Billing"
                >
                  <UserCircle size={20} />
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-white/50 hover:text-red-400 transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-medium text-white/70 hover:text-white">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold skew-x-[-12deg] hover:bg-orange-600 transition-all hover:skew-x-0"
                >
                  <span className="block skew-x-[12deg]">Get Started</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#0a0a0a] border-b border-white/10 px-4 pt-2 pb-6 space-y-4"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="block text-lg h-12 flex items-center border-b border-white/5"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          {session?.user?.email === 'kingmd892@gmail.com' && (
            <Link
              to="/admin"
              className="block text-lg h-12 flex items-center border-b border-white/5 text-orange-500 font-bold font-mono"
              onClick={() => setIsMenuOpen(false)}
            >
              ADMIN_CONSOLE
            </Link>
          )}

          {session ? (
            <>
              <Link
                to="/publish"
                className="block text-lg h-12 flex items-center border-b border-white/5"
                onClick={() => setIsMenuOpen(false)}
              >
                Broadcast
              </Link>
              <Link
                to="/dashboard"
                className="block text-lg h-12 flex items-center border-b border-white/5"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              {/* ✅ Account লিংক — mobile menu তেও */}
              <Link
                to="/account"
                className="block text-lg h-12 flex items-center border-b border-white/5 text-orange-400"
                onClick={() => setIsMenuOpen(false)}
              >
                Account &amp; Billing
              </Link>
              <button
                onClick={handleLogout}
                className="block text-lg h-12 flex items-center text-red-400"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Link
                to="/login"
                className="flex items-center justify-center p-3 bg-white/5 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center p-3 bg-orange-500 rounded-lg font-bold"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </nav>
  );
}
