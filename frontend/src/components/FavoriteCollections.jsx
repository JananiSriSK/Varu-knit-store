import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import api from '../services/api';

const FavoriteCollections = () => {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavoriteCollections();
  }, []);

  const fetchFavoriteCollections = async () => {
    try {
      const response = await api.getFavoriteCollections();
      const data = await response.json();
      if (data.success) {
        setFavoriteProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching favorite collections:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-300 h-64 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (favoriteProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-6 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
        <h2 className="text-xl md:text-2xl font-serif font-semibold text-[#444444] mb-6">
          Our Favorite Collections
        </h2>
        <p className="text-gray-600 mb-8">
          Handpicked by our team - these are the pieces we absolutely love
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {favoriteProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FavoriteCollections;