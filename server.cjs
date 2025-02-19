const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const fs = require("fs");
const WebSocket = require('ws');
<<<<<<< HEAD
const OpenAI = require("openai");
=======
const readline = require('node:readline');
>>>>>>> 91913acc24aed4176698b4b34d7016758a092c1a

const app = express();
const ws = new WebSocket.Server({ port: 8080 });

const getAIMessage = (message) => {
  const apiKey = fs.readFileSync("key.txt", "utf-8");

  const openai = new OpenAI({
    apiKey: apiKey,
  });

  try {
    const completion = openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: false,
      messages: [
        {"role": "system", "content": "You are a gen-z highschool who likes stem activities and sometimes using 'brainrot' words."},
        {"role": "user", "content": message},
      ],
    });

    completion.then((result) => console.log(result.choices[0].message));
  } catch (error) {
    console.log("API Call failed: "+err);
  }
}

getAIMessage("What's up my skibidi sigma!");

var sockets = [];

var pairings = {};

ws.on('connection', ws => {
  console.log('Client connected');
  sockets.push(ws);

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
