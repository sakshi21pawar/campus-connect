import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import "../styles/theme.css";
import "../styles/AIAssistant.css";

const SUGGESTED_QUESTIONS = [
  { icon: "fa-briefcase",    text: "How do I prepare for placements in 3rd year?" },
  { icon: "fa-code",         text: "Best resources to learn DSA?" },
  { icon: "fa-file-lines",   text: "Tips for writing a good resume?" },
  { icon: "fa-graduation-cap", text: "How does KT/backlog system work?" },
  { icon: "fa-calendar-check", text: "How to improve low attendance?" },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const sendMessage = async (text) => {
    const userMessage = text || input.trim();
    if (!userMessage) return;

    const updatedMessages = [...messages, { role: "user", text: userMessage }];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

      const res = await axiosInstance.post("/ai/chat", { message: userMessage, history });
      setMessages([...updatedMessages, { role: "model", text: res.data.reply }]);
    } catch (err) {
      setMessages([...updatedMessages, { role: "model", text: "Sorry, something went wrong. Please try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <Navbar />

      <div className="ai-body">

        {/* Header */}
        <div className="ai-header">
          <div className="ai-header-icon">
            <i className="fa-solid fa-robot"></i>
          </div>
          <h2>CampusBot</h2>
          <p>Ask me anything about placements, study tips, or campus life</p>
        </div>

        {/* Suggested questions — only when no messages */}
        {messages.length === 0 && (
          <div className="ai-suggestions">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button key={i} className="ai-suggestion-btn" onClick={() => sendMessage(q.text)}>
                <i className={`fa-solid ${q.icon}`}></i>
                {q.text}
              </button>
            ))}
          </div>
        )}

        {/* Chat window */}
        <div className="ai-chat-window">
          {messages.length === 0 && (
            <div className="ai-empty-state">
              <i className="fa-solid fa-comments"></i>
              Start by typing a question or click a suggestion above
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`ai-msg ${msg.role === 'user' ? 'ai-msg-user' : 'ai-msg-bot'}`}>
              <div className="ai-msg-label">
                {msg.role === 'user'
                  ? <><i className="fa-solid fa-user"></i> You</>
                  : <><i className="fa-solid fa-robot"></i> CampusBot</>
                }
              </div>
              <div className={msg.role === 'user' ? 'ai-bubble-user' : 'ai-bubble-bot'}>
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="ai-typing">
              <i className="fa-solid fa-spinner fa-spin"></i>
              CampusBot is thinking...
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="ai-input-area">
          <input
            className="ai-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about placements, DSA, campus life..."
          />
          <button
            className="ai-send-btn"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            <i className="fa-solid fa-paper-plane"></i>
            Send
          </button>
        </div>

      </div>
      <Footer />
    </div>
  );
}
