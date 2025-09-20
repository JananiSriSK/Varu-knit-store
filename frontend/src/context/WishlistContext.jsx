import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist')) || [];
      setWishlistItems(guestWishlist);
      return;
    }

    try {
      const response = await api.getWishlist();
      const data = await response.json();
      if (data.success) {
        setWishlistItems(data.wishlist.map(item => item._id));
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.includes(productId);
  };

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist')) || [];
      guestWishlist.push(productId);
      localStorage.setItem('guestWishlist', JSON.stringify(guestWishlist));
      setWishlistItems(guestWishlist);
      return { success: true };
    }

    try {
      const response = await api.addToWishlist(productId);
      const data = await response.json();
      if (data.success) {
        setWishlistItems([...wishlistItems, productId]);
      }
      return data;
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      return { success: false };
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) {
      const guestWishlist = wishlistItems.filter(id => id !== productId);
      localStorage.setItem('guestWishlist', JSON.stringify(guestWishlist));
      setWishlistItems(guestWishlist);
      return { success: true };
    }

    try {
      const response = await api.removeFromWishlist(productId);
      const data = await response.json();
      if (data.success) {
        setWishlistItems(wishlistItems.filter(id => id !== productId));
      }
      return data;
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      return { success: false };
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      fetchWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);