let io;

const setupChatWebSocket = (socketServer) => {
  io = socketServer;

  io.on("connection", (socket) => {
    console.log("A user connected for chat:", socket.id);

    socket.on("chat message", (message) => {
      // Broadcast to all clients except the sender
      socket.broadcast.emit("chat message", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected from chat:", socket.id);
    });
  });
};

module.exports = { setupChatWebSocket };
