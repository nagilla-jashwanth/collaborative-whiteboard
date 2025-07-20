import React from 'react';

const UserCursors = ({ cursors }) => {
  const cursorColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

  return (
    <div className="user-cursors">
      {Array.from(cursors.entries()).map(([userId, cursor], index) => (
        <div
          key={userId}
          className="user-cursor"
          style={{
            left: cursor.x,
            top: cursor.y,
            backgroundColor: cursorColors[index % cursorColors.length]
          }}
        />
      ))}
    </div>
  );
};

export default UserCursors;
