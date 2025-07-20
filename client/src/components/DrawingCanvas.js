import React, { useRef, useEffect, useState, useCallback } from 'react';

const DrawingCanvas = ({ socket, settings }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth - 100;
    canvas.height = window.innerHeight - 150;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('load-drawing', (drawingData) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      drawingData.forEach(command => {
        if (command.type === 'clear') {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else if (command.type === 'stroke') {
          drawLine(ctx, command.data);
        }
      });
    });

    socket.on('draw-start', (data) => {
      setLastPoint({ x: data.x, y: data.y });
    });

    socket.on('draw-move', (data) => {
      const ctx = canvasRef.current.getContext('2d');
      drawLine(ctx, data);
    });

    socket.on('clear-canvas', () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off('load-drawing');
      socket.off('draw-start');
      socket.off('draw-move');
      socket.off('clear-canvas');
    };
  }, [socket]);

  const drawLine = useCallback((ctx, data) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.strokeWidth;
    
    ctx.beginPath();
    ctx.moveTo(data.fromX, data.fromY);
    ctx.lineTo(data.toX, data.toY);
    ctx.stroke();
  }, []);

  const startDrawing = useCallback((e) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setLastPoint({ x, y });
    
    if (socket) {
      socket.emit('draw-start', { x, y });
    }
  }, [socket]);

  const draw = useCallback((e) => {
    if (!isDrawing || !lastPoint) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const drawData = {
      fromX: lastPoint.x,
      fromY: lastPoint.y,
      toX: x,
      toY: y,
      color: settings.color,
      strokeWidth: settings.strokeWidth
    };

    const ctx = canvasRef.current.getContext('2d');
    drawLine(ctx, drawData);

    if (socket) {
      socket.emit('draw-move', drawData);
    }
    
    setLastPoint({ x, y });
  }, [isDrawing, lastPoint, settings, socket, drawLine]);

  const stopDrawing = useCallback(() => {
    if (isDrawing && socket) {
      socket.emit('draw-end');
    }
    setIsDrawing(false);
    setLastPoint(null);
  }, [isDrawing, socket]);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      style={{ 
        border: '2px solid #ddd', 
        cursor: 'crosshair',
        backgroundColor: 'white'
      }}
    />
  );
};

export default DrawingCanvas;
