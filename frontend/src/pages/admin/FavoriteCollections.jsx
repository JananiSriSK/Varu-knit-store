import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useNotification } from "../../context/NotificationContext";

const FavoriteCollections = ({ products = [] }) => {
  const { addNotification } = useNotification();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentFavorites, setCurrentFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrentFavorites();
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

  const handleProductSelect = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else if (selectedProducts.length < 3) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      addNotification("You can only select 3 products", "error");
    }
  };

  const handleSave = async () => {
    if (selectedProducts.length !== 3) {
      return addNotification("Please select exactly 3 products", "error");
    }

    setLoading(true);
    try {
      const response = await api.setFavoriteCollections(selectedProducts);
      const data = await response.json();
      
      if (data.success) {
        addNotification("Favorite collections updated successfully!", "success");
        setCurrentFavorites(data.products);
      } else {
        addNotification(data.message || "Failed to update favorites", "error");
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      addNotification("Failed to update favorites", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Manage Favorite Collections
      </h2>
      
      <div className="bg-white p-6 rounded-xl shadow-lg border border-[#dcd6f7] mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Current Favorites ({selectedProducts.length}/3 selected)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {currentFavorites.map((product) => (
            <div key={product._id} className="border rounded-lg p-3 bg-green-50">
              <img
                src={product.image?.[0]?.url || "/placeholder.jpg"}
                alt={product.name}
                className="w-full h-32 object-cover rounded mb-2"
              />
              <h4 className="font-medium text-sm">{product.name}</h4>
              <p className="text-xs text-gray-600">₹{product.price}</p>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={loading || selectedProducts.length !== 3}
          className="bg-[#7b5fc4] hover:bg-[#6b4fb4] text-white px-6 py-2 rounded-lg disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : "Save Favorites"}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-[#dcd6f7]">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Select Products (Choose 3)
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
          {products.map((product) => (
            <div
              key={product._id}
              onClick={() => handleProductSelect(product._id)}
              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                selectedProducts.includes(product._id)
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
              {selectedProducts.includes(product._id) && (
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