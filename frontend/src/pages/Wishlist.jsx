import { useState, useEffect } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useNotification } from "../context/NotificationContext";
import api from "../services/api";

const Wishlist = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addNotification } = useNotification();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const removeFromWishlist = async (productId) => {
    try {
      const response = await api.removeFromWishlist(productId);
      const data = await response.json();
      if (data.success) {
        setWishlist(wishlist.filter((item) => item._id !== productId));
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  const handleAddToCart = (product) => {
    addToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.image[0]?.url,
      size: product.size[0],
      quantity: 1,
    });
    addNotification("Added to cart!", "success");
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
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative">
                <img
                  src={product.image?.[0]?.url || "/placeholder.jpg"}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  {product.name}
                </h3>
                <p className="text-[#7b5fc4] font-bold text-lg mb-3">
                  ${product.price}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-[#e1cffb] text-[#444444] py-2 px-3 rounded-lg hover:bg-[#b89ae8] transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>
                  <Link
                    to={`/product/${product._id}`}
                    className="px-3 py-2 border-none text-[#7b5fc4] rounded-lg hover:bg-[#7b5fc4]  hover:text-white transition"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
