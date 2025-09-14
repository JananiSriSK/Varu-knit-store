import React, { useState } from "react";
import { X, User, Package, MapPin, CreditCard } from "lucide-react";



const getStatusStyle = (status) => {
  switch (status) {
    case "Order Placed":
      return "bg-blue-100 text-blue-800";
    case "Verification Pending":
      return "bg-orange-100 text-orange-800";
    case "Verified and Confirmed":
      return "bg-purple-100 text-purple-800";
    case "Shipped":
      return "bg-indigo-100 text-indigo-800";
    case "Shipping Delayed":
      return "bg-yellow-100 text-yellow-800";
    case "Delivered":
      return "bg-green-100 text-green-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const RecentOrders = ({ orders = [], loading = false }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  if (loading) {
    return (
      <section className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="p-6 md:p-8 max-w-6xl mx-auto">
      <h2 className="mb-6 text-2xl font-serif text-[#444444]">Recent Orders</h2>
      <div className="overflow-x-auto rounded-xl bg-white shadow-md">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-[#f7f4ff] text-[#444444] text-sm uppercase">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Total (₹)</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr 
                key={order._id} 
                className="hover:bg-[#f7f4ff] cursor-pointer transition-colors"
                onClick={() => setSelectedOrder(order)}
              >
                <td className="px-6 py-4 font-medium">{order._id.slice(-8)}</td>
                <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">{order.orderItems.length}</td>
                <td className="px-6 py-4">₹{order.totalPrice}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusStyle(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No recent orders.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusStyle(selectedOrder.orderStatus)}`}>
                        {selectedOrder.orderStatus}
                      </span>
                    </p>
                    <p><strong>Total:</strong> ₹{selectedOrder.totalPrice}</p>
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
                
                {/* Payment Info */}
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RecentOrders;
