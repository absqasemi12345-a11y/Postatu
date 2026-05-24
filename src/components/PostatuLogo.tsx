import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  iconSize?: string;
  showText?: boolean;
  textColor?: string;
  taglineColor?: string;
}

export default function PostatuLogo({ 
  className = "", 
  iconSize = "w-10 h-10", 
  showText = true,
  textColor = "text-white",
  taglineColor = "text-white/40"
}: LogoProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Icon portion: swirling clockwise loop with an arrowhead + central play button */}
      <motion.div 
        whileHover={{ scale: 1.05, rotate: 5 }}
        className={`${iconSize} flex-shrink-0 relative`}
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="postatu-brand-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" />  {/* Vibrant Sky Blue */}
              <stop offset="45%" stopColor="#0d9488" /> {/* Rich Teal */}
              <stop offset="100%" stopColor="#10b981" /> {/* Glowing Emerald */}
            </linearGradient>
          </defs>
          
          {/* Swirling Arrow Orbit ring */}
          <path 
            d="M 50,20 
               A 30,30 0 1,0 80,50 
               A 30,30 0 0,0 72,28" 
            stroke="url(#postatu-brand-grad)" 
            strokeWidth="9" 
            strokeLinecap="round" 
            fill="none" 
          />
          
          {/* Arrowhead at the end of loop */}
          <path 
            d="M 60,34 L 75,19 L 88,32" 
            stroke="url(#postatu-brand-grad)" 
            strokeWidth="9" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
          />
          
          {/* Center Play Icon Triangle */}
          <path 
            d="M 44,38 L 64,50 L 44,62 Z" 
            fill="url(#postatu-brand-grad)" 
            stroke="url(#postatu-brand-grad)" 
            strokeWidth="3"
            strokeLinejoin="round" 
          />
        </svg>
      </motion.div>

      {showText && (
        <div className="flex flex-col select-none">
          <span className={`text-2xl font-black tracking-tighter ${textColor} leading-none font-sans`}>
            POSTATU
          </span>
          <span className={`text-[7.5px] tracking-wider uppercase ${taglineColor} leading-none mt-1 font-mono`}>
            Social Media Automation & Video Distribution
          </span>
        </div>
      )}
    </div>
  );
}
