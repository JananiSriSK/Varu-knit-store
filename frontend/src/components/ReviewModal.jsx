import React, { useState } from "react";
import { X, Star } from "lucide-react";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";

const ReviewModal = ({ isOpen, onClose, product }) => {
  const { addNotification } = useNotification();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      return addNotification("Please select a rating", "error");
    }

    setLoading(true);
    try {
      const response = await api.createReview({
        rating,
        comment,
        productId: product.product
      });
      const data = await response.json();

      if (data.success) {
        addNotification("Review submitted successfully!", "success");
        onClose();
        setRating(0);
        setComment("");
      } else {
        addNotification(data.message || "Failed to submit review", "error");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      addNotification("Failed to submit review", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Write Review</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4">
            <h3 className="font-medium text-gray-800">{product.name}</h3>
            <p className="text-sm text-gray-600">Size: {product.size}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-1 ${
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
                rows="4"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || rating === 0}
                className="flex-1 px-4 py-2 bg-[#7b5fc4] text-white rounded-lg hover:bg-[#6b4fb4] disabled:opacity-50 transition-colors"
              >
                {loading ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;