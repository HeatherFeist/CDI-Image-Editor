import React, { useState, useEffect } from 'react';
import { ImageUploader } from './ImageUploader';
import { UploadedImage, SavedImage } from '../types';
import { ArrowRight, Loader2, Coins, Gem, Zap, History } from 'lucide-react';

interface MerchantCoinPanelProps {
  onGenerate: (prompt: string, baseImage: UploadedImage) => Promise<void>;
  isGenerating: boolean;
  history: SavedImage[];
  activeInputImage: UploadedImage | null;
}

export const MerchantCoinPanel: React.FC<MerchantCoinPanelProps> = ({ 
  onGenerate, 
  isGenerating, 
  history,
  activeInputImage 
}) => {
  const [coinImage, setCoinImage] = useState<UploadedImage | null>(null);
  const [prompt, setPrompt] = useState('');

  // Effect to handle cumulative edits
  useEffect(() => {
    if (activeInputImage) {
      setCoinImage(activeInputImage);
    }
  }, [activeInputImage]);

  const presets = [
    { 
      label: "Gold & Luxury", 
      icon: <Gem size={16} />,
      desc: "Render the coin with a high-polish 3D gold texture. Background: Dark velvet luxury setting with rim lighting." 
    },
    { 
      label: "Cyber Neon", 
      icon: <Zap size={16} />,
      desc: "Give the coin a glowing futuristic neon edge. Background: Cyberpunk city grid with teal and orange lights." 
    },
    { 
      label: "3D Floating", 
      icon: <Coins size={16} />,
      desc: "Make the coin appear as a solid 3D object floating in mid-air. Background: Clean, modern abstract gradient." 
    },
    { 
      label: "Professional Marketing", 
      icon: <History size={16} />,
      desc: "Display the coin on a sleek corporate podium. Background: Professional blurred office or showroom environment." 
    }
  ];

  const handleSubmit = () => {
    if (!coinImage) return;

    const finalPrompt = `You are an expert 3D branding artist and marketing designer.
    TASK: Enhance the provided Merchant Coin or Logo image for a high-end marketing campaign.
    
    INSTRUCTIONS:
    1. SUBJECT ENHANCEMENT: Treat the input image as a "Coin" or "Token". Enhance its appearance to look like a premium physical object (add subtle depth, texture, or sheen while keeping the logo/design clear).
    2. BACKGROUND: ${prompt}
    3. LIGHTING: Use professional studio lighting to highlight the details of the coin.
    4. COMPOSITION: Center the coin or place it dynamically for a marketing advertisement.
    
    Make the final image look like a high-budget 3D render or professional product photo.`;

    onGenerate(finalPrompt, coinImage);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Coins className="text-orange-400" />
          Merchant Coin Studio
        </h2>
        <p className="text-slate-400">Design premium marketing visuals, 3D renders, and social media assets for your brand tokens.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider">Coin / Logo Upload</h3>
          <ImageUploader 
            label="Upload Coin or Logo"
            image={coinImage}
            onUpload={setCoinImage}
            onRemove={() => setCoinImage(null)}
            className="h-80"
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider">Marketing Style</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
               {presets.map((preset, idx) => (
                 <button
                   key={idx}
                   onClick={() => setPrompt(preset.desc)}
                   className="flex items-start gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-orange-500 hover:bg-slate-700 transition-all group text-left"
                 >
                   <div className="bg-slate-900 p-2 rounded-lg text-orange-400 group-hover:text-orange-300 transition-colors">
                     {preset.icon}
                   </div>
                   <div>
                     <span className="block font-semibold text-slate-200 group-hover:text-orange-300 mb-1">{preset.label}</span>
                     <span className="text-xs text-slate-500 line-clamp-2">{preset.desc}</span>
                   </div>
                 </button>
               ))}
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-slate-500 uppercase font-semibold">Custom Marketing Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the desired marketing scene... e.g. Floating above a digital circuit board map of the world."
                className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none placeholder:text-slate-600 resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!coinImage || !prompt || isGenerating}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" /> Minting Visuals...
              </>
            ) : (
              <>
                Generate Marketing Asset <ArrowRight size={20} />
              </>
            )}
          </button>

           {/* History Section */}
           {history.length > 0 && (
            <div className="pt-8 border-t border-slate-800">
              <h3 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                <History size={20} /> Saved Branding Assets
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {history.map((item) => (
                  <div key={item.id} className="group relative rounded-lg overflow-hidden border border-slate-700 aspect-square">
                    <img src={item.imageUrl} alt="Saved Asset" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                      <p className="text-xs text-white font-medium truncate">Coin Asset</p>
                    </div>
                     <div className="absolute top-1 right-1 bg-yellow-500/90 p-1 rounded-full">
                       <ArrowRight size={10} className="text-black -rotate-45" />
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