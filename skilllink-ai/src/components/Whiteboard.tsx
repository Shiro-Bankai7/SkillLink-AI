import React, { useRef, useEffect, useState } from 'react';
import { 
  Pen, 
  Eraser, 
  Square, 
  Circle, 
  Type, 
  Trash2, 
  Download, 
  Upload,
  Undo,
  Redo,
  Palette
} from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface DrawingPath {
  points: Point[];
  color: string;
  width: number;
  tool: 'pen' | 'eraser';
}

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'text'>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentWidth, setCurrentWidth] = useState(2);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [undoStack, setUndoStack] = useState<DrawingPath[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawingPath[][]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    redrawCanvas();
  }, [paths]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all paths
    paths.forEach(path => {
      if (path.points.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (path.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    });

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  };

  const startDrawing = (point: Point) => {
    if (currentTool === 'pen' || currentTool === 'eraser') {
      setIsDrawing(true);
      setCurrentPath([point]);
    }
  };

  const draw = (point: Point) => {
    if (!isDrawing || (currentTool !== 'pen' && currentTool !== 'eraser')) return;

    setCurrentPath(prev => {
      const newPath = [...prev, point];
      
      // Draw current stroke in real-time
      const canvas = canvasRef.current;
      if (canvas && newPath.length >= 2) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.beginPath();
          ctx.strokeStyle = currentTool === 'eraser' ? '#FFFFFF' : currentColor;
          ctx.lineWidth = currentWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          if (currentTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
          } else {
            ctx.globalCompositeOperation = 'source-over';
          }

          const lastPoint = newPath[newPath.length - 2];
          ctx.moveTo(lastPoint.x, lastPoint.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }
      }

      return newPath;
    });
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    
    if (currentPath.length > 1) {
      const newPath: DrawingPath = {
        points: currentPath,
        color: currentTool === 'eraser' ? '#FFFFFF' : currentColor,
        width: currentWidth,
        tool: currentTool as 'pen' | 'eraser'
      };

      // Save current state for undo
      setUndoStack(prev => [...prev, paths]);
      setRedoStack([]);
      
      setPaths(prev => [...prev, newPath]);
    }
    
    setCurrentPath([]);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const point = getMousePos(e);
    startDrawing(point);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const point = getMousePos(e);
    draw(point);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const point = getTouchPos(e);
    startDrawing(point);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const point = getTouchPos(e);
    draw(point);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    stopDrawing();
  };

  const clearCanvas = () => {
    setUndoStack(prev => [...prev, paths]);
    setRedoStack([]);
    setPaths([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, paths]);
    setUndoStack(prev => prev.slice(0, -1));
    setPaths(previousState);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, paths]);
    setRedoStack(prev => prev.slice(0, -1));
    setPaths(nextState);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#008000', '#800000', '#000080'
  ];

  return (
    <div className="relative w-full h-full bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-100 to-indigo-100 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-purple-700 tracking-tight">
          Collaborative Whiteboard
        </h3>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          {/* Tools */}
          <button
            onClick={() => setCurrentTool('pen')}
            className={`p-2 rounded-lg transition-colors ${
              currentTool === 'pen' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            title="Pen"
          >
            <Pen className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setCurrentTool('eraser')}
            className={`p-2 rounded-lg transition-colors ${
              currentTool === 'eraser' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>

          {/* Stroke Width */}
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-sm text-gray-600">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={currentWidth}
              onChange={(e) => setCurrentWidth(Number(e.target.value))}
              className="w-16"
            />
            <span className="text-sm text-gray-600 w-6">{currentWidth}</span>
          </div>

          {/* Colors */}
          <div className="flex items-center space-x-1 ml-4">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                className={`w-6 h-6 rounded border-2 transition-all ${
                  currentColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
          
          <button
            onClick={clearCanvas}
            className="p-2 rounded-lg bg-white text-red-600 hover:bg-red-50"
            title="Clear All"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={downloadCanvas}
            className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-100"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
        />
      </div>
    </div>
  );
}