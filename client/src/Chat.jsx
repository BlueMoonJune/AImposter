import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Chat.css";
import "./Vote.css";

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

var init = false;

var won = "";

const Vote = () => {
  const [update, setUpdate] = useState(false)

  const handleAI = () => {
    sock.send(JSON.stringify({type: "vote", vote: "AI"}));
    setTimeout(() => setUpdate((prev) => !prev), 2000);
  }

  const handleHuman = () => {
    sock.send(JSON.stringify({type: "vote", vote: "Human"}));
    setTimeout(() => setUpdate((prev) => !prev), 2000);
  }

  return (
    <div className="guess-container">
      <h1 className="login-header">So, was it an AI or a Human?</h1>
      <div className="guess-buttons">
        <button className="vote-button" onClick={handleAI}>AI</button>
        <p className="guess-or">or</p>
        <button className="vote-button" onClick={handleHuman}>Human</button>
      </div>
      {won.length !== 0 && (
        <p className="guess-won-display">
          You were {won}!
        </p>
      )}
    </div>
  );
}

const Chat = () => {

  const navigate = useNavigate();


  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [vote, setVote] = useState(false);
  const [timer, setTimer] = useState(60);
  const timerRef = useRef(timer);

  if (!init) {
    sock.addEventListener("message", (event) => {
      var json = event.data
      console.log(json);
      var data = JSON.parse(json);
      if (data.type == "message") {
        setMessages((prev) => [...prev, {text: data.text, isYou: false }]);
      } else if (data.type == "start") {
        setMessages([]);
        started = true;
        setVote(false);
        setTimer((prev) => 60);
        const interval = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setVote(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (data.type == "result") {
        won = data.result ? "correct" : "wrong";
        console.log(won);
      }
    });
    init = true;
  }

  useEffect(() => {
    timerRef.current = timer;
  }, [timer]);

  const sendMessage = () => {
    if (input.trim() === "")
      return;

    setMessages((prev) => [...prev, { text: input, isYou: true }]);
    sock.send(JSON.stringify({type: "message", text: input}))
    setInput("");
  };

  if (started && !vote) {
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
  } else if (!started && !vote) {
    return (
        <p className="wait-for-host">Please wait for host to start.</p>
    );
  } else {
    return (
      <Vote />
    );
  }
}

export default Chat;
