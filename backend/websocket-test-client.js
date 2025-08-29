const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:5002");

ws.on("open", () => {
  console.log("✅ Connected to Todo backend");

  // Example: Add a todo
  ws.send(JSON.stringify({ action: "add", todo: "Buy milk" }));

  // Example: List all todos
  setTimeout(() => {
    ws.send(JSON.stringify({ action: "list" }));
  }, 1000);

  // Example: Add another todo
  setTimeout(() => {
    ws.send(JSON.stringify({ action: "add", todo: "Walk the dog" }));
  }, 2000);

  // Example: Complete a todo (using the first todo's ID from the list)
  setTimeout(() => {
    ws.send(JSON.stringify({ action: "complete", id: "68add22531900102953edb0f" }));
  }, 3000);

  // Example: Delete a todo (using the second todo's ID from the list)
  setTimeout(() => {
    ws.send(JSON.stringify({ action: "delete", id: "68add22731900102953edb12" }));
  }, 4000);

  // Example: Get todos count
  setTimeout(() => {
    ws.send(JSON.stringify({ action: "count" }));
  }, 5000);

  // Close connection after tests
  setTimeout(() => {
    console.log("🔚 Closing connection after tests...");
    ws.close();
  }, 6000);
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
