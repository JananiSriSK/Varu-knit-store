import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PersonalDetails from "../components/PersonalDetails.jsx";
import RecentOrders from "../components/RecentOrders.jsx";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Profile = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.getMyOrders();
      const data = await response.json();
      
      if (data.success) {
        console.log('📦 Orders fetched:', data.orders.length, data.orders);
        setOrders(data.orders);
      } else {
        console.error('❌ Failed to fetch orders:', data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto mt-20 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6 text-[#444]">
        Account Dashboard
      </h2>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-gray-200">
        <button
          className={`py-2 px-4 font-medium cursor-pointer ${
            activeTab === "personal"
              ? "border-b-2 border-purple-600 text-purple-600"
              : "text-gray-500 hover:text-purple-600"
          }`}
          onClick={() => setActiveTab("personal")}
        >
          Personal Details
        </button>
        <button
          className={`py-2 px-4 font-medium cursor-pointer ${
            activeTab === "orders"
              ? "border-b-2 border-purple-600 text-purple-600"
              : "text-gray-500 hover:text-purple-600"
          }`}
          onClick={() => setActiveTab("orders")}
        >
          My Orders
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "personal" && <PersonalDetails user={user} />}
      {activeTab === "orders" && (
        <RecentOrders orders={orders} loading={loading} />
      )}
    </div>
  );
};

export default Profile;