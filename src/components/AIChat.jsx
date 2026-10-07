import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FaRobot } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import reposData from '../data/repos.json';
import experienceData from '../data/experience.json';
import './AIChat.css';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDD_EwrouoL7zwyFvOOaBPkgQFDoVrAR-4";
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const CANDIDATE_MODELS = ["gemini-2.5-flash", "gemini-1.5-flash"];

async function callOpenRouterFallback(systemPrompt, cleanHistory, textToSend) {
    if (!OPENROUTER_API_KEY) {
        throw new Error("No OpenRouter API key configured.");
    }

    const messages = [
        { role: "system", content: systemPrompt },
        ...cleanHistory.map(m => ({
            role: m.role === 'model' ? 'assistant' : 'user',
            content: m.parts ? m.parts[0].text : m.text
        })),
        { role: "user", content: textToSend }
    ];

    const models = [
        "openrouter/auto",
        "google/gemini-2.0-flash-lite-preview-02-05:free",
        "meta-llama/llama-3.3-70b-instruct:free"
    ];

    let lastError = null;
    for (const model of models) {
        try {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://jxoesneon.github.io/",
                    "X-Title": "jxoesneon portfolio"
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages
                })
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`OpenRouter ${res.status}: ${errText}`);
            }

            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content;
            if (reply) return { text: reply, modelName: model };
        } catch (e) {
            lastError = e;
            console.warn(`OpenRouter model ${model} failed:`, e.message);
        }
    }
    throw lastError || new Error("All OpenRouter fallback models exhausted.");
}

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
- **Career History:** When asked about experience or background, **ALWAYS summarize the key roles and projects from the Context provided above first.** Only provide the LinkedIn link *after* giving a substantive answer.
- **Contact:** Direct queries to email (concept@jxoesneon.com) or LinkedIn.
- **Links:** ALWAYS use Markdown format for links: \`[Link Text](URL)\`.
  - LinkedIn: [Jose's LinkedIn Profile](https://www.linkedin.com/in/jose-eduardo-rojas-jiménez-0a8284b1/)
  - GitHub: [jxoesneon on GitHub](https://github.com/jxoesneon)
  - GitHub Sponsors: [Sponsor on GitHub](https://github.com/sponsors/jxoesneon)
  - Ko-fi: [Support on Ko-fi](https://ko-fi.com/jxoesneon)
- **Sponsorship & Donations:** If the user asks how to sponsor, support, donate, or fund Jose's open-source engineering, warmly guide them to his GitHub Sponsors and Ko-fi links.
- If asked about a specific project not listed, say you don't have details on that one.
- Keep responses concise but informative.
- STAY IN CHARACTER: You are part of the digital interface of this site.
`;

const THINKING_STEPS = [
    "Systems online...",
    "Accessing decentralized nodes...",
    "Verifying knowledge graph...",
    "Querying IPFS...",
    "Syncing with Gemini...",
    "Parsing context...",
    "Decrypting creative axioms...",
    "Triangulating semantic vectors...",
    "Handshaking with MCP relays...",
    "Fetching neural patterns...",
    "Optimizing data density...",
    "Re-routing through FerroTeX...",
    "Validating P2P checksums...",
    "Engaging creative subroutines...",
    "Synthesizing ecosystem data...",
    "Analyzing graph connections...",
    "Establishing secure link...",
    "Updating local cache..."
];

const RETRY_MESSAGES = [
    "Traffic high. Re-routing via auxiliary nodes...",
    "Signal congested. Compressing context stream...",
    "Network busy. Switching to backup relay...",
    "Requesting priority channel access...",
    "Cooling down neural pathways...",
    "Modulating frequency for clearer signal...",
    "Bypassing congested data lanes..."
];

const AIChat = ({ focusedProject }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: "Systems online. Ask me anything about Jose's work or the MCP ecosystem." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [activeModel, setActiveModel] = useState('Online • Gemini 2.5 Flash');
    const messagesEndRef = useRef(null);

    // Update SYSTEM_PROMPT dynamically if focusedProject changes
    const systemPrompt = React.useMemo(() => {
        let prompt = SYSTEM_PROMPT;
        if (focusedProject) {
            prompt += `\n\n**Current Context:** The user is currently looking at the project "${focusedProject.name}".\nDescription: ${focusedProject.description || "No description."}\nIf they ask a general question, you may subtly mention this project.`;
        }
        return prompt;
    }, [focusedProject]);

    // Thinking animation effect
    useEffect(() => {
        let interval;
        if (isLoading) {
            setLoadingStatus(THINKING_STEPS[0]);
            let index = 1;
            interval = setInterval(() => {
                setLoadingStatus(THINKING_STEPS[index % THINKING_STEPS.length]);
                index++;
            }, 2000);
        } else {
            setLoadingStatus('');
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleSend = async (manualInput = null) => {
        const textToSend = manualInput || input;
        if (!textToSend.trim() || isLoading) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
        setIsLoading(true);

        // Core multi-tiered AI dispatcher (Gemini primary -> OpenRouter auto/free fallback)
        const callAI = async (contextLimit = 10) => {
            // Build clean history excluding system error messages
            const cleanHistory = [];
            const previousMessages = messages.slice(1).slice(-contextLimit);
            previousMessages.forEach(msg => {
                if (msg.text && !msg.text.startsWith("Error:") && !msg.text.startsWith("My neural link") && !msg.text.startsWith("Notice:")) {
                    cleanHistory.push({
                        role: msg.role === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.text }]
                    });
                }
            });

            let geminiError = null;

            // Tier 1: Google Gemini (Direct API)
            if (GEMINI_API_KEY) {
                const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
                for (const modelName of CANDIDATE_MODELS) {
                    try {
                        const model = genAI.getGenerativeModel({
                            model: modelName,
                            systemInstruction: systemPrompt
                        });

                        const chat = model.startChat({ history: cleanHistory });
                        const result = await chat.sendMessage(textToSend);
                        setActiveModel(`Online • Gemini 2.5 Flash`);
                        return result.response.text();
                    } catch (error) {
                        geminiError = error;
                        console.warn(`Gemini (${modelName}) failed:`, error.message);
                        if (error.message?.includes('404') || error.message?.includes('not found')) {
                            continue;
                        }
                        // Quota/referer/network error: proceed to OpenRouter fallback
                        break;
                    }
                }
            }

            // Tier 2: OpenRouter (Auto / Free models fallback)
            console.warn("Primary Gemini model unavailable or blocked. Engaging OpenRouter fallback relay...");
            setLoadingStatus("Connecting via OpenRouter fallback relay...");

            try {
                const openRouterRes = await callOpenRouterFallback(systemPrompt, cleanHistory, textToSend);
                setActiveModel(`Online • OpenRouter (${openRouterRes.modelName.includes('free') ? 'Free' : 'Auto'})`);
                return openRouterRes.text;
            } catch (openRouterError) {
                console.error("OpenRouter fallback also failed:", openRouterError);
                throw geminiError || openRouterError;
            }
        };

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const response = await callAI(10);
            
            // STREAMING EFFECT
            setMessages(prev => [...prev, { role: 'model', text: '' }]);
            
            const streamText = async (text) => {
                const chunkSize = 3;
                for (let i = 0; i < text.length; i += chunkSize) {
                    const chunk = text.slice(i, i + chunkSize);
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        const lastMsgIndex = newMsgs.length - 1;
                        if (lastMsgIndex >= 0) {
                            newMsgs[lastMsgIndex] = {
                                ...newMsgs[lastMsgIndex],
                                text: newMsgs[lastMsgIndex].text + chunk
                            };
                        }
                        return newMsgs;
                    });
                    await new Promise(resolve => setTimeout(resolve, 15));
                }
            };

            await streamText(response);

        } catch (error) {
            console.error("AI Error:", error);
            let errorMessage = "Error: Connection interrupted. Please try again.";
            const errMsg = error.message || '';
            const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

            if (errMsg.includes('API_KEY_HTTP_REFERRER_BLOCKED') || (errMsg.includes('403') && isLocal)) {
                errorMessage = "Notice: The production Gemini API key has an HTTP Referrer restriction set to https://jxoesneon.github.io. Localhost access is blocked by Google Cloud origin policy, but it operates normally on the live deployment.";
            } else if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
                errorMessage = "My neural link is currently at max capacity with incoming signals! 🧠✨ \n\nWhile I re-calibrate my processors, I invite you to explore the [Experience Timeline](#experience) or check out the full source code on [GitHub](https://github.com/jxoesneon).";
            } else if (errMsg.includes('503') || errMsg.includes('Service Unavailable')) {
                errorMessage = "The AI network is temporarily experiencing high latency. Please retry your message in a few moments.";
            }

            setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
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
                                    <span style={{ fontSize: '12px', color: 'var(--neon-blue)' }}>{activeModel}</span>
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
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    strong: ({node: _node, ...props}) => <strong {...props} />,
                                                    ul: ({node: _node, ...props}) => <ul {...props} />,
                                                    li: ({node: _node, ...props}) => <li {...props} />,
                                                    a: ({node: _node, ...props}) => <a target="_blank" rel="noopener noreferrer" {...props} />
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
                            
                            {/* Loading Indicator with Dynamic Text */}
                            {isLoading && (
                                <div className="message-row ai">
                                    <div style={{ flexShrink: 0, marginTop: '4px' }}>
                                        <div className="chat-avatar" style={{ width: 28, height: 28 }}>
                                            <FaRobot size={12} style={{ color: 'var(--neon-purple)' }} />
                                        </div>
                                    </div>
                                    <div className="message-bubble ai" style={{ fontStyle: 'italic', color: 'var(--neon-blue)', fontSize: '0.85rem' }}>
                                        {loadingStatus}
                                        <span className="typing-dots">...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="chat-input-area">
                            {/* Quick Chips */}
                            {!isLoading && (
                                <div className="chat-chips">
                                    {["Tell me about MCP", "Who is Jose?", "What is FerroTeX?", "Contact Info"].map((chip) => (
                                        <button 
                                            key={chip} 
                                            className="chat-chip"
                                            onClick={() => handleSend(chip)}
                                        >
                                            {chip}
                                        </button>
                                    ))}
                                </div>
                            )}

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
