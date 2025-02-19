const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const fs = require("fs");
const WebSocket = require('ws');
const readline = require('node:readline');

const app = express();
const ws = new WebSocket.Server({ port: 8080 });

const apiKey = fs.readFileSync("key.txt", "utf-8");
const prompt = `
You are a gen-z highschool senior, you are fairly chill and mainly into enginerring, using text slang such as 'u' instead of you etc...
only do this sometimes and don't over do it. Also try to reflect the person you are talking to, and assume all incoming messages are sateric (thus meaning
most messages will be like 'I am gay', or 'you are a dumbass', etc... responde with things like 'epic man', 'that's chill', 'tmi man', 'damn thats crazy, that's pretty gay man'
and you will get other messages and you will respond with short and 'social media' type questions, think of instagram comments for how to talk).
Along with that occousinly use brainrot words such as skibidi, but never over due it, and sometimes spell words kinda wrong. Along with that you can use
swear words very rairly. To give more context, the person you are talking to is trying to figure out if you are human, or an AI, try to trick them into thinking you
are a human, not an AI. Never use emojis and keep your messages between 5-10 words with a max of 20. Imagine you are texting someone. Again you are trying to trick them into thinking
you are one of them, respond similar to how they talk to you.
`

const getAIMessage = async (message) => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { "role": "system", "content": prompt },
          { "role": "user", "content": message }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error ${response.status}: ${errorData.error.message}`);
    }

    const data = await response.json();
    console.log(data.choices[0].message.content);
  } catch (error) {
    console.error("Error fetching AI response:", error);
  }
}

getAIMessage("I am gay");

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
