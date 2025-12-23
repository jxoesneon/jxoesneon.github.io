import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { FaRobot } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import reposData from '../data/repos.json';
import experienceData from '../data/experience.json';
import './AIChat.css';

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
                        className="chat-tooltip"
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
                        className="chat-window"
                    >
                        {/* Header */}
                        <div className="chat-header">
                            <div className="chat-header-user">
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                
                                <div style={{ position: 'relative' }}>
                                    <div className="chat-avatar">
                                        <FaRobot size={18} className="text-white" />
                                    </div>
                                    <div style={{ position: 'absolute', bottom: 0, right: 0 }} className="chat-status-dot" />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>AI Assistant</span>
                                    <span style={{ fontSize: '12px', color: 'var(--neon-blue)' }}>Online • Gemini 2.5 Flash</span>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="chat-messages">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`message-row ${msg.role === 'user' ? 'user' : 'ai'}`}>
                                    {/* Avatar */}
                                    <div style={{ flexShrink: 0, marginTop: '4px' }}>
                                        {msg.role === 'model' ? (
                                            <div className="chat-avatar" style={{ width: 28, height: 28 }}>
                                                <FaRobot size={12} style={{ color: 'var(--neon-purple)' }} />
                                            </div>
                                        ) : (
                                            <div style={{ 
                                                width: 28, height: 28, borderRadius: '50%', 
                                                background: 'rgba(0, 243, 255, 0.1)', border: '1px solid rgba(0, 243, 255, 0.2)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <svg width="14" height="14" style={{ color: 'var(--neon-blue)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bubble */}
                                    <div className={`message-bubble ${msg.role === 'user' ? 'user' : 'ai'} markdown-content`}>
                                        {msg.role === 'model' ? (
                                             <ReactMarkdown 
                                                components={{
                                                    strong: ({node, ...props}) => <strong {...props} />,
                                                    ul: ({node, ...props}) => <ul {...props} />,
                                                    li: ({node, ...props}) => <li {...props} />,
                                                    a: ({node, ...props}) => <a target="_blank" {...props} />
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
                        <div className="chat-input-area">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="chat-input-wrapper"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about projects..."
                                    className="chat-input"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="chat-send-btn"
                                >
                                    {isLoading ? (
                                        <div style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                    ) : (
                                        <svg width="20" height="20" transform="rotate(90)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="chat-fab"
            >
                {isOpen ? (
                    <IoClose size={24} />
                ) : (
                    <FaRobot size={24} /> // removed animate-pulse to avoid conflict/overhead
                )}
            </motion.button>
        </>,
        document.body
    );
};

export default AIChat;
