// const WebSocket = require("ws");

// function setupChatWebSocket(server) {
//   const wss = new WebSocket.Server({ server });

//   wss.on("connection", (ws) => {
//     console.log("New chat WebSocket connection");

//     ws.on("message", (message) => {
//       console.log("Chat message received:", message);
//       // Logic for handling chat message
//       ws.send(`Message received: ${message}`);
//     });

//     ws.on("close", () => {
//       console.log("Chat WebSocket connection closed");
//     });
//   });
// }

// module.exports = { setupChatWebSocket };

import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
wss.on("connection", (client) => {
  client.on("message", (message, isBinary) => {
    [...wss.clients]
      .filter((c) => c !== client)
      .forEach((c) => c.send(isBinary ? message.toString() : message));
  });
});