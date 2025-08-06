import React, { useState } from "react";
import { Search, User, ShoppingCart } from "lucide-react";
import logo from "../images/logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react"; // Already probably imported

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = false;

  // Inside your Navbar component:
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const category = queryParams.get("category") || "";
    setActiveCategory(category);
  }, [location.search]);

  // Show tabs only on these pages
  const allowedCategoryPaths = ["/", "/home", "/products", "/shop"];
  const showCategoryTabs = allowedCategoryPaths.includes(location.pathname);

  const mainNavItems = ["Home","About Us", "Contact Us"];

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
              <span className="text-lg font-semibold">Varu's Comfy Knits</span>
            </a>

            {/* Right Icons */}
            <div className="flex items-center space-x-3 relative">
              {/* Search */}
              <div className="relative hidden sm:block">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-40 md:w-52 pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#DBDDFF] bg-white"
                />
                <Search className="cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              {/* Cart */}
              <a href="/cart" className="hover:text-[#F4A8A8] transition">
                <ShoppingCart className="cursor-pointer h-5 w-5" />
              </a>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="cursor-pointer w-8 h-8 rounded-full bg-white hover:bg-[#fceeee] flex items-center justify-center"
                >
                  <User className="h-4 w-4 text-[#444444]" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-md z-10 py-2 w-44 text-sm">
                    {mainNavItems.map((item) => (
                      <a
                        key={item}
                        href="#"
                        className="block px-4 py-2 hover:bg-[#FCE8E8] hover:text-[#D97878]"
                      >
                        {item}
                      </a>
                    ))}
                    <hr className="my-1 border-gray-200" />
                    {isLoggedIn ? (
                      <>
                        <a
                          href="/profile"
                          className="block px-4 py-2 hover:bg-[#FCE8E8] hover:text-[#D97878]"
                        >
                          My Profile
                        </a>
                        <button
                          onClick={() => console.log("Logout")}
                          className="block w-full text-left px-4 py-2 hover:bg-[#FCE8E8] hover:text-[#D97878]"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <a
                        href="/login"
                        className="block px-4 py-2 hover:bg-[#FCE8E8] hover:text-[#D97878]"
                      >
                        Login / Sign Up
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden ml-2"
              >
                <span className="text-sm">☰</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-2 border-t border-gray-200">
              <div className="flex flex-col space-y-2">
                {mainNavItems.map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-[#444444] hover:text-[#D97878] py-1 px-2"
                  >
                    {item}
                  </a>
                ))}
                <a
                  href={isLoggedIn ? "/profile" : "/login"}
                  className="text-[#444444] hover:text-[#D97878] py-1 px-2"
                >
                  {isLoggedIn ? "My Profile" : "Login / Sign Up"}
                </a>
                {isLoggedIn && (
                  <button
                    onClick={() => console.log("Logout")}
                    className="text-left text-[#444444] hover:text-[#D97878] py-1 px-2"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Category Tabs (only on specific routes) */}
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
                      activeCategory === category.value
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

          {/* Spacer below category row */}
          <div className="h-[124px]"></div>
        </>
      )}
    </>
  );
};

export default Navbar;
