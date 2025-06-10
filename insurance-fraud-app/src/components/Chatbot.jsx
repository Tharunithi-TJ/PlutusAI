import React, { useState, useRef } from 'react';
// If you have react-icons installed, you can use: import { FaRobot } from 'react-icons/fa';

const ROBOT_ICON = (
  <span style={{ fontSize: 28, display: 'inline-block' }} role="img" aria-label="robot">🤖</span>
);

const Chatbot = ({ sectionLabel, diagramLabels }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! Ask me about the metrics or diagrams you see on this page.' }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Scroll to bottom on new message
  React.useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Compose context for Gemini
  const getContext = () => {
    return `Current section: ${sectionLabel}.\nDiagrams rendered: ${diagramLabels.join(', ')}.`;
  };

  // Placeholder Gemini API call
  const callGemini = async (userMessage) => {
    setLoading(true);
    const GEMINI_API_KEY = 'AIzaSyCPx36Gl4Kg6cjAr90QBQLaIx7FccU4IHQ';
    const context = getContext();
    const prompt = `Context: ${context}\nUser question: ${userMessage}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ]
          })
        }
      );
      const data = await response.json();
      console.log(data); // For debugging
      let answer = '';
      if (
        data &&
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] &&
        data.candidates[0].content.parts[0].text
      ) {
        answer = data.candidates[0].content.parts[0].text;
      } else if (data.error && data.error.message) {
        answer = `Gemini API error: ${data.error.message}`;
      } else {
        answer = "Sorry, I couldn't get a response from Gemini.";
      }
      setLoading(false);
      return answer;
    } catch (err) {
      setLoading(false);
      return "Sorry, there was an error connecting to Gemini.";
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(msgs => [...msgs, { sender: 'user', text: userMsg }]);
    setInput('');
    const botReply = await callGemini(userMsg);
    setMessages(msgs => [...msgs, { sender: 'bot', text: botReply }]);
  };

  return (
    <>
      {/* Floating Robot Button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1000,
          background: '#2980b9',
          color: '#fff',
          border: 'none',
          borderRadius: '50%',
          width: 56,
          height: 56,
          boxShadow: '0 4px 16px rgba(41,128,185,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 28,
        }}
        aria-label="Open chatbot"
      >
        {ROBOT_ICON}
      </button>
      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 100,
            right: 32,
            width: 340,
            maxHeight: 480,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(41,128,185,0.18)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ background: '#2980b9', color: '#fff', padding: '1rem', fontWeight: 600, fontSize: '1.1rem' }}>
            <span style={{ marginRight: 8 }}>{ROBOT_ICON}</span> Analytics Chatbot
            <button onClick={() => setOpen(false)} style={{ float: 'right', background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>&times;</button>
          </div>
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#f8fafd' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ marginBottom: 12, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                <div
                  style={{
                    display: 'inline-block',
                    background: msg.sender === 'user' ? '#eaf1fb' : '#e8f6ff',
                    color: '#222',
                    borderRadius: 12,
                    padding: '8px 14px',
                    maxWidth: '80%',
                    fontSize: '1rem',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={{ padding: '0.75rem', borderTop: '1px solid #eee', background: '#f8fafd' }}>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              style={{ display: 'flex', gap: 8 }}
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about these diagrams..."
                style={{ flex: 1, borderRadius: 8, border: '1px solid #ccc', padding: '8px 12px', fontSize: '1rem' }}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{ background: '#2980b9', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}
              >
                {loading ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot; 