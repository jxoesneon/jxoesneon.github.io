import React from 'react';
import { motion } from 'framer-motion';
import experience from '../data/experience.json';

const ExperienceTimeline = () => {
  return (
    <section className="container mx-auto px-4 py-20 relative">
      <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center gradient-text">Evolution</h2>
      
      {/* Vertical Line */}
      <div className="absolute left-4 md:left-1/2 top-40 bottom-20 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-60" />

      <div className="space-y-12">
        {experience.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`flex flex-col md:flex-row gap-8 items-center ${
              index % 2 === 0 ? 'md:flex-row-reverse' : ''
            }`}
          >
            {/* Content Card */}
            <div className="flex-1 w-full md:w-1/2">
              <div className={`glass-card p-6 relative group hover:border-white/20 transition-colors ${
                index % 2 === 0 ? 'md:text-right' : 'md:text-left'
              }`}>
                {/* Year Badge */}
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.04] text-slate-300 border border-white/10 mb-3">
                  {item.year}
                </span>
                <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-slate-200 transition-colors tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 font-medium mb-3">{item.company}</p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Center Dot */}
            <div className="relative z-10 hidden md:flex items-center justify-center w-8 h-8">
              <div className="w-2.5 h-2.5 bg-slate-300 rounded-full border border-white/20 transition-transform group-hover:scale-125" />
            </div>

            {/* Empty Spacer for alternating layout */}
            <div className="flex-1 hidden md:block" />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ExperienceTimeline;
