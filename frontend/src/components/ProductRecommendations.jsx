import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import api from '../services/api';

const ProductRecommendations = ({ productId, title = "Frequently Bought Together" }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [productId]);

  const fetchRecommendations = async () => {
    try {
      const response = await api.getRecommendations(productId);
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-gray-200 h-48 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="py-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;