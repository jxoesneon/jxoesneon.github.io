import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaTwitter, FaMapMarkerAlt, FaCode, FaEnvelope } from 'react-icons/fa';
import { SiReact, SiVite, SiTailwindcss, SiFlutter, SiPython, SiDocker, SiTensorflow } from 'react-icons/si';

const BentoTile = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={`glass-card p-6 flex flex-col justify-center items-center text-center ${className}`}
  >
    {children}
  </motion.div>
);

const BentoGrid = () => {
  return (
    <section className="container mx-auto px-4 py-20">
      <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center gradient-text">Connect & Stack</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[180px]">
        {/* Socials - Large Tile */}
        <BentoTile className="md:col-span-2 md:row-span-2" delay={0.1}>
           <h3 className="text-2xl font-bold mb-6">Let's Collaborate</h3>
           <p className="text-gray-400 mb-8 max-w-md">Open to discussing Decentralized AI, Model Context Protocol, and the future of software.</p>
           <div className="flex gap-6">
             <a href="https://github.com/jxoesneon" className="text-4xl hover:text-neon-blue transition-colors"><FaGithub /></a>
             <a href="https://www.linkedin.com/in/jose-eduardo-rojas-jiménez-0a8284b1/" className="text-4xl hover:text-neon-blue transition-colors"><FaLinkedin /></a>
             <a href="mailto:rj.joseeduardo@gmail.com" className="text-4xl hover:text-neon-blue transition-colors"><FaEnvelope /></a>
           </div>
        </BentoTile>

        {/* Tech Stack - Tall Tile */}
        <BentoTile className="md:row-span-2" delay={0.2}>
          <h3 className="text-xl font-bold mb-6 text-neon-green">Tech Stack</h3>
          <div className="grid grid-cols-2 gap-4 text-3xl text-gray-400">
            <SiReact className="hover:text-[#61DAFB] transition-colors" title="React" />
            <SiVite className="hover:text-[#646CFF] transition-colors" title="Vite" />
            <SiFlutter className="hover:text-[#02569B] transition-colors" title="Flutter" />
            <SiPython className="hover:text-[#3776AB] transition-colors" title="Python" />
            <SiDocker className="hover:text-[#2496ED] transition-colors" title="Docker" />
            <SiTensorflow className="hover:text-[#FF6F00] transition-colors" title="TensorFlow" />
          </div>
        </BentoTile>

        {/* Location - Small Tile */}
        <BentoTile delay={0.3}>
          <FaMapMarkerAlt className="text-3xl text-neon-purple mb-2" />
          <h4 className="font-bold">Costa Rica</h4>
          <p className="text-sm text-gray-400">UTC-6 (CST)</p>
        </BentoTile>

         {/* Status - Small Tile */}
         <BentoTile delay={0.4} className="relative overflow-hidden">
          <div className="absolute inset-0 bg-neon-green/10 animate-pulse" />
          <div className="z-10 flex flex-col items-center">
            <div className="w-3 h-3 bg-neon-green rounded-full mb-2 shadow-[0_0_10px_var(--neon-green)]" />
            <h4 className="font-bold text-neon-green">Open to Work</h4>
            <p className="text-xs text-center text-gray-400 mt-1">Full Stack / AI Engineer</p>
          </div>
        </BentoTile>
        
        {/* Quote/Philosophy - Wide Tile */}
         <BentoTile className="md:col-span-2 bg-gradient-to-r from-white/5 to-transparent" delay={0.5}>
          <FaCode className="text-2xl text-neon-blue mb-4" />
          <blockquote className="italic text-lg text-gray-300">"Code is the interface between imagination and reality."</blockquote>
        </BentoTile>

      </div>
    </section>
  );
};

export default BentoGrid;
