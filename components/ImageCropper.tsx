import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Check, X, Move, RotateCcw } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBase64: string) => void;
  onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCropComplete, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  // Constants
  const CANVAS_SIZE = 800;
  const MASK_SIZE = 500; // 1:1 Aspect Ratio

  // Load image
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setImgElement(img);
      // Center image initially
      setPosition({ x: 0, y: 0 });
      // Calculate initial scale to fit
      const minScale = Math.max(MASK_SIZE / img.width, MASK_SIZE / img.height);
      setScale(minScale);
    };
  }, [imageSrc]);

  // Draw loop
  useEffect(() => {
    if (!imgElement || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f172a'; // slate-900 background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw Image
    ctx.save();
    ctx.translate(centerX + position.x, centerY + position.y);
    ctx.scale(scale, scale);
    ctx.drawImage(imgElement, -imgElement.width / 2, -imgElement.height / 2);
    ctx.restore();

    // Draw Overlay (Mask)
    const maskX = (canvas.width - MASK_SIZE) / 2;
    const maskY = (canvas.height - MASK_SIZE) / 2;

    // Darken outside area
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    // Top
    ctx.fillRect(0, 0, canvas.width, maskY);
    // Bottom
    ctx.fillRect(0, maskY + MASK_SIZE, canvas.width, canvas.height - (maskY + MASK_SIZE));
    // Left
    ctx.fillRect(0, maskY, maskX, MASK_SIZE);
    // Right
    ctx.fillRect(maskX + MASK_SIZE, maskY, canvas.width - (maskX + MASK_SIZE), MASK_SIZE);

    // Stroke border / Crop Guide
    ctx.strokeStyle = '#f97316'; // orange-500
    ctx.lineWidth = 2;
    ctx.strokeRect(maskX, maskY, MASK_SIZE, MASK_SIZE);

    // Grid lines (Rule of Thirds)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(maskX + MASK_SIZE / 3, maskY);
    ctx.lineTo(maskX + MASK_SIZE / 3, maskY + MASK_SIZE);
    ctx.moveTo(maskX + (MASK_SIZE / 3) * 2, maskY);
    ctx.lineTo(maskX + (MASK_SIZE / 3) * 2, maskY + MASK_SIZE);
    
    // Horizontal lines
    ctx.moveTo(maskX, maskY + MASK_SIZE / 3);
    ctx.lineTo(maskX + MASK_SIZE, maskY + MASK_SIZE / 3);
    ctx.moveTo(maskX, maskY + (MASK_SIZE / 3) * 2);
    ctx.lineTo(maskX + MASK_SIZE, maskY + (MASK_SIZE / 3) * 2);
    ctx.stroke();

  }, [imgElement, scale, position]);

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    // Map screen pixels to canvas pixels
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    
    return { x, y };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const coords = getCanvasCoordinates(e);
    // Store offset relative to current position
    setDragStart({ 
      x: coords.x - position.x, 
      y: coords.y - position.y 
    });
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDragging) {
      if ('touches' in e) e.preventDefault(); // Prevent scrolling on touch
      const coords = getCanvasCoordinates(e);
      setPosition({
        x: coords.x - dragStart.x,
        y: coords.y - dragStart.y
      });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    if (imgElement) {
      setPosition({ x: 0, y: 0 });
      const minScale = Math.max(MASK_SIZE / imgElement.width, MASK_SIZE / imgElement.height);
      setScale(minScale);
    }
  };

  const handleSave = () => {
    if (!imgElement || !canvasRef.current) return;

    // Output Canvas (High Res)
    const OUTPUT_SIZE = 1024;
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = OUTPUT_SIZE;
    cropCanvas.height = OUTPUT_SIZE;
    const ctx = cropCanvas.getContext('2d');
    if (!ctx) return;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    // Calculate ratio from Mask Space to Output Space
    const ratio = OUTPUT_SIZE / MASK_SIZE;

    ctx.save();
    // Center in output
    ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);
    // Apply transformations (scaled by ratio)
    ctx.translate(position.x * ratio, position.y * ratio);
    ctx.scale(scale * ratio, scale * ratio);
    
    ctx.drawImage(imgElement, -imgElement.width / 2, -imgElement.height / 2);
    ctx.restore();

    onCropComplete(cropCanvas.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden max-w-2xl w-full flex flex-col shadow-2xl h-[90vh] md:h-auto">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Move size={18} className="text-orange-400" />
            Adjust Frame
          </h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div 
          ref={containerRef}
          className="relative bg-slate-950 flex-1 overflow-hidden cursor-move touch-none flex items-center justify-center min-h-[400px]"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <canvas 
            ref={canvasRef} 
            width={CANVAS_SIZE} 
            height={CANVAS_SIZE} 
            className="w-full h-full object-contain max-h-full"
          />
          
          {/* Floating Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-full px-6 py-3 flex items-center gap-4 shadow-xl">
            <ZoomOut size={18} className="text-slate-400" />
            <input 
              type="range" 
              min="0.1" 
              max="3" 
              step="0.05" 
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-32 md:w-48 accent-orange-500 cursor-pointer"
            />
            <ZoomIn size={18} className="text-slate-400" />
            
            <div className="w-px h-6 bg-slate-700 mx-1"></div>
            
            <button 
              onClick={handleReset}
              className="text-slate-400 hover:text-white transition-colors"
              title="Reset View"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-900">
          <button 
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-slate-300 hover:text-white font-medium hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-lg shadow-orange-900/20 flex items-center gap-2"
          >
            <Check size={18} /> Crop & Use
          </button>
        </div>
      </div>
    </div>
  );
};