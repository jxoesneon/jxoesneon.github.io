import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaMapMarkerAlt, FaEnvelope, FaHeart } from 'react-icons/fa';
import { SiReact, SiVite, SiFlutter, SiPython, SiDocker, SiTensorflow, SiGithubsponsors, SiKofi } from 'react-icons/si';

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
           <h3 className="text-2xl font-bold mb-4 tracking-tight">Let's Collaborate</h3>
           <p className="text-gray-400 mb-8 max-w-md text-sm leading-relaxed">Open to conversations regarding systems architecture, Model Context Protocol tooling, and technical research.</p>
           <div className="flex gap-6">
             <a href="https://github.com/jxoesneon" aria-label="GitHub Profile" className="text-3xl text-gray-400 hover:text-white transition-colors"><FaGithub /></a>
             <a href="https://www.linkedin.com/in/jose-eduardo-rojas-jiménez-0a8284b1/" aria-label="LinkedIn Profile" className="text-3xl text-gray-400 hover:text-white transition-colors"><FaLinkedin /></a>
             <a href="mailto:rj.joseeduardo@gmail.com" aria-label="Send Email" className="text-3xl text-gray-400 hover:text-white transition-colors"><FaEnvelope /></a>
           </div>
        </BentoTile>

        {/* Tech Stack - Tall Tile */}
        <BentoTile className="md:row-span-2" delay={0.2}>
          <h3 className="text-xl font-semibold mb-6 text-white tracking-tight">Tech Stack</h3>
          <div className="flex flex-wrap justify-center gap-4 text-3xl text-gray-400">
            <SiReact className="hover:text-slate-200 transition-colors" title="React" />
            <SiVite className="hover:text-slate-200 transition-colors" title="Vite" />
            <SiFlutter className="hover:text-slate-200 transition-colors" title="Flutter" />
            <SiPython className="hover:text-slate-200 transition-colors" title="Python" />
            <SiDocker className="hover:text-slate-200 transition-colors" title="Docker" />
            <SiTensorflow className="hover:text-slate-200 transition-colors" title="TensorFlow" />
          </div>
        </BentoTile>

        {/* Location - Small Tile */}
        <BentoTile delay={0.3}>
          <FaMapMarkerAlt className="text-2xl text-slate-400 mb-2" />
          <h4 className="font-semibold text-white">Costa Rica</h4>
          <p className="text-sm text-gray-400">UTC-6 (CST)</p>
        </BentoTile>

         {/* Status - Small Tile */}
         <BentoTile delay={0.4} className="relative overflow-hidden">
          <div className="z-10 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <h4 className="font-semibold text-emerald-400 text-sm">Open to Work</h4>
            </div>
            <p className="text-xs text-center text-gray-400">Full Stack / AI Engineer</p>
          </div>
        </BentoTile>
        
        {/* Support & Sponsors - Wide Tile */}
        <BentoTile className="md:col-span-2 border border-white/10" delay={0.5}>
          <div className="flex items-center gap-2 mb-2">
            <FaHeart className="text-rose-400 text-base" />
            <h4 className="font-semibold text-base text-white tracking-tight">Support Open Source</h4>
          </div>
          <p className="text-sm text-gray-400 max-w-md mb-4 leading-relaxed">
            Sponsor independent research in decentralized infrastructure, Model Context Protocol utilities, and developer tooling.
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <a
              href="https://github.com/sponsors/jxoesneon"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-medium rounded-full bg-white/[0.04] border border-white/10 text-slate-200 hover:bg-white/[0.08] hover:border-white/20 flex items-center gap-2 transition-all shadow-sm"
            >
              <SiGithubsponsors className="text-sm text-rose-400" /> GitHub Sponsors
            </a>
            <a
              href="https://ko-fi.com/jxoesneon"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-medium rounded-full bg-white/[0.04] border border-white/10 text-slate-200 hover:bg-white/[0.08] hover:border-white/20 flex items-center gap-2 transition-all shadow-sm"
            >
              <SiKofi className="text-sm text-amber-400" /> Support on Ko-fi
            </a>
          </div>
        </BentoTile>

      </div>
    </section>
  );
};

export default BentoGrid;
