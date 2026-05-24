import { useState, FormEvent } from 'react';
import { Mail, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    toast.success('Your message has been received. Our team will contact you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-12">Let's talk about scale.</h1>
            <p className="text-xl text-white/50 mb-16 leading-relaxed">
              Have a custom requirement or need technical support? We're here to help you bridge the gap between creative and distribution.
            </p>

            <div className="space-y-12">
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="text-orange-500" />
                </div>
                <div>
                   <h4 className="font-bold text-white mb-1">Email</h4>
                   <p className="text-white/50 text-sm">Kingmd892@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-blue-500" />
                </div>
                <div>
                   <h4 className="font-bold text-white mb-1">Office</h4>
                   <p className="text-white/50 text-sm">Jatrabari, Dhaka, Bangladesh</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[2rem]">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-white/30">Your Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:border-orange-500 outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-white/30">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:border-orange-500 outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-white/30">Message</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:border-orange-500 outline-none transition-colors resize-none"
                  placeholder="How can we help?"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-white text-black py-5 rounded-xl font-bold flex items-center justify-center space-x-3 hover:bg-orange-500 hover:text-white transition-all"
              >
                <span>Send Message</span>
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
