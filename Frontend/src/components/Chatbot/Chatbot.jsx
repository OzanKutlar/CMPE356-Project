import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import Util from "../../Util.js";

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'bot', content: 'Hello! How can I help you today?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const chatBoxRef = useRef(null);
    const timeoutRef = useRef(null);
    const messagesEndRef = useRef(null);

    const toggleChat = () => {
        if (isOpen) {
            // Start close animation
            setIsAnimatingOut(true);
            setTimeout(() => {
                setIsOpen(false);
                setIsAnimatingOut(false);
            }, 300); // Match this to the CSS animation duration
        } else {
            setIsOpen(true);
        }
    };

    const handleMouseLeave = () => {
        if (isOpen && !isAnimatingOut) {
            // Set a timeout to close the chat after 2 seconds
            timeoutRef.current = setTimeout(() => {
                // Start close animation
                setIsAnimatingOut(true);
                setTimeout(() => {
                    setIsOpen(false);
                    setIsAnimatingOut(false);
                }, 300); // Match this to the CSS animation duration
            }, 2000);
        }
    };

    const handleMouseEnter = () => {
        // Clear the timeout if mouse enters back before 2 seconds
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Add user message to chat
        const newMessage = { role: 'user', content: message };
        const updatedHistory = [...chatHistory, newMessage];
        setChatHistory(updatedHistory);
        setMessage('');
        setIsLoading(true);

        try {
            const data = await Util.callBackend("chatbot/ask", {}, {
                history: updatedHistory,
                message: message
            });


            if (data.msg === "success") {
                setChatHistory([...updatedHistory, {
                    role: 'bot',
                    content: data.message
                }]);
            } else {
                Util.CallGeneric("ChatBot Disconnected", "Error");
                setIsAnimatingOut(true);
                setTimeout(() => {
                    setIsOpen(false);
                    setIsAnimatingOut(false);
                }, 300);
            }
        } catch (error) {
            console.error("Error communicating with chatbot:", error);
            Util.CallGeneric("ChatBot Disconnected", "Error");
            // Start close animation
            setIsAnimatingOut(true);
            setTimeout(() => {
                setIsOpen(false);
                setIsAnimatingOut(false);
            }, 300);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-container fixed bottom-6 right-6 z-50">
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="chatbot-button bg-rose-500 hover:bg-rose-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
                    style={{
                        animation: 'chatbot-rock 1.5s ease-in-out infinite',
                        animationFillMode: 'both'
                    }}
                >
                    <MessageSquare size={24} />
                </button>
            )}

            {/* Chat Box */}
            {(isOpen || isAnimatingOut) && (
                <div
                    ref={chatBoxRef}
                    className="chatbot-box bg-white rounded-lg shadow-xl w-80 sm:w-96 flex flex-col"
                    style={{
                        height: '400px',
                        animation: isAnimatingOut
                            ? 'chatbot-slide-out 0.3s ease-in forwards'
                            : 'chatbot-slide-in 0.3s ease-out forwards'
                    }}
                    onMouseLeave={handleMouseLeave}
                    onMouseEnter={handleMouseEnter}
                >
                    {/* Chat Header */}
                    <div className="chatbot-header bg-rose-500 text-white p-3 rounded-t-lg flex justify-between items-center">
                        <h3 className="font-medium">Chat Assistant</h3>
                        <button
                            onClick={toggleChat}
                            className="chatbot-close-btn p-1 rounded-full hover:bg-rose-600"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="chatbot-messages flex-grow overflow-y-auto p-4 flex flex-col gap-3">
                        {chatHistory.map((msg, index) => (
                            <div
                                key={index}
                                className={`chatbot-message ${
                                    msg.role === 'user'
                                        ? 'chatbot-user-message bg-rose-100 self-end'
                                        : 'chatbot-bot-message bg-gray-100 self-start'
                                } p-3 rounded-lg max-w-3/4`}
                            >
                                {msg.content}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chatbot-message chatbot-bot-message bg-gray-100 self-start p-3 rounded-lg">
                <span className="chatbot-typing-indicator">
                  <span className="chatbot-dot"></span>
                  <span className="chatbot-dot"></span>
                  <span className="chatbot-dot"></span>
                </span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={sendMessage} className="chatbot-input-container border-t p-3 flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="chatbot-input flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !message.trim()}
                            className="chatbot-send-btn bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white p-2 rounded-md"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            <style jsx>{`
        @keyframes chatbot-rock {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes chatbot-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes chatbot-slide-out {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        
        .chatbot-typing-indicator {
          display: flex;
          gap: 2px;
        }
        
        .chatbot-dot {
          width: 6px;
          height: 6px;
          background-color: #6b7280;
          border-radius: 50%;
          animation: chatbot-typing 1.4s infinite ease-in-out;
        }
        
        .chatbot-dot:nth-child(1) {
          animation-delay: 0s;
        }
        
        .chatbot-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .chatbot-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes chatbot-typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
        </div>
    );
}