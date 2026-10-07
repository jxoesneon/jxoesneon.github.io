import repos from './data/repos.json';
import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { SiGithubsponsors, SiKofi } from 'react-icons/si';
import Hero from './components/Hero';
import ProjectGrid from './components/ProjectGrid';
import BentoGrid from './components/BentoGrid';
import ExperienceTimeline from './components/ExperienceTimeline';
import AIChat from './components/AIChat';
import NodeWeb from './components/NodeWeb';

function App() {
  const [focusedProject, setFocusedProject] = React.useState(null);
  const lastUpdated = new Date(Math.max(...repos.map(r => new Date(r.updatedAt)))).toLocaleDateString();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans relative overflow-hidden flex flex-col">
      <NodeWeb />
      <main className="relative z-10 flex-grow">
        <Hero />
        <ProjectGrid onProjectHover={setFocusedProject} />
        <ExperienceTimeline />
        <BentoGrid />
        <AIChat focusedProject={focusedProject} />
      </main>
      
      <footer className="relative z-10 py-8 text-center text-gray-500 text-sm border-t border-white/10 glass-card mx-4 mb-4 mt-20">
        <p>© {new Date().getFullYear()} Jose Eduardo Rojas Jimenez. Built with React & Vite.</p>
        <p className="mt-2 text-xs">Last Portfolio Sync: {lastUpdated}</p>
        <div className="flex justify-center gap-6 mt-4 items-center flex-wrap">
          <a
            href="https://github.com/jxoesneon"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neon-blue transition-colors flex items-center gap-1.5"
          >
            <FaGithub /> GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/jose-eduardo-rojas-jiménez-0a8284b1/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neon-blue transition-colors flex items-center gap-1.5"
          >
            <FaLinkedin /> LinkedIn
          </a>
          <a
            href="https://github.com/sponsors/jxoesneon"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-400 text-pink-400/90 transition-colors flex items-center gap-1.5"
          >
            <SiGithubsponsors /> GitHub Sponsors
          </a>
          <a
            href="https://ko-fi.com/jxoesneon"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 text-amber-400/90 transition-colors flex items-center gap-1.5"
          >
            <SiKofi /> Ko-fi
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
