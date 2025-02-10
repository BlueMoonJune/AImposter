import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Chat.css";

console.log("test")
var sock = new WebSocket("ws://127.0.0.1:8080");

sock.addEventListener("open", (event) => {
  console.log("connected")
});

sock.addEventListener("message", (event) => {
  const data = event.data;
  const deliminator = data.indexOf(":");

  if (deliminator !== -1) {
    const timerData = Number(data.substring(0, deliminator));
    setTimer(timerData);

    const newMessage = data.substring(deliminator + 1).trim();
    setMessages((prev) => [...prev, { text: newMessage, isYou: false }]);
  } else {
    console.warn("Invalid message format: ", data);
  }
});

const Chat = () => {
  const naviagate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [timer, setTimer] = useState(60);
  
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => Math.max(0, prev-1));
      }, 1000);

      return () => clearInterval(interval);
    } else {
      naviagate("/vote");
    }
  }, [timer]);

  const sendMessage = () => {
    if (input.trim() === "")
      return;

    setMessages((prev) => [...prev, { text: input, isYou: true }]);
    setInput("");
  };

  return (
    <div className="chat-container">
      <h1 className="chat-timer-display">Time left: {timer}</h1>
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
