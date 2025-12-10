import React, { useState, useEffect } from 'react';
import { ImageUploader } from './ImageUploader';
import { UploadedImage, SavedImage } from '../types';
import { ArrowRight, Loader2, User, Briefcase, History, AlertCircle } from 'lucide-react';

interface HeadshotPanelProps {
  onGenerate: (prompt: string, baseImage: UploadedImage) => Promise<void>;
  isGenerating: boolean;
  history: SavedImage[];
  activeInputImage: UploadedImage | null;
}

export const HeadshotPanel: React.FC<HeadshotPanelProps> = ({ 
  onGenerate, 
  isGenerating, 
  history,
  activeInputImage 
}) => {
  const [baseImage, setBaseImage] = useState<UploadedImage | null>(null);
  const [prompt, setPrompt] = useState('');

  // Effect to handle cumulative edits
  useEffect(() => {
    if (activeInputImage) {
      setBaseImage(activeInputImage);
    }
  }, [activeInputImage]);

  const presets = [
    { label: "Corporate Suit", desc: "Wear a dark navy business suit and white shirt. Background: Professional blurred office." },
    { label: "Tech Casual", desc: "Wear a smart grey t-shirt and blazer. Background: Bright modern startup office." },
    { label: "Studio Black", desc: "Wear a black turtleneck. Background: Dark grey solid studio backdrop with dramatic lighting." },
    { label: "Medical/Lab", desc: "Wear a white medical lab coat. Background: Clean bright hospital or laboratory environment." }
  ];

  const handleSubmit = () => {
    if (!baseImage) return;

    // Simplified, direct instruction is often better for preservation than complex roleplay
    const finalPrompt = `Change the person's outfit and background to match this description: ${prompt}.
    
    CRITICAL INSTRUCTION: Keep the person's face, facial features, hair, and head shape EXACTLY as they appear in the original image. Do not alter the identity. Only modify the clothing and background around the subject.`;

    onGenerate(finalPrompt, baseImage);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <User className="text-indigo-400" />
          Pro Headshot Creator
        </h2>
        <p className="text-slate-400">Upload a casual photo and let AI dress you for success.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Source Photo</h3>
          <ImageUploader 
            label="Upload Selfie / Portrait"
            image={baseImage}
            onUpload={setBaseImage}
            onRemove={() => setBaseImage(null)}
            className="h-80"
          />
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl text-xs text-slate-400 flex gap-2 items-start">
             <AlertCircle size={16} className="text-indigo-400 shrink-0 mt-0.5" />
             <span>
               <strong>Tip:</strong> For best results, ensure your face is evenly lit and looking directly at the camera.
             </span>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
               <Briefcase size={16} /> Select Style
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
               {presets.map((preset, idx) => (
                 <button
                   key={idx}
                   onClick={() => setPrompt(preset.desc)}
                   className="text-left p-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-indigo-500 hover:bg-slate-700 transition-all group"
                 >
                   <span className="block font-semibold text-slate-200 group-hover:text-indigo-300">{preset.label}</span>
                   <span className="text-xs text-slate-500 line-clamp-1">{preset.desc}</span>
                 </button>
               ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-500 uppercase font-semibold">Custom Description</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the desired outfit and background. E.g., 'Wear a beige trench coat in an outdoor city street setting.'"
                className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder:text-slate-600 resize-none"
              />
              <p className="text-[10px] text-slate-500">
                Focus on describing the clothing and background. The AI will attempt to keep your face unchanged.
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!baseImage || !prompt || isGenerating}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" /> Processing Headshot...
              </>
            ) : (
              <>
                Generate Headshot <ArrowRight size={20} />
              </>
            )}
          </button>

           {/* History Section */}
           {history.length > 0 && (
            <div className="pt-8 border-t border-slate-800">
              <h3 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                <History size={20} /> Saved Profiles
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {history.map((item) => (
                  <div key={item.id} className="group relative rounded-lg overflow-hidden border border-slate-700 aspect-[3/4]">
                    <img src={item.imageUrl} alt="Saved Headshot" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                      <p className="text-xs text-white font-medium truncate">Profile Ready</p>
                    </div>
                     <div className="absolute top-1 right-1 bg-indigo-500/90 p-1 rounded-full">
                       <ArrowRight size={10} className="text-white -rotate-45" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};