import React, { useState, useEffect } from "react";
import { Star, Trash2, Search } from "lucide-react";
import api from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import ConfirmationModal from "../../components/ConfirmationModal";

const ReviewsManagement = ({ products = [] }) => {
  const { addNotification } = useNotification();
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, reviewId: null, productId: null });

  useEffect(() => {
    fetchAllReviews();
  }, [products]);

  const fetchAllReviews = () => {
    const allReviews = [];
    products.forEach(product => {
      if (product.reviews && product.reviews.length > 0) {
        product.reviews.forEach(review => {
          allReviews.push({
            ...review,
            productId: product._id,
            productName: product.name,
            productImage: product.image?.[0]?.url
          });
        });
      }
    });
    setReviews(allReviews);
  };

  const handleDeleteReview = async () => {
    const { productId, reviewId } = confirmModal;
    setLoading(true);
    try {
      const response = await api.deleteReview(productId, reviewId);
      const data = await response.json();

      if (data.success) {
        setReviews(reviews.filter(review => review._id !== reviewId));
        addNotification("Review deleted successfully!", "success");
      } else {
        addNotification(data.message || "Failed to delete review", "error");
      }
    } catch (err) {
      console.error("Error deleting review:", err);
      addNotification("Failed to delete review", "error");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredReviews = () => {
    if (!searchTerm) return reviews;
    return reviews.filter(review =>
      review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Reviews Management</h2>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search reviews by product, user, or comment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7b5fc4]"
        />
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl shadow-lg border border-[#dcd6f7] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-[#e8e0ff] to-[#f0ebff]">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Product</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">User</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Rating</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Comment</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredReviews().map((review, index) => (
                <tr key={review._id} className="border-t border-gray-100/70 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {review.productImage && (
                        <img
                          src={review.productImage}
                          alt={review.productName}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{review.productName}</p>
                        <p className="text-sm text-gray-500">ID: {review.productId.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-gray-800">{review.name}</p>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Verified Purchase</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">({review.rating})</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-gray-700 max-w-xs truncate" title={review.comment}>
                      {review.comment}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-gray-600 text-sm">
                      {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => setConfirmModal({ isOpen: true, reviewId: review._id, productId: review.productId })}
                      disabled={loading}
                      className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {getFilteredReviews().length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    {searchTerm ? "No reviews found matching your search." : "No reviews available."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-white rounded-xl shadow-lg border border-[#dcd6f7] p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Reviews Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#7b5fc4]">{reviews.length}</p>
            <p className="text-gray-600">Total Reviews</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#7b5fc4]">
              {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0"}
            </p>
            <p className="text-gray-600">Average Rating</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#7b5fc4]">
              {products.filter(p => p.reviews && p.reviews.length > 0).length}
            </p>
            <p className="text-gray-600">Products with Reviews</p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, reviewId: null, productId: null })}
        onConfirm={handleDeleteReview}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default ReviewsManagement;