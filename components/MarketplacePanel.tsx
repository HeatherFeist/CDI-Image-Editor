import React, { useState, useEffect } from 'react';
import { ImageUploader } from './ImageUploader';
import { ImageCropper } from './ImageCropper';
import { UploadedImage, SavedImage } from '../types';
import { ArrowRight, Loader2, ShieldCheck, History, AlertCircle, Check, Crop, ExternalLink, Store, RefreshCw } from 'lucide-react';

interface MarketplacePanelProps {
  onGenerate: (prompt: string, baseImage: UploadedImage) => Promise<void>;
  isGenerating: boolean;
  history: SavedImage[];
  activeInputImage: UploadedImage | null;
}

export const MarketplacePanel: React.FC<MarketplacePanelProps> = ({ 
  onGenerate, 
  isGenerating, 
  history,
  activeInputImage 
}) => {
  const [productImage, setProductImage] = useState<UploadedImage | null>(null);
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');

  // Effect to handle cumulative edits
  useEffect(() => {
    if (activeInputImage) {
      setProductImage(activeInputImage);
    }
  }, [activeInputImage]);

  const handleUpload = (image: UploadedImage) => {
    // Instead of setting directly, open cropper first
    setCroppingImage(image.previewUrl);
    // We temporarily store the full file object if needed, but for now we just use the preview for cropping
  };

  const handleCropComplete = (croppedBase64: string) => {
    const croppedImage: UploadedImage = {
      id: Math.random().toString(36).substr(2, 9),
      file: new File(["cropped"], "product-crop.png", { type: "image/png" }),
      previewUrl: croppedBase64,
      base64: croppedBase64,
      mimeType: "image/png"
    };
    setProductImage(croppedImage);
    setCroppingImage(null);
  };

  const handleSubmit = () => {
    if (!productImage) return;

    const finalPrompt = `You are a professional product photographer editing an auction listing.
    TASK: Change the background of the image while keeping the foreground product EXACTLY identical.
    
    CRITICAL RULES FOR AUCTION INTEGRITY:
    1. PRESERVE PRODUCT: The foreground object (blouse, shoes, tool, etc.) must remain pixel-perfect where possible.
    2. TEXTURE & DEFECTS: Do NOT smooth out fabric wrinkles, scratches, or wear. 
    3. APPAREL SPECIFIC: If the item is clothing, preserve the drape, fold, and fit exactly. Do not change the color or pattern.
    
    SCENE GENERATION:
    - New Background: "${prompt}"
    - Lighting: Apply lighting to the background that matches the product's existing lighting.
    - Separation: cleanly separate the product from its original background.
    
    The final image should look like a professional e-commerce photo of THIS SPECIFIC ITEM.`;

    onGenerate(finalPrompt, productImage);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {croppingImage && (
        <ImageCropper 
          imageSrc={croppingImage}
          onCropComplete={handleCropComplete}
          onCancel={() => setCroppingImage(null)}
        />
      )}

      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Marketplace Studio</h2>
        <p className="text-slate-400">Create professional staging for your products without hiding their true condition.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider">Product Photo</h3>
          <div className="relative">
            <ImageUploader 
              label="Upload Product"
              image={productImage}
              onUpload={handleUpload}
              onRemove={() => setProductImage(null)}
              className="h-80"
            />
            {productImage && (
              <button 
                onClick={() => setCroppingImage(productImage.previewUrl)}
                className="absolute bottom-4 right-4 bg-slate-900 text-slate-200 p-2 rounded-lg border border-slate-600 hover:bg-slate-800 hover:text-orange-400 transition-colors shadow-lg z-10 flex items-center gap-2 text-xs font-bold"
                title="Crop Image"
              >
                <Crop size={16} /> Re-Crop
              </button>
            )}
          </div>
          
          <div className="bg-emerald-900/20 border border-emerald-700/50 p-4 rounded-xl flex gap-3 items-start">
            <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-semibold text-emerald-200 mb-1">True to Life Guarantee</p>
              <p className="text-xs text-emerald-200/70">
                AI is instructed to preserve all defects, scratches, and details.
              </p>
            </div>
          </div>

          {/* CDI Marketplace Integration Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-5 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2">
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Live Sync</span>
                </div>
             </div>
             
             <div className="flex items-center gap-2 mb-2 text-orange-400 font-bold text-sm">
               <Store size={18} /> CDI Marketplace
             </div>
             <p className="text-xs text-slate-400 mb-4 pr-16 leading-relaxed">
               Generated assets are automatically formatted for the marketplace. Send them directly to your seller dashboard.
             </p>
             <div className="grid grid-cols-2 gap-3">
                <a 
                  href="https://marketplace.constructivedesignsinc.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold py-2.5 px-3 rounded-lg transition-colors shadow-md shadow-orange-900/20"
                >
                  Launch App <ExternalLink size={12} />
                </a>
                <a 
                  href="https://marketplace.constructivedesignsinc.org/dashboard" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold py-2.5 px-3 rounded-lg border border-slate-600 transition-colors"
                >
                  Seller Dash
                </a>
             </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl flex gap-2 items-start text-xs text-slate-400">
             <AlertCircle size={14} className="mt-0.5 text-orange-400 shrink-0" />
             <p>
               <strong>Tip:</strong> Crop your product tightly (1:1 square) for the best results on the marketplace listing page.
             </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider">Background Setting</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
               {[
                 "On a clean white marble countertop",
                 "Floating against a soft pastel gradient",
                 "Hanging on a rack in a boutique store",
                 "Laid flat on rustic white wood planks"
               ].map((preset, idx) => (
                 <button
                   key={idx}
                   onClick={() => setPrompt(preset)}
                   className="text-left text-xs p-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-orange-500 hover:text-orange-300 transition-colors"
                 >
                   {preset}
                 </button>
               ))}
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the background scene... e.g. On a velvet podium with dramatic spotlighting."
              className="w-full h-40 bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none placeholder:text-slate-600 resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!productImage || !prompt || isGenerating}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" /> Staging Product...
              </>
            ) : (
              <>
                Generate Staged Photo <ArrowRight size={20} />
              </>
            )}
          </button>

           {/* History Section */}
           {history.length > 0 && (
            <div className="pt-8 border-t border-slate-800">
              <h3 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                <History size={20} /> CDI Marketplace • Listing Bucket
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {history.map((item) => (
                  <div key={item.id} className="group relative rounded-lg overflow-hidden border border-slate-700 aspect-square hover:border-orange-500 transition-colors">
                    <img src={item.imageUrl} alt="Saved Asset" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                      <p className="text-xs text-white font-medium truncate">Synced to Marketplace</p>
                    </div>
                     <div className="absolute top-1 right-1 bg-emerald-600/90 p-1 rounded-full shadow-sm flex items-center justify-center w-5 h-5">
                       <Check size={10} className="text-white" />
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