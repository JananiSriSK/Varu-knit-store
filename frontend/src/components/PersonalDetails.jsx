import React, { useState } from "react";
import {
  ShoppingCart,
  Star,
  Heart,
  RotateCcw,
  Home,
  ChevronRight,
  Edit3,
  MoreHorizontal,
  Truck,
  X,
  Check,
  Eye,
  RefreshCw,
  Trash2,
} from "lucide-react";

const Profile = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-gray-50">
      {/* Profile Section */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#444]">My Profile</h3>
            <p className="text-sm text-gray-500">
              Manage your personal information
            </p>
          </div>
          <button
            onClick={handleEditClick}
            className="flex items-center gap-1 rounded-lg bg-[#fceeee] px-3 py-1.5 text-sm text-[#D97878] hover:bg-[#FCE8E8]"
          >
            <Edit3 className="h-4 w-4 cursor-pointer" />
            Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <span className="font-semibold">Name:</span> Helene Mayer
          </div>
          <div>
            <span className="font-semibold">Email:</span> helene@example.com
          </div>
          <div>
            <span className="font-semibold">Mobile:</span> +91 1234567890
          </div>
          <div>
            <span className="font-semibold">Gender:</span> Female
          </div>
          <div className="col-span-2">
            <span className="font-semibold">Address:</span> 123 Street Name,
            City, State - 100001
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { icon: ShoppingCart, label: "Orders", value: 12 },
          { icon: Star, label: "Reviews", value: 4 },
          { icon: Heart, label: "Wishlist", value: 8 },
          { icon: RotateCcw, label: "Returns", value: 1 },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3 text-gray-700">
              <item.icon className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <span className="text-sm font-semibold">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-lg relative">
            <button
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
              onClick={handleCloseModal}
            >
              <X className="h-6 w-6 cursor-pointer" />
            </button>
            <h3 className="mb-4 text-lg font-semibold text-[#444] ">
              Edit Profile
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: handle form submission logic
                setIsEditModalOpen(false);
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Name*
                  </label>
                  <input
                    type="text"
                    defaultValue="Helene Mayer"
                    required
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Email*
                  </label>
                  <input
                    type="email"
                    defaultValue="helene@example.com"
                    required
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Mobile
                  </label>
                  <input
                    type="tel"
                    defaultValue="+91 1234567890"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Gender
                  </label>
                  <select
                    defaultValue="Female"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900"
                  >
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Address
                  </label>
                  <textarea
                    defaultValue="123 Street Name, City, State - 100001"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900"
                    rows="3"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-[#D97878] px-4 py-2 text-sm text-white hover:bg-[#c56767] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
