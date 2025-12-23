import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
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

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-5 right-5 z-[9999] w-14 h-14 rounded-full bg-neon-purple/20 border border-neon-purple backdrop-blur-md flex items-center justify-center text-white shadow-[0_0_15px_rgba(188,19,254,0.3)] hover:shadow-[0_0_25px_rgba(188,19,254,0.6)] transition-all"
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 z-50 w-[350px] md:w-[400px] h-[500px] bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="font-bold text-white tracking-wide">AI_ASSISTANT v1.0</span>
                            </div>
                            <span className="text-xs text-neon-purple border border-neon-purple/30 px-2 py-0.5 rounded">GEMINI 2.5 FLASH</span>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-neon-blue/20 border border-neon-blue/30 text-white rounded-br-none' 
                                            : 'bg-white/10 text-gray-200 rounded-bl-none'
                                    }`}>
                                        {msg.role === 'model' ? (
                                             <ReactMarkdown 
                                                components={{
                                                    strong: ({node, ...props}) => <span className="text-neon-pink font-bold" {...props} />,
                                                    ul: ({node, ...props}) => <ul className="list-disc pl-4 mt-2 mb-2" {...props} />,
                                                    li: ({node, ...props}) => <li className="mb-1" {...props} />
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
                                    placeholder="Ask about projects, stack..."
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
        </>
    );
};

export default AIChat;
