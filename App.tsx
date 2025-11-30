
import React, { useState, useEffect, useRef } from 'react';
import { Product, Order, OrderStatus } from './types';
import { ShoppingCart, Search, Menu, Star, Upload, Check, Loader2, Lock, ArrowLeft, Package, X } from 'lucide-react';
import axios from 'axios';

// --- CONFIGURATION ---
// REPLACE THIS WITH YOUR DEPLOYED RAILWAY BACKEND URL
// Example: const API_URL = 'https://s-shop-backend.up.railway.app';
const API_URL = 'http://localhost:5000'; 

// --- Mock Data (Amazon Style) ---
const PRODUCTS: Product[] = [
  { id: 1, name: 'Wireless Noise Cancelling Headphones', price: 299.99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', rating: 4.8, reviews: 2450 },
  { id: 2, name: 'Smart Fitness Watch Series 7', price: 199.50, category: 'Wearables', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', rating: 4.5, reviews: 1200 },
  { id: 3, name: 'Professional DSLR Camera Kit', price: 850.00, category: 'Photography', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80', rating: 4.9, reviews: 890 },
  { id: 4, name: 'Ergonomic Office Chair', price: 149.99, category: 'Furniture', image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80', rating: 4.2, reviews: 450 },
  { id: 5, name: 'Gaming Laptop 15" 16GB RAM', price: 1299.00, category: 'Computers', image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&q=80', rating: 4.7, reviews: 3200 },
  { id: 6, name: 'Ceramic Coffee Mug Set', price: 24.99, category: 'Home', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80', rating: 4.0, reviews: 150 },
];

const App: React.FC = () => {
  const [view, setView] = useState<'shop' | 'checkout' | 'admin' | 'login'>('shop');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if Telegram WebApp is available
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      try {
        window.Telegram.WebApp.expand();
      } catch (e) {
        console.log('Expand not supported on this version');
      }
    }
  }, []);

  // --- Safe Telegram Helpers ---
  const safeShowAlert = (message: string) => {
    const tg = window.Telegram?.WebApp;
    // showAlert requires version 6.2+. 
    // In version 6.0, window.alert is overridden but sometimes buggy.
    // We use a custom modal fallback to be safe.
    if (tg && tg.isVersionAtLeast && tg.isVersionAtLeast('6.2')) {
      tg.showAlert(message);
    } else {
      setAlertMessage(message);
    }
  };

  const safeHaptic = (style: 'light' | 'medium' | 'heavy') => {
    const tg = window.Telegram?.WebApp;
    // HapticFeedback requires version 6.1+
    if (tg && tg.HapticFeedback && tg.isVersionAtLeast && tg.isVersionAtLeast('6.1')) {
      tg.HapticFeedback.impactOccurred(style);
    }
  };

  // --- Views ---

  const ShopView = () => (
    <div className="pb-20 bg-gray-100 min-h-screen">
      {/* Amazon-like Header */}
      <div className="bg-[#232f3e] p-4 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <Menu className="text-white" />
          <h1 className="text-white font-bold text-lg flex-grow">S-Shop</h1>
          <ShoppingCart className="text-white" />
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search S-Shop..." 
            className="w-full p-2 pl-3 rounded-md text-sm outline-none"
          />
          <button className="absolute right-0 top-0 h-full bg-[#febd69] px-3 rounded-r-md flex items-center justify-center">
            <Search size={18} className="text-[#232f3e]" />
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-[#37475a] text-white p-2 text-xs flex justify-center items-center gap-2">
        <span>Deliver to Ethiopia</span>
      </div>

      {/* Product Grid */}
      <div className="p-2 grid grid-cols-2 gap-2">
        {PRODUCTS.map(product => (
          <div key={product.id} className="bg-white p-3 rounded-sm shadow-sm flex flex-col h-full">
            <div className="h-40 w-full flex items-center justify-center mb-2 bg-white">
              <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
            </div>
            <h3 className="text-sm text-gray-800 line-clamp-3 mb-1 leading-tight">{product.name}</h3>
            <div className="flex items-center mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className={`${i < Math.floor(product.rating || 0) ? 'text-[#ffa41c] fill-[#ffa41c]' : 'text-gray-300'}`} />
              ))}
              <span className="text-xs text-blue-600 ml-1">{product.reviews}</span>
            </div>
            <div className="mt-auto">
              <div className="flex items-start">
                <span className="text-xs align-top mt-1">$</span>
                <span className="text-2xl font-medium">{Math.floor(product.price)}</span>
                <span className="text-xs align-top mt-1">{(product.price % 1).toFixed(2).substring(1)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-2">Get it by tomorrow</p>
            <button 
              onClick={() => {
                setSelectedProduct(product);
                setView('checkout');
              }}
              className="w-full bg-[#ffd814] border border-[#fcd200] rounded-full py-2 text-sm text-[#0F1111] hover:bg-[#f7ca00] active:scale-95 transition-transform"
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>

      {/* Admin Link Footer */}
      <div className="p-8 text-center mt-4 border-t bg-white">
        <button onClick={() => setView('login')} className="text-gray-400 text-xs hover:underline">
          Admin Panel Access
        </button>
      </div>
    </div>
  );

  const CheckoutView = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Simple client-side size check (e.g. 5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          safeShowAlert("Image is too large. Please use an image under 5MB.");
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setScreenshot(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const submitOrder = async () => {
      if (!screenshot || !selectedProduct) {
        safeShowAlert("Please upload a payment screenshot.");
        return;
      }

      setIsSubmitting(true);
      
      // Get User ID from Telegram Web App or generate a random one for web testing
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      const userId = tgUser?.id?.toString() || 'web_guest_' + Math.floor(Math.random() * 10000);
      const userName = tgUser?.first_name || 'Web Guest';

      try {
        await axios.post(`${API_URL}/api/orders/create`, {
          items: [{ ...selectedProduct, quantity: 1 }],
          total: selectedProduct.price,
          screenshot,
          telegramUserId: userId,
          customerName: userName,
        });
        
        safeShowAlert("Order placed successfully! Delivery is on the way once confirmed.");
        safeHaptic('heavy');
        setView('shop');
        setScreenshot(null);
        setSelectedProduct(null);
      } catch (error) {
        console.error(error);
        safeShowAlert("Failed to place order. Please check your connection.");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-[#232f3e] text-white p-4 flex items-center gap-2 shadow-sm">
          <button onClick={() => setView('shop')}><ArrowLeft /></button>
          <h2 className="font-bold text-lg">Checkout</h2>
        </div>

        <div className="p-4 flex-grow">
          {/* Order Summary */}
          {selectedProduct && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4 flex gap-4">
              <img src={selectedProduct.image} className="w-20 h-20 object-contain" alt="" />
              <div>
                <h3 className="font-medium text-sm line-clamp-2">{selectedProduct.name}</h3>
                <p className="font-bold text-lg text-[#B12704] mt-1">${selectedProduct.price}</p>
                <p className="text-xs text-green-600">In Stock</p>
              </div>
            </div>
          )}

          {/* Payment Instructions */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
            <h3 className="font-bold text-lg mb-2">Payment Required</h3>
            <p className="text-sm text-gray-600 mb-3">
              Transfer <span className="font-bold text-black">${selectedProduct?.price}</span> via TelBirr to:
            </p>
            <div className="bg-gray-100 p-3 rounded border border-gray-300 font-mono text-center text-xl tracking-wider select-all cursor-pointer" onClick={() => {
                navigator.clipboard.writeText("0973393381");
                safeShowAlert("Number copied!");
            }}>
              0973393381
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Tap number to copy</p>
          </div>

          {/* Upload Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <h3 className="font-bold text-sm mb-3">Upload Payment Screenshot</h3>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${screenshot ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              {screenshot ? (
                <div className="relative w-full h-full p-2">
                  <img src={screenshot} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                    <span className="bg-white text-xs px-2 py-1 rounded-full shadow">Tap to change</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-gray-100 p-3 rounded-full mb-2">
                    <Upload className="text-gray-400" size={24} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Upload Screenshot</span>
                  <span className="text-xs text-gray-400 mt-1">JPG or PNG</span>
                </>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <button 
            onClick={submitOrder}
            disabled={isSubmitting}
            className={`w-full py-3.5 rounded-lg font-bold shadow-sm flex justify-center items-center gap-2 ${isSubmitting ? 'bg-gray-300' : 'bg-[#ffd814] border border-[#fcd200] active:bg-[#f7ca00]'}`}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Place Order'}
          </button>
        </div>
      </div>
    );
  };

  const AdminLogin = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <Lock size={24} className="text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Login</h2>
        <input 
          type="password" 
          placeholder="Password (admin123)"
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
          value={adminPassword}
          onChange={e => setAdminPassword(e.target.value)}
        />
        <button 
          onClick={() => {
            if (adminPassword === 'admin123') setView('admin');
            else safeShowAlert('Invalid Password');
          }}
          className="w-full bg-[#232f3e] text-white py-3 rounded-lg font-bold hover:bg-[#37475a] transition-colors"
        >
          Sign In
        </button>
        <button onClick={() => setView('shop')} className="w-full mt-4 text-gray-500 text-sm hover:text-gray-800">
          Back to Shop
        </button>
      </div>
    </div>
  );

  const AdminPanel = () => {
    useEffect(() => {
      fetchOrders();
    }, []);

    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await axios.get(`${API_URL}/api/orders`);
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        safeShowAlert("Failed to load orders");
      } finally {
        setLoadingOrders(false);
      }
    };

    const confirmOrder = async (orderId: string, userId: string) => {
      try {
        await axios.post(`${API_URL}/api/orders/confirm`, { orderId, telegramUserId: userId });
        safeShowAlert("Order Confirmed & Notification Sent!");
        fetchOrders();
      } catch (err) {
        console.error(err);
        safeShowAlert('Error confirming order');
      }
    };

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="bg-[#232f3e] text-white p-4 flex justify-between items-center shadow-md">
          <h2 className="font-bold text-lg">Admin Dashboard</h2>
          <div className="flex gap-2">
            <button onClick={fetchOrders} className="text-sm bg-[#37475a] px-3 py-1 rounded hover:bg-[#485769]">Refresh</button>
            <button onClick={() => setView('shop')} className="text-sm bg-[#febd69] text-black px-3 py-1 rounded font-bold">Logout</button>
          </div>
        </div>

        <div className="p-4 flex-grow overflow-auto">
          {loadingOrders ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p>Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Package size={48} className="mb-2 opacity-50" />
              <p>No orders found</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl mx-auto">
              {orders.map(order => (
                <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 p-3 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Order ID</p>
                      <p className="text-xs font-mono text-gray-700">{order._id?.slice(-6)}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === OrderStatus.CONFIRMED ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Customer Info */}
                    <div className="flex justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-gray-400">ID: {order.telegramUserId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-bold text-xl text-[#B12704]">${order.total}</p>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="mb-4 bg-gray-50 p-2 rounded">
                      <p className="text-sm text-gray-600">{order.items[0]?.name} (x{order.items[0]?.quantity})</p>
                    </div>

                    {/* Screenshot */}
                    <div className="mb-4">
                       <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Payment Proof</p>
                       <div className="h-40 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                         <img src={order.screenshot} alt="Proof" className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform" onClick={() => window.open(order.screenshot)} />
                       </div>
                    </div>

                    {/* Actions */}
                    {order.status === OrderStatus.PENDING && (
                      <button 
                        onClick={() => confirmOrder(order._id!, order.telegramUserId)}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-green-700 shadow-sm active:transform active:scale-95 transition-all"
                      >
                        <Check size={18} /> Confirm Payment & Notify
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {view === 'shop' && <ShopView />}
      {view === 'checkout' && <CheckoutView />}
      {view === 'login' && <AdminLogin />}
      {view === 'admin' && <AdminPanel />}

      {/* Custom Alert Modal */}
      {alertMessage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative">
             <button 
               onClick={() => setAlertMessage(null)}
               className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600"
             >
               <X size={20} />
             </button>
             <h3 className="text-lg font-bold mb-2 text-[#232f3e]">Notification</h3>
             <p className="text-gray-600 mb-6">{alertMessage}</p>
             <button 
               onClick={() => setAlertMessage(null)}
               className="w-full bg-[#ffd814] border border-[#fcd200] text-[#0F1111] py-3 rounded-lg font-bold hover:bg-[#f7ca00]"
             >
               OK
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
