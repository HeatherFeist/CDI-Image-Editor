import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Check, X, Move } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBase64: string) => void;
  onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCropComplete, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setImgElement(img);
      // Center image initially
      setPosition({ x: 0, y: 0 });
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
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate centering
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // We want to draw the image such that 'position' offsets it from center
    // and 'scale' zooms it.
    
    // Draw Image
    ctx.save();
    ctx.translate(centerX + position.x, centerY + position.y);
    ctx.scale(scale, scale);
    
    // Draw image centered on the translation point
    ctx.drawImage(imgElement, -imgElement.width / 2, -imgElement.height / 2);
    ctx.restore();

    // Draw Overlay (Mask)
    // We assume a 1:1 square crop box of 300x300 (or larger depending on screen)
    // For simplicity, let's make the output 500x500 logic, displayed smaller
    
    const maskSize = 300;
    const maskX = (canvas.width - maskSize) / 2;
    const maskY = (canvas.height - maskSize) / 2;

    // Dim outside area
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, maskY); // Top
    ctx.fillRect(0, maskY + maskSize, canvas.width, canvas.height - (maskY + maskSize)); // Bottom
    ctx.fillRect(0, maskY, maskX, maskSize); // Left
    ctx.fillRect(maskX + maskSize, maskY, canvas.width - (maskX + maskSize), maskSize); // Right

    // Stroke border
    ctx.strokeStyle = '#f97316'; // orange-500
    ctx.lineWidth = 2;
    ctx.strokeRect(maskX, maskY, maskSize, maskSize);

  }, [imgElement, scale, position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    if (!imgElement || !canvasRef.current) return;

    // Create a new temporary canvas for the final crop output
    const outputSize = 1024; // High res output
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = outputSize;
    cropCanvas.height = outputSize;
    const ctx = cropCanvas.getContext('2d');
    if (!ctx) return;

    // Logic to map the visible area on screen to the full resolution output
    // Screen Mask Size = 300
    // Screen Image Scale = scale
    // Screen Image Pos = position
    
    // We need to replicate the transform but scaled up to outputSize
    // Ratio of Output / ScreenMask
    const maskSize = 300;
    const ratio = outputSize / maskSize;

    // Fill background (optional, but good for transparency handling)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outputSize, outputSize);

    ctx.save();
    // Center in output
    ctx.translate(outputSize / 2, outputSize / 2);
    // Apply position offset scaled by ratio
    ctx.translate(position.x * ratio, position.y * ratio);
    // Apply scale
    ctx.scale(scale * ratio, scale * ratio);
    
    ctx.drawImage(imgElement, -imgElement.width / 2, -imgElement.height / 2);
    ctx.restore();

    onCropComplete(cropCanvas.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden max-w-2xl w-full flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Move size={18} className="text-orange-400" />
            Adjust Frame
          </h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="relative bg-slate-950 flex-1 overflow-hidden cursor-move h-[400px] md:h-[500px]"
             onMouseDown={handleMouseDown}
             onMouseMove={handleMouseMove}
             onMouseUp={handleMouseUp}
             onMouseLeave={handleMouseUp}
        >
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={500} 
            className="w-full h-full object-contain"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-full px-4 py-2 flex items-center gap-4">
            <ZoomOut size={16} className="text-slate-400" />
            <input 
              type="range" 
              min="0.5" 
              max="3" 
              step="0.1" 
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-32 accent-orange-500"
            />
            <ZoomIn size={16} className="text-slate-400" />
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
            <Check size={18} /> Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};