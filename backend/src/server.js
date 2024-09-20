const app = require('./app');
const http = require("http");
const { Server } = require("socket.io");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);


// // Initialize socket.io
// const io = new Server(server, {
//   cors: {
//     origin: "*",  // You can restrict this to your frontend URL
//     methods: ["GET", "POST"]
//   }
// });

// // Handle socket.io connections
// io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);

//   // Handle receiving messages
//   socket.on('chat message', (message) => {
//     console.log('Message received:', message);

//     // Broadcast the message to all other connected clients
//     socket.broadcast.emit('chat message', message);
//   });

//   // Handle disconnection
//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//   });
// });

const wss = new WebSocketServer({ server }); // Use the same HTTP server
const clients = {};

// Handle WebSocket connections
wss.on("connection", (client, req) => {
  console.log("A new WebSocket connection was established.");
  const clientId = req.body;
  if (clientId) {
    // Store the client in the clients object
    clients[clientId] = client;
    console.log(`Client with ID ${clientId} connected.`);
  }

  client.on("message", (message, isBinary) => {
    // Parse the incoming message (assuming it's JSON with a targetId and message)
    let data;
    try {
      data = JSON.parse(message);
    } catch (err) {
      console.error("Invalid message format:", message);
      return;
    }

    const { targetId, content } = data;

    // Check if the targetId is connected
    if (clients[targetId]) {
      // Send the message to the specific client
      clients[targetId].send(isBinary ? message.toString() : content);
      console.log(`Message sent to client with ID ${targetId}`);
    } else {
      console.error(`Client with ID ${targetId} is not connected.`);
    }
  });

  client.on("close", () => {
    console.log(`Client with ID ${clientId} disconnected.`);
    // Remove the client from the clients object on disconnect
    delete clients[clientId];
  });
});


// Start the server with both Express and socket.io
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});