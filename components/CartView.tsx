import React from 'react';
import { CartItem } from '../types';
import { Trash2, ShoppingBag } from 'lucide-react';

interface CartViewProps {
  cart: CartItem[];
  onRemove: (id: number) => void;
  onCheckout: () => void;
}

const CartView: React.FC<CartViewProps> = ({ cart, onRemove, onCheckout }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-hint p-4">
        <div className="bg-secondary p-6 rounded-full mb-4">
          <ShoppingBag size={48} className="opacity-20" />
        </div>
        <p className="text-lg font-medium">Your cart is empty</p>
        <p className="text-sm text-center mt-2">Start shopping to see items here!</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-32 space-y-4">
      <h2 className="text-2xl font-bold text-text mb-4">Your Cart</h2>
      
      <div className="space-y-3">
        {cart.map((item) => (
          <div key={item.id} className="bg-bg border border-gray-100 p-3 rounded-xl flex items-center shadow-sm">
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-16 h-16 rounded-lg object-cover bg-gray-100"
            />
            <div className="ml-3 flex-grow">
              <h3 className="font-semibold text-sm text-text">{item.name}</h3>
              <p className="text-xs text-hint mb-1">{item.quantity} x ${item.price}</p>
              <p className="font-bold text-telegram">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <button 
              onClick={() => onRemove(item.id)}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="fixed bottom-20 left-4 right-4 bg-bg p-4 rounded-2xl shadow-xl border border-gray-100 z-20">
        <div className="flex justify-between items-center mb-3">
          <span className="text-hint">Total</span>
          <span className="text-xl font-bold text-text">${total.toFixed(2)}</span>
        </div>
        <button 
          onClick={onCheckout}
          className="w-full bg-telegram text-telegramText py-3 rounded-xl font-bold shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default CartView;