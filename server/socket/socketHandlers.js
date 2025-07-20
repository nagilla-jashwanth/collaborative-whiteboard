const Room = require('../models/Room');

const handleSocketConnection = (io) => {
  const roomUsers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join-room', async (roomId) => {
      try {
        socket.join(roomId);
        socket.currentRoom = roomId;
        if (!roomUsers.has(roomId)) {
          roomUsers.set(roomId, new Set());
        }
        roomUsers.get(roomId).add(socket.id);

        io.to(roomId).emit('user-count', roomUsers.get(roomId).size);
        
        const room = await Room.findOne({ roomId });
        if (room) {
          socket.emit('load-drawing', room.drawingData);
        }
      } catch (error) {
        socket.emit('error', 'Failed to join room');
      }
    });
    socket.on('cursor-move', (data) => {
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('cursor-move', {
          userId: socket.id,
          x: data.x,
          y: data.y
        });
      }
    });
    socket.on('draw-start', (data) => {
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('draw-start', data);
      }
    });

    socket.on('draw-move', async (data) => {
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('draw-move', data);
        try {
          await Room.findOneAndUpdate(
            { roomId: socket.currentRoom },
            {
              $push: {
                drawingData: {
                  type: 'stroke',
                  data: data,
                  timestamp: new Date()
                }
              },
              lastActivity: new Date()
            }
          );
        } catch (error) {
          console.error('Failed to save drawing data:', error);
        }
      }
    });

    socket.on('draw-end', (data) => {
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('draw-end', data);
      }
    });
    socket.on('clear-canvas', async () => {
      if (socket.currentRoom) {
        try {
          await Room.findOneAndUpdate(
            { roomId: socket.currentRoom },
            {
              drawingData: [],
              lastActivity: new Date()
            }
          );
          
          io.to(socket.currentRoom).emit('clear-canvas');
        } catch (error) {
          socket.emit('error', 'Failed to clear canvas');
        }
      }
    });

    socket.on('disconnect', () => {
      if (socket.currentRoom && roomUsers.has(socket.currentRoom)) {
        roomUsers.get(socket.currentRoom).delete(socket.id);

        const userCount = roomUsers.get(socket.currentRoom).size;
        if (userCount === 0) {
          roomUsers.delete(socket.currentRoom);
        } else {
          io.to(socket.currentRoom).emit('user-count', userCount);
        }

        socket.to(socket.currentRoom).emit('user-disconnected', socket.id);
      }
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = handleSocketConnection;
