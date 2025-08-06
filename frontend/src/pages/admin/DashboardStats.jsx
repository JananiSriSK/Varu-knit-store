import React from "react";
import { Users, ShoppingBag, IndianRupee, Package } from "lucide-react";

const stats = [
  {
    name: "Total Users",
    value: 1342,
    icon: Users,
    color: "bg-purple-100 text-purple-800",
  },
  {
    name: "Total Orders",
    value: 876,
    icon: ShoppingBag,
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    name: "Total Revenue",
    value: "₹5.2L",
    icon: IndianRupee,
    color: "bg-green-100 text-green-800",
  },
  {
    name: "Total Products",
    value: 320,
    icon: Package,
    color: "bg-pink-100 text-pink-800",
  },
];

const DashboardStats = () => {
  return (
    <div className="mt-18">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Dashboard Overview
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ name, value, icon: Icon, color }) => (
          <div
            key={name}
            className={`flex items-center justify-between rounded-lg p-5 shadow-md  border-none ${color}`}
          >
            <div>
              <p className="text-sm">{name}</p>
              <p className="text-xl font-bold">{value}</p>
            </div>
            <Icon className="h-8 w-8 opacity-80" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;
