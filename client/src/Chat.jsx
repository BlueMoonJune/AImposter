import { useState, useEffect } from "react";
import "./Chat.css";

console.log("test")
var sock = new WebSocket("ws://127.0.0.1:8080");

sock.addEventListener("open", (event) => {
  console.log("connected")
});


const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    sock.addEventListener("message", (event) => {
      event.data.text().then((text) => {
        console.log(messages);
          setMessages((prev) => {
            console.log(prev)
            if (prev.length == 0 || prev[prev.length-1].text != text)
              return [...prev, { text, isYou: false }]
          })
      });
    });

  }, []);

  const sendMessage = () => {
    if (input.trim() === "")
      return;

    setMessages((prev) => [...prev, { text: input, isYou: true }]);
    sock.send(input)
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
