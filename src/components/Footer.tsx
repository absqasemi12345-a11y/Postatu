import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-2xl font-display font-bold tracking-tighter text-white">POSTATU</Link>
            <p className="mt-4 text-white/50 max-w-sm">
              The premium multi-platform content distribution hub. 
              Simplify your workflow, amplify your reach.
            </p>
            <div className="mt-8 space-y-3">
              <div className="flex items-center space-x-3 text-white/40 hover:text-white transition-colors">
                <Mail size={18} className="text-orange-500" />
                <span className="text-sm">Kingmd892@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3 text-white/40">
                <MapPin size={18} className="text-orange-500" />
                <span className="text-sm">Jatrabari, Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Platform</h4>
            <ul className="space-y-4 text-white/50 text-sm">
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/services" className="hover:text-white">Services</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Legal</h4>
            <ul className="space-y-4 text-white/50 text-sm">
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-white/30 text-xs tracking-tight">
            © {new Date().getFullYear()} Postatu. All rights reserved. Built with precision for creators.
          </p>
          <div className="flex space-x-6">
            <Link to="/admin" className="text-[10px] uppercase tracking-widest text-white/10 hover:text-white/50 transition-colors">Admin Console</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
