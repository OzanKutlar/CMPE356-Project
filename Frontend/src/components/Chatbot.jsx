import React, { useState } from "react";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: "bot", text: "Hello! How can I help you?" }]);
  const [input, setInput] = useState("");

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = () => {
    if (input.trim() === "") return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    const response = getBotResponse(input);
    setTimeout(() => {
      setMessages([...newMessages, { sender: "bot", text: response }]);
    }, 1000);
  };

  const getBotResponse = (userInput) => {
    const lowerCaseInput = userInput.toLowerCase();

    if (lowerCaseInput.includes("types of meat") || lowerCaseInput.includes("what meats do you have")) {
      return "We offer a variety of meats including beef, pork, chicken, lamb, and specialty cuts like wagyu beef and organic chicken.";
    }

    if (lowerCaseInput.includes("order") || lowerCaseInput.includes("when will my order arrive")) {
      return "You can track your order by going to the 'Order List' section on your account page. Delivery times depend on your location, but typically, we deliver within 1-2 days.";
    }

    if (lowerCaseInput.includes("customize cuts") || lowerCaseInput.includes("custom butcher services")) {
      return "Yes, we offer custom cuts. You can request your preferred cuts while placing an order or contact us directly through the 'Contact Us' section for special requests.";
    }

    if (lowerCaseInput.includes("pricing") || lowerCaseInput.includes("how much is")) {
      return "Our prices vary by product and weight. You can check the prices directly on our website, or if you're looking for something specific, feel free to ask!";
    }

    if (lowerCaseInput.includes("delivery") || lowerCaseInput.includes("shipping")) {
      return "We offer delivery services to most regions. Check the 'Delivery Page' for more details, including fees and time estimates.";
    }

    return "I'm sorry, I didn't quite understand that. Could you please rephrase or check out our FAQ section for more help?";
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
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask me anything about our meats!"
              style={styles.input}
            />
            <button onClick={handleSendMessage} style={styles.sendButton}>Send</button>
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
