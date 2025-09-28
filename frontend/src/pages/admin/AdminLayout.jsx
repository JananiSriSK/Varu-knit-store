import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  BarChart3,
  Users as UsersIcon,
  Package,
  Home,
  Edit,
  Settings,
  MessageCircle,
  Heart,
  User,
  Star,
} from "lucide-react";
import NotificationBell from "../../components/NotificationBell";
import logo from "../../images/logo.png";
import Stats from "./DashboardStats.jsx";
import Users from "./UsersList.jsx";
import Orders from "./OrdersPanel.jsx";
import Products from "./EditProducts.jsx";
import ChatbotManagement from "./ChatbotManagement.jsx";
import FavoriteCollections from "./FavoriteCollections.jsx";
import ContentManagement from "./ContentManagement.jsx";
import ReviewsManagement from "./ReviewsManagement.jsx";
import api from "../../services/api";
import { useNotification } from "../../context/NotificationContext";

const AdminLayout = () => {
  const [activeTab, setActiveTab] = useState("stats");
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, dispatch, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotification();

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/");
      return;
    }
    fetchAdminData();
  }, [user, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        api.getAllOrders(),
        api.getAllUsers(),
        api.getAdminProducts(),
      ]);

      const [ordersData, usersData, productsData] = await Promise.all([
        ordersRes.json(),
        usersRes.json(),
        productsRes.json(),
      ]);

      if (ordersData.success) setOrders(ordersData.orders);
      if (usersData.success) setUsers(usersData.users);
      if (productsData.success) setProducts(productsData.products);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      addNotification("Logged out successfully", "success");
      logout();
    } catch (err) {
      console.error("Logout error:", err);
      addNotification("Logout failed", "error");
      logout(); // Force logout even if API call fails
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "stats":
        return <Stats orders={orders} users={users} products={products} />;
      case "users":
        return <Users users={users} onUpdate={fetchAdminData} />;
      case "orders":
        return <Orders orders={orders} onUpdate={fetchAdminData} />;
      case "content":
        return <ContentManagement />;
      case "products":
        return <Products products={products} onUpdate={fetchAdminData} />;
      case "chatbot":
        return <ChatbotManagement />;
      case "favorites":
        return <FavoriteCollections products={products} />;
      case "reviews":
        return <ReviewsManagement products={products} />;
      default:
        return <Stats orders={orders} users={users} products={products} />;
    }
  };

  const navItems = [
    { id: "stats", label: "Dashboard", icon: BarChart3 },
    { id: "users", label: "Users", icon: UsersIcon },
    { id: "orders", label: "Orders", icon: Package },
    { id: "products", label: "Products", icon: Edit },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "content", label: "Content", icon: Settings },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "chatbot", label: "Chatbot", icon: MessageCircle },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ff]">
      {/* Mobile/Desktop Navbar */}
      <nav className="bg-[#e1cffb] shadow-sm border-b border-[#dcd6f7]">
        <div className="px-4 sm:px-6 py-4">
          {/* Mobile Layout */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-[#DBDDFF]"
                />
                <div>
                  <h1 className="text-sm sm:text-base font-semibold text-[#444444]">
                    Varu's Comfy Knits
                  </h1>
                  <p className="text-xs text-[#666]">Admin Panel</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <NotificationBell isAdmin={true} />
                <div className="w-8 h-8 rounded-full bg-white hover:bg-[#fceeee] flex items-center justify-center cursor-pointer relative group">
                  <User className="h-3 w-3 text-[#444444]" />
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-md z-10 py-2 w-32 text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <span className="block px-3 py-2 text-gray-600 text-xs">
                      {user?.name}
                    </span>
                    <hr className="my-1 border-gray-200" />
                    <a
                      href="/"
                      className="flex items-center gap-1 px-3 py-2 hover:bg-[#FCE8E8] hover:text-[#D97878] cursor-pointer"
                    >
                      <Home className="h-3 w-3" />
                      <span>Storefront</span>
                    </a>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 hover:bg-[#FCE8E8] hover:text-[#D97878] cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Mobile Navigation Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all cursor-pointer ${
                      activeTab === item.id
                        ? "bg-[#7b5fc4] text-white shadow-md"
                        : "text-[#444444] hover:bg-[#f7f4ff] hover:text-[#7b5fc4]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-12 h-12 rounded-full object-cover border border-[#DBDDFF]"
                />
                <div>
                  <h1 className="text-lg font-semibold text-[#444444]">
                    Varu's Comfy Knits
                  </h1>
                  <p className="text-sm text-[#666]">Admin Panel</p>
                </div>
              </div>
              <div className="flex space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                        activeTab === item.id
                          ? "bg-[#7b5fc4] text-white shadow-md"
                          : "text-[#444444] hover:bg-[#f7f4ff] hover:text-[#7b5fc4]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell isAdmin={true} />
              <div className="w-8 h-8 rounded-full bg-white hover:bg-[#fceeee] flex items-center justify-center cursor-pointer relative group">
                <User className="h-4 w-4 text-[#444444]" />
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-md z-10 py-2 w-36 text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <span className="block px-4 py-2 text-gray-600 text-xs">
                    {user?.name}
                  </span>
                  <hr className="my-1 border-gray-200" />
                  <a
                    href="/"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-[#FCE8E8] hover:text-[#D97878] cursor-pointer"
                  >
                    <Home className="h-3 w-3" />
                    <span>Storefront</span>
                  </a>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-[#FCE8E8] hover:text-[#D97878] cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-4 sm:p-6">{renderTabContent()}</main>
    </div>
  );
};

export default AdminLayout;
