import React from "react";
import { motion } from "framer-motion";
import { FaGithub, FaStar, FaCodeBranch } from "react-icons/fa";
import repos from "../data/repos.json";

const ProjectCard = ({ repo, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card p-6 flex flex-col h-full hover:scale-105 transition-transform duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-neon-blue">{repo.name}</h3>
        <a
          href={`https://github.com/jxoesneon/${repo.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <FaGithub size={20} />
        </a>
      </div>

      <p className="text-gray-300 mb-4 flex-grow text-sm leading-relaxed">
        {repo.description || "No description available."}
      </p>

      {repo.repositoryTopics && repo.repositoryTopics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {repo.repositoryTopics.slice(0, 3).map((topic, i) => (
            <span
              key={i}
              className="px-2 py-1 text-xs rounded-full bg-white/10 text-neon-purple border border-white/5"
            >
              {topic.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto pt-4 border-t border-white/10">
        {repo.latestRelease && (
          <span className="flex items-center gap-1 text-neon-green">
            <FaCodeBranch /> {repo.latestRelease.tagName}
          </span>
        )}
        <span className="flex items-center gap-1">
          <FaStar className="text-yellow-500" /> {repo.stargazerCount}
        </span>
        <span className="ml-auto">
          {new Date(repo.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
};

const ProjectGrid = () => {
  // Filter repos as defined in the plan
  const featured = ["FerroTeX", "UE5-MCP", "IPFS", "dart_lz4"];
  const mcp = [
    "ultramac-mcp",
    "blender-mcp",
    "godot-mcp",
    "mcp-server-gemini-image-generator",
  ];

  const featuredRepos = repos.filter((r) => featured.includes(r.name));
  const mcpRepos = repos.filter((r) => mcp.includes(r.name));

  return (
    <div className="container mx-auto px-4 py-20">
      <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center gradient-text">
        Latest Releases
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-24">
        {featuredRepos.map((repo, idx) => (
          <ProjectCard key={repo.name} repo={repo} index={idx} />
        ))}
      </div>

      <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center gradient-text">
        MCP Ecosystem
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {mcpRepos.map((repo, idx) => (
          <ProjectCard key={repo.name} repo={repo} index={idx + 4} />
        ))}
      </div>
    </div>
  );
};

export default ProjectGrid;
