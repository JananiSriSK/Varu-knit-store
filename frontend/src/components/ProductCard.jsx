import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiStar, FiShoppingCart, FiHeart } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import api from "../services/api";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotification();
  const [isInWishlist, setIsInWishlist] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  return (
    <Link to={`/product/${product._id}`} className="block">
      <div className="group my-6 flex w-full h-[400px] max-w-[450px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
        <div className="relative mx-3 mt-3 flex h-48 overflow-hidden rounded-lg">
          <img
            className="peer absolute top-0 right-0 h-full w-full object-cover transition-all duration-700"
            src={product.image?.[0]?.url || product.image1 || '/placeholder.jpg'}
            alt="product"
          />
          {product.image?.[1] && (
            <img
              className="peer absolute top-0 -right-96 h-full w-full object-cover transition-all delay-100 duration-1000 hover:right-0 peer-hover:right-0"
              src={product.image[1]?.url || product.image2}
              alt="product hover"
            />
          )}
          
          <button 
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              if (!isAuthenticated) {
                // Add to guest wishlist
                const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist')) || [];
                const isInGuestWishlist = guestWishlist.some(id => id === product._id);
                
                if (isInGuestWishlist) {
                  const updatedWishlist = guestWishlist.filter(id => id !== product._id);
                  localStorage.setItem('guestWishlist', JSON.stringify(updatedWishlist));
                  setIsInWishlist(false);
                  addNotification('Removed from wishlist', 'success');
                } else {
                  guestWishlist.push(product._id);
                  localStorage.setItem('guestWishlist', JSON.stringify(guestWishlist));
                  setIsInWishlist(true);
                  addNotification('Added to wishlist', 'success');
                }
                return;
              }

              try {
                if (isInWishlist) {
                  const response = await api.removeFromWishlist(product._id);
                  const data = await response.json();
                  if (data.success) {
                    setIsInWishlist(false);
                    addNotification('Removed from wishlist', 'success');
                  }
                } else {
                  const response = await api.addToWishlist(product._id);
                  const data = await response.json();
                  if (data.success) {
                    setIsInWishlist(true);
                    addNotification('Added to wishlist', 'success');
                  }
                }
              } catch (err) {
                console.error('Wishlist error:', err);
              }
            }}
            className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition ${
              isInWishlist ? 'bg-red-50 text-red-600' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FiHeart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>

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
              {product.stock === 0 ? 'Out of Stock' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;