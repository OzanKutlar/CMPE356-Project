import React, { useState } from "react";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: "bot", text: "Hello! How can I help you?" }]);
  const [input, setInput] = useState("");

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = () => {
    if (input.trim() === "") return;
    
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    // Simple bot response (Replace with API call for AI responses)
    setTimeout(() => {
      setMessages([...newMessages, { sender: "bot", text: "I'm just a basic chatbot for now!" }]);
    }, 1000);
  };

  return (
    <div>
      <button onClick={toggleChat} style={styles.chatButton}>
        💬
      </button>

      {isOpen && (
        <div style={styles.chatContainer}>
          <div style={styles.chatHeader}>
            <span>Chatbot</span>
            <button onClick={toggleChat} style={styles.closeButton}>✖</button>
          </div>
          <div style={styles.chatBody}>
            {messages.map((msg, index) => (
              <div key={index} style={msg.sender === "user" ? styles.userMessage : styles.botMessage}>
                {msg.text}
              </div>
            ))}
          </div>
          <div style={styles.chatFooter}>
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              style={styles.input}
            />
            <button onClick={sendMessage} style={styles.sendButton}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  chatButton: {
    position: "fixed", bottom: "20px", right: "20px",
    backgroundColor: "#007bff", color: "#fff", border: "none",
    padding: "10px 15px", borderRadius: "50%", fontSize: "18px",
    cursor: "pointer"
  },
  chatContainer: {
    position: "fixed", bottom: "80px", right: "20px",
    width: "300px", backgroundColor: "#fff", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
    borderRadius: "10px", overflow: "hidden", display: "flex", flexDirection: "column"
  },
  chatHeader: {
    backgroundColor: "#007bff", color: "#fff", padding: "10px",
    display: "flex", justifyContent: "space-between", alignItems: "center"
  },
  closeButton: {
    background: "none", border: "none", color: "#fff", fontSize: "16px",
    cursor: "pointer"
  },
  chatBody: {
    padding: "10px", height: "200px", overflowY: "auto",
    display: "flex", flexDirection: "column", gap: "5px"
  },
  userMessage: {
    alignSelf: "flex-end", backgroundColor: "#007bff", color: "#fff",
    padding: "8px", borderRadius: "10px", maxWidth: "70%"
  },
  botMessage: {
    alignSelf: "flex-start", backgroundColor: "#eee", color: "#000",
    padding: "8px", borderRadius: "10px", maxWidth: "70%"
  },
  chatFooter: {
    display: "flex", padding: "10px", borderTop: "1px solid #ddd"
  },
  input: {
    flex: 1, padding: "8px", border: "1px solid #ddd", borderRadius: "5px"
  },
  sendButton: {
    marginLeft: "5px", backgroundColor: "#007bff", color: "#fff",
    border: "none", padding: "8px", borderRadius: "5px", cursor: "pointer"
  }
};

export default Chatbot;
