import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import chatbotMessages from "../Chatbot/PredefinedMessages";
import chatbotIcon from "../../assets/assistant.png";
import assistantAvatar from "../../assets/assistant.png";
import { X, Send, User } from "lucide-react"; // Changed from FaTimes, FaPaperPlane, FaUser
import { motion } from "framer-motion";
import "./Chatbot.css";

function Chatbot() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getResponse = async (input) => {
    const message = chatbotMessages.find(
      (msg) => msg.prompt === input
    )?.message;

    if (message) {
      return message;
    }

    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDWQZtv7gdNiT5yLMjyzpEQUeoYeAMaJuY`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: input }] }],
        },
      });
      return (
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        chatbotMessages["default"]
      );
    } catch (error) {
      console.error("Error fetching response:", error);
      return "Sorry, I'm having trouble responding right now.";
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, fromUser: true, time: getCurrentTime() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    setIsTyping(true);
    setTimeout(async () => {
      setIsTyping(false);

      const botResponseText = await getResponse(input);
      const botResponse = {
        text: botResponseText,
        fromUser: false,
        time: getCurrentTime(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setLoading(false);
    }, 2000);
  };

  //auto scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const capitalize = (str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <>
      {!isChatbotOpen && (
        <motion.div
          onClick={() => setIsChatbotOpen(true)}
          className="chatbot-icon-container"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <img
            src={chatbotIcon}
            alt="Chat Icon"
            className="chatbot-icon"
          />
        </motion.div>
      )}

      <div
        className={`chatbot-container ${isChatbotOpen ? "open" : "closed"}`}
      >
        <div className="chatbot-header">
          <div className="chatbot-header-content">
            <img
              src={assistantAvatar}
              alt="Chatbot"
              className="chatbot-avatar"
            />
            <h2 className="chatbot-title"> "AIRI" virtual assistant</h2>
          </div>
          <button
            onClick={() => setIsChatbotOpen(false)}
            className="chatbot-close-button"
          >
            <X size={20} /> {/* Changed from FaTimes */}
          </button>
        </div>

        <div className="chatbot-messages">
          <div className="chatbot-welcome-message">
            <span className="chatbot-welcome-text">
              💬 How can we help you today?
            </span>
          </div>
          <div className="chatbot-intro-message">
            <motion.p
              className="chatbot-intro-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
            >
              <span role="img" aria-label="wave" className="chatbot-wave">
                👋
              </span>
              Hi there! I'm AIRI your virtual assistant. Let me know if you have any
              questions!
            </motion.p>
            <button className="chatbot-chat-button">
              Chat with us
            </button>
          </div>

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chatbot-message ${msg.fromUser ? "user" : "bot"}`}
            >
              <User className="chatbot-user-icon" size={20} /> {/* Changed from FaUser */}
              <div className="chatbot-message-content">
                {msg.image ? (
                  <img src={msg.image} alt="Uploaded" />
                ) : (
                  <p className="chatbot-message-text">{msg.text}</p>
                )}
                <p className="chatbot-message-time">{msg.time}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="chatbot-loading">
              <span>Typing...</span>
            </div>
          )}
          {/* Scroll to the last message */}
          <div ref={messagesEndRef}></div>
        </div>

        <div className="chatbot-input-container">
          <input
            type="text"
            placeholder="Start a new message..."
            value={input}
            onChange={(e) => setInput(capitalize(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="chatbot-input"
          />
          <button
            onClick={handleSend}
            className="chatbot-send-button"
          >
            <Send size={20} /> {/* Changed from FaPaperPlane */}
          </button>
        </div>
      </div>
    </>
  );
}

export default Chatbot;