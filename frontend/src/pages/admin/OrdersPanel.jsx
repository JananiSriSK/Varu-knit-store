import React, { useState, useEffect } from "react";
import { Eye, Check, X, RefreshCw } from "lucide-react";

const dummyOrders = [
  {
    id: 101,
    user: "Ravi Kumar",
    items: 3,
    total: "₹1499",
    status: "Pending",
  },
  {
    id: 102,
    user: "Anita Sharma",
    items: 2,
    total: "₹899",
    status: "Shipped",
  },
  {
    id: 103,
    user: "John Doe",
    items: 1,
    total: "₹299",
    status: "Cancelled",
  },
];

const OrdersPanel = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Simulating an API call
    setOrders(dummyOrders);
  }, []);

  const updateStatus = (id, newStatus) => {
    const updatedOrders = orders.map((order) =>
      order.id === id ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
  };

  return (
    <div className="mt-18">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6 ">
        Manage Orders
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border bg-white rounded-lg shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left py-3 px-4">Order ID</th>
              <th className="text-left py-3 px-4">User</th>
              <th className="text-left py-3 px-4">Items</th>
              <th className="text-left py-3 px-4">Total</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="py-3 px-4">{order.id}</td>
                <td className="py-3 px-4">{order.user}</td>
                <td className="py-3 px-4">{order.items}</td>
                <td className="py-3 px-4">{order.total}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      order.status === "Pending"
                        ? "bg-yellow-200 text-yellow-800"
                        : order.status === "Shipped"
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="py-3 px-4 space-x-2">
                  <button
                    onClick={() => updateStatus(order.id, "Shipped")}
                    className="text-green-600 hover:text-green-800"
                    title="Mark as Shipped"
                  >
                    <Check className="inline h-5 w-5" />
                  </button>
                  <button
                    onClick={() => updateStatus(order.id, "Cancelled")}
                    className="text-red-600 hover:text-red-800"
                    title="Cancel Order"
                  >
                    <X className="inline h-5 w-5" />
                  </button>
                  <button
                    onClick={() => updateStatus(order.id, "Pending")}
                    className="text-blue-600 hover:text-blue-800"
                    title="Reset to Pending"
                  >
                    <RefreshCw className="inline h-5 w-5" />
                  </button>
                  <button
                    onClick={() => alert(`Viewing order ${order.id}`)}
                    className="text-gray-600 hover:text-gray-800"
                    title="View Details"
                  >
                    <Eye className="inline h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersPanel;
