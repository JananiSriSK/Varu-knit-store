import { X, ShoppingCart, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const AddToCartModal = ({ isOpen, onClose, productName }) => {
  const navigate = useNavigate();
  
  if (!isOpen) return null;
  
  const handleContinueShopping = () => {
    onClose();
    navigate('/products');
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative animate-in fade-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-[#f3e8ff] rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-8 w-8 text-[#7b5fc4]" />
          </div>
          
          <h2 className="text-2xl font-semibold text-[#7b5fc4] mb-2">
            Added to Cart!
          </h2>
          
          <p className="text-gray-600 mb-6">
            "{productName}" has been added to your cart
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleContinueShopping}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              Continue Shopping
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
                navigate('/cart');
              }}
              className="flex-1 px-4 py-2 bg-[#e1cffb] text-[#444444] rounded-md hover:bg-[#b89ae8] transition cursor-pointer font-semibold text-center flex items-center justify-center gap-2"
            >
              View Cart
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;