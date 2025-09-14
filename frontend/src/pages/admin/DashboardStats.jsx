import React, { useMemo, useState } from "react";
import { Users, ShoppingBag, IndianRupee, Package, TrendingUp, Calendar, Star, Clock, BarChart3, MapPin, Award, CheckCircle, Loader, Truck, X, Pause } from "lucide-react";

const DashboardStats = ({ orders = [], users = [], products = [] }) => {
  const [salesPeriod, setSalesPeriod] = useState('month');
  
  const analytics = useMemo(() => {
    // Time-based sales analysis
    const weeklySales = {};
    const monthlySales = {};
    const yearlySales = {};
    const productSales = {};
    const regionSales = {};
    const orderStatusCount = {};
    const categoryStats = {};
    
    // Only process completed/delivered orders for accurate sales data
    const completedOrdersList = orders.filter(order => 
      order.orderStatus === 'Delivered' || 
      order.orderStatus === 'Verified and Confirmed' ||
      order.orderStatus === 'Shipped'
    );
    
    completedOrdersList.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const orderRevenue = order.totalPrice || 0;
      
      // Weekly sales - group by week starting Monday
      const weekStart = new Date(orderDate);
      const dayOfWeek = weekStart.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      weekStart.setDate(weekStart.getDate() - daysToMonday);
      const weekKey = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      weeklySales[weekKey] = (weeklySales[weekKey] || 0) + orderRevenue;
      
      // Monthly sales
      const monthKey = orderDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlySales[monthKey] = (monthlySales[monthKey] || 0) + orderRevenue;
      
      // Yearly sales
      const yearKey = orderDate.getFullYear().toString();
      yearlySales[yearKey] = (yearlySales[yearKey] || 0) + orderRevenue;
      
      // Regional sales (prioritize state, fallback to city)
      const region = order.shippingInfo?.state || order.shippingInfo?.city || 'Unknown Region';
      regionSales[region] = (regionSales[region] || 0) + orderRevenue;
    });
    
    // Process all orders for status count and product analysis
    orders.forEach(order => {
      // Order status count
      orderStatusCount[order.orderStatus] = (orderStatusCount[order.orderStatus] || 0) + 1;
      
      // Product sales and category analysis from order items
      if (order.orderItems && Array.isArray(order.orderItems)) {
        order.orderItems.forEach(item => {
          const productName = item.name || 'Unknown Product';
          const itemRevenue = (item.quantity || 0) * (item.price || 0);
          
          // Only count revenue for completed orders
          if (completedOrdersList.includes(order)) {
            productSales[productName] = (productSales[productName] || 0) + itemRevenue;
          }
          
          // For category stats, we need to get category from products array
          // Since orderItems don't have category, we'll match with products
          const matchingProduct = products.find(p => p._id === item.product);
          const category = matchingProduct?.category || 'Other';
          categoryStats[category] = (categoryStats[category] || 0) + (item.quantity || 0);
        });
      }
    });
    
    const recentUsers = users.filter(user => {
      const userDate = new Date(user.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return userDate >= thirtyDaysAgo;
    }).length;
    
    // Get current period data based on selection
    const getCurrentPeriodData = () => {
      switch(salesPeriod) {
        case 'week': 
          return Object.entries(weeklySales)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .slice(-8);
        case 'year': 
          return Object.entries(yearlySales)
            .sort(([a], [b]) => parseInt(a) - parseInt(b));
        default: 
          return Object.entries(monthlySales)
            .sort(([a], [b]) => new Date(a + ' 1') - new Date(b + ' 1'))
            .slice(-6);
      }
    };
    
    // Calculate revenue only from completed orders
    const completedRevenue = completedOrdersList.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const completedOrdersCount = completedOrdersList.length;
    const pendingOrdersCount = orders.filter(order => 
      order.orderStatus === 'Order Placed' || 
      order.orderStatus === 'Verification Pending'
    ).length;
    
    return {
      totalRevenue: completedRevenue,
      completedOrders: completedOrdersCount,
      pendingOrders: pendingOrdersCount,
      avgOrderValue: completedOrdersCount > 0 ? completedRevenue / completedOrdersCount : 0,
      currentPeriodSales: getCurrentPeriodData(),
      topProducts: Object.entries(productSales)
        .filter(([, sales]) => sales > 0)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      topRegions: Object.entries(regionSales)
        .filter(([, sales]) => sales > 0)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      orderStatusCount,
      categoryStats: Object.entries(categoryStats)
        .filter(([, quantity]) => quantity > 0)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      recentUsers
    };
  }, [orders, users, salesPeriod]);
  
  const stats = [
    {
      name: "Total Revenue",
      value: `₹${analytics.totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      color: "bg-gradient-to-r from-green-100 to-green-200 text-green-700",
      change: "+12.5%",
      trend: "up"
    },
    {
      name: "Total Orders",
      value: orders.length,
      icon: ShoppingBag,
      color: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700",
      change: "+8.2%",
      trend: "up"
    },
    {
      name: "Total Users",
      value: users.length,
      icon: Users,
      color: "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700",
      change: "+15.3%",
      trend: "up"
    },
    {
      name: "Total Products",
      value: products.length,
      icon: Package,
      color: "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700",
      change: "+5.1%",
      trend: "up"
    },
  ];
  
  const quickStats = [
    {
      name: "Avg Order Value",
      value: `₹${analytics.avgOrderValue.toFixed(0)}`,
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      name: "Completed Orders",
      value: analytics.completedOrders,
      icon: Star,
      color: "text-blue-600"
    },
    {
      name: "Pending Orders",
      value: analytics.pendingOrders,
      icon: Clock,
      color: "text-yellow-600"
    },
    {
      name: "New Users (30d)",
      value: analytics.recentUsers,
      icon: Calendar,
      color: "text-purple-600"
    },
  ];
  return (
    <div className="mt-6 space-y-8">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Dashboard Overview
      </h2>
      
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ name, value, icon: Icon, color, change, trend }) => (
          <div
            key={name}
            className={`rounded-xl p-6 shadow-lg border border-gray-100 ${color} transform hover:scale-105 transition-transform duration-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{name}</p>
                <p className="text-2xl font-bold mt-1">{value}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span className="text-xs font-medium">{change}</span>
                </div>
              </div>
              <Icon className="h-10 w-10 opacity-70" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map(({ name, value, icon: Icon, color }) => (
          <div key={name} className="bg-white rounded-lg p-4 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">{name}</p>
                <p className="text-lg font-semibold text-gray-800">{value}</p>
              </div>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
          </div>
        ))}
      </div>
      
      {/* Sales Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Trend Chart with Period Selector */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Sales Trend</h3>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['week', 'month', 'year'].map(period => (
                <button
                  key={period}
                  onClick={() => setSalesPeriod(period)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    salesPeriod === period 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {analytics.currentPeriodSales.map(([period, revenue], index) => {
              const maxRevenue = Math.max(...analytics.currentPeriodSales.map(([, rev]) => rev));
              const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
              return (
                <div key={period} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-20 truncate">{period}</span>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-700"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-800 w-24">₹{revenue.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Best Selling Products */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center mb-4">
            <Award className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-700">Best Selling Products</h3>
          </div>
          <div className="space-y-4">
            {analytics.topProducts.map(([product, sales], index) => {
              const maxSales = Math.max(...analytics.topProducts.map(([, s]) => s));
              const percentage = (sales / maxSales) * 100;
              const rankColors = ['text-yellow-600', 'text-gray-500', 'text-orange-600', 'text-blue-600', 'text-purple-600'];
              return (
                <div key={product} className="flex items-center">
                  <div className={`w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-3 ${rankColors[index]}`}>
                    <span className="text-xs font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800 truncate">{product}</span>
                      <span className="text-sm text-gray-600">₹{sales.toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-700 ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                          index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                          index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                          'bg-gradient-to-r from-blue-400 to-purple-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Regional Sales & Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Regional Sales Analysis */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center mb-4">
            <MapPin className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-700">Top Regions by Sales</h3>
          </div>
          <div className="space-y-4">
            {analytics.topRegions.map(([region, sales], index) => {
              const maxSales = Math.max(...analytics.topRegions.map(([, s]) => s));
              const percentage = (sales / maxSales) * 100;
              const regionColors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
              return (
                <div key={region} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className={`w-4 h-4 rounded-full ${regionColors[index % regionColors.length]} mr-3`}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800">{region}</span>
                        <span className="text-sm text-gray-600">₹{sales.toLocaleString()}</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${regionColors[index % regionColors.length]} transition-all duration-700`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-700">Order Status Distribution</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(analytics.orderStatusCount).map(([status, count], index) => {
              const colors = ['bg-green-500', 'bg-yellow-500', 'bg-blue-500', 'bg-red-500', 'bg-purple-500'];
              const percentage = (count / orders.length) * 100;
              const getStatusIcon = (status) => {
                switch(status) {
                  case 'Delivered': return <CheckCircle className="h-4 w-4" />;
                  case 'Processing': return <Loader className="h-4 w-4" />;
                  case 'Shipped': return <Truck className="h-4 w-4" />;
                  case 'Cancelled': return <X className="h-4 w-4" />;
                  case 'Pending': return <Pause className="h-4 w-4" />;
                  default: return <Clock className="h-4 w-4" />;
                }
              };
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className={`w-8 h-8 rounded-full ${colors[index % colors.length]} mr-3 flex items-center justify-center text-white`}>
                      {getStatusIcon(status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800">{status}</span>
                        <span className="text-sm text-gray-600">{count} orders ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${colors[index % colors.length]} transition-all duration-700`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardStats;
