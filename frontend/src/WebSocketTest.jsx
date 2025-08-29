import React, { useState, useEffect, useRef } from 'react';

function WebSocketTest() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket server
    const ws = new WebSocket('ws://localhost:5002');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      setMessages(prev => [...prev, { type: 'system', text: 'Connected to WebSocket server' }]);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages(prev => [...prev, { type: 'received', text: JSON.stringify(data, null, 2) }]);
      } catch (error) {
        setMessages(prev => [...prev, { type: 'received', text: event.data }]);
      }
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      setIsConnected(false);
      setMessages(prev => [...prev, { type: 'system', text: 'Disconnected from WebSocket server' }]);
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setMessages(prev => [...prev, { type: 'error', text: 'WebSocket error occurred' }]);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const sendMessage = () => {
    if (inputMessage.trim() && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = { text: inputMessage, timestamp: new Date().toISOString() };
      wsRef.current.send(JSON.stringify(message));
      setMessages(prev => [...prev, { type: 'sent', text: `Sent: ${inputMessage}` }]);
      setInputMessage('');
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      margin: '20px 0',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>WebSocket Test</h3>
      <div style={{ marginBottom: '10px' }}>
        Status: <span style={{ 
          color: isConnected ? 'green' : 'red', 
          fontWeight: 'bold' 
        }}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      <div style={{ 
        height: '200px', 
        border: '1px solid #ddd', 
        padding: '10px', 
        overflowY: 'auto',
        backgroundColor: 'white',
        marginBottom: '10px'
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ 
            marginBottom: '5px',
            color: msg.type === 'error' ? 'red' : 
                   msg.type === 'system' ? 'blue' : 
                   msg.type === 'sent' ? 'green' : 'black'
          }}>
            <strong>{msg.type.toUpperCase()}:</strong> {msg.text}
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '8px' }}
        />
        <button 
          onClick={sendMessage}
          disabled={!isConnected}
          style={{ padding: '8px 16px' }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default WebSocketTest;
