import React, { useState, useEffect } from 'react';
import { ImageUploader } from './ImageUploader';
import { UploadedImage } from '../types';
import { ArrowRight, Loader2, Plus } from 'lucide-react';

interface GeneralPanelProps {
  onGenerate: (prompt: string, baseImage: UploadedImage, refImages: UploadedImage[]) => Promise<void>;
  isGenerating: boolean;
  activeInputImage: UploadedImage | null;
}

export const GeneralPanel: React.FC<GeneralPanelProps> = ({ 
  onGenerate, 
  isGenerating,
  activeInputImage 
}) => {
  const [baseImage, setBaseImage] = useState<UploadedImage | null>(null);
  const [referenceImages, setReferenceImages] = useState<UploadedImage[]>([]);
  const [prompt, setPrompt] = useState('');

  // Effect to handle cumulative edits
  useEffect(() => {
    if (activeInputImage) {
      setBaseImage(activeInputImage);
    }
  }, [activeInputImage]);

  const handleAddReference = (img: UploadedImage) => {
    setReferenceImages(prev => [...prev, img]);
  };

  const handleRemoveReference = (id: string) => {
    setReferenceImages(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = () => {
    if (!baseImage) return;
    
    let finalPrompt = `You are an advanced AI image editor.
    TASK: Edit the provided Base Image according to the instructions.
    
    INSTRUCTIONS: ${prompt}`;

    if (referenceImages.length > 0) {
      finalPrompt += `
      
      ADDITIONAL ASSETS:
      I have provided ${referenceImages.length} additional image(s) to be used as assets or references.
      Please incorporate these specific visual elements into the scene as described in the instructions.
      Match lighting, perspective, and style to make the integration seamless.`;
    }
    
    finalPrompt += `\n\nMake the edits seamless and photorealistic.`;
    
    onGenerate(finalPrompt, baseImage, referenceImages);
  };

  return (
    <div className="space-y-8 animate-fade-in">
       <div>
        <h2 className="text-2xl font-bold text-white mb-2">Creative Editor</h2>
        <p className="text-slate-400">Make complex edits or blend multiple images using natural language.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/2 space-y-6">
           {/* Base Image Section */}
           <div className="space-y-4">
             <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">1. Base Image</h3>
             <ImageUploader 
              label="Upload Image to Edit"
              image={baseImage}
              onUpload={setBaseImage}
              onRemove={() => setBaseImage(null)}
            />
           </div>

           {/* Reference Images Section */}
           <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">2. Assets to Integrate (Optional)</h3>
              <span className="text-xs text-slate-500">{referenceImages.length} items</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {referenceImages.map((img) => (
                <div key={img.id} className="relative group rounded-xl overflow-hidden h-24 border border-slate-700 bg-slate-900">
                  <img src={img.previewUrl} className="w-full h-full object-cover" alt="Reference" />
                  <button 
                    onClick={() => handleRemoveReference(img.id)}
                    className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="rotate-45" size={14} />
                  </button>
                </div>
              ))}
              
              <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors group">
                 <Plus className="text-slate-500 group-hover:text-purple-400 mb-1" size={20} />
                 <span className="text-[10px] text-slate-500 group-hover:text-slate-300 text-center px-1">Add Asset</span>
                 <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                   const file = e.target.files?.[0];
                   if(file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        handleAddReference({
                          id: Math.random().toString(),
                          file,
                          previewUrl: reader.result as string,
                          base64: reader.result as string,
                          mimeType: file.type
                        });
                      };
                      reader.readAsDataURL(file);
                   }
                 }} />
              </label>
            </div>
            <p className="text-xs text-slate-500">
              Upload logos, objects, or textures you want to add to the base image.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">3. Edit Instructions</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Place the logo (image 2) on the wall, change the sky to night time, and make the lighting dramatic."
              className="w-full h-64 bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none placeholder:text-slate-600 resize-none"
            />
            <p className="text-xs text-slate-500">
              Tip: Be specific about how you want the uploaded assets to be used.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!baseImage || !prompt || isGenerating}
            className="w-full py-4 mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" /> Processing Edits...
              </>
            ) : (
              <>
                Apply Edits <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};