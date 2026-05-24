import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import PostatuLogo from '../components/PostatuLogo';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Registration successful! Please check your email.');
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#050505]">
       <motion.div 
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         className="w-full max-w-md bg-white/[0.02] border border-white/5 p-12 rounded-[2.5rem]"
       >
         <div className="text-center mb-10 flex flex-col items-center">
            <Link to="/" className="mb-6 block">
              <PostatuLogo showText={false} iconSize="w-16 h-16" />
            </Link>
            <h1 className="text-3xl font-bold mb-2">Create Engine</h1>
            <p className="text-white/40 text-sm italic">Join the next generation of content distribution.</p>
         </div>
         
         <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 ml-2">Email</label>
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-orange-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 ml-2">Password</label>
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-orange-500 outline-none transition-all"
              />
            </div>
            
            <button 
              disabled={loading}
              className="w-full bg-orange-500 text-white font-bold py-5 rounded-2xl hover:bg-orange-600 transition-all disabled:opacity-50 mt-4 active:scale-[0.98]"
            >
              {loading ? 'Initializing...' : 'Construct Account'}
            </button>
         </form>

         <div className="mt-8 text-center text-sm text-white/30">
            Already have an account? <Link to="/login" className="text-orange-500 hover:underline">Log In</Link>
         </div>
       </motion.div>
    </div>
  );
}
