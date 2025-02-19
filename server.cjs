const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const fs = require("fs");
const WebSocket = require('ws');
const readline = require('node:readline');

const app = express();
const ws = new WebSocket.Server({ port: 8080 });

const getAIMessage = async (messages) => {
  const apiKey = fs.readFileSync("key.txt", "utf-8");
  console.log(messages)
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error ${response.status}: ${errorData.error.message}`);
    }

    const data = await response.json();
    return data.choices[0].message.content
  } catch (error) {
    console.error("Error fetching AI response:", error);
  }
}

var sockets = [];

var pairings = {};

ws.on('connection', ws => {
  console.log('Client connected');
  sockets.push(ws);

  ws.on('message', data => {
    var message = data.toString();
    console.log(`Received: ${message}`);
    var pairing = pairings[ws];
    if ("type" in pairing && pairing["type"] == "AI") {
      pairing.messages.push({role: "user", content: message});
      response = getAIMessage(pairing.messages).then((response) => {
        ws.send(JSON.stringify({type: "message", text: response}));
        pairing.messages.push({role: "assistant", content: response});
      });

    } else {
      ws.send(JSON.stringify({type: "message", text: message}));
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
    if (Math.random() < 0.0) {
      let i = Math.random(0, sockets.length)
      var pair = sockets[i]
      pairings[sockets[0]] = pair
      pairings[pair] = sockets[0]
      sockets.pop(i)
      sockets.pop(0)
    } else {
      pairings[sockets[0]] = {type: "AI", messages: [{role: "system", content: "You are a Gen-Z high schooler who likes STEM activities and sometimes uses 'brainrot' words."}]}
      sockets.pop(0)
    }
  }
});
