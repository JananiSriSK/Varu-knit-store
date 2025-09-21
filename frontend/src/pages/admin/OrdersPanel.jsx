import React, { useState } from "react";
import { Eye, Check, X, RefreshCw, User, Package, MapPin, CreditCard } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import api from "../../services/api";

const OrdersPanel = ({ orders = [], onUpdate }) => {
  const [updating, setUpdating] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sortFilter, setSortFilter] = useState('recent');

  const { addNotification } = useNotification();



  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const response = await api.updateOrderStatus(orderId, newStatus);
      const data = await response.json();
      
      if (data.success) {
        onUpdate(); // Refresh the orders list
        addNotification(`Order status updated to ${newStatus}`, 'success');
      } else {
        addNotification(data.message || 'Failed to update order status', 'error');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      addNotification('Failed to update order status', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const getSortedOrders = () => {
    let sortedOrders = [...orders];
    
    switch (sortFilter) {
      case 'recent':
        return sortedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'delayed':
        return sortedOrders.filter(order => order.orderStatus === 'Shipping Delayed');
      case 'verification':
        return sortedOrders.filter(order => 
          order.orderStatus === 'Order Placed' || 
          order.orderStatus === 'Verification Pending' ||
          order.paymentInfo?.status === 'pending'
        );
      case 'shipped':
        return sortedOrders.filter(order => order.orderStatus === 'Shipped');
      case 'delivered':
        return sortedOrders.filter(order => order.orderStatus === 'Delivered');
      default:
        return sortedOrders;
    }
  };

  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-700">
          Manage Orders
        </h2>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">Sort by:</label>
          <select
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
          >
            <option value="recent">Recent Orders</option>
            <option value="verification">Need Verification</option>
            <option value="delayed">Delayed Orders</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-xl p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
          <thead className="bg-gradient-to-r from-[#e8e0ff] to-[#f0ebff]">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Order ID</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">User</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Items</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Total (₹)</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Payment</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {getSortedOrders().map((order) => (
              <tr key={order._id} className="border-t border-gray-100/70 hover:bg-gray-50/50 transition-colors duration-200">
                <td className="py-4 px-6 text-gray-800 font-mono text-sm">{order._id.slice(-8)}</td>
                <td className="py-4 px-6 text-gray-800">{order.user?.name || 'Unknown User'}</td>
                <td className="py-4 px-6 text-gray-600">{order.orderItems.length}</td>
                <td className="py-4 px-6 text-gray-800 font-semibold">₹{order.totalPrice}</td>
                <td className="py-4 px-6">
                  <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                    order.paymentInfo?.status === 'pending' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {order.paymentInfo?.status === 'pending' ? 'Pending Verification' : 'Verified'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                      order.orderStatus === "Order Placed"
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : order.orderStatus === "Verification Pending"
                        ? "bg-orange-100 text-orange-700 border border-orange-200"
                        : order.orderStatus === "Verified and Confirmed"
                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : order.orderStatus === "Shipped"
                        ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                        : order.orderStatus === "Shipping Delayed"
                        ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        : order.orderStatus === "Delivered"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    {/* Status Update Dropdown */}
                    <select
                      value={order.orderStatus}
                      onChange={(e) => {
                        if (e.target.value !== order.orderStatus) {
                          if (confirm(`Update order status to ${e.target.value}?`)) {
                            updateStatus(order._id, e.target.value);
                          } else {
                            e.target.value = order.orderStatus;
                          }
                        }
                      }}
                      disabled={updating === order._id || order.orderStatus === "Delivered" || order.orderStatus === "Cancelled"}
                      className="text-xs px-2 py-1 border border-gray-200/50 rounded-lg bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
                    >
                      <option value="Order Placed">Order Placed</option>
                      <option value="Verification Pending">Verification Pending</option>
                      <option value="Verified and Confirmed">Verified and Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Shipping Delayed">Shipping Delayed</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-[#7b5fc4] hover:text-[#6b4fb4] transition-colors duration-200"
                      title="View Order Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {getSortedOrders().length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  {sortFilter === 'recent' ? 'No orders found.' : `No ${sortFilter} orders found.`}
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>
      
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Info */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Order Information
                    </h3>
                    <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                    <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> {selectedOrder.orderStatus}</p>
                    <p><strong>Total:</strong> ₹{selectedOrder.totalPrice}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Customer Information
                    </h3>
                    <p><strong>Name:</strong> {selectedOrder.user?.name}</p>
                    <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Shipping Address
                    </h3>
                    <p>{selectedOrder.shippingInfo.address}</p>
                    <p>{selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.state}</p>
                    <p>{selectedOrder.shippingInfo.country} - {selectedOrder.shippingInfo.pinCode}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Order Items</h3>
                    {selectedOrder.orderItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Size: {item.size} | Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Payment Screenshot */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Payment Information
                    </h3>
                    <p><strong>Payment ID:</strong> {selectedOrder.paymentInfo.id}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        selectedOrder.paymentInfo.status === 'pending' ? 'bg-orange-200 text-orange-800' : 'bg-green-200 text-green-800'
                      }`}>
                        {selectedOrder.paymentInfo.status === 'pending' ? 'Pending Verification' : 'Verified'}
                      </span>
                    </p>
                  </div>
                  
                  {selectedOrder.paymentInfo?.screenshot && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">Payment Screenshot</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <img
                          src={selectedOrder.paymentInfo.screenshot}
                          alt="Payment Screenshot"
                          className="w-full h-auto max-h-96 object-contain bg-white"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Status Update */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Update Order Status</h3>
                    <select
                      value={selectedOrder.orderStatus}
                      onChange={(e) => {
                        if (e.target.value !== selectedOrder.orderStatus) {
                          if (confirm(`Update order status to ${e.target.value}?`)) {
                            updateStatus(selectedOrder._id, e.target.value);
                            setSelectedOrder(null);
                          }
                        }
                      }}
                      disabled={updating === selectedOrder._id || selectedOrder.orderStatus === "Delivered" || selectedOrder.orderStatus === "Cancelled"}
                      className="w-full px-3 py-2 border border-gray-200/50 rounded-lg bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
                    >
                      <option value="Order Placed">Order Placed</option>
                      <option value="Verification Pending">Verification Pending</option>
                      <option value="Verified and Confirmed">Verified and Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Shipping Delayed">Shipping Delayed</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default OrdersPanel;
