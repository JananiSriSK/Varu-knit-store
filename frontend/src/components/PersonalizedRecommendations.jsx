import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProductCard from './ProductCard';
import api from '../services/api';

const PersonalizedRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPersonalizedRecommendations();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPersonalizedRecommendations = async () => {
    try {
      const response = await api.getPersonalizedRecommendations();
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching personalized recommendations:', error);
    } finally {
      setLoading(false);
    }
  };



  if (!user || loading) {
    return loading ? (
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
    ) : null;
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="py-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
      <div className="px-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-800">Recommended for You</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {recommendations.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalizedRecommendations;