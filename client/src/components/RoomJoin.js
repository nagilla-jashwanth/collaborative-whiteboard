import React, { useState } from 'react';
import axios from 'axios';

const RoomJoin = ({ onJoinRoom }) => {
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) {
      setError('Please enter a room code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/rooms/join', {
        roomId: roomId.trim().toUpperCase()
      });

      if (response.data.success) {
        onJoinRoom(response.data.roomId);
      }
    } catch (error) {
      setError('Failed to join room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomRoom = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/rooms/join', {});
      if (response.data.success) {
        onJoinRoom(response.data.roomId);
      }
    } catch (error) {
      setError('Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="room-join">
      <div className="room-join-container">
        <h1>Collaborative Whiteboard</h1>
        <p>Enter a room code to join or create a new whiteboard session</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter room code (e.g. ABC123)"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            maxLength={8}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Joining...' : 'Join Room'}
          </button>
        </form>
        
        <div className="divider">OR</div>
        
        <button 
          onClick={generateRandomRoom} 
          disabled={isLoading}
          className="create-room-btn"
        >
          Create New Room
        </button>
        
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default RoomJoin;
