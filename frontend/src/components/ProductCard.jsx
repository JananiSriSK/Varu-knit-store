import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiStar, FiShoppingCart, FiHeart } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useNotification } from "../context/NotificationContext";

const ProductCard = ({ product, isWishlistView = false, onRemoveFromWishlist }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotification();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');

  const images = product.image || [];
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock === 0) {
      addNotification('Product is out of stock!', 'error');
      return;
    }
    
    // If multiple sizes available, show size selection modal
    if (product.size && product.size.length > 1) {
      setShowSizeModal(true);
      return;
    }
    
    // Add to cart with product data
    addToCart({
      product: product._id || product.id,
      name: product.name,
      price: product.price,
      image: product.image?.[0]?.url || product.image1,
      quantity: 1,
      size: product.size?.[0] || 'One Size'
    });
    addNotification('Product added to cart!', 'success');
  };
  
  const handleSizeSelection = () => {
    if (!selectedSize) {
      addNotification('Please select a size!', 'error');
      return;
    }
    
    addToCart({
      product: product._id || product.id,
      name: product.name,
      price: product.price,
      image: product.image?.[0]?.url || product.image1,
      quantity: 1,
      size: selectedSize
    });
    addNotification('Product added to cart!', 'success');
    setShowSizeModal(false);
    setSelectedSize('');
  };

  return (
    <Link to={`/product/${product._id}`} className="block">
      <div className="group my-6 flex w-full h-[450px] max-w-[500px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
        <div 
          className="relative mx-2 mt-2 flex h-64 overflow-hidden rounded-lg"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <img
            className="peer absolute top-0 right-0 h-full w-full object-cover transition-all duration-700"
            src={images[currentImageIndex]?.url || product.image1 || '/placeholder.jpg'}
            alt="product"
          />
          {images.length > 1 && currentImageIndex === 0 && (
            <img
              className="peer absolute top-0 -right-96 h-full w-full object-cover transition-all delay-100 duration-1000 hover:right-0 peer-hover:right-0"
              src={images[1]?.url}
              alt="product hover"
            />
          )}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 z-10">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
          
          {isWishlistView ? (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemoveFromWishlist(product._id);
              }}
              className="absolute top-2 right-2 p-2 bg-red-50 text-red-600 rounded-full shadow-md hover:bg-red-100 transition"
            >
              <FiHeart className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button 
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const productInWishlist = isInWishlist(product._id);
                
                try {
                  if (productInWishlist) {
                    const result = await removeFromWishlist(product._id);
                    if (result.success) {
                      addNotification('Removed from wishlist', 'success');
                    }
                  } else {
                    const result = await addToWishlist(product._id);
                    if (result.success) {
                      addNotification('Added to wishlist', 'success');
                    }
                  }
                } catch (err) {
                  console.error('Wishlist error:', err);
                }
              }}
              className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition ${
                isInWishlist(product._id) ? 'bg-red-50 text-red-600' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiHeart className={`w-4 h-4 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
            </button>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="mt-3 px-4 pb-4 flex flex-col flex-grow">
          <h5 className="text-sm font-semibold text-slate-800 line-clamp-2 h-10">
            {product.name}
          </h5>

          <div className="flex items-center mt-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.ratings || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-1 text-xs text-gray-600">
              ({product.numberOfReviews || 0})
            </span>
          </div>

          <div className="mt-1 mb-3 flex items-center justify-between">
            <p className="text-base font-semibold text-slate-900">
              ₹{product.price}
            </p>
          </div>

          <div className="mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex items-center justify-center rounded bg-[#6f5d6e] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#5c4b5a] disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              <FiShoppingCart className="mr-1 h-4 w-4" />
              {product.stock === 0 ? 'Product Out of Stock' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Size Selection Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowSizeModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Select Size</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {product.size?.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`p-2 border rounded text-sm ${
                    selectedSize === size 
                      ? 'border-[#6f5d6e] bg-[#6f5d6e] text-white' 
                      : 'border-gray-300 hover:border-[#6f5d6e]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSizeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSizeSelection}
                className="flex-1 px-4 py-2 bg-[#6f5d6e] text-white rounded hover:bg-[#5c4b5a]"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
};

export default ProductCard;