import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return { ...state, items: action.payload };
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => 
        item.product === action.payload.product && item.size === action.payload.size
      );
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.product === action.payload.product && item.size === action.payload.size
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      
      return {
        ...state,
        items: [...state.items, action.payload]
      };
      
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => 
          !(item.product === action.payload.product && item.size === action.payload.size)
        )
      };
      
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.product === action.payload.product && item.size === action.payload.size
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
      
    case 'UPDATE_SIZE':
      return {
        ...state,
        items: state.items.map(item =>
          item.product === action.payload.product && item.size === action.payload.oldSize
            ? { ...item, size: action.payload.newSize }
            : item
        )
      };
      
    case 'CLEAR_CART':
      return { ...state, items: [] };
      
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: []
  });

  const loadCart = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userId = JSON.parse(atob(token.split('.')[1])).id;
        const userCart = JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];
        dispatch({ type: 'LOAD_CART', payload: userCart });
      } catch (err) {
        console.error('Error loading user cart:', err);
        const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
        dispatch({ type: 'LOAD_CART', payload: guestCart });
      }
    } else {
      // Load guest cart
      const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
      dispatch({ type: 'LOAD_CART', payload: guestCart });
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Listen for storage changes (when user logs in)
  useEffect(() => {
    const handleStorageChange = () => {
      loadCart();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addToCart = (item) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
    
    // Save to appropriate storage
    setTimeout(() => {
      const token = localStorage.getItem('token');
      if (token) {
        const userId = JSON.parse(atob(token.split('.')[1])).id;
        const currentItems = JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];
        const existingItem = currentItems.find(cartItem => 
          cartItem.product === item.product && cartItem.size === item.size
        );
        
        let updatedItems;
        if (existingItem) {
          updatedItems = currentItems.map(cartItem =>
            cartItem.product === item.product && cartItem.size === item.size
              ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
              : cartItem
          );
        } else {
          updatedItems = [...currentItems, item];
        }
        
        localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedItems));
      } else {
        // Save to guest cart
        const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
        const existingItem = guestCart.find(cartItem => 
          cartItem.product === item.product && cartItem.size === item.size
        );
        
        let updatedItems;
        if (existingItem) {
          updatedItems = guestCart.map(cartItem =>
            cartItem.product === item.product && cartItem.size === item.size
              ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
              : cartItem
          );
        } else {
          updatedItems = [...guestCart, item];
        }
        
        localStorage.setItem('guestCart', JSON.stringify(updatedItems));
      }
    }, 0);
  };

  const removeFromCart = (product, size) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { product, size } });
    
    setTimeout(() => {
      const token = localStorage.getItem('token');
      if (token) {
        const userId = JSON.parse(atob(token.split('.')[1])).id;
        const currentItems = JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];
        const newItems = currentItems.filter(item => 
          !(item.product === product && item.size === size)
        );
        localStorage.setItem(`cart_${userId}`, JSON.stringify(newItems));
      } else {
        const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
        const newItems = guestCart.filter(item => 
          !(item.product === product && item.size === size)
        );
        localStorage.setItem('guestCart', JSON.stringify(newItems));
      }
    }, 0);
  };

  const updateQuantity = (product, size, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { product, size, quantity } });
    
    setTimeout(() => {
      const token = localStorage.getItem('token');
      if (token) {
        const userId = JSON.parse(atob(token.split('.')[1])).id;
        const currentItems = JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];
        const newItems = currentItems.map(item =>
          item.product === product && item.size === size
            ? { ...item, quantity }
            : item
        );
        localStorage.setItem(`cart_${userId}`, JSON.stringify(newItems));
      } else {
        const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
        const newItems = guestCart.map(item =>
          item.product === product && item.size === size
            ? { ...item, quantity }
            : item
        );
        localStorage.setItem('guestCart', JSON.stringify(newItems));
      }
    }, 0);
  };

  const updateSize = (product, oldSize, newSize) => {
    dispatch({ type: 'UPDATE_SIZE', payload: { product, oldSize, newSize } });
    
    setTimeout(() => {
      const token = localStorage.getItem('token');
      if (token) {
        const userId = JSON.parse(atob(token.split('.')[1])).id;
        const currentItems = JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];
        const newItems = currentItems.map(item =>
          item.product === product && item.size === oldSize
            ? { ...item, size: newSize }
            : item
        );
        localStorage.setItem(`cart_${userId}`, JSON.stringify(newItems));
      } else {
        const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
        const newItems = guestCart.map(item =>
          item.product === product && item.size === oldSize
            ? { ...item, size: newSize }
            : item
        );
        localStorage.setItem('guestCart', JSON.stringify(newItems));
      }
    }, 0);
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    const token = localStorage.getItem('token');
    if (token) {
      const userId = JSON.parse(atob(token.split('.')[1])).id;
      localStorage.removeItem(`cart_${userId}`);
    } else {
      localStorage.removeItem('guestCart');
    }
  };

  const syncGuestDataOnLogin = () => {
    const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
    const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist')) || [];
    
    if (guestCart.length > 0) {
      dispatch({ type: 'LOAD_CART', payload: guestCart });
      const token = localStorage.getItem('token');
      if (token) {
        const userId = JSON.parse(atob(token.split('.')[1])).id;
        localStorage.setItem(`cart_${userId}`, JSON.stringify(guestCart));
        localStorage.removeItem('guestCart');
      }
    }
  };

  return (
    <CartContext.Provider value={{
      items: state.items,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateSize,
      clearCart,
      syncGuestDataOnLogin
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);