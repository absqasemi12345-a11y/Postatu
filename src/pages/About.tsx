import { motion } from 'motion/react';

export default function About() {
  const steps = [
    { title: 'Connect Accounts', desc: 'Securely link your YouTube, TikTok, and Meta profiles via OAuth.' },
    { title: 'Define Logic', desc: 'Set up n8n webhooks or use our internal scheduler to trigger distributions.' },
    { title: 'Process Video', desc: 'Our engine optimizes and formats your content for each specific platform.' },
    { title: 'Auto-Publish', desc: 'Content is delivered simultaneously to all your selected channels.' }
  ];

  return (
    <div className="pt-32 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-20">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">Simplifying distribution for the modern creator.</h1>
          <p className="text-xl text-white/50 leading-relaxed max-w-3xl">
            Postatu was born out of a simple problem: the burnout associated with managing multiple social media channels. 
            We built a central nervous system for your content, allowing you to focus on the story while we handle the pixels and platforms.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-32">
          <div className="space-y-12">
            <h2 className="text-3xl font-bold italic serif">Our Mission</h2>
            <p className="text-white/60 leading-relaxed">
              Our mission is to democratize high-level social media automation. What was once only available to large media corporations with custom software teams is now available to every independent creator through Postatu. 
            </p>
            <p className="text-white/60 leading-relaxed">
              We focus on "Invisible Tech"—complex background processes that work flawlessly so you never have to think about them.
            </p>
          </div>
          <div className="bg-white/5 rounded-3xl p-12 border border-white/10 flex items-center justify-center">
             <div className="text-center">
                 <div className="text-6xl font-bold text-orange-500 mb-2">100%</div>
                 <div className="text-sm uppercase tracking-widest text-white/30 font-bold">Automation Focus</div>
             </div>
          </div>
        </section>

        <section className="mt-40">
           <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-white/30 mb-20 text-center">The Distribution Lifecycle</h2>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
             {steps.map((step, i) => (
               <div key={i} className="relative">
                 <div className="text-8xl font-display font-black text-white/5 absolute -top-12 -left-4 z-0">0{i+1}</div>
                 <div className="relative z-10">
                   <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                   <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
                 </div>
               </div>
             ))}
           </div>
        </section>
      </div>
    </div>
  );
}
