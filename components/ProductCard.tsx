import React from 'react';
import { Product } from '../types';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, onClick }) => {
  return (
    <div 
      className="bg-bg rounded-2xl shadow-sm overflow-hidden border border-gray-100 flex flex-col h-full"
      onClick={() => onClick(product)}
    >
      <div className="relative h-40 w-full overflow-hidden bg-gray-100">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-semibold text-text text-sm mb-1 truncate">{product.name}</h3>
        <p className="text-xs text-hint mb-2 uppercase tracking-wide">{product.category}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="font-bold text-telegram text-lg">${product.price}</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAdd(product);
            }}
            className="bg-telegram text-telegramText p-2 rounded-full hover:opacity-90 transition-opacity active:scale-95"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;