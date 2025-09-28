import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiStar, FiShoppingCart, FiHeart } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useNotification } from "../context/NotificationContext";
import BackButton from "../components/BackButton";
import ImageZoomModal from "../components/ImageZoomModal";
import ProductRecommendations from "../components/ProductRecommendations";
import ConfirmationModal from "../components/ConfirmationModal";
import api from "../services/api";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { isInWishlist: checkIsInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addNotification } = useNotification();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: "", images: [] });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    console.log('ProductDetail useEffect - ID from params:', id);
    
    // Reset state when ID changes
    setProduct(null);
    setLoading(true);
    setSelectedSize("");
    setQuantity(1);
    setActiveImage(0);
    setHasPurchased(false);
    
    const fetchProduct = async () => {
      try {
        console.log('Fetching product with ID:', id);
        const response = await api.getProduct(id);
        const data = await response.json();
        console.log('Product fetched:', data.product?.name, data.product?._id);

        if (data.success) {
          setProduct(data.product);
          if (data.product.size?.length > 0) {
            setSelectedSize(data.product.size[0]);
          }
          
          // Check if user has already reviewed this product
          if (isAuthenticated && data.product.reviews) {
            const userReview = data.product.reviews.find(review => review.user?.toString() === user?.id?.toString());
            if (userReview) {
              setExistingReview(userReview);
              setReview({ rating: userReview.rating, comment: userReview.comment, images: userReview.images || [] });
            }
          }
        }
        
        // Check if user has purchased this product
        if (isAuthenticated) {
          try {
            const ordersResponse = await api.getMyOrders();
            const ordersData = await ordersResponse.json();
            if (ordersData.success) {
              const purchased = ordersData.orders.some(order => 
                order.orderItems.some(item => item.product === id) &&
                ['Delivered', 'Verified and Confirmed'].includes(order.orderStatus)
              );
              setHasPurchased(purchased);
            }
          } catch (err) {
            console.error('Error checking purchase history:', err);
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
      // Scroll to top when product changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [id, isAuthenticated]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      addNotification("Please select a size", "warning");
      return;
    }

    addToCart({
      product: product._id,
      quantity,
      size: selectedSize,
      price: product.price,
    });

    addNotification("Product added to cart!", "success");
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      addNotification("Please login to add to wishlist", "warning");
      return;
    }

    try {
      const productInWishlist = checkIsInWishlist(product._id);
      
      if (productInWishlist) {
        const result = await removeFromWishlist(product._id);
        if (result.success) {
          addNotification("Removed from wishlist", "success");
        }
      } else {
        const result = await addToWishlist(product._id);
        if (result.success) {
          addNotification("Added to wishlist", "success");
        }
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      addNotification("Please login to submit a review", "warning");
      return;
    }

    try {
      // Convert images to base64 if any
      let imageData = [];
      if (review.images && review.images.length > 0) {
        for (const file of review.images) {
          const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
          imageData.push(base64);
        }
      }

      const response = await api.createReview({
        productId: product._id,
        rating: review.rating,
        comment: review.comment,
        images: imageData,
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Review submitted successfully:', data);
        
        // Update product with new review data
        if (data.product) {
          console.log('🔄 Updating product with new reviews:', data.product.reviews.length);
          setProduct(data.product);
          
          // Find the user's review
          const userReview = data.product.reviews.find(r => r.user?.toString() === user?.id?.toString());
          setExistingReview(userReview);
          console.log('📝 User review found:', userReview);
        }
        
        setReview({ rating: 5, comment: "", images: [] });
        setShowReviewForm(false);
        addNotification(existingReview ? "Review updated successfully!" : "Review submitted successfully!", "success");
      } else {
        addNotification(data.message || "Failed to submit review", "error");
      }
    } catch (err) {
      console.error("Review error:", err);
      addNotification("Failed to submit review", "error");
    }
  };

  const handleDeleteReview = async () => {
    try {
      const response = await api.deleteReview(product._id, existingReview._id);
      const data = await response.json();

      if (data.success) {
        setProduct(data.product || { ...product, reviews: product.reviews.filter(r => r._id !== existingReview._id) });
        setExistingReview(null);
        setReview({ rating: 5, comment: "", images: [] });
        setShowReviewForm(false);
        addNotification("Review deleted successfully!", "success");
      } else {
        addNotification(data.message || "Failed to delete review", "error");
      }
    } catch (err) {
      console.error("Delete review error:", err);
      addNotification("Failed to delete review", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f4ff] py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#7b5fc4]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f7f4ff] py-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Product Not Found
          </h2>
          <Link to="/products" className="text-[#7b5fc4] hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ff] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton className="mb-4" />
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link to="/" className="text-[#7b5fc4] hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="text-[#7b5fc4] hover:underline">
            Products
          </Link>
          <span className="mx-2">/</span>
          <span className="text-base text-[#444444]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-4 mb-4 relative">
              <img
                src={product.image?.[activeImage]?.url || "/placeholder.jpg"}
                alt={product.name}
                className="w-full h-96 object-contain bg-white rounded-lg cursor-pointer"
                onClick={() => setShowZoomModal(true)}
              />
              {product.image?.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage(activeImage > 0 ? activeImage - 1 : product.image.length - 1)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setActiveImage(activeImage < product.image.length - 1 ? activeImage + 1 : 0)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition"
                  >
                    →
                  </button>
                </>
              )}
            </div>

            {product.image?.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.image.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      activeImage === index
                        ? "border-[#7b5fc4]"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-contain bg-white"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-xl font-semibold text-[#444444] mb-4">
              {product.name}
            </h1>

            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.ratings)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <button 
                  onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="ml-2 text-gray-600 hover:text-[#7b5fc4] underline cursor-pointer"
                >
                  ({product.numberOfReviews} reviews)
                </button>
              </div>
            </div>

            <p className="text-xl font-semibold text-[#7b5fc4] mb-6">
              ₹{product.price}
            </p>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Category</h3>
              <p className="text-gray-600">
                {product.category} - {product.subcategory}
              </p>
            </div>

            {/* Size Selection */}
            {product.size?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Size</h3>
                <div className="flex space-x-2">
                  {product.size.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-md ${
                        selectedSize === size
                          ? "border-[#7b5fc4] bg-[#e1cffb] text-[#444444]"
                          : "border-gray-300 hover:border-[#7b5fc4]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Quantity</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  -
                </button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {product.stock} items in stock
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-[#e1cffb] text-[#444444] py-3 rounded-lg hover:bg-[#b89ae8] transition font-semibold disabled:opacity-50 flex items-center justify-center"
              >
                <FiShoppingCart className="mr-2" />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
              <button
                onClick={toggleWishlist}
                className={`px-6 py-3 border-none rounded-lg transition ${
                  checkIsInWishlist(product._id)
                    ? "bg-red-50 border-red-300 text-red-600"
                    : "border-[#7b5fc4] text-[#7b5fc4] hover:bg-[#7b5fc4] hover:text-white"
                }`}
              >
                <FiHeart className={checkIsInWishlist(product._id) ? "fill-current" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div id="reviews-section" className="mt-12 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-[#444444]">Reviews</h2>
            {isAuthenticated && hasPurchased && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowReviewForm(!showReviewForm);
                    if (existingReview && !showReviewForm) {
                      setReview({ rating: existingReview.rating, comment: existingReview.comment, images: existingReview.images || [] });
                    }
                  }}
                  className="bg-[#e1cffb] text-[#444444] px-4 py-2 rounded-lg hover:bg-[#b89ae8] transition"
                >
                  {existingReview ? 'Edit Review' : 'Write Review'}
                </button>
                {existingReview && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition"
                  >
                    Delete Review
                  </button>
                )}
              </div>
            )}
            {isAuthenticated && !hasPurchased && (
              <p className="text-sm text-gray-500">Only customers who have purchased this product can write reviews</p>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && hasPurchased && (
            <form
              onSubmit={handleSubmitReview}
              className="mb-6 p-4 border rounded-lg"
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Rating</label>
                <select
                  value={review.rating}
                  onChange={(e) =>
                    setReview({ ...review, rating: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]"
                >
                  {[5, 4, 3, 2, 1].map((num) => (
                    <option key={num} value={num}>
                      {num} Star{num !== 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Comment
                </label>
                <textarea
                  value={review.comment}
                  onChange={(e) =>
                    setReview({ ...review, comment: e.target.value })
                  }
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]"
                  placeholder="Write your review..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Add Images (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setReview({ ...review, images: files });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]"
                />
                <p className="text-xs text-gray-500 mt-1">You can upload multiple images of the product</p>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-[#e1cffb] text-[#444444] px-4 py-2 rounded-lg hover:bg-[#b89ae8] transition"
                >
                  {existingReview ? 'Update Review' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {product.reviews?.length > 0 ? (
              product.reviews.map((review, index) => (
                <div key={index} className="border-b pb-4">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 font-semibold">{review.name}</span>
                    <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Verified Purchase</span>
                  </div>
                  <p className="text-gray-600 mb-3">{review.comment}</p>
                  {review.images && review.images.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500 mb-2">Customer Photos:</p>
                      <div className="flex gap-2 flex-wrap">
                        {review.images.map((img, imgIndex) => {
                          const imageSrc = typeof img === 'string' ? img : (img.url || img.src || img);
                          return (
                            <div key={imgIndex} className="relative group">
                              <img
                                src={imageSrc}
                                alt={`Customer photo ${imgIndex + 1}`}
                                className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-[#7b5fc4] transition-all duration-200 shadow-sm"
                                onClick={() => window.open(imageSrc, '_blank')}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center">
                                <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600">
                No reviews yet. Be the first to review!
              </p>
            )}
          </div>
        </div>

        {/* Product Recommendations */}
        <ProductRecommendations 
          productId={product._id} 
          title="Frequently Bought Together" 
        />

        {/* Image Zoom Modal */}
        <ImageZoomModal
          isOpen={showZoomModal}
          onClose={() => setShowZoomModal(false)}
          imageSrc={product.image?.[activeImage]?.url}
          imageAlt={product.name}
        />

        {/* Delete Review Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteReview}
          title="Delete Review"
          message="Are you sure you want to delete your review? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </div>
  );
};

export default ProductDetail;
