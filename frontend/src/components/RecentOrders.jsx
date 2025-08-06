import React from "react";
import { Eye, Truck, X, RefreshCw } from "lucide-react";

const sampleOrders = [
  {
    id: "ORD001",
    date: "2025-08-05",
    status: "Shipped",
    items: 3,
    total: 1499,
  },
  {
    id: "ORD002",
    date: "2025-08-01",
    status: "Delivered",
    items: 2,
    total: 799,
  },
  {
    id: "ORD003",
    date: "2025-07-28",
    status: "Pending",
    items: 1,
    total: 299,
  },
  {
    id: "ORD004",
    date: "2025-07-20",
    status: "Cancelled",
    items: 4,
    total: 1999,
  },
];

const getStatusStyle = (status) => {
  switch (status) {
    case "Shipped":
      return "bg-blue-100 text-blue-800";
    case "Delivered":
      return "bg-green-100 text-green-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const RecentOrders = () => {
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
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sampleOrders.map((order) => (
              <tr key={order.id} className="hover:bg-[#f7f4ff]">
                <td className="px-6 py-4 font-medium">{order.id}</td>
                <td className="px-6 py-4">{order.date}</td>
                <td className="px-6 py-4">{order.items}</td>
                <td className="px-6 py-4">₹{order.total}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {/* View order details */}
                    <button title="View Order">
                      <Eye className="h-4 w-4 text-gray-600 hover:text-black cursor-pointer" />
                    </button>

                    {/* Track order (if shipped) */}
                    {order.status === "Shipped" && (
                      <button title="Track Order">
                        <Truck className="h-4 w-4 text-gray-600 hover:text-black" />
                      </button>
                    )}

                    {/* Reorder (if delivered) */}
                    {order.status === "Delivered" && (
                      <button title="Reorder">
                        <RefreshCw className="h-4 w-4 text-gray-600 hover:text-black" />
                      </button>
                    )}

                    {/* Cancel (if pending) */}
                    {order.status === "Pending" && (
                      <button title="Cancel Order">
                        <X className="h-4 w-4 text-red-500 hover:text-red-700" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {sampleOrders.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No recent orders.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default RecentOrders;
