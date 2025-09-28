import { useState, useEffect, useRef } from "react";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import LoginModal from "../components/LoginModal";
import api from "../services/api";

const Cart = () => {
  const { items, updateQuantity, updateSize, removeFromCart } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { addNotification } = useNotification();
  const prevSubtotalRef = useRef(0);

  useEffect(() => {
    setLoading(false);
  }, [items]);

  const handleUpdateQuantity = (productId, size, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId, size);
      addNotification('Item removed from cart', 'info');
    } else {
      updateQuantity(productId, size, newQuantity);
      addNotification('Cart updated', 'success');
    }
  };

  const subtotal = items.reduce((sum, item) => {
    return sum + (item.price || 0) * item.quantity;
  }, 0);
  
  const shipping = subtotal >= 999 ? 0 : 100;
  const total = subtotal + shipping;

  // Check for free shipping eligibility and trigger celebration
  useEffect(() => {
    if (prevSubtotalRef.current < 999 && subtotal >= 999 && items.length > 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
    prevSubtotalRef.current = subtotal;
  }, [subtotal, items.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f4ff] py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#7b5fc4]"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f4ff] py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-[#7b5fc4] mb-8 text-center">
            Your Cart
          </h1>
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
            <Link
              to="/products"
              className="bg-[#e1cffb] text-[#444444] px-6 py-3 rounded-lg hover:bg-[#b89ae8] transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ff] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#7b5fc4] mb-8 text-center">
          Your Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {items.map((item) => (
                <div
                  key={`${item.product}-${item.size}`}
                  className="flex items-center py-4 border-b border-gray-200 last:border-b-0"
                >
                  <Link to={`/product/${item.product}`}>
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg mr-4 cursor-pointer hover:opacity-80 transition"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/product/${item.product}`} className="hover:text-[#7b5fc4] transition">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    </Link>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Size:</span>
                      <select
                        value={item.size}
                        onChange={(e) => {
                          updateSize(item.product, item.size, e.target.value);
                          addNotification(`Size updated to ${e.target.value}`, 'success');
                        }}
                        className="bg-transparent border border-gray-300 text-gray-700 px-2 py-1 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#7b5fc4]"
                      >
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="One Size">One Size</option>
                      </select>
                    </div>
                    <p className="text-[#7b5fc4] font-semibold">₹{item.price}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleUpdateQuantity(item.product, item.size, item.quantity - 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <FiMinus size={16} />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.product, item.size, item.quantity + 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <FiPlus size={16} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product, item.size)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full ml-4"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                </div>
                {shipping === 0 ? (
                  <div className="relative">
                    <p className="text-green-600 text-sm font-medium">🎉 Free shipping on orders over ₹999!</p>
                    {showCelebration && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="animate-bounce text-2xl">🎉</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
                    <p className="text-orange-700 font-medium">📦 Add ₹{(999 - subtotal).toFixed(2)} more to get FREE shipping!</p>
                    <p className="text-orange-600 text-xs mt-1">Save ₹100 on shipping costs</p>
                  </div>
                )}
                <hr className="my-3" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-[#7b5fc4]">₹{total.toFixed(2)}</span>
                </div>
              </div>
              {user ? (
                <Link
                  to="/checkout"
                  className="block w-full bg-[#e1cffb] text-[#444444] py-3 rounded-lg hover:bg-[#b89ae8] transition mt-6 font-semibold text-center"
                >
                  Proceed to Checkout
                </Link>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="block w-full bg-[#e1cffb] text-[#444444] py-3 rounded-lg hover:bg-[#b89ae8] transition mt-6 font-semibold text-center"
                >
                  Login to Checkout
                </button>
              )}
              <Link
                to="/products"
                className="block text-center text-[#7b5fc4] hover:underline mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-pulse">
            🎉
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center animate-bounce">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold text-[#7b5fc4] mb-1">Congratulations!</h3>
              <p className="text-gray-600">You've unlocked FREE shipping!</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
};

export default Cart;