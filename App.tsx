import React, { useState, useEffect, useCallback } from 'react';
import { Product, CartItem, Order, OrderStatus, View } from './types';
import { ShoppingCart, Store, LayoutDashboard, Sparkles } from 'lucide-react';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import CartView from './components/CartView';
import AdminDashboard from './components/AdminDashboard';
import { generateProductPitch, generateStylingAdvice } from './services/geminiService';

// Completed Mock Data
const MOCK_PRODUCTS: Product[] = [
  { 
    id: 1, 
    name: 'Classic White Tee', 
    price: 29.99, 
    category: 'Apparel', 
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80', 
    description: 'A timeless staple for every wardrobe. Made from premium organic cotton for a soft, breathable feel.',
    details: { material: '100% Organic Cotton', fit: 'Regular Fit', care: 'Machine wash cold' }
  },
  { 
    id: 2, 
    name: 'Vintage Denim Jacket', 
    price: 89.50, 
    category: 'Outerwear', 
    image: 'https://images.unsplash.com/photo-1551534769-b0f9598fd4b7?auto=format&fit=crop&w=800&q=80', 
    description: 'Rugged yet stylish denim jacket with a vintage wash finish. Perfect for layering.',
    details: { material: '12oz Denim', fit: 'Oversized', care: 'Dry clean only' }
  },
  { 
    id: 3, 
    name: 'Leather Oxford Shoes', 
    price: 120.00, 
    category: 'Footwear', 
    image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80', 
    description: 'Handcrafted premium leather shoes designed for comfort and elegance.',
    details: { material: 'Full-grain Leather', fit: 'True to size', care: 'Polish regularly' }
  },
  {
    id: 4,
    name: 'Minimalist Watch',
    price: 149.99,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    description: 'Sleek design with a genuine leather strap. Water-resistant and durable.',
    details: { material: 'Stainless Steel & Leather', fit: 'Adjustable Strap', care: 'Wipe clean' }
  },
  {
    id: 5,
    name: 'Summer Floral Dress',
    price: 59.99,
    category: 'Apparel',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    description: 'Lightweight and airy, perfect for warm summer days. Features a beautiful floral print.',
    details: { material: '100% Rayon', fit: 'Flowy', care: 'Hand wash cold' }
  },
  {
    id: 6,
    name: 'Urban Backpack',
    price: 75.00,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    description: 'Functional and stylish backpack with laptop compartment and multiple pockets.',
    details: { material: 'Water-resistant Canvas', fit: '20L Capacity', care: 'Spot clean' }
  }
];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.SHOP);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // AI State
  const [aiPitch, setAiPitch] = useState<string>('');
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  // Initialize Telegram WebApp
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.BackButton.onClick(() => handleBack());
    }
  }, [activeView]);

  // Handle Back Button Visibility
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      if (activeView === View.PRODUCT_DETAIL) {
        window.Telegram.WebApp.BackButton.show();
      } else {
        window.Telegram.WebApp.BackButton.hide();
      }
    }
  }, [activeView]);

  const handleBack = () => {
    setActiveView(View.SHOP);
    setSelectedProduct(null);
  };

  const handleProductClick = async (product: Product) => {
    setSelectedProduct(product);
    setActiveView(View.PRODUCT_DETAIL);
    setLoadingAi(true);
    setAiPitch('');
    setAiAdvice('');

    // Trigger AI generation
    try {
      const [pitch, advice] = await Promise.all([
        generateProductPitch(product.name, product.category),
        generateStylingAdvice(product.name)
      ]);
      setAiPitch(pitch);
      setAiAdvice(advice);
    } catch (error) {
      console.error('Failed to generate AI content', error);
    } finally {
      setLoadingAi(false);
    }
  };

  const addToCart = (product: Product) => {
    window.Telegram?.WebApp?.HapticFeedback.impactOccurred('medium');
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    // If not in detail view, show a tiny popup/toast logic here could be nice, 
    // but standard feedback is sufficient for this scope.
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      items: [...cart],
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: OrderStatus.PENDING,
      date: new Date().toISOString(),
      customerName: window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'Guest User'
    };

    setOrders(prev => [...prev, newOrder]);
    setCart([]);
    window.Telegram?.WebApp?.showPopup({
      title: 'Order Placed!',
      message: `Your order #${newOrder.id.slice(0,6)} has been received.`,
      buttons: [{type: 'ok'}]
    });
    setActiveView(View.SHOP);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  return (
    <div className="min-h-screen bg-bg text-text font-sans selection:bg-telegram selection:text-white">
      {/* Navigation Bar (Hidden in Detail View) */}
      {activeView !== View.PRODUCT_DETAIL && (
        <>
          <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Sparkles className="text-telegram" size={24} />
              <h1 className="text-xl font-bold tracking-tight">LuxeShop</h1>
            </div>
            {cart.length > 0 && activeView !== View.CART && (
               <div className="bg-telegram text-telegramText text-xs font-bold px-2 py-1 rounded-full">
                 {cart.reduce((a, b) => a + b.quantity, 0)}
               </div>
            )}
          </header>

          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg border-t border-gray-100 pb-safe pt-2 px-6 flex justify-between items-center h-16 shadow-lg">
            <button 
              onClick={() => setActiveView(View.SHOP)}
              className={`flex flex-col items-center space-y-1 ${activeView === View.SHOP ? 'text-telegram' : 'text-hint'}`}
            >
              <Store size={24} />
              <span className="text-[10px] font-medium">Shop</span>
            </button>
            <button 
              onClick={() => setActiveView(View.CART)}
              className={`flex flex-col items-center space-y-1 relative ${activeView === View.CART ? 'text-telegram' : 'text-hint'}`}
            >
              <div className="relative">
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                    {cart.reduce((a,b) => a + b.quantity, 0)}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">Cart</span>
            </button>
            <button 
              onClick={() => setActiveView(View.ADMIN)}
              className={`flex flex-col items-center space-y-1 ${activeView === View.ADMIN ? 'text-telegram' : 'text-hint'}`}
            >
              <LayoutDashboard size={24} />
              <span className="text-[10px] font-medium">Admin</span>
            </button>
          </nav>
        </>
      )}

      {/* Main Content Area */}
      <main className={`${activeView !== View.PRODUCT_DETAIL ? 'pb-20 pt-4 px-4' : ''}`}>
        
        {activeView === View.SHOP && (
          <div className="grid grid-cols-2 gap-4">
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

        {activeView === View.CART && (
          <CartView 
            cart={cart} 
            onRemove={removeFromCart} 
            onCheckout={handleCheckout} 
          />
        )}

        {activeView === View.ADMIN && (
          <AdminDashboard 
            orders={orders} 
            onUpdateStatus={updateOrderStatus} 
          />
        )}

        {activeView === View.PRODUCT_DETAIL && selectedProduct && (
          <ProductDetail 
            product={selectedProduct}
            aiPitch={aiPitch}
            aiAdvice={aiAdvice}
            loadingAi={loadingAi}
            onAdd={addToCart}
            onBack={handleBack}
          />
        )}
      </main>
    </div>
  );
};

export default App;