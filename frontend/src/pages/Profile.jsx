import React, { useState } from "react";
import PersonalDetails from "../components/PersonalDetails.jsx";
import RecentOrders from "../components/RecentOrders.jsx";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto mt-20 bg-gray-50">
      <h2 className="text-2xl font-semibold mb-6 text-[#444]">
        Account Dashboard
      </h2>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-gray-200 ">
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
      {activeTab === "personal" && <PersonalDetails />}
      {activeTab === "orders" && <RecentOrders />}
    </div>
  );
};

export default Profile;
