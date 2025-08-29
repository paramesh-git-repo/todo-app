const WebSocket = require("ws");
const axios = require("axios");

const wss = new WebSocket.Server({ port: 5002 });

// Todo API base URL
const API_BASE = "http://localhost:5001/api";

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      console.log("Received:", data);

      let response = { success: false, message: "Unknown action" };

      switch (data.action) {
        case "add":
          if (data.todo) {
            const result = await axios.post(`${API_BASE}/todos`, { text: data.todo });
            response = { success: true, action: "add", data: result.data };
          } else {
            response = { success: false, message: "Todo text is required" };
          }
          break;

        case "list":
          const todos = await axios.get(`${API_BASE}/todos`);
          response = { success: true, action: "list", data: todos.data };
          break;

        case "complete":
          if (data.id) {
            const result = await axios.put(`${API_BASE}/todos/${data.id}`, { completed: true });
            response = { success: true, action: "complete", data: result.data };
          } else {
            response = { success: false, message: "Todo ID is required" };
          }
          break;

        case "delete":
          if (data.id) {
            await axios.delete(`${API_BASE}/todos/${data.id}`);
            response = { success: true, action: "delete", message: "Todo deleted successfully" };
          } else {
            response = { success: false, message: "Todo ID is required" };
          }
          break;

        case "count":
          const countResult = await axios.get(`${API_BASE}/todos`);
          response = { success: true, action: "count", count: countResult.data.length };
          break;

        default:
          response = { success: false, message: `Unknown action: ${data.action}` };
      }

      ws.send(JSON.stringify(response));
    } catch (error) {
      console.error("Error processing message:", error.message);
      ws.send(JSON.stringify({ 
        success: false, 
        message: "Error processing request",
        error: error.message 
      }));
    }
  });

  ws.send(JSON.stringify({ 
    type: "welcome", 
    message: "Welcome to Todo WebSocket API! 👋",
    availableActions: ["add", "list", "complete", "delete", "count"]
  }));
});

console.log("WebSocket server running on port 5002");
console.log("Todo API integration enabled");
