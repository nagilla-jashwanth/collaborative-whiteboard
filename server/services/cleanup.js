const Room = require('../models/Room');

const cleanupOldRooms = async () => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  try {
    const result = await Room.deleteMany({
      lastActivity: { $lt: twentyFourHoursAgo }
    });
    console.log(`Cleaned up ${result.deletedCount} inactive rooms`);
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
};

setInterval(cleanupOldRooms, 60 * 60 * 1000);

module.exports = cleanupOldRooms;
