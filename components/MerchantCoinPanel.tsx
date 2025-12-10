import React, { useState, useEffect } from 'react';
import { ImageUploader } from './ImageUploader';
import { UploadedImage, SavedImage } from '../types';
import { ArrowRight, Loader2, Coins, Gem, Zap, History, Plus, Upload, Type, AlertCircle, Wallet } from 'lucide-react';

interface MerchantCoinPanelProps {
  onGenerate: (prompt: string, baseImage: UploadedImage | null) => Promise<void>;
  isGenerating: boolean;
  history: SavedImage[];
  activeInputImage: UploadedImage | null;
}

type CoinMode = 'enhance' | 'create';

export const MerchantCoinPanel: React.FC<MerchantCoinPanelProps> = ({ 
  onGenerate, 
  isGenerating, 
  history,
  activeInputImage 
}) => {
  const [mode, setMode] = useState<CoinMode>('enhance');
  const [coinImage, setCoinImage] = useState<UploadedImage | null>(null);
  const [coinName, setCoinName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  // Effect to handle cumulative edits
  useEffect(() => {
    if (activeInputImage) {
      setCoinImage(activeInputImage);
      setMode('enhance'); // Switch to enhance mode if we are editing a result
    }
  }, [activeInputImage]);

  const presets = [
    { 
      label: "Gold & Luxury", 
      icon: <Gem size={16} />,
      desc: "High-polish 3D gold texture. Background: Dark velvet luxury setting with rim lighting." 
    },
    { 
      label: "Cyber Neon", 
      icon: <Zap size={16} />,
      desc: "Glowing futuristic neon edges. Background: Cyberpunk city grid with teal and orange lights." 
    },
    { 
      label: "3D Floating", 
      icon: <Coins size={16} />,
      desc: "Solid 3D object floating in mid-air. Background: Clean, modern abstract gradient." 
    },
    { 
      label: "Professional Marketing", 
      icon: <History size={16} />,
      desc: "Displayed on a sleek corporate podium. Background: Professional blurred office environment." 
    }
  ];

  const handleSubmit = () => {
    setShowValidation(false);

    if (mode === 'enhance' && !coinImage) return;
    
    // VALIDATION: Prompt user for name if missing in Create mode
    if (mode === 'create' && !coinName.trim()) {
      setShowValidation(true);
      return;
    }

    if (!prompt) return;

    let finalPrompt = '';

    if (mode === 'enhance' && coinImage) {
      finalPrompt = `You are an expert 3D branding artist and marketing designer.
      TASK: Enhance the provided Merchant Coin or Logo image for a high-end marketing campaign.
      
      INSTRUCTIONS:
      1. SUBJECT ENHANCEMENT: Treat the input image as a "Coin" or "Token". Enhance its appearance to look like a premium physical object (add subtle depth, texture, or sheen while keeping the logo/design clear).
      2. BACKGROUND & STYLE: ${prompt}
      3. LIGHTING: Use professional studio lighting to highlight the details of the coin.
      4. COMPOSITION: Center the coin or place it dynamically for a marketing advertisement.
      
      Make the final image look like a high-budget 3D render or professional product photo.`;
      
      onGenerate(finalPrompt, coinImage);
    } else {
      // Create from Scratch
      finalPrompt = `You are an expert logo designer and 3D artist.
      TASK: Create a new branded token or coin from scratch.
      
      BRAND NAME: "${coinName}"
      
      DESIGN STYLE & BACKGROUND: ${prompt}
      
      INSTRUCTIONS:
      1. LOGO DESIGN: Create a modern, iconic logo for the brand named "${coinName}". The text "${coinName}" should be clearly legible on the coin face.
      2. 3D RENDERING: Render this as a high-quality physical "Merchant Coin" or "Medallion". 
      3. VISUALS: Ensure high resolution, sharp details, and premium materials (gold, silver, holographic, etc. based on style).
      
      Output a photorealistic 3D render of this new coin asset.`;
      
      onGenerate(finalPrompt, null);
    }
  };

  // Button disabled logic: Only disable if purely essential generation blockers exist (like isGenerating). 
  // We leave it enabled for missing Name so we can show the validation error on click.
  const isDisabled = isGenerating || (mode === 'enhance' && !coinImage) || !prompt;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Coins className="text-orange-400" />
            Merchant Coin Studio
          </h2>
          <p className="text-slate-400">Design premium marketing visuals or generate new brand assets.</p>
        </div>
        
        <div className="bg-slate-900 p-1 rounded-xl flex border border-slate-700">
          <button
            onClick={() => setMode('enhance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'enhance' 
                ? 'bg-orange-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload size={16} /> Enhance Upload
          </button>
          <button
            onClick={() => setMode('create')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'create' 
                ? 'bg-orange-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus size={16} /> Create New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider">
            {mode === 'enhance' ? 'Coin / Logo Upload' : 'Brand Details'}
          </h3>
          
          {mode === 'enhance' ? (
            <ImageUploader 
              label="Upload Coin or Logo"
              image={coinImage}
              onUpload={setCoinImage}
              onRemove={() => setCoinImage(null)}
              className="h-80"
            />
          ) : (
            <div className={`h-80 bg-slate-800/50 border rounded-2xl p-6 flex flex-col justify-center space-y-6 transition-colors ${
              showValidation && !coinName.trim() ? 'border-red-500 bg-red-500/5' : 'border-slate-700'
            }`}>
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border transition-colors ${
                  showValidation && !coinName.trim() ? 'bg-red-500/20 border-red-500/50' : 'bg-orange-600/20 border-orange-500/30'
                }`}>
                  <Type className={showValidation && !coinName.trim() ? 'text-red-400' : 'text-orange-400'} size={32} />
                </div>
                <h4 className="text-white font-medium mb-1">Name Your Coin</h4>
                <p className="text-xs text-slate-500">What text should appear on the coin?</p>
              </div>
              
              <div>
                <input
                  type="text"
                  value={coinName}
                  onChange={(e) => {
                    setCoinName(e.target.value);
                    if (e.target.value) setShowValidation(false);
                  }}
                  placeholder="e.g. Bitcoin, CDI Token..."
                  className={`w-full bg-slate-900 border rounded-xl px-4 py-3 text-center text-white font-bold text-lg focus:ring-2 focus:outline-none placeholder:text-slate-600 ${
                    showValidation && !coinName.trim() 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-600 focus:ring-orange-500 focus:border-transparent'
                  }`}
                />
                {showValidation && !coinName.trim() && (
                  <div className="flex items-center justify-center gap-1 mt-2 text-red-400 text-xs animate-pulse">
                    <AlertCircle size={12} />
                    <span>Please enter a coin name</span>
                  </div>
                )}
              </div>

              <div className="text-center">
                 <p className="text-xs text-orange-400/80">
                   AI will generate a unique logo and 3D coin design based on this name.
                 </p>
              </div>
            </div>
          )}
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
              <label className="text-xs text-slate-500 uppercase font-semibold">Custom Design Instructions</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === 'enhance' 
                  ? "Describe the marketing background... e.g. Floating above a digital circuit board." 
                  : "Describe the logo style... e.g. Minimalist geometric lion head, matte black finish."
                }
                className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none placeholder:text-slate-600 resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isDisabled}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" /> {mode === 'enhance' ? 'Rendering Visuals...' : 'Minting New Coin...'}
              </>
            ) : (
              <>
                {mode === 'enhance' ? 'Generate Marketing Asset' : 'Generate New Coin'} <ArrowRight size={20} />
              </>
            )}
          </button>

           {/* History Section - Updated to "Bucket" */}
           {history.length > 0 && (
            <div className="pt-8 border-t border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-300 flex items-center gap-2">
                  <Wallet size={20} className="text-orange-400" /> 
                  Quantum Wallet • Asset Bucket
                </h3>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-md border border-emerald-900">
                  {history.length} Assets Synced
                </span>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {history.map((item) => (
                  <div key={item.id} className="group relative rounded-xl overflow-hidden border border-slate-700 aspect-square shadow-lg shadow-black/40">
                    <img src={item.imageUrl} alt="Saved Asset" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                      <p className="text-[10px] text-orange-200 font-medium uppercase tracking-wider mb-0.5">Quantum Vault</p>
                      <p className="text-xs text-white font-bold truncate">Synced Asset</p>
                    </div>
                     <div className="absolute top-1 right-1 bg-gradient-to-br from-orange-500 to-red-600 p-1.5 rounded-full shadow-md">
                       <Zap size={10} className="text-white fill-white" />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-[10px] text-slate-500 mt-4">
                These assets are saved in your bucket and ready for deployment to the Quantum Wallet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};