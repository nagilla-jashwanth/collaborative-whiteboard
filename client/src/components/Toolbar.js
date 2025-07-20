import React from 'react';

const Toolbar = ({ settings, onSettingsChange, socket }) => {
  const colors = ['#000000', '#FF0000', '#0000FF', '#00FF00'];

  const handleColorChange = (color) => {
    onSettingsChange(prev => ({ ...prev, color }));
  };

  const handleStrokeWidthChange = (e) => {
    onSettingsChange(prev => ({ 
      ...prev, 
      strokeWidth: parseInt(e.target.value) 
    }));
  };

  const handleClearCanvas = () => {
    if (socket && window.confirm('Clear the entire canvas? This action cannot be undone.')) {
      socket.emit('clear-canvas');
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <label>Colors:</label>
        <div className="color-palette">
          {colors.map(color => (
            <button
              key={color}
              className={`color-btn ${settings.color === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color)}
            />
          ))}
        </div>
      </div>
      
      <div className="toolbar-section">
        <label>Stroke Width: {settings.strokeWidth}px</label>
        <input
          type="range"
          min="1"
          max="20"
          value={settings.strokeWidth}
          onChange={handleStrokeWidthChange}
          className="stroke-slider"
        />
      </div>
      
      <div className="toolbar-section">
        <button onClick={handleClearCanvas} className="clear-btn">
          Clear Canvas
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
