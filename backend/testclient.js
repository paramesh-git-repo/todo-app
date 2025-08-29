const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:5002");

ws.on("open", () => {
  console.log("✅ Connected to Todo backend");

  // Add a todo
  ws.send(JSON.stringify({ action: "add", todo: "Buy milk" }));

  // List all todos after 1 second
  setTimeout(() => {
    ws.send(JSON.stringify({ action: "list" }));
  }, 1000);
});

ws.on("message", (data) => {
  console.log("📩 Response:", data.toString());
});

ws.on("close", () => {
  console.log("❌ Connection closed");
});

ws.on("error", (err) => {
  console.error("⚠️ Error:", err.message);
});
