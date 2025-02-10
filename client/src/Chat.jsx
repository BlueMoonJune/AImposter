import { useState, useEffect } from "react";
import "./Chat.css";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    setMessages([{text:"Test from other", isYou:false},{text:"From me test",isYou:true}]);
  }, []);

  const sendMessage = () => {
    if (input.trim() === "") 
      return;

    setMessages((prev) => [...prev, { text: input, isYou: true }]);
    setInput("");
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.isYou ? "message-you" : "message-other"}`}
          >{msg.text}</div>
        ))}
      </div>
      <div className="input-container">
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <button className="chat-button" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
