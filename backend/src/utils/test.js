// Open a WebSocket connection with a specific client ID
const socket = new WebSocket("ws://localhost:8080/?id=1");

// Event listener for when the connection is opened
socket.onopen = () => {
  console.log("Connected to the WebSocket server.");

  // Send a message to another client with ID 67890
  const message = {
    targetId: "1",
    content: "Hello, client 67890!",
  };
  socket.send(JSON.stringify(message));
};

// Event listener for receiving messages
socket.onmessage = (event) => {
  console.log("Received message:", event.data);
};

// Event listener for when the connection is closed
socket.onclose = () => {
  console.log("Disconnected from the WebSocket server.");
};
