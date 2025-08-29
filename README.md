# Todo App

A full-stack Todo application with React frontend, Express backend, MongoDB database, and WebSocket real-time communication.

## Project Structure

```
todo-app/
├── frontend/          # React application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Express server + WebSocket
│   ├── server.js
│   ├── websocket-server.js
│   ├── testclient.js
│   ├── websocket-test-client.js
│   ├── websocket-test-client-advanced.js
│   ├── .env
│   └── package.json
├── package.json       # Root package.json for managing both
└── README.md
```

## Quick Start

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Start All Services
```bash
npm run dev
```

This will start:
- **Backend**: Express server on port 5001
- **WebSocket**: WebSocket server on port 5002
- **Frontend**: React app on port 3000

## Individual Commands

### Backend
```bash
npm run backend          # Start Express server only
npm run websocket        # Start WebSocket server only
```

### Frontend
```bash
npm run frontend         # Start React app only
```

### Testing
```bash
npm run test-ws          # Run basic WebSocket test
npm run test-ws-advanced # Run advanced WebSocket test
npm run testclient       # Run simple test client
```

## Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **WebSocket**: ws://localhost:5002

## Features

- ✅ Add, complete, and delete todos
- ✅ Real-time WebSocket communication
- ✅ MongoDB database integration
- ✅ React frontend with modern UI
- ✅ Express REST API
- ✅ WebSocket test clients

## API Endpoints

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Add new todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

## WebSocket Actions

- `{ action: "add", todo: "text" }` - Add todo
- `{ action: "list" }` - Get all todos
- `{ action: "complete", id: "id" }` - Complete todo
- `{ action: "delete", id: "id" }` - Delete todo
- `{ action: "count" }` - Get todo count
