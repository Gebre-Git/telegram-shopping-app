import React from 'react';
import { Product } from '../types';
import { ShoppingBag, Sparkles, Shirt, Ruler, Info, ArrowLeft } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  aiPitch: string;
  aiAdvice: string;
  loadingAi: boolean;
  onAdd: (product: Product) => void;
  onBack: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ 
  product, 
  aiPitch, 
  aiAdvice, 
  loadingAi, 
  onAdd,
  onBack 
}) => {
  return (
    <div className="bg-bg min-h-screen pb-24 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header Image */}
      <div className="relative h-72 w-full bg-gray-100">
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-text"
        >
          <ArrowLeft size={20} />
        </button>
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <span className="inline-block px-2 py-1 bg-telegram text-telegramText text-xs font-bold rounded-md mb-2">
            {product.category}
          </span>
          <h1 className="text-2xl font-bold text-white shadow-sm">{product.name}</h1>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-hint">Price</p>
            <p className="text-3xl font-bold text-telegram">${product.price}</p>
          </div>
          <button 
            onClick={() => onAdd(product)}
            className="flex items-center space-x-2 bg-telegram text-telegramText px-6 py-3 rounded-xl font-semibold shadow-lg active:scale-95 transition-transform"
          >
            <ShoppingBag size={20} />
            <span>Add to Cart</span>
          </button>
        </div>

        {/* AI Insights Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100 shadow-sm">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="text-indigo-600" size={20} />
            <h3 className="font-bold text-indigo-900">AI Stylist Insights</h3>
          </div>
          
          {loadingAi ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-indigo-200/50 rounded w-3/4"></div>
              <div className="h-4 bg-indigo-200/50 rounded w-full"></div>
              <div className="h-4 bg-indigo-200/50 rounded w-5/6"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/60 p-3 rounded-lg">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">The Vibe</p>
                <p className="text-indigo-900 text-sm leading-relaxed italic">
                  "{aiPitch}"
                </p>
              </div>
              
              <div className="bg-white/60 p-3 rounded-lg">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Style With</p>
                <div className="text-indigo-900 text-sm leading-relaxed">
                  {aiAdvice.split('\n').map((line, i) => (
                    <p key={i} className="mb-1">{line}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <h3 className="font-semibold text-text mb-2">Description</h3>
          <p className="text-gray-600 leading-relaxed text-sm">
            {product.description}
          </p>
        </div>

        {/* Product Details Grid */}
        <div>
          <h3 className="font-semibold text-text mb-3">Product Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary p-3 rounded-xl">
              <div className="flex items-center space-x-2 text-hint mb-1">
                <Shirt size={16} />
                <span className="text-xs font-medium">Material</span>
              </div>
              <p className="text-sm font-semibold text-text">{product.details?.material}</p>
            </div>
            <div className="bg-secondary p-3 rounded-xl">
              <div className="flex items-center space-x-2 text-hint mb-1">
                <Ruler size={16} />
                <span className="text-xs font-medium">Fit</span>
              </div>
              <p className="text-sm font-semibold text-text">{product.details?.fit}</p>
            </div>
            <div className="col-span-2 bg-secondary p-3 rounded-xl">
              <div className="flex items-center space-x-2 text-hint mb-1">
                <Info size={16} />
                <span className="text-xs font-medium">Care Instructions</span>
              </div>
              <p className="text-sm font-semibold text-text">{product.details?.care}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;