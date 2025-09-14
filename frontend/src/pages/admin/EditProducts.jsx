import React, { useState } from "react";
import api from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import SimpleMediaUpload from "../../components/SimpleMediaUpload";

const EditProducts = ({ products = [], onUpdate }) => {
  const { addNotification } = useNotification();
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    subcategory: "",
    stock: "",
    size: ""
  });
  const [mediaData, setMediaData] = useState({ uploadMethod: 'upload', files: [], driveLinks: [] });
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');

  const handleInputChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleMediaChange = (data) => {
    setMediaData(data);
    // If editing and removing existing media, update the editing product
    if (editingProduct && data.existingMedia !== undefined) {
      setEditingProduct(prev => ({
        ...prev,
        image: data.existingMedia
      }));
    }
  };

  const resetForm = () => {
    setNewProduct({
      name: "",
      price: "",
      description: "",
      category: "",
      subcategory: "",
      stock: "",
      size: ""
    });
    setMediaData({ uploadMethod: 'upload', files: [], driveLinks: [] });
    setEditingProduct(null);
    // Clear all file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => input.value = '');
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory,
      stock: product.stock,
      size: Array.isArray(product.size) ? product.size.join(', ') : (product.size || '')
    });
    // Set media data with existing media for editing
    setMediaData({ 
      uploadMethod: 'upload', 
      files: [], 
      driveLinks: [],
      existingMedia: product.image || []
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      return addNotification("Name and price are required", "error");
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add text fields
      Object.keys(newProduct).forEach(key => {
        if (key === 'size') {
          const sizes = newProduct.size.split(',').map(s => s.trim()).filter(s => s);
          formData.append(key, JSON.stringify(sizes));
        } else {
          formData.append(key, newProduct[key]);
        }
      });
      
      // Add upload method
      formData.append('uploadMethod', mediaData.uploadMethod);
      
      // Add files or drive links based on method
      if (mediaData.uploadMethod === 'upload' && mediaData.files.length > 0) {
        mediaData.files.forEach((file) => {
          formData.append('images', file);
        });
      } else if (mediaData.uploadMethod === 'drive' && mediaData.driveLinks.length > 0) {
        mediaData.driveLinks.forEach((link, index) => {
          formData.append(`driveImages[${index}]`, link);
        });
      }

      const response = editingProduct 
        ? await api.updateProduct(editingProduct._id, formData)
        : await api.createProduct(formData);
      const data = await response.json();

      if (data.success) {
        addNotification(editingProduct ? "Product updated successfully!" : "Product added successfully!", "success");
        resetForm();
        onUpdate && onUpdate();
      } else {
        addNotification(data.message || `Failed to ${editingProduct ? 'update' : 'add'} product`, "error");
      }
    } catch (err) {
      console.error("Error adding product:", err);
      addNotification(`Failed to ${editingProduct ? 'update' : 'add'} product`, "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const response = await api.deleteProduct(id);
      const data = await response.json();
      
      if (data.success) {
        addNotification("Product deleted successfully!", "success");
        onUpdate && onUpdate();
      } else {
        addNotification(data.message || "Failed to delete product", "error");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      addNotification("Failed to delete product", "error");
    }
  };

  const getFilteredProducts = () => {
    let filtered = products;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    // Subcategory filter
    if (subcategoryFilter) {
      filtered = filtered.filter(product => product.subcategory === subcategoryFilter);
    }
    
    return filtered;
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
        {editingProduct ? 'Edit Product' : 'Manage Products'}
      </h2>

      <form
        onSubmit={addProduct}
        className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-[#dcd6f7] space-y-4 mb-6 sm:mb-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-[#444444]">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={newProduct.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              className="w-full border border-[#dcd6f7] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Price (₹) *
            </label>
            <input
              type="number"
              name="price"
              value={newProduct.price}
              onChange={handleInputChange}
              placeholder="Enter product price"
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              name="category"
              value={newProduct.category}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            >
              <option value="">Select Category</option>
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="kids">Kids</option>
              <option value="accessories">Accessories</option>
              <option value="bags">Bags</option>
              <option value="tabledecor">Table Decor</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Subcategory *
            </label>
            <input
              type="text"
              name="subcategory"
              value={newProduct.subcategory}
              onChange={handleInputChange}
              placeholder="e.g., sweaters, hats, bags"
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Stock *
            </label>
            <input
              type="number"
              name="stock"
              value={newProduct.stock}
              onChange={handleInputChange}
              placeholder="Enter stock quantity"
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Sizes (comma separated)
            </label>
            <input
              type="text"
              name="size"
              value={newProduct.size}
              onChange={handleInputChange}
              placeholder="e.g., XS, S, M, L, XL"
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={newProduct.description}
            onChange={handleInputChange}
            placeholder="Enter product description"
            className="w-full border border-gray-300 rounded-md p-2 h-24"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Product Images & Videos
          </label>
          <SimpleMediaUpload 
            onMediaChange={handleMediaChange}
            existingMedia={editingProduct?.image || []}
          />

        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-[#7b5fc4] hover:bg-[#6b4fb4] text-white px-6 py-3 rounded-lg disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? (editingProduct ? "Updating..." : "Adding...") : (editingProduct ? "Update Product" : "Add Product")}
          </button>
          {editingProduct && (
            <button
              type="button"
              onClick={resetForm}
              className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg sm:text-xl font-semibold text-[#444444]">Existing Products</h3>
          
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
                setSubcategoryFilter(''); // Reset subcategory when category changes
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="kids">Kids</option>
              <option value="accessories">Accessories</option>
              <option value="bags">Bags</option>
              <option value="tabledecor">Table Decor</option>
            </select>
            
            <select
              value={subcategoryFilter}
              onChange={(e) => setSubcategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
              disabled={!categoryFilter}
            >
              <option value="">All Subcategories</option>
              {getUniqueSubcategories().map(subcategory => (
                <option key={subcategory} value={subcategory}>
                  {subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        {getFilteredProducts().length === 0 ? (
          <p className="text-gray-500">
            {products.length === 0 ? 'No products found.' : 'No products match your search criteria.'}
          </p>
        ) : (
          getFilteredProducts().map((product) => (
            <div
              key={product._id}
              className="p-4 border border-gray-200 rounded-md bg-white shadow"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                <div className="flex space-x-3 sm:space-x-4">
                  <img
                    src={product.image?.[0]?.url || "/placeholder.jpg"}
                    alt={product.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-800 truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">₹{product.price}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{product.category} - {product.subcategory}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Stock: {product.stock}</p>
                  </div>
                </div>
                <div className="flex gap-2 sm:flex-col sm:gap-1">
                  <button
                    onClick={() => editProduct(product)}
                    className="flex-1 sm:flex-none text-blue-600 hover:underline text-sm px-2 py-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(product._id)}
                    className="flex-1 sm:flex-none text-red-600 hover:underline text-sm px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EditProducts;