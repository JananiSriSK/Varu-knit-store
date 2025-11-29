import React, { useState, useEffect, useRef } from "react";
import { User, ShoppingCart, Heart, Home } from "lucide-react";
import SmartSearchBar from "./SmartSearchBar";
import logo from "../images/logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import LoginModal from "./LoginModal";
import NotificationBell from "./NotificationBell";
import api from "../services/api";
import axios from "axios";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const profileDropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, dispatch, logout } = useAuth();
  const { items } = useCart();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const category = queryParams.get("category") || "";

    // Only set active category if we're on products page or have a category parameter
    if (location.pathname === "/products" || category) {
      setActiveCategory(category);
    } else {
      setActiveCategory(""); // Clear selection on homepage
    }
  }, [location.search, location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchWishlistCount = async () => {
      if (isAuthenticated && user?.role !== "admin") {
        try {
          const response = await axios.get(
            "http://localhost:5000/api/v1/wishlist",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const data = response.data;
          if (data.success) {
            setWishlistCount(data.wishlist.length);
          }
        } catch (err) {
          console.error("Error fetching wishlist count:", err);
        }
      }
    };
    fetchWishlistCount();
  }, [isAuthenticated, user]);

  const allowedCategoryPaths = ["/", "/home", "/products", "/shop"];
  const showCategoryTabs = allowedCategoryPaths.includes(location.pathname);

  const mainNavItems = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Contact Us", href: "#footer" },
  ];

  const categories = [
    { name: "All", value: "" },
    { name: "Women", value: "women" },
    { name: "Men", value: "men" },
    { name: "Kids", value: "kids" },
    { name: "Accessories", value: "accessories" },
    { name: "Bags", value: "bags" },
    { name: "TableDecor", value: "tabledecor" },
  ];

  const handleCategoryClick = (categoryValue) => {
    setActiveCategory(categoryValue);
    navigate(`/products?category=${categoryValue.toLowerCase()}`);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      logout();
      setIsProfileMenuOpen(false);
    } catch (err) {
      console.error("Logout error:", err);
      logout(); // Force logout even if API call fails
    }
  };

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <nav className="bg-[#e1cffb] text-[#444444] py-2 shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <a href="/" className="flex items-center space-x-3">
              <img
                src={logo}
                alt="Logo"
                className="w-15 h-15 rounded-full object-cover border border-[#DBDDFF]"
              />
              <span className="text-lg font-semibold">Varu's Knit Store</span>
            </a>

            {/* Right Icons */}
            <div className="flex items-center space-x-3 relative">
              {/* Smart Search */}
              <div className="hidden sm:block">
                <SmartSearchBar className="w-40 md:w-52" />
              </div>

              {/* Home button for non-admin users */}
              {user?.role !== "admin" && (
                <a
                  href="/"
                  className="hover:text-[#F4A8A8] transition cursor-pointer"
                >
                  <Home className="h-5 w-5" />
                </a>
              )}

              {/* Notifications for authenticated users */}
              {isAuthenticated && (
                <NotificationBell isAdmin={user?.role === "admin"} />
              )}

              {/* Wishlist & Cart - Only show for non-admin users */}
              {user?.role !== "admin" && (
                <>
                  <a
                    href="/wishlist"
                    className="hover:text-[#F4A8A8] transition relative"
                  >
                    <Heart className="cursor-pointer h-5 w-5" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </a>
                  <a
                    href="/cart"
                    className="hover:text-[#F4A8A8] transition relative"
                  >
                    <ShoppingCart className="cursor-pointer h-5 w-5" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </a>
                </>
              )}

              {/* Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <div
                  className="cursor-pointer w-8 h-8 rounded-full bg-white hover:bg-[#fceeee] flex items-center justify-center"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <User className="h-4 w-4 text-[#444444]" />
                </div>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-md z-10 py-2 w-44 text-sm">
                    {user?.role !== "admin" &&
                      mainNavItems.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          onClick={(e) => {
                            if (item.name === "Contact Us") {
                              e.preventDefault();
                              document
                                .getElementById("footer")
                                ?.scrollIntoView({ behavior: "smooth" });
                            }
                          }}
                          className="flex items-center px-4 py-2 hover:bg-[#FCE8E8] hover:text-[#D97878]"
                        >
                          {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                          {item.name}
                        </a>
                      ))}
                    <hr className="my-1 border-gray-200" />
                    {isAuthenticated ? (
                      <>
                        <span className="block px-4 py-2 text-gray-600 text-xs">
                          Welcome, {user?.name}
                        </span>
                        {user?.role !== "admin" && (
                          <a
                            href="/my-profile"
                            className="block px-4 py-2 hover:bg-[#FCE8E8] hover:text-[#D97878]"
                          >
                            My Profile
                          </a>
                        )}
                        {user?.role === "admin" && (
                          <a
                            href="/admindashboard"
                            className="block px-4 py-2 hover:bg-[#FCE8E8] hover:text-[#D97878]"
                          >
                            Admin Dashboard
                          </a>
                        )}
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 hover:bg-[#FCE8E8] hover:text-[#D97878] cursor-pointer"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setShowLoginModal(true);
                          setIsProfileMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-[#FCE8E8] hover:text-[#D97878] cursor-pointer"
                      >
                        Login / Sign Up
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden ml-2 cursor-pointer"
              >
                <span className="text-sm">☰</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-2 border-t border-gray-200">
              <div className="flex flex-col space-y-2">
                {user?.role !== "admin" &&
                  mainNavItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={(e) => {
                        if (item.name === "Contact Us") {
                          e.preventDefault();
                          document
                            .getElementById("footer")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="flex items-center text-[#444444] hover:text-[#D97878] py-1 px-2"
                    >
                      {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                      {item.name}
                    </a>
                  ))}
                {user?.role !== "admin" &&
                  (isAuthenticated ? (
                    <a
                      href="/my-profile"
                      className="text-[#444444] hover:text-[#D97878] py-1 px-2"
                    >
                      My Profile
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        setShowLoginModal(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-left text-[#444444] hover:text-[#D97878] py-1 px-2 w-full cursor-pointer"
                    >
                      Login / Sign Up
                    </button>
                  ))}
                {user?.role === "admin" && (
                  <a
                    href="/admindashboard"
                    className="text-[#444444] hover:text-[#D97878] py-1 px-2"
                  >
                    Admin Dashboard
                  </a>
                )}
                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className="text-left text-[#444444] hover:text-[#D97878] py-1 px-2 cursor-pointer"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Category Tabs */}
      {showCategoryTabs && (
        <>
          <div className="bg-[#f7f4ff] border-t border-gray-100 px-2 py-1 shadow fixed top-[70px] w-full z-30">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-center space-x-4 py-4 overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => handleCategoryClick(category.value)}
                    className={`text-sm whitespace-nowrap cursor-pointer transition-colors ${
                      activeCategory === category.value &&
                      location.pathname === "/products"
                        ? "text-[#A084CA] font-semibold"
                        : "text-[#555] hover:text-[#A084CA]"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="h-[124px]"></div>
        </>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

export default Navbar;
