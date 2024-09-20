// const WebSocket = require("ws");

// // Create WebSocket server on port 8080
// const wss = new WebSocket.Server({ port: 8080 });

// // Object to store connected clients by their IDs
// const clients = {};

// wss.on("connection", (client, req) => {
//   // Parse the client's ID from the query string (e.g., ws://localhost:8080/?id=12345)
// //   const params = new URLSearchParams(req.url.replace("/?", ""));
//   const clientId = req.body
//   if (clientId) {
//     // Store the client in the clients object
//     clients[clientId] = client;
//     console.log(`Client with ID ${clientId} connected.`);
//   }

//   // Handle incoming messages from a client
//   client.on("message", (message, isBinary) => {
//     let data;
//     try {
//       // Parse the incoming message (assuming it's JSON)
//       data = JSON.parse(message);
//     } catch (err) {
//       console.error("Invalid message format:", message);
//       return;
//     }

//     const { targetId, content } = data;

//     // Send the message only to the target client if they are connected
//     if (clients[targetId]) {
//       clients[targetId].send(isBinary ? message.toString() : content);
//       console.log(`Message sent to client with ID ${targetId}`);
//     } else {
//       console.error(`Client with ID ${targetId} is not connected.`);
//     }
//   });

//   // Handle client disconnection
//   client.on("close", () => {
//     console.log(`Client with ID ${clientId} disconnected.`);
//     delete clients[clientId];
//   });
// });

// console.log("WebSocket server is running on ws://localhost:8080");
const WebSocket = require("ws");
const url = require("url");

// Create WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });

// Object to store connected clients by their IDs
const clients = {};

wss.on("connection", (client, req) => {
  // Parse the client's ID from the query string (e.g., ws://localhost:8080/?id=12345)
  const query = url.parse(req.url, true).query;
  const clientId = query.id;

  if (clientId) {
    // Store the client in the clients object
    clients[clientId] = client;
    console.log(`Client with ID ${clientId} connected.`);
  }

  // Handle incoming messages from a client
  client.on("message", (message, isBinary) => {
    let data;
    try {
      // Parse the incoming message (assuming it's JSON)
      data = JSON.parse(message);
    } catch (err) {
      console.error("Invalid message format:", message);
      return;
    }

    const { targetId, content } = data;

    // Send the message only to the target client if they are connected
    if (clients[targetId]) {
      clients[targetId].send(isBinary ? message.toString() : content);
      console.log(`Message sent to client with ID ${targetId}`);
    } else {
      console.error(`Client with ID ${targetId} is not connected.`);
    }
  });

  // Handle client disconnection
  client.on("close", () => {
    console.log(`Client with ID ${clientId} disconnected.`);
    delete clients[clientId];
  });
});

console.log("WebSocket server is running on ws://localhost:8080");