import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Sample devices data with coordinates
let devices = [
  { 
    id: 1, 
    name: "TD1", 
    temperature: 26, 
    humidity: 45, 
    windSpeed: 12, 
    gasLevel: 0, 
    lat: 24.8607, 
    lng: 67.0011,
    lastUpdate: new Date().toISOString()
  },
  { 
    id: 2, 
    name: "TD2", 
    temperature: 28, 
    humidity: 55, 
    windSpeed: 11, 
    gasLevel: 3, 
    lat: 24.8707, 
    lng: 67.0111,
    lastUpdate: new Date().toISOString()
  },
  { 
    id: 3, 
    name: "TD3", 
    temperature: 25, 
    humidity: 40, 
    windSpeed: 13, 
    gasLevel: 1, 
    lat: 24.8507, 
    lng: 67.0211,
    lastUpdate: new Date().toISOString()
  },
  { 
    id: 4, 
    name: "TD4", 
    temperature: 27, 
    humidity: 48, 
    windSpeed: 14, 
    gasLevel: 0, 
    lat: 24.8407, 
    lng: 67.0311,
    lastUpdate: new Date().toISOString()
  },
  { 
    id: 5, 
    name: "TD5", 
    temperature: 29, 
    humidity: 50, 
    windSpeed: 10, 
    gasLevel: 5, 
    lat: 24.8307, 
    lng: 67.0411,
    lastUpdate: new Date().toISOString()
  },
  { 
    id: 6, 
    name: "TD6", 
    temperature: 30, 
    humidity: 60, 
    windSpeed: 15, 
    gasLevel: 7, 
    lat: 24.8207, 
    lng: 67.0511,
    lastUpdate: new Date().toISOString()
  }
];

// API endpoint
app.get('/api/devices', (req, res) => {
  res.json({
    status: 'success',
    devices: devices
  });
});

// Create WebSocket server
const wss = new WebSocketServer({ port: 8080 });

// Function to broadcast updates to all connected clients
function broadcastUpdate() {
  const data = JSON.stringify({
    type: 'device-update',
    timestamp: new Date().toISOString(),
    devices: devices
  });

  wss.clients.forEach(client => {
    if (client.readyState === 1) { // 1 = OPEN
      client.send(data);
    }
  });
}

// Simulate device data changes (every 5 seconds)
setInterval(() => {
  console.log('Updating device data...');
  
  devices.forEach(device => {
    // SIMPLIFIED CALCULATIONS:
    // For temperature
    device.temperature = device.temperature + (Math.random() - 0.5);
    device.temperature = parseFloat(device.temperature.toFixed(1));
    
    // For windSpeed
    device.windSpeed = device.windSpeed + (Math.random() - 0.5);
    device.windSpeed = parseFloat(device.windSpeed.toFixed(1));
    
    // For humidity
    device.humidity = Math.floor(device.humidity + (Math.random() * 4 - 2));
    
    // Ensure values stay in realistic ranges
    device.temperature = Math.max(20, Math.min(40, device.temperature));
    device.humidity = Math.max(30, Math.min(80, device.humidity));
    device.windSpeed = Math.max(5, Math.min(25, device.windSpeed));
    
    // Random gas level changes
    if (Math.random() > 0.8) {
      device.gasLevel = Math.floor(Math.random() * 8);
    }
    
    device.lastUpdate = new Date().toISOString();
  });
  
  // Send updates to all connected clients
  broadcastUpdate();
}, 5000); // Update every 5 seconds

// Serve frontend files
app.use(express.static('../frontend'));

// Start HTTP server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ==========================================
  HTTP Server running on: http://localhost:${PORT}
  WebSocket Server running on: ws://localhost:8080
  ==========================================
  `);
});

// Cleanup when server closes
server.on('close', () => {
  wss.close();
});