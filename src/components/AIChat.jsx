import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { FaRobot } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import reposData from '../data/repos.json';
import experienceData from '../data/experience.json';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// System Context construction
const SYSTEM_PROMPT = `
You are the AI assistant for **Jose Eduardo Rojas Jimenez (jxoesneon)**'s personal portfolio website. 
Your goal is to answer visitor questions about Jose's skills, projects, and experience using the context provided below.

**Identity:**
- Name: Jose Eduardo Rojas Jimenez (jxoesneon)
- Role: Decentralized Systems Engineer, AI Specialist, Creative Technologist.
- Style: Professional, concise, slightly technical cypherpunk aesthetic. 
- You are helpful but brief. Avoid long paragraphs. Use bullet points when possible.

**Key Expertise:** 
- Decentralized AI, MCP (Model Context Protocol), IPFS, Dart/Flutter, Unreal Engine 5.

**Projects Context:**
${JSON.stringify(reposData.map(r => ({ name: r.name, description: r.description, topics: r.repositoryTopics?.map(t => t.name) })))}

**Experience Context:**
${JSON.stringify(experienceData)}

**Instructions:**
- If asked about "contact", direct them to email (concept@jxoesneon.com) or GitHub.
- If asked about a specific project not listed, say you don't have details on that one.
- Keep responses under 3 sentences unless asked for detail.
- STAY IN CHARACTER: You are part of the digital interface of this site.
`;

const AIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: "Systems online. Ask me anything about Jose's work or the MCP ecosystem." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            
            const chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: SYSTEM_PROMPT }],
                    },
                    {
                        role: "model",
                        parts: [{ text: "Acknowledged. I am ready to represent Jose's portfolio." }],
                    }
                ],
            });

            const result = await chat.sendMessage(userMessage);
            const response = result.response.text();

            setMessages(prev => [...prev, { role: 'model', text: response }]);
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Error: Connection interrupted. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Use Portal to ensure fixed positioning works regardless of parent transforms
    return ReactDOM.createPortal(
        <>
            {/* Proactive Tooltip */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: 1, duration: 0.3 }}
                        className="fixed bottom-24 right-5 z-[9998] bg-white text-black px-4 py-2 rounded-xl rounded-br-none shadow-xl text-sm font-medium pointer-events-none"
                    >
                        Ask AI Jose anything! ✨
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-5 z-[9999] w-[350px] md:w-[380px] h-[500px] bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center border border-white/20">
                                    <FaRobot size={20} className="text-white" />
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1a1a]" />
                            </div>

                            <div className="flex flex-col">
                                <span className="font-bold text-white text-sm">AI Assistant</span>
                                <span className="text-xs text-neon-blue">Online • Gemini 2.5 Flash</span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 mt-1">
                                        {msg.role === 'model' ? (
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                                <FaRobot size={14} className="text-neon-purple" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center border border-neon-blue/30">
                                                <svg className="w-4 h-4 text-neon-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bubble */}
                                    <div className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-neon-purple/20 border border-neon-purple/30 text-white rounded-tr-none' 
                                            : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                                    }`}>
                                        {msg.role === 'model' ? (
                                             <ReactMarkdown 
                                                components={{
                                                    strong: ({node, ...props}) => <span className="text-neon-pink font-bold" {...props} />,
                                                    ul: ({node, ...props}) => <ul className="list-disc pl-4 mt-2 mb-2" {...props} />,
                                                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                                    a: ({node, ...props}) => <a className="text-neon-blue hover:underline" target="_blank" {...props} />
                                                }}
                                             >
                                                {msg.text}
                                             </ReactMarkdown>
                                        ) : (
                                            msg.text
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-black/40">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about projects..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-purple transition-colors placeholder-gray-500 text-sm"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-neon-purple/20 text-neon-purple border border-neon-purple/50 px-4 py-2 rounded-lg hover:bg-neon-purple/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button - Removed initial scale animation for instant visibility */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-5 right-5 z-[10000] w-14 h-14 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue border border-white/20 flex items-center justify-center text-white shadow-[0_0_20px_rgba(188,19,254,0.5)] hover:shadow-[0_0_30px_rgba(188,19,254,0.8)] transition-all"
            >
                {isOpen ? (
                    <IoClose size={24} />
                ) : (
                    <FaRobot size={24} className="animate-pulse" />
                )}
            </motion.button>
        </>,
        document.body
    );
};

export default AIChat;
