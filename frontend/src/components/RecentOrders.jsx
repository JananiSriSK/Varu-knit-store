import React, { useState } from "react";
import { X, User, Package, MapPin, CreditCard, Star } from "lucide-react";
import ReviewModal from "./ReviewModal";



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
  const [reviewModal, setReviewModal] = useState({ isOpen: false, product: null });

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif text-[#444444]">Recent Orders</h2>
        <span className="bg-[#7b5fc4] text-white px-3 py-1 rounded-full text-sm font-medium">
          {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-lg border border-gray-200/50">
          <thead className="bg-gradient-to-r from-[#e8e0ff] to-[#f0ebff]">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Order ID</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Items</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Total (₹)</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr 
                key={order._id} 
                className="border-t border-gray-100/70 hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <td className="py-4 px-6 text-gray-800 font-mono text-sm">{order._id.slice(-8)}</td>
                <td className="py-4 px-6 text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="py-4 px-6 text-gray-600">{order.orderItems.length}</td>
                <td className="py-4 px-6 text-gray-800 font-semibold">₹{order.totalPrice}</td>
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
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  No recent orders.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Size: {item.size} | Qty: {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                          {selectedOrder.orderStatus === "Delivered" && (
                            <button
                              onClick={() => setReviewModal({ isOpen: true, product: item })}
                              className="flex items-center gap-1 px-3 py-1 bg-[#7b5fc4] text-white text-xs rounded-lg hover:bg-[#6b4fb4] transition-colors"
                            >
                              <Star className="h-3 w-3" />
                              Review
                            </button>
                          )}
                        </div>
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

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ isOpen: false, product: null })}
        product={reviewModal.product}
      />
    </section>
  );
};

export default RecentOrders;
