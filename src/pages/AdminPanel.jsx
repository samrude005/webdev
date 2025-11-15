import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DollarSign, CreditCard, Users, TrendingUp, Download, Search, Calendar, BarChart3, PieChart, ShoppingCart, X, Plus, Minus, Star, Eye, FileText, Package, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

// Marketplace Component
const MarketplaceView = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Educational Kit for Children',
      vendor: 'Hope Foundation',
      category: 'Education',
      price: 25.00,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop',
      description: 'Complete educational kit including books, pencils, and learning materials for underprivileged children.',
      verified: true,
      stock: 50
    },
    {
      id: 2,
      name: 'Medical Supply Bundle',
      vendor: 'HealthCare NGO',
      category: 'Healthcare',
      price: 75.00,
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=300&h=200&fit=crop',
      description: 'Essential medical supplies including first aid kits, bandages, and basic medications.',
      verified: true,
      stock: 30
    },
    {
      id: 3,
      name: 'Nutrition Food Pack',
      vendor: 'Feed the World',
      category: 'Food',
      price: 35.00,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=300&h=200&fit=crop',
      description: 'Nutritious food package containing grains, pulses, and essential nutrients for families in need.',
      verified: true,
      stock: 100
    },
    {
      id: 4,
      name: 'Winter Clothing Bundle',
      vendor: 'Warmth for All',
      category: 'Clothing',
      price: 45.00,
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&h=200&fit=crop',
      description: 'Complete winter clothing set including jackets, blankets, and warm accessories.',
      verified: true,
      stock: 40
    },
    {
      id: 5,
      name: 'Laptop for Students',
      vendor: 'Tech for Education',
      category: 'Technology',
      price: 350.00,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=200&fit=crop',
      description: 'Refurbished laptop with educational software for students in remote areas.',
      verified: true,
      stock: 15
    },
    {
      id: 6,
      name: 'School Uniform Set',
      vendor: 'Bright Futures',
      category: 'Clothing',
      price: 20.00,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=300&h=200&fit=crop',
      description: 'Complete school uniform set to help children attend school with dignity.',
      verified: true,
      stock: 80
    }
  ]);

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product, qty = 1) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + qty }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: qty }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    alert(`Checkout Total: ₹${cartTotal.toFixed(2)}\n\nThank you for supporting our cause!`);
    setCart([]);
    setShowCart(false);
  };

  return (
    <div className="marketplace-container">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="Education">Education</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Food">Food</option>
              <option value="Clothing">Clothing</option>
              <option value="Technology">Technology</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div onClick={() => setSelectedProduct(product)}>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover bg-gray-200"
              />
              <div className="p-5">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm mb-2">
                  {product.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.vendor}</p>
                <div className="flex items-center mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
                  {product.verified && (
                    <span className="ml-2 text-xs text-green-600 font-semibold">✓ Verified</span>
                  )}
                </div>
                <p className="text-2xl font-bold text-green-600 mb-4">₹{product.price.toFixed(2)}</p>
              </div>
            </div>
            <div className="px-5 pb-5">
              <button
                onClick={() => {
                  addToCart(product);
                }}
                disabled={product.stock === 0}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  product.stock > 0
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Product Details</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full rounded-lg bg-gray-200"
                  />
                </div>
                <div>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm mb-3">
                    {selectedProduct.category}
                  </span>
                  <h2 className="text-3xl font-bold mb-4">{selectedProduct.name}</h2>
                  <div className="bg-gray-100 rounded-lg p-4 mb-4">
                    <p className="font-semibold text-gray-700">Vendor: {selectedProduct.vendor}</p>
                    {selectedProduct.verified && (
                      <p className="text-green-600 font-semibold mt-1">✓ Verified Vendor</p>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                  <div className="flex items-center mb-4">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="ml-2 text-lg">{selectedProduct.rating} / 5.0</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600 mb-6">₹{selectedProduct.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-600 mb-4">Stock: {selectedProduct.stock} available</p>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-semibold">Quantity:</span>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center px-3 py-2 border border-gray-300 rounded"
                      min="1"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(selectedProduct, quantity);
                      setSelectedProduct(null);
                      setQuantity(1);
                    }}
                    disabled={selectedProduct.stock === 0}
                    className={`w-full py-3 rounded-lg font-semibold text-lg ${
                      selectedProduct.stock > 0
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {selectedProduct.stock > 0 ? `Add ${quantity} to Cart` : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowCart(false)}
          />
          <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Shopping Cart</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Your cart is empty</p>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4 mb-6 pb-6 border-b border-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">₹{item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <p className="font-bold text-green-600">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
            {cart.length > 0 && (
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
                <div className="flex justify-between text-xl font-bold mb-4">
                  <span>Total:</span>
                  <span className="text-green-600">₹{cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
                >
                  Checkout
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Floating Cart Button */}
      <button
        onClick={() => setShowCart(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-30"
      >
        <ShoppingCart className="w-6 h-6" />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );
};

// My Purchases Component
const MyPurchasesView = () => {
  const [purchases, setPurchases] = useState([
    {
      purchaseId: "PUR-2024-001",
      itemName: "Educational Kit for Children",
      vendor: "Hope Foundation",
      vendorId: "vendor001",
      vendorAddress: "123 Education Street, New Delhi - 110001",
      vendorContact: "support@hopefoundation.in",
      quantity: 50,
      amount: 1250.00,
      orderDate: "2024-11-10T10:30:00Z",
      paymentId: "pay_1234567890abcdef",
      paymentMethod: "Razorpay",
      status: "verified",
      receiptUrl: "https://example.com/receipts/pur-2024-001.pdf",
      volunteerAssigned: {
        name: "Rohan Sharma",
        id: "vol_001",
        email: "rohan@volunteers.ngo"
      },
      photos: [
        "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=300&h=200&fit=crop",
        "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300&h=200&fit=crop",
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop"
      ],
      blockchainProof: {
        hash: "0x3f8a9b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
        link: "https://polygonscan.com/tx/0x3f8a9b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2"
      },
      impactReport: "Educational kits distributed to 150 students in 3 villages"
    },
    {
      purchaseId: "PUR-2024-002",
      itemName: "Medical Supply Bundle",
      vendor: "HealthCare NGO",
      vendorId: "vendor002",
      vendorAddress: "45 Health Avenue, Mumbai - 400001",
      vendorContact: "care@healthcarengo.in",
      quantity: 20,
      amount: 1500.00,
      orderDate: "2024-11-08T14:20:00Z",
      paymentId: "pay_abcd1234efgh5678",
      paymentMethod: "Razorpay",
      status: "under-verification",
      receiptUrl: "https://example.com/receipts/pur-2024-002.pdf",
      volunteerAssigned: {
        name: "Priya Patel",
        id: "vol_002",
        email: "priya@volunteers.ngo"
      },
      photos: [
        "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=300&h=200&fit=crop"
      ],
      blockchainProof: null,
      impactReport: null
    },
    {
      purchaseId: "PUR-2024-003",
      itemName: "Winter Clothing Bundle",
      vendor: "Warmth for All",
      vendorId: "vendor004",
      vendorAddress: "78 NGO Complex, Kolkata - 700001",
      vendorContact: "info@warmthforall.in",
      quantity: 100,
      amount: 4500.00,
      orderDate: "2024-10-25T09:15:00Z",
      paymentId: "pay_xyz789abc123",
      paymentMethod: "Razorpay",
      status: "delivered",
      receiptUrl: "https://example.com/receipts/pur-2024-003.pdf",
      volunteerAssigned: {
        name: "Amit Kumar",
        id: "vol_003",
        email: "amit@volunteers.ngo"
      },
      photos: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=200&fit=crop",
        "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop"
      ],
      blockchainProof: {
        hash: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
        link: "https://polygonscan.com/tx/0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b"
      },
      impactReport: "Winter clothing distributed to 300 families in rural areas"
    },
    {
      purchaseId: "PUR-2024-004",
      itemName: "Nutrition Food Pack",
      vendor: "Feed the World",
      vendorId: "vendor003",
      vendorAddress: "56 Food Street, Chennai - 600001",
      vendorContact: "support@feedtheworld.in",
      quantity: 75,
      amount: 2625.00,
      orderDate: "2024-11-01T11:00:00Z",
      paymentId: "pay_food123xyz789",
      paymentMethod: "Razorpay",
      status: "pending",
      receiptUrl: "https://example.com/receipts/pur-2024-004.pdf",
      volunteerAssigned: null,
      photos: [],
      blockchainProof: null,
      impactReport: null
    }
  ]);

  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      'delivered': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Delivered' },
      'under-verification': { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'Under Verification' },
      'verified': { color: 'bg-teal-100 text-teal-800', icon: CheckCircle, label: 'Verified' },
      'flagged': { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Flagged' }
    };
    const config = statusConfig[status] || statusConfig['pending'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const openPurchaseDetails = (purchase) => {
    setSelectedPurchase(purchase);
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Purchase ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchases.length > 0 ? (
                purchases.map((purchase) => (
                  <tr key={purchase.purchaseId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{purchase.purchaseId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{purchase.itemName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{purchase.vendor}</div>
                      <div className="text-xs text-gray-500">{purchase.vendorId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">
                        ₹{purchase.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(purchase.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(purchase.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openPurchaseDetails(purchase)}
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        {purchase.blockchainProof && (
                          <button
                            onClick={() => window.open(purchase.blockchainProof.link, '_blank')}
                            className="inline-flex items-center px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Proof
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
                    <p>Your purchase history will appear here</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Detail Modal */}
      {selectedPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Purchase Details</h2>
              <button
                onClick={() => setSelectedPurchase(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {/* Basic Information */}
              <div className="mb-6 p-5 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-blue-600">
                    <div className="text-xs text-gray-500 uppercase mb-1">Purchase ID</div>
                    <div className="text-base font-semibold text-gray-900">{selectedPurchase.purchaseId}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-blue-600">
                    <div className="text-xs text-gray-500 uppercase mb-1">Item Name</div>
                    <div className="text-base font-semibold text-gray-900">{selectedPurchase.itemName}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-blue-600">
                    <div className="text-xs text-gray-500 uppercase mb-1">Status</div>
                    <div>{getStatusBadge(selectedPurchase.status)}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-blue-600">
                    <div className="text-xs text-gray-500 uppercase mb-1">Quantity</div>
                    <div className="text-base font-semibold text-gray-900">{selectedPurchase.quantity}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-blue-600">
                    <div className="text-xs text-gray-500 uppercase mb-1">Total Amount</div>
                    <div className="text-base font-bold text-green-600">₹{selectedPurchase.amount.toLocaleString()}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-blue-600">
                    <div className="text-xs text-gray-500 uppercase mb-1">Order Date</div>
                    <div className="text-base font-semibold text-gray-900">
                      {new Date(selectedPurchase.orderDate).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vendor Information */}
              <div className="mb-6 p-5 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Vendor Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-600">
                    <div className="text-xs text-gray-500 uppercase mb-1">Vendor Name</div>
                    <div className="text-base font-semibold text-gray-900">{selectedPurchase.vendor}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-600">
                    <div className="text-xs text-gray-500 uppercase mb-1">Vendor ID</div>
                    <div className="text-base font-semibold text-gray-900">{selectedPurchase.vendorId}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-600">
                    <div className="text-xs text-gray-500 uppercase mb-1">Address</div>
                    <div className="text-sm text-gray-900">{selectedPurchase.vendorAddress}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-600">
                    <div className="text-xs text-gray-500 uppercase mb-1">Contact</div>
                    <div className="text-sm text-gray-900">{selectedPurchase.vendorContact}</div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="mb-6 p-5 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-purple-600">
                    <div className="text-xs text-gray-500 uppercase mb-1">Payment ID</div>
                    <div className="text-sm font-mono text-gray-900">{selectedPurchase.paymentId}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-purple-600">
                    <div className="text-xs text-gray-500 uppercase mb-1">Payment Method</div>
                    <div className="text-base font-semibold text-gray-900">{selectedPurchase.paymentMethod}</div>
                  </div>
                </div>
              </div>

              {/* Volunteer Information */}
              {selectedPurchase.volunteerAssigned && (
                <div className="mb-6 p-5 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Volunteer Assigned</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border-l-4 border-orange-600">
                      <div className="text-xs text-gray-500 uppercase mb-1">Name</div>
                      <div className="text-base font-semibold text-gray-900">{selectedPurchase.volunteerAssigned.name}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-orange-600">
                      <div className="text-xs text-gray-500 uppercase mb-1">Volunteer ID</div>
                      <div className="text-base font-semibold text-gray-900">{selectedPurchase.volunteerAssigned.id}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-orange-600">
                      <div className="text-xs text-gray-500 uppercase mb-1">Email</div>
                      <div className="text-sm text-gray-900">{selectedPurchase.volunteerAssigned.email}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Photos */}
              {selectedPurchase.photos && selectedPurchase.photos.length > 0 && (
                <div className="mb-6 p-5 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedPurchase.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Delivery photo ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg shadow-md"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Blockchain Proof */}
              {selectedPurchase.blockchainProof && (
                <div className="mb-6 p-5 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Blockchain Proof</h3>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-xs text-gray-500 uppercase mb-2">Transaction Hash</div>
                    <div className="text-sm font-mono text-gray-700 break-all mb-3">
                      {selectedPurchase.blockchainProof.hash}
                    </div>
                    <a
                      href={selectedPurchase.blockchainProof.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      View on Polygonscan
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              )}

              {/* Impact Report */}
              {selectedPurchase.impactReport && (
                <div className="p-5 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Impact Report</h3>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-gray-700">{selectedPurchase.impactReport}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');
  const [selectedView, setSelectedView] = useState('overview'); // overview, transactions, campaigns, marketplace, purchases

  useEffect(() => {
    if (!user || user.userType !== 'ngo') {
      navigate('/dashboard');
      return;
    }
    loadAdminData();
  }, [user, navigate]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Fetch all donations from Firestore
      const donationsSnapshot = await getDocs(collection(db, 'donations'));
      const donationsList = donationsSnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        };
      });
      setDonations(donationsList);

      // Fetch all campaigns from Firestore
      const campaignsSnapshot = await getDocs(collection(db, 'campaigns'));
      const campaignsList = campaignsSnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        };
      });
      setCampaigns(campaignsList);

      // Fetch all volunteers from Firestore
      const volunteersSnapshot = await getDocs(collection(db, 'volunteers'));
      const volunteersList = volunteersSnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setVolunteers(volunteersList);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = 
      donation.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterMethod === 'all' || donation.paymentMethod === filterMethod;
    return matchesSearch && matchesFilter;
  });

  const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const uniqueDonors = new Set(donations.map(d => d.userId)).size;
  const paymentMethods = [...new Set(donations.map(d => d.paymentMethod))].filter(Boolean);
  const avgDonation = donations.length > 0 ? totalDonations / donations.length : 0;
  
  // Payment method breakdown
  const paymentBreakdown = paymentMethods.map(method => ({
    method,
    count: donations.filter(d => d.paymentMethod === method).length,
    amount: donations.filter(d => d.paymentMethod === method).reduce((sum, d) => sum + (d.amount || 0), 0)
  }));

  // Top campaigns by donations
  const campaignStats = campaigns.map(campaign => {
    const campaignDonations = donations.filter(d => d.campaignId === campaign.id);
    const campaignVolunteers = volunteers.filter(v => v.campaignId === campaign.id);
    return {
      ...campaign,
      donationCount: campaignDonations.length,
      donationAmount: campaignDonations.reduce((sum, d) => sum + (d.amount || 0), 0),
      volunteerCount: campaignVolunteers.length
    };
  }).sort((a, b) => b.donationAmount - a.donationAmount);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-xl text-gray-600">Payment & Donation Management</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSelectedView('overview')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                selectedView === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-5 h-5 inline-block mr-2" />
              Overview & Statistics
            </button>
            <button
              onClick={() => setSelectedView('transactions')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                selectedView === 'transactions'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <CreditCard className="w-5 h-5 inline-block mr-2" />
              Transactions
            </button>
            <button
              onClick={() => setSelectedView('campaigns')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                selectedView === 'campaigns'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-5 h-5 inline-block mr-2" />
              Campaign Performance
            </button>
            <button
              onClick={() => setSelectedView('marketplace')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                selectedView === 'marketplace'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <ShoppingCart className="w-5 h-5 inline-block mr-2" />
              Marketplace
            </button>
            <button
              onClick={() => setSelectedView('purchases')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                selectedView === 'purchases'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <Package className="w-5 h-5 inline-block mr-2" />
              My Purchases
            </button>
          </div>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Donations</p>
                <p className="text-3xl font-bold text-gray-900">₹{totalDonations.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Transactions</p>
                <p className="text-3xl font-bold text-gray-900">{donations.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Unique Donors</p>
                <p className="text-3xl font-bold text-gray-900">{uniqueDonors}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Donation</p>
                <p className="text-3xl font-bold text-gray-900">₹{avgDonation.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <PieChart className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Volunteers</p>
                <p className="text-3xl font-bold text-gray-900">{volunteers.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Overview Statistics */}
        {selectedView === 'overview' && (
          <>
            {/* Payment Method Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Payment Method Distribution</h3>
                <div className="space-y-4">
                  {paymentBreakdown.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-700">{item.method?.toUpperCase() || 'Unknown'}</span>
                        <span className="text-sm text-gray-600">{item.count} transactions</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${(item.amount / totalDonations) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-gray-600">₹{item.amount.toLocaleString()}</span>
                        <span className="text-sm font-semibold text-blue-600">
                          {((item.amount / totalDonations) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {donations.slice(0, 5).map((donation, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{donation.userName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(donation.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${donation.amount}</p>
                        <p className="text-xs text-gray-500">{donation.paymentMethod}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Campaigns */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">Top Performing Campaigns</h3>
              <div className="space-y-4">
                {campaignStats.slice(0, 5).map((campaign, index) => (
                  <div key={campaign.id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                          #{index + 1}
                        </span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{campaign.title}</h4>
                          <p className="text-sm text-gray-500">{campaign.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{campaign.donationAmount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{campaign.donationCount} donations</p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-600">
                        <Users className="w-4 h-4 inline mr-1" />
                        {campaign.volunteerCount} volunteers
                      </span>
                      <span className="text-gray-600">
                        Goal: ₹{campaign.goal.toLocaleString()}
                      </span>
                      <span className="text-blue-600 font-semibold">
                        {Math.round((campaign.raised / campaign.goal) * 100)}% achieved
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Transactions View */}
        {selectedView === 'transactions' && (
          <>
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by Transaction ID or Donor Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Payment Methods</option>
              {paymentMethods.map(method => (
                <option key={method} value={method}>
                  {method?.toUpperCase() || 'Unknown'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Donations Table */}
        {/* Donations Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Payment Transactions</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDonations.length > 0 ? (
                  filteredDonations.map((donation, index) => (
                    <tr key={donation.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {donation.transactionId || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{donation.userName || 'Anonymous'}</div>
                        <div className="text-sm text-gray-500">ID: {donation.userId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">
                          ${donation.amount?.toLocaleString() || '0'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {donation.paymentMethod?.toUpperCase() || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(donation.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {donation.paymentStatus || 'COMPLETED'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}

        {/* Campaign Performance View */}
        {selectedView === 'campaigns' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Campaign Performance Analysis</h2>
            <div className="space-y-6">
              {campaignStats.map((campaign) => (
                <div key={campaign.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{campaign.title}</h3>
                      <p className="text-gray-600 mt-1">{campaign.description?.substring(0, 100)}...</p>
                      <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                        {campaign.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-semibold">{new Date(campaign.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Raised</p>
                      <p className="text-2xl font-bold text-green-600">₹{campaign.donationAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Donations</p>
                      <p className="text-2xl font-bold text-blue-600">{campaign.donationCount}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Volunteers</p>
                      <p className="text-2xl font-bold text-purple-600">{campaign.volunteerCount}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Goal Progress</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {Math.round((campaign.raised / campaign.goal) * 100)}%
                      </p>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress to Goal</span>
                      <span className="font-semibold">
                        ₹{campaign.raised?.toLocaleString() || 0} / ₹{campaign.goal.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Marketplace View */}
        {selectedView === 'marketplace' && (
          <MarketplaceView />
        )}

        {/* My Purchases View */}
        {selectedView === 'purchases' && (
          <MyPurchasesView />
        )}

        {/* Export Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => alert('Export feature coming soon!')}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            <Download className="w-5 h-5 mr-2" />
            Export to CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
