import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, isAuthenticated: true, loading: false };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('cart');
      return { ...state, user: null, isAuthenticated: false, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    loading: true
  });

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    // Redirect based on user role
    const currentUser = state.user;
    if (currentUser?.role === 'admin') {
      window.location.href = '/admindashboard';
    } else {
      window.location.href = '/';
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      axios.get('http://localhost:5000/api/v1/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        const data = response.data;
        if (data.success) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
        } else {
          localStorage.removeItem('token');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        dispatch({ type: 'SET_LOADING', payload: false });
      });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);