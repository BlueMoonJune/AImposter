import "./Vote.css";
import { useNavigate } from "react-router-dom";

const Vote = () => {
  const navigate = useNavigate();

  return (
    <div className="vote-container">
      <h1 className="login-header">So, Was it an AI or a Human?</h1>
      <div className="vote-input">
        <button className="chat-button" onClick={() => { navigate("/"); }}>AI</button>
        <p className="vote-or">or</p>
        <button className="chat-button" onClick={() => { navigate("/"); }}>Human</button>
      </div>
    </div>
  );
}

export default Vote;
