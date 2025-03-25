import React, { useState } from "react";
import "./Chatbot.css"; // Import the separate CSS file

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
      <button onClick={toggleChat} className="cowButton">
        🐄
      </button>

      {isOpen && (
        <div className="chatContainer">
          <div className="chatHeader">
            <span>Chatbot</span>
            <button onClick={toggleChat} className="closeButton">✖</button>
          </div>
          <div className="chatBody">
            {messages.map((msg, index) => (
              <div key={index} className={msg.sender === "user" ? "userMessage" : "botMessage"}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chatFooter">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask me anything about our meats!"
              className="input"
            />
            <button onClick={handleSendMessage} className="sendButton">Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
