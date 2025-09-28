import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useNotification } from "../../context/NotificationContext";

const FavoriteCollections = ({ products = [] }) => {
  const { addNotification } = useNotification();
  const [activeSection, setActiveSection] = useState("favorites");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentFavorites, setCurrentFavorites] = useState([]);
  const [selectedLatest, setSelectedLatest] = useState([]);
  const [currentLatest, setCurrentLatest] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");

  useEffect(() => {
    fetchCurrentFavorites();
    fetchCurrentLatest();
  }, []);

  const fetchCurrentFavorites = async () => {
    try {
      const response = await api.getFavoriteCollections();
      const data = await response.json();
      if (data.success) {
        setCurrentFavorites(data.products);
        setSelectedProducts(data.products.map(p => p._id));
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const fetchCurrentLatest = async () => {
    try {
      const response = await api.getLatestCollections();
      const data = await response.json();
      if (data.success) {
        setCurrentLatest(data.products);
        setSelectedLatest(data.products.map(p => p._id));
      }
    } catch (error) {
      console.error("Error fetching latest:", error);
    }
  };

  const handleProductSelect = (productId) => {
    const isLatest = activeSection === "latest";
    const selected = isLatest ? selectedLatest : selectedProducts;
    const setSelected = isLatest ? setSelectedLatest : setSelectedProducts;
    
    if (selected.includes(productId)) {
      setSelected(selected.filter(id => id !== productId));
    } else if (selected.length < 3) {
      setSelected([...selected, productId]);
    } else {
      addNotification("You can only select 3 products", "error");
    }
  };

  const handleSave = async () => {
    const isLatest = activeSection === "latest";
    const selected = isLatest ? selectedLatest : selectedProducts;
    const apiCall = isLatest ? api.setLatestCollections : api.setFavoriteCollections;
    const sectionName = isLatest ? "latest" : "favorite";
    
    if (selected.length !== 3) {
      return addNotification("Please select exactly 3 products", "error");
    }

    setLoading(true);
    try {
      const response = await apiCall(selected);
      const data = await response.json();
      
      if (data.success) {
        addNotification(`${sectionName} collections updated successfully!`, "success");
        if (isLatest) {
          setCurrentLatest(data.products);
        } else {
          setCurrentFavorites(data.products);
        }
      } else {
        addNotification(data.message || `Failed to update ${sectionName}`, "error");
      }
    } catch (error) {
      console.error(`Error updating ${sectionName}:`, error);
      addNotification(`Failed to update ${sectionName}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentProducts = () => activeSection === "latest" ? currentLatest : currentFavorites;
  const getSelectedCount = () => activeSection === "latest" ? selectedLatest.length : selectedProducts.length;
  const getSelected = () => activeSection === "latest" ? selectedLatest : selectedProducts;

  const getFilteredProducts = () => {
    let filtered = products;
    
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    if (subcategoryFilter) {
      filtered = filtered.filter(product => product.subcategory === subcategoryFilter);
    }
    
    return filtered;
  };

  const getUniqueCategories = () => {
    const categories = products.map(product => product.category).filter(Boolean);
    return [...new Set(categories)];
  };

  const getUniqueSubcategories = () => {
    const subcategories = products
      .filter(product => !categoryFilter || product.category === categoryFilter)
      .map(product => product.subcategory)
      .filter(Boolean);
    return [...new Set(subcategories)];
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Manage Collections
      </h2>
      
      {/* Section Navigation */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveSection("favorites")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeSection === "favorites"
              ? "bg-[#7b5fc4] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Favorite Collections
        </button>
        <button
          onClick={() => setActiveSection("latest")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeSection === "latest"
              ? "bg-[#7b5fc4] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Latest Collections
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-lg border border-[#dcd6f7] mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Current {activeSection === "latest" ? "Latest" : "Favorite"} ({getSelectedCount()}/3 selected)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {getCurrentProducts().map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md border border-gray-200/50 overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={product.image?.[0]?.url || "/placeholder.jpg"}
                alt={product.name}
                className="w-full h-32 object-cover"
              />
              <div className="p-3">
                <h4 className="font-medium text-sm text-gray-800 line-clamp-2">{product.name}</h4>
                <p className="text-sm font-semibold text-[#7b5fc4] mt-1">₹{product.price}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={loading || getSelectedCount() !== 3}
          className="bg-[#7b5fc4] hover:bg-[#6b4fb4] text-white px-6 py-2 rounded-lg disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : `Save ${activeSection === "latest" ? "Latest" : "Favorites"}`}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-[#dcd6f7]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-medium text-gray-800">
            Select Products (Choose 3)
          </h3>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
            />
            
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setSubcategoryFilter('');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
            >
              <option value="">All Categories</option>
              {getUniqueCategories().map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            
            <select
              value={subcategoryFilter}
              onChange={(e) => setSubcategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
              disabled={!categoryFilter}
            >
              <option value="">All Subcategories</option>
              {getUniqueSubcategories().map(sub => (
                <option key={sub} value={sub}>
                  {sub.charAt(0).toUpperCase() + sub.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
          {getFilteredProducts().map((product) => (
            <div
              key={product._id}
              onClick={() => handleProductSelect(product._id)}
              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                getSelected().includes(product._id)
                  ? "border-[#7b5fc4] bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <img
                src={product.image?.[0]?.url || "/placeholder.jpg"}
                alt={product.name}
                className="w-full h-24 object-cover rounded mb-2"
              />
              <h4 className="font-medium text-xs truncate">{product.name}</h4>
              <p className="text-xs text-gray-600">₹{product.price}</p>
              {getSelected().includes(product._id) && (
                <div className="text-xs text-[#7b5fc4] font-medium mt-1">✓ Selected</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavoriteCollections;