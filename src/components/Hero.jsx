import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Hero = () => {
  const [showFullName, setShowFullName] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowFullName(prev => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-[80vh] flex flex-col justify-center items-center text-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-neon-purple/20 via-transparent to-transparent pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="z-10"
      >
        <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-neon-blue text-sm mb-6 backdrop-blur-md">
          Decentralized Systems & AI
        </span>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight flex flex-col items-center gap-2">
          <span>Hi, I'm</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={showFullName ? "full" : "nick"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="gradient-text pb-2"
            >
              {showFullName ? "Jose Eduardo Rojas Jimenez" : "jxoesneon"}
            </motion.span>
          </AnimatePresence>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Building the bridge between <span className="text-white">Artificial Intelligence</span> and <span className="text-white">Desktop Reality</span> via the Model Context Protocol.
        </p>

        <div className="flex gap-4 justify-center">
          <a href="https://github.com/jxoesneon" className="btn-primary">
            GitHub Profile
          </a>
          <a href="mailto:rj.joseeduardo@gmail.com" className="btn-secondary">
            Get in Touch
          </a>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
