import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';

const Hero = () => {
  const [showFullName, setShowFullName] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);

  const taglines = [
    "Building bridges between artificial intelligence and local systems via the Model Context Protocol.",
    "Pioneering decentralized infrastructure with IPFS and peer-to-peer networks.",
    "Developing automation tooling for spatial 3D pipelines in Blender and Unreal Engine.",
    "Architecting research tools, systems programming, and high-performance developer utilities."
  ];

  useEffect(() => {
    const nameInterval = setInterval(() => {
      setShowFullName(prev => !prev);
    }, 4000);

    const taglineInterval = setInterval(() => {
      setTaglineIndex(prev => (prev + 1) % taglines.length);
    }, 5000);

    return () => {
      clearInterval(nameInterval);
      clearInterval(taglineInterval);
    };
  }, [taglines.length]);

  return (
    <section className="min-h-[80vh] flex flex-col justify-center items-center text-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="z-10 w-full max-w-4xl"
      >
        <span className="inline-block py-1 px-3.5 rounded-full bg-white/[0.03] border border-white/10 text-slate-300 text-xs tracking-wide uppercase font-medium mb-6 backdrop-blur-md">
          Decentralized Systems & AI
        </span>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight flex flex-col items-center gap-2">
          <span>Hi, I'm</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={showFullName ? "full" : "nick"}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="pb-2 min-h-[1.2em] block font-bold"
              style={{
                backgroundImage: 'linear-gradient(180deg, #ffffff 15%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              {showFullName ? "Jose Eduardo Rojas Jimenez" : "jxoesneon"}
            </motion.span>
          </AnimatePresence>
        </h1>
        
        <div className="h-24 md:h-20 mb-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p 
              key={taglineIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
            >
              {taglines[taglineIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex gap-4 justify-center flex-wrap items-center">
          <a href="https://github.com/jxoesneon" target="_blank" rel="noopener noreferrer" className="btn-primary">
            GitHub Profile
          </a>
          <a href="mailto:rj.joseeduardo@gmail.com" className="btn-secondary">
            Get in Touch
          </a>
          <a href="https://github.com/sponsors/jxoesneon" target="_blank" rel="noopener noreferrer" className="btn-sponsor">
            <FaHeart className="text-sm" /> Sponsor
          </a>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
