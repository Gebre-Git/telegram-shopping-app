import React, { useState, useEffect, useCallback } from 'react';
import { Product, CartItem, Order, OrderStatus, View } from './types';
import { ShoppingCart, Store, LayoutDashboard, ArrowLeft, Sparkles, Send } from 'lucide-react';
import ProductCard from './components/ProductCard';
import AdminDashboard from './components/AdminDashboard';
import { generateProductPitch, generateStylingAdvice } from './services/geminiService';

// Mock Data
const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Classic White Tee', price: 29.99, category: 'Apparel', image: 'https://picsum.photos/seed/tee/300/300', description: 'A timeless staple for every wardrobe.' },
  { id: 2, name: 'Denim Jacket', price: 89.50, category: 'Outerwear', image: 'https://picsum.photos/seed/denim/300/300', description: 'Rugged yet stylish denim jacket.' },
  { id: 3, name: 'Leather Sneakers', price: 120.00, category: 'Footwear', image: 'https://picsum.photos/seed/shoes/300/300', description: 'Premium leather minimalist sneakers.' },
  { id: 4, name: 'Canvas Backpack', price: 55.00, category: 'Accessories', image: 'https://picsum.photos/seed/bag/300/300', description: 'Durable backpack for daily commute.' },
  { id: 5, name: 'Aviator Sunglasses', price: 145.00, category: 'Accessories', image: 'https://picsum.photos/seed/glass/300/300', description: 'Classic aviators with gold frames.' },
  { id: 6, name: 'Chino Pants', price: 49.99, category: 'Apparel', image: 'https://picsum.photos/seed/pant/300/300', description: 'Comfortable stretch chinos.' },
];

function App() {
  const [view, setView] = useState<View>(View.SHOP);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [aiPitch, setAiPitch] = useState<string>('');
  const [aiStyle, setAiStyle] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  
  // Initialize Telegram WebApp
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      
      // Theme handling
      document.body.style.backgroundColor = window.Telegram.WebApp.themeParams.bg_color || '#ffffff';
    }
    
    // Load mock orders from local storage to persist between reloads (simulated backend)
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  // Cart Logic
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Order Logic
  const handleCheckout = () => {
    if (cart.length === 0) return;

    const newOrder: Order = {
      id: crypto.randomUUID(),
      items: [...cart],
      total: cartTotal,
      status: OrderStatus.PENDING,
      date: new Date().toISOString(),
      customerName: window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'Guest User'
    };

    setOrders(prev => [...prev, newOrder]);
    setCart([]);
    
    // Show success
    window.Telegram?.WebApp?.showPopup({
      title: 'Order Placed',
      message: 'Your order has been sent to the admin for confirmation.',
      buttons: [{type: 'ok'}]
    });
  };

  const handleStatusUpdate = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  // AI Features
  const handleProductClick = useCallback(async (product: Product) => {
    setSelectedProduct(product);
    setView(View.PRODUCT_DETAIL);
    setAiPitch('');
    setAiStyle('');
    
    // Auto-fetch basic AI pitch
    setLoadingAi(true);
    const pitch = await generateProductPitch(product.name, product.category);
    setAiPitch(pitch);
    setLoadingAi(false);
  }, []);

  const fetchStylingAdvice = async () => {
    if (!selectedProduct) return;
    setLoadingAi(true);
    const advice = await generateStylingAdvice(selectedProduct.name);
    setAiStyle(advice);
    setLoadingAi(false);
  };

  // Views
  const renderHeader = () => (
    <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      {view === View.SHOP ? (
        <div className="flex items-center space-x-2">
          <Store className="text-telegram" size={24} />
          <h1 className="text-xl font-bold tracking-tight">LuxeShop</h1>
        </div>
      ) : (
        <div className="flex items-center space-x-2" onClick={() => setView(View.SHOP)}>
          <ArrowLeft className="text-text" size={24} />
          <span className="font-medium text-lg">Back</span>
        </div>
      )}
      
      {view !== View.ADMIN && (
        <button 
          onClick={() => setView(View.CART)} 
          className="relative p-2 hover:bg-secondary rounded-full transition-colors"
        >
          <ShoppingCart size={24} className={cart.length > 0 ? "text-telegram" : "text-hint"} />
          {cart.length > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      )}
    </header>
  );

  const renderBottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg border-t border-gray-100 flex justify-around py-3 pb-safe z-50">
      <button 
        onClick={() => setView(View.SHOP)}
        className={`flex flex-col items-center space-y-1 ${view === View.SHOP || view === View.PRODUCT_DETAIL ? 'text-telegram' : 'text-hint'}`}
      >
        <Store size={24} />
        <span className="text-[10px] font-medium">Shop</span>
      </button>
      <button 
        onClick={() => setView(View.CART)}
        className={`flex flex-col items-center space-y-1 ${view === View.CART ? 'text-telegram' : 'text-hint'}`}
      >
        <ShoppingCart size={24} />
        <span className="text-[10px] font-medium">Cart</span>
      </button>
      <button 
        onClick={() => setView(View.ADMIN)}
        className={`flex flex-col items-center space-y-1 ${view === View.ADMIN ? 'text-telegram' : 'text-hint'}`}
      >
        <LayoutDashboard size={24} />
        <span className="text-[10px] font-medium">Admin</span>
      </button>
    </nav>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    return (
      <div className="pb-24 animate-in slide-in-from-right duration-300">
        <div className="relative h-72 w-full bg-gray-200">
          <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h2 className="text-2xl font-bold text-white">{selectedProduct.name}</h2>
            <p className="text-white/90">{selectedProduct.category}</p>
          </div>
        </div>
        
        <div className="p-5 space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-3xl font-bold text-telegram">${selectedProduct.price}</span>
            <button 
              onClick={() => { addToCart(selectedProduct); setView(View.SHOP); }}
              className="bg-telegram text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform"
            >
              Add to Cart
            </button>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold mb-2 text-gray-700">Description</h3>
            <p className="text-gray-600 leading-relaxed">{selectedProduct.description}</p>
          </div>

          {/* Gemini AI Section */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-purple-600" size={20} />
              <h3 className="font-bold text-purple-800">AI Stylist</h3>
            </div>
            
            {loadingAi && !aiPitch ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-2 bg-purple-200 rounded"></div>
                  <div className="h-2 bg-purple-200 rounded w-5/6"></div>
                </div>
              </div>
            ) : (
              <p className="text-purple-900 text-sm italic mb-4">"{aiPitch}"</p>
            )}

            <button 
              onClick={fetchStylingAdvice}
              disabled={loadingAi || !!aiStyle}
              className="w-full text-xs font-bold uppercase tracking-wider text-purple-600 border border-purple-200 rounded-lg py-2 hover:bg-purple-100 transition-colors disabled:opacity-50"
            >
              {aiStyle ? 'Styling Advice Loaded' : 'Ask: What should I wear this with?'}
            </button>

            {aiStyle && (
              <div className="mt-3 bg-white/50 p-3 rounded-lg text-sm text-purple-800 whitespace-pre-wrap animate-in fade-in">
                {aiStyle}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCart = () => (
    <div className="p-4 pb-24">
      <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-hint">
          <ShoppingCart size={64} className="mb-4 opacity-20" />
          <p>Your cart is empty</p>
          <button 
            onClick={() => setView(View.SHOP)}
            className="mt-4 text-telegram font-semibold"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div key={item.id} className="flex items-center bg-bg border border-gray-100 p-3 rounded-xl shadow-sm">
                <img src={item.image} className="w-16 h-16 rounded-lg object-cover" alt={item.name} />
                <div className="ml-3 flex-grow">
                  <h3 className="font-semibold text-sm">{item.name}</h3>
                  <p className="text-telegram font-bold">${item.price}</p>
                </div>
                <div className="flex items-center bg-secondary rounded-lg">
                  <button onClick={() => updateQuantity(item.id, -1)} className="px-3 py-1 text-lg font-medium">-</button>
                  <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="px-3 py-1 text-lg font-medium">+</button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-secondary p-4 rounded-xl mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-telegram mt-2 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            className="w-full bg-telegram text-telegramText py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2 hover:opacity-90 active:scale-95 transition-all"
          >
            <span>Checkout</span>
            <Send size={20} />
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      {renderHeader()}

      <main className="max-w-md mx-auto w-full">
        {view === View.SHOP && (
          <div className="p-4 pb-24 grid grid-cols-2 gap-4">
            {MOCK_PRODUCTS.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAdd={addToCart} 
                onClick={handleProductClick}
              />
            ))}
          </div>
        )}

        {view === View.PRODUCT_DETAIL && renderProductDetail()}
        {view === View.CART && renderCart()}
        {view === View.ADMIN && <AdminDashboard orders={orders} onUpdateStatus={handleStatusUpdate} />}
      </main>

      {renderBottomNav()}
    </div>
  );
}

export default App;