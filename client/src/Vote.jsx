import "./Vote.css";
import { useState } from "react";
import { sock } from "./Chat.jsx";

const Vote = () => {
  const [isAi, setIsAi] = useState(false);
  const [won, setWon] = useState("");

  const handleAI = () => {
    sock.send("Vote: AI");
  }

  const handleHuman = () => {
    sock.send("Vote: Human");
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
          You {won}, it was {isAi ? "an AI" : "a Human"}.
        </p>
      )}
    </div>
  );
}

export default Vote;
