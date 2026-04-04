const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", {
  auth: {
    token: "SUPERSECRETJWT",
  },
});

socket.on("connect", () => {
  console.log("Connected");

  socket.emit("sendMessage", {
    content: "Halo dari test",
  });
});

socket.on("newMessage", (data) => {
  console.log("Message masuk:", data);
});