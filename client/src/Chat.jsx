import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Chat.css";

//sock.addEventListener("message", (event) => {
//  const data = event.data;
//  const deliminator = data.indexOf(":");
//
//  if (deliminator !== -1) {
//    const timerData = Number(data.substring(0, deliminator));
//    setTimer(timerData);
//
//    const newMessage = data.substring(deliminator + 1).trim();
//    setMessages((prev) => [...prev, { text: newMessage, isYou: false }]);
//  } else {
//    console.warn("Invalid message format: ", data);
//  }
//});
var url = window.location.origin
//console.log(url.substring(0, url.indexOf(":", 5)) + ":8080")
var sock = new WebSocket(url.substring(0, url.indexOf(":", 5)) + ":8080");

sock.addEventListener("connected", (event) => {
  console.log("connected")
});

var started = false;

var init = false


const Chat = () => {

  const navigate = useNavigate();


  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [timer, setTimer] = useState(5);

  if (!init) {
    sock.addEventListener("message", (event) => {
      var json = event.data
      console.log(json);
      var data = JSON.parse(json);
      if (data.type == "message") {
        setMessages((prev) => [...prev, {text: data.text, isYou: false }]);
      } else if (data.type == "start") {
        started = true;
      }
    });
    init = true;
  }

  useEffect(() => {
    setInterval(() => {
      setTimer((prev) => prev - 1)
      if (timer <= 0) {
        navigate("/vote");
      }
    }, 1000);
  }, [timer]);

  const sendMessage = () => {
    if (input.trim() === "")
      return;

    setMessages((prev) => [...prev, { text: input, isYou: true }]);
    sock.send(JSON.stringify({type: "message", text: input}))
    setInput("");
  };

  if (started) {
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
  } else {
    return (
        <p className="wait-for-host">Please wait for host to start.</p>
    );
  }
}

export default Chat;
