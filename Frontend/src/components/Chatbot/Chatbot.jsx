import React, { useState } from "react";
import "./Chatbot.css"; // Import the separate CSS file

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: "bot", text: "Hello! How can I help you?" }]);
  const [input, setInput] = useState("");

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

 const handleSendMessage = async () => {
  if (input.trim() === "") return;

  const newMessages = [...messages, { sender: "user", text: input }];
  setMessages(newMessages);
  setInput("");

  const response = await getBotResponse(input);
  setMessages([...newMessages, { sender: "bot", text: response }]);
};
//made it asynchoronous

  const getBotResponse = async (userInput) => {
  try {
    const response = await fetch("/api/chatbot/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userInput }),
    });

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("Error fetching bot response:", error);
    return "Oops! Something went wrong. Please try again later.";
  }
};
//replaced it with an API call

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
