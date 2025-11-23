import React from 'react';
import { Order, OrderStatus } from '../types';
import { CheckCircle, XCircle, Package, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface AdminDashboardProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ orders, onUpdateStatus }) => {
  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING);
  const confirmedOrders = orders.filter(o => o.status === OrderStatus.CONFIRMED);

  // Prepare data for chart
  const data = [
    { name: 'Pending', count: pendingOrders.length },
    { name: 'Confirmed', count: confirmedOrders.length },
    { name: 'Rejected', count: orders.filter(o => o.status === OrderStatus.REJECTED).length },
  ];

  return (
    <div className="p-4 space-y-6 pb-24">
      <h2 className="text-2xl font-bold text-text mb-4">Admin Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="text-blue-500 mb-2"><Clock size={24} /></div>
          <div className="text-2xl font-bold text-blue-800">{pendingOrders.length}</div>
          <div className="text-xs text-blue-600">Pending Orders</div>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <div className="text-green-500 mb-2"><CheckCircle size={24} /></div>
          <div className="text-2xl font-bold text-green-800">{confirmedOrders.length}</div>
          <div className="text-xs text-green-600">Confirmed Orders</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-64">
        <h3 className="text-sm font-semibold text-gray-500 mb-4">Order Statistics</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip cursor={{fill: 'transparent'}} />
            <Bar dataKey="count" fill="var(--tg-theme-button-color, #3390ec)" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Order List */}
      <div>
        <h3 className="text-lg font-bold text-text mb-3">Recent Orders</h3>
        {orders.length === 0 ? (
          <div className="text-center py-10 text-hint">
            <Package size={48} className="mx-auto mb-2 opacity-20" />
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...orders].reverse().map(order => (
              <div key={order.id} className="bg-bg border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs text-hint block">#{order.id.slice(0, 8)}</span>
                    <span className="font-semibold block">{order.customerName}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-700' :
                    order.status === OrderStatus.CONFIRMED ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="space-y-1 mb-3">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.quantity}x {item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                  <span className="font-bold">Total: ${order.total.toFixed(2)}</span>
                  
                  {order.status === OrderStatus.PENDING && (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => onUpdateStatus(order.id, OrderStatus.REJECTED)}
                        className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
                      >
                        <XCircle size={20} />
                      </button>
                      <button 
                        onClick={() => onUpdateStatus(order.id, OrderStatus.CONFIRMED)}
                        className="p-2 text-green-500 bg-green-50 rounded-lg hover:bg-green-100"
                      >
                        <CheckCircle size={20} />
                      </button>
                    </div>
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

export default AdminDashboard;