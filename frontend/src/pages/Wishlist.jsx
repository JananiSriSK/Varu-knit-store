import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import ProductCard from "../components/ProductCard";
import ConfirmationModal from "../components/ConfirmationModal";
import api from "../services/api";

const Wishlist = () => {
  const { user } = useAuth();

  const { addNotification } = useNotification();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [productToRemove, setProductToRemove] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await api.getWishlist();
      const data = await response.json();
      if (data.success) {
        setWishlist(data.wishlist);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClick = (productId) => {
    setProductToRemove(productId);
    setShowConfirmModal(true);
  };
  
  const confirmRemove = async () => {
    try {
      const response = await api.removeFromWishlist(productToRemove);
      const data = await response.json();
      if (data.success) {
        setWishlist(wishlist.filter((item) => item._id !== productToRemove));
        addNotification("Item removed from wishlist", "success");
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
    setShowConfirmModal(false);
    setProductToRemove(null);
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f4ff] py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#7b5fc4]"></div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f4ff] py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-lg font-medium mb-8 text-center text-[#444444]">
            My Wishlist
          </h1>
          <div className="text-center py-16">
            <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg mb-4">Your wishlist is empty</p>
            <Link
              to="/products"
              className="bg-[#e1cffb] text-[#444444] px-6 py-3 rounded-lg hover:bg-[#b89ae8] transition"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ff] py-8">
      <div className="max-w-6xl mx-auto px-4 mt-20">
        <h1 className="text-lg font-medium mb-8 text-left text-[#444444]">
          My Wishlist ({wishlist.length} items)
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard 
              key={product._id} 
              product={product} 
              isWishlistView={true}
              onRemoveFromWishlist={handleRemoveClick}
            />
          ))}
        </div>
        
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmRemove}
          title="Remove from Wishlist"
          message="Are you sure you want to remove this item from your wishlist?"
          confirmText="Remove"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </div>
  );
};

export default Wishlist;
