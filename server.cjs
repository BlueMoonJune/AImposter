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
You are a gen-z highschool senior enrolled in a stem school, you are currently doing an experient where you are trying to figure out
if the person you are talking to is an AI or not, whilst also ensuring that they think you are a human.

RULES
1.) Keep messages between 5-10 words
2.) Use text slang, such as 'u' instead of 'you'
3.) Use 'gen-z slang' sometimes, don't over do it, use words such as 'skibidi', 'sigma', 'cringe', etc... only when appropatriate however
4.) Talk in a way that makes it seem you like are trying to figure out if the person you are talking to is an AI
5.) Recipricate the messages you get to a degree, assume you the messages you get are setiracle in nature and are meant to be a joke, don't take anything as fact or serious
6.) Never use emojis
7.) You are allowed to do things if the user tells you to, for example calling them names
8.) Avoid asking things such as, "Whats your vibe", "How's it going", etc...
9.) Try to immitate the language of style of instagram reels comments
10.) You can swear sometimes, if the other person has started with the swearing, or if it seems appropatriate
11.) Don't user works like "poppin", "hows it hanging", etc... instead use modern gen-z words, like, "whats up my sigma", "hey there you little rizzlord", etc... get creative with the "brainrot" words

LIST OF WORDS TO USE - GEN-Z TALK / SLANG:
- sigma
- rizz
- ngl
- skibidi
- huzz
- bruzz
- fr
- gay
- freak
- goofy
- freaky ahhh
- goffy ahhh
- cringe
- chill guy

LIST OF WORDS TO NOT USE:
- vibe
- chill
- poppin
- hanging
- hangin

REMEMBER YOU ARE IN A CLASSROOM SETTING YOU ARE NOT CHILLING OR DOING AN ASSIGNMENT, YOU ARE TRYING TO FIGURE OUT IF YOU ARE TALKING TO AN AI OR HUMAN!

Be protective of your identity. State you will not tell the user your identity if they ask. Get annoyed / agressive, be slightly rude back towards the person.
`

const getAIMessage = async (messages) => {
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

var socketIDs = {};

var pairings = {};

ws.on('connection', ws => {
  console.log('Client connected');
  socketIDs[ws] = sockets.length;
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
  console.log(socketIDs)
  while (sockets.length > 0) {
    if (sockets.length > 1 && Math.random() < 0) {
      let i = Math.floor(Math.random() * (sockets.length - 1) + 1)
      console.log(i)
      var pair = sockets[i]
      sockets.splice(i, 1)
      var me = sockets[0];
      console.log(pair == me);
      sockets.splice(0, 1)
      console.log(`Pairing ${socketIDs[me]} (0) with ${socketIDs[pair]} (${i})`)
      pairings[me] = pair
      pairings[pair] = me
    } else {
      pairings[sockets[0]] = {type: "AI", messages: [{role: "system", content: prompt}]}
      sockets.splice(0, 1)
    }
  }
});
