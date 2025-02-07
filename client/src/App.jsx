import { useState } from "react";
import "./App.css"

function App() {
  const [username, setUsername] = useState("");

  return (
    <div className="login-container">
      <h1 className="login-header">Welcome to AI or Not</h1>
      <p className="login-subheader">You will be paired with a fellow student, or will you? Vsauce, Micheal here</p>
      <button className="login-play-button">Play!</button>
    </div>
  )
}

export default App;
