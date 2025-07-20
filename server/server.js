const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
app.use(cors());
app.use(express.json());

const MONGO_UR = process.env.MONGO_URI

mongoose.connect(MONGO_UR, {
  serverSelectionTimeoutMS: 10000,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const roomsRouter = require('./routes/rooms'); 
app.use('/api/rooms', roomsRouter); 
const handleSocketConnection = require('./socket/socketHandlers');
handleSocketConnection(io);