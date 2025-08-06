import React, { useState } from "react";
import Stats from "./DashboardStats.jsx";
import Users from "./UsersList.jsx";
import Orders from "./OrdersPanel.jsx";
import EditHomepage from "./EditHomepage.jsx";
import Products from "./EditProducts.jsx";

const AdminLayout = () => {
  const [activeTab, setActiveTab] = useState("stats");

  const renderTabContent = () => {
    switch (activeTab) {
      case "stats":
        return <Stats />;
      case "users":
        return <Users />;
      case "orders":
        return <Orders />;
      case "edit-homepage":
        return <EditHomepage />;
      case "products":
        return <Products />;
      default:
        return <Stats />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-52 bg-[#f7f4ff] backdrop-blur-sm border-r border-gray-300 p-6">
        <h2 className="text-2xl font-bold text-purple-800 mb-8">Admin Panel</h2>
        <nav className="flex flex-col divide-y divide-gray-300">
          <button
            onClick={() => setActiveTab("stats")}
            className={`py-3 text-left ${
              activeTab === "stats"
                ? "text-purple-800 font-semibold"
                : "text-gray-600"
            }`}
          >
            Dashboard Stats
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`py-3 text-left ${
              activeTab === "users"
                ? "text-purple-800 font-semibold"
                : "text-gray-600"
            }`}
          >
            Users List
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-3 text-left ${
              activeTab === "orders"
                ? "text-purple-800 font-semibold"
                : "text-gray-600"
            }`}
          >
            Order Management
          </button>
          <button
            onClick={() => setActiveTab("edit-homepage")}
            className={`py-3 text-left ${
              activeTab === "edit-homepage"
                ? "text-purple-800 font-semibold"
                : "text-gray-600"
            }`}
          >
            Edit Homepage
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`py-3 text-left ${
              activeTab === "products"
                ? "text-purple-800 font-semibold"
                : "text-gray-600"
            }`}
          >
            Manage Products
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">{renderTabContent()}</main>
    </div>
  );
};

export default AdminLayout;
