import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import DrawingCanvas from './DrawingCanvas';
import Toolbar from './Toolbar';
import UserCursors from './UserCursors';

const Whiteboard = ({ roomId, onLeaveRoom, onConnectionChange }) => {
  const [socket, setSocket] = useState(null);
  const [userCount, setUserCount] = useState(1);
  const [cursors, setCursors] = useState(new Map());
  const [drawingSettings, setDrawingSettings] = useState({
    color: '#000000',
    strokeWidth: 2
  });

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      onConnectionChange(true);
      newSocket.emit('join-room', roomId);
    });

    newSocket.on('disconnect', () => {
      onConnectionChange(false);
    });

    newSocket.on('user-count', (count) => {
      setUserCount(count);
    });

    newSocket.on('cursor-move', (data) => {
      setCursors(prev => new Map(prev.set(data.userId, {
        x: data.x,
        y: data.y,
        lastUpdate: Date.now()
      })));
    });

    newSocket.on('user-disconnected', (userId) => {
      setCursors(prev => {
        const updated = new Map(prev);
        updated.delete(userId);
        return updated;
      });
    });

    const cursorCleanup = setInterval(() => {
      const now = Date.now();
      setCursors(prev => {
        const updated = new Map();
        prev.forEach((cursor, userId) => {
          if (now - cursor.lastUpdate < 5000) { // 5 second timeout
            updated.set(userId, cursor);
          }
        });
        return updated;
      });
    }, 1000);
    
    return () => {
      clearInterval(cursorCleanup);
      newSocket.disconnect();
    };
  }, [roomId, onConnectionChange]);

  const handleMouseMove = (e) => {
    if (socket) {
      const rect = e.currentTarget.getBoundingClientRect();
      socket.emit('cursor-move', {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  return (
    <div className="whiteboard" onMouseMove={handleMouseMove}>
      <div className="whiteboard-header">
        <div className="room-info">
          <h2>Room: {roomId}</h2>
          <span className="user-count">👥 {userCount} user{userCount !== 1 ? 's' : ''}</span>
        </div>
        <button onClick={onLeaveRoom} className="leave-btn " style={{marginTop:40}}>Leave Room</button>
      </div>
      
      <Toolbar 
        settings={drawingSettings}
        onSettingsChange={setDrawingSettings}
        socket={socket}
      />
      
      <div className="canvas-container">
        <DrawingCanvas 
          socket={socket}
          settings={drawingSettings}
        />
        <UserCursors cursors={cursors} />
      </div>
    </div>
  );
};

export default Whiteboard;
