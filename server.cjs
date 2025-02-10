const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require('http');
const WebSocket = require('ws');

const app = express();
const ws = new WebSocket.Server({ port: 8080 });

var sockets = [];

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
