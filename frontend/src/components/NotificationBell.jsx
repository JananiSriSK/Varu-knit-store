import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, User, Package, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const NotificationBell = ({ isAdmin = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.getNotifications();
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.markNotificationRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read first
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    
    // Close dropdown
    setShowDropdown(false);
    
    // Navigate based on notification type and user role
    switch (notification.type) {
      case 'new_user':
        if (isAdmin) {
          navigate('/admindashboard?tab=users');
        }
        break;
      case 'new_order':
        if (isAdmin) {
          navigate('/admindashboard?tab=orders');
        } else {
          navigate('/my-profile?tab=orders');
        }
        break;
      case 'order_status_update':
        if (isAdmin) {
          navigate('/admindashboard?tab=orders');
        } else {
          navigate('/my-profile?tab=orders');
        }
        break;
      case 'order_delayed':
        if (isAdmin) {
          navigate('/admindashboard?tab=orders');
        } else {
          navigate('/my-profile?tab=orders');
        }
        break;
      case 'low_stock':
        if (isAdmin) {
          navigate('/admindashboard?tab=products');
        }
        break;
      case 'product_review':
        if (isAdmin) {
          navigate('/admindashboard?tab=products');
        } else {
          // Navigate to the specific product if productId is available
          if (notification.productId) {
            navigate(`/product/${notification.productId}`);
          } else {
            navigate('/my-profile?tab=orders');
          }
        }
        break;
      default:
        // Default navigation based on user role
        if (isAdmin) {
          navigate('/admindashboard');
        } else {
          navigate('/my-profile');
        }
        break;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_user': return <User className="h-4 w-4 text-blue-500" />;
      case 'new_order': return <Package className="h-4 w-4 text-green-500" />;
      case 'order_delayed': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div 
      className="relative"
      ref={notificationRef}
    >
      <div 
        className="relative p-2 text-[#444444] hover:bg-[#f7f4ff] rounded-lg transition-colors cursor-pointer"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-[#444444]">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#444444]">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;