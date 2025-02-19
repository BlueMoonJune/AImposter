const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const fs = require("fs");
const WebSocket = require('ws');
const readline = require('node:readline');

const app = express();
const ws = new WebSocket.Server({ port: 8080 });

const apiKey = fs.readFileSync("deepseekkey.txt", "utf-8");
const apiUrl = "https://api.deepseek.com/v1/chat/completions";

const data = {
  model: "deepseek-chat",
  messages: [{ role: "system", content: "You are just a chill high schooler" }],
};

const getAIMessage = (message) => {
  data.messages.push({ role: "user", content: message });
  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Deepseek Error: ${response.status}`);
    }
    return response.json();
  })
  .then(responseData => {
    return responseData.choices[0].message.content;
  })
  .catch(error => {
    console.error("Deepseek Error:", error);
  });
}

var sockets = [];

var pairings = {};

ws.on('connection', ws => {
  console.log('Client connected');
  sockets.push(ws);

  console.log(getAIMessage("What's up my skibidi sigma!"));

  ws.on('message', message => {
    console.log(`Received: ${message}`);
    for (const i in sockets) {
      if (sockets[i] != ws) {
        console.log(`sending to ${i}`);
        sockets[i].send(message);
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.onerror = error => {
    console.error('WebSocket error:', error);
  };
});

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist", "index.html"));
});

const port = 8000;
const ip = "0.0.0.0";
app.listen(port, ip, () => {
  console.log(`Server is running on http://${ip}:${port}`);
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Press Enter to start\n", _ => {
  console.log("Starting...")
  for (const i in sockets) {
    sockets[i].send(JSON.stringify({type: "start"}))
  }
  while (sockets.length > 0) {
    if (Math.random() < 0.5) {
      let i = Math.random(0, sockets.length)
      var pair = sockets[i]
      pairings[sockets[0]] = pair
      pairings[pair] = sockets[0]
      sockets.pop(i)
      sockets.pop(0)
    } else {
      pairings[sockets[0]] = {type: "AI"}
      sockets.pop(0)
    }
  }
});
