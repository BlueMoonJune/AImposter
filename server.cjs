const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const readline = require('node:readline');

const app = express();
const ws = new WebSocket.Server({ port: 8080 });

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

app.post("/api/users", async (req, res) => {
});

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
