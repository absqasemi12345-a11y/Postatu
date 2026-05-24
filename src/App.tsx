import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './services/supabase';

import Home      from './pages/Home';
import About     from './pages/About';
import Services  from './pages/Services';
import Contact   from './pages/Contact';
import Privacy   from './pages/Privacy';
import Terms     from './pages/Terms';
import Dashboard from './pages/Dashboard';
import Admin     from './pages/Admin';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Publish   from './pages/Publish';
import Account   from './pages/Account'; // ✅ নতুন: Account/Billing পেজ

import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505] text-white">
        <div className="animate-pulse font-mono text-xs tracking-widest uppercase">
          Initializing Postatu...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500 selection:text-white">
        <Navbar session={session} />
        <main>
          <Routes>
            {/* ─── Public Routes ─── */}
            <Route path="/"         element={<Home />} />
            <Route path="/about"    element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact"  element={<Contact />} />
            <Route path="/privacy"  element={<Privacy />} />
            <Route path="/terms"    element={<Terms />} />

            {/* ─── Auth Routes ─── */}
            <Route path="/login"    element={!session ? <Login />    : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!session ? <Register /> : <Navigate to="/dashboard" />} />

            {/* ─── Protected Routes ─── */}
            <Route
              path="/dashboard"
              element={session ? <Dashboard user={session.user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/publish"
              element={session ? <Publish user={session.user} /> : <Navigate to="/login" />}
            />
            {/* ✅ Account/Billing পেজ — protected */}
            <Route
              path="/account"
              element={session ? <Account /> : <Navigate to="/login" />}
            />

            {/* ─── Admin ─── */}
            {/* ✅ Admin এ user pass করা হচ্ছে, session না থাকলে খালি email */}
            <Route
              path="/admin"
              element={<Admin user={session?.user ?? { email: '' }} />}
            />
          </Routes>
        </main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#151619',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '14px',
            },
          }}
        />
      </div>
    </Router>
  );
}
