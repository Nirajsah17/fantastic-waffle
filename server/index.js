import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Initialize waiting users for both modes
const waitingUsers = {
  video: new Set(),
  text: new Set()
};

const VALID_MODES = ['video', 'text'];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('waiting', ({ peerId, mode }) => {
    // Validate and sanitize the mode
    const validMode = VALID_MODES.includes(mode) ? mode : 'video';
    console.log(`User ${socket.id} waiting in ${validMode} mode`);
    
    // Remove user from all waiting lists first
    Object.values(waitingUsers).forEach(list => {
      list.delete(socket.id);
    });

    // Store user information
    socket.peerId = peerId;
    socket.chatMode = validMode;

    // Add user to appropriate waiting list
    if (waitingUsers[validMode]) {
      waitingUsers[validMode].add(socket.id);
      matchUsers(validMode);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    Object.values(waitingUsers).forEach(list => {
      list.delete(socket.id);
    });
  });

  socket.on('cancel-waiting', () => {
    Object.values(waitingUsers).forEach(list => {
      list.delete(socket.id);
    });
  });
});

function matchUsers(mode) {
  if (!waitingUsers[mode]) return;
  
  const waitingArray = Array.from(waitingUsers[mode]);
  
  while (waitingArray.length >= 2) {
    const user1 = waitingArray.shift();
    const user2 = waitingArray.shift();
    
    const socket1 = io.sockets.sockets.get(user1);
    const socket2 = io.sockets.sockets.get(user2);
    
    if (socket1 && socket2) {
      // Remove both users from waiting list
      waitingUsers[mode].delete(user1);
      waitingUsers[mode].delete(user2);
      
      // Send peer IDs to both users
      socket1.emit('matched', socket2.peerId);
      socket2.emit('matched', socket1.peerId);
      
      console.log(`Matched users in ${mode} mode:`, user1, user2);
    }
  }
}

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});