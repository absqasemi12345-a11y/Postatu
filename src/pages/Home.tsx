import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Share2, Calendar, Zap, Shield, Globe, Users, ArrowRight, Play } from 'lucide-react';
import PostatuLogo from '../components/PostatuLogo';

export default function Home() {
  const features = [
    {
      title: 'Multi-Platform Hub',
      desc: 'Distribute content to YouTube, Facebook, Instagram, and TikTok from a single command center.',
      icon: <Globe className="text-orange-500" />,
      color: 'from-orange-500/20 to-transparent'
    },
    {
      title: 'Automated Scheduling',
      desc: 'Set it and forget it. Our engine ensures your content hits the prime time across all timezones.',
      icon: <Calendar className="text-blue-500" />,
      color: 'from-blue-500/20 to-transparent'
    },
    {
      title: 'n8n Integration',
      desc: 'Connect your custom workflows with n8n webhooks for ultimate automation flexibility.',
      icon: <Zap className="text-purple-500" />,
      color: 'from-purple-500/20 to-transparent'
    },
    {
      title: 'Enterprise Security',
      desc: 'Your access tokens are encrypted and managed with bank-grade security protocols.',
      icon: <Shield className="text-green-500" />,
      color: 'from-green-500/20 to-transparent'
    },
    {
      title: 'Multi-Account Support',
      desc: 'Manage 10+ YouTube channels and multiple social profiles simultaneously without switching.',
      icon: <Users className="text-pink-500" />,
      color: 'from-pink-500/20 to-transparent'
    },
    {
      title: 'Smart Distribution',
      desc: 'Optimized video processing engine ensures high-quality uploads every single time.',
      icon: <Share2 className="text-yellow-500" />,
      color: 'from-yellow-500/20 to-transparent'
    }
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] bg-orange-600/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[20%] right-[10%] w-[35vw] h-[35vw] bg-blue-600/10 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-10 overflow-visible p-4">
              <PostatuLogo iconSize="w-20 h-20" showText={true} />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter leading-[0.9] text-white">
              PUBLISH ONCE.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">REACH EVERYWHERE.</span>
            </h1>
            <p className="mt-8 text-xl text-white/50 max-w-2xl mx-auto font-light leading-relaxed">
              Postatu is the premium engine designed for creators and businesses to automate content distribution across all major social networks simultaneously.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/register"
                className="group relative bg-orange-500 text-white px-10 py-5 rounded-full text-lg font-bold flex items-center space-x-3 hover:bg-orange-600 transition-all"
              >
                <span>Start Distributing</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="group flex items-center space-x-3 text-white/70 hover:text-white transition-colors"
              >
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/5">
                  <Play size={18} fill="currentColor" />
                </div>
                <span className="font-medium">See how it works</span>
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-white/20 to-transparent"
        />
      </section>

      {/* Stats/Logo Cloud */}
      <section className="py-20 border-y border-white/5 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white/30 text-xs font-bold uppercase tracking-[0.3em] mb-12">Supported Platforms</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
             <span className="text-3xl font-bold italic">YouTube</span>
             <span className="text-3xl font-bold italic">Facebook</span>
             <span className="text-3xl font-bold italic">Instagram</span>
             <span className="text-3xl font-bold italic">TikTok</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Designed for Peak Performance</h2>
            <p className="text-white/50 max-w-xl mx-auto">Our engine handles the complexity of API restrictions and scheduling so you can focus on creation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-orange-500/30 transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl`} />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brutalist Call to Action */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-orange-500 rounded-[3rem] p-12 md:p-24 text-center text-black overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32 rounded-full" />
            <h2 className="text-4xl md:text-7xl font-display font-bold tracking-tighter leading-none mb-8">READY TO SCALE YOUR<br />DIGITAL PRESENCE?</h2>
            <Link 
                to="/register"
                className="inline-block bg-black text-white px-12 py-6 rounded-full font-bold text-xl hover:scale-105 transition-transform"
            >
                Join Postatu Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
