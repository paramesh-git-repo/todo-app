const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:5002");

let todoIds = [];

ws.on("open", () => {
  console.log("✅ Connected to Todo backend");

  // Step 1: List all todos to get IDs
  ws.send(JSON.stringify({ action: "list" }));

  // Step 2: Add a new todo
  setTimeout(() => {
    ws.send(JSON.stringify({ action: "add", todo: "Buy groceries" }));
  }, 1000);

  // Step 3: Add another todo
  setTimeout(() => {
    ws.send(JSON.stringify({ action: "add", todo: "Call mom" }));
  }, 2000);

  // Step 4: List todos again to get updated IDs
  setTimeout(() => {
    ws.send(JSON.stringify({ action: "list" }));
  }, 3000);

  // Step 5: Complete the first todo (if we have IDs)
  setTimeout(() => {
    if (todoIds.length > 0) {
      ws.send(JSON.stringify({ action: "complete", id: todoIds[0] }));
    } else {
      console.log("⚠️ No todo IDs available for completion");
    }
  }, 4000);

  // Step 6: Delete the second todo (if we have IDs)
  setTimeout(() => {
    if (todoIds.length > 1) {
      ws.send(JSON.stringify({ action: "delete", id: todoIds[1] }));
    } else {
      console.log("⚠️ No todo IDs available for deletion");
    }
  }, 5000);

  // Step 7: Get final count
  setTimeout(() => {
    ws.send(JSON.stringify({ action: "count" }));
  }, 6000);

  // Step 8: Final list
  setTimeout(() => {
    ws.send(JSON.stringify({ action: "list" }));
  }, 7000);

  // Close connection after tests
  setTimeout(() => {
    console.log("🔚 Closing connection after tests...");
    ws.close();
  }, 8000);
});

ws.on("message", (data) => {
  try {
    const response = JSON.parse(data.toString());
    console.log("📩 Response:", JSON.stringify(response, null, 2));
    
    // Store todo IDs from list responses
    if (response.action === "list" && response.success && response.data) {
      todoIds = response.data.map(todo => todo._id);
      console.log("📋 Available todo IDs:", todoIds);
    }
  } catch (error) {
    console.log("📩 Raw Response:", data.toString());
  }
});

ws.on("close", () => {
  console.log("❌ Connection closed");
});

ws.on("error", (err) => {
  console.error("⚠️ Error:", err.message);
});
