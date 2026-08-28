const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");

const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");
const CodeSubmission = require("../models/CodeSubmission");

// ==========================================
// REALISTIC DEMO CODE ARTIFACTS
// ==========================================

const FRONTEND_CODE = `import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * ProductList Component
 * Displays product catalog with real-time search, category filtering,
 * price/rating sorting, pagination, and a detailed quick-view modal.
 */
export default function ProductList({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Quick-view Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Available product categories
  const categories = ['All', 'Electronics', 'Clothing', 'Home & Kitchen', 'Beauty', 'Books'];

  // Fetch product catalog from API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // NOTE: Direct fetch without central config or request cancellation
      const response = await fetch('http://localhost:5000/api/products');
      if (!response.ok) {
        throw new Error('Failed to load products from server (' + response.status + ')');
      }
      const data = await response.json();
      // Potential runtime issue: assuming data.products exists without fallback
      setProducts(data.products);
    } catch (err) {
      console.error('Fetch products error:', err);
      setError(err.message || 'Unable to load products. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    // Missing cleanup function / AbortController for in-flight requests
  }, [fetchProducts]);

  // Filter and sort product data
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
      );
    }

    // Sorting Logic
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenDetail = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const handleAddToCartSubmit = () => {
    if (selectedProduct && onAddToCart) {
      onAddToCart({
        ...selectedProduct,
        quantity: Number(quantity) || 1,
      });
      setSelectedProduct(null);
    }
  };

  return (
    <div className="product-list-container max-w-7xl mx-auto px-4 py-8">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shop Products</h1>
          <p className="text-sm text-gray-500">Discover premium items curated for your lifestyle</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search products by title or keyword..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-72 px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Category Pills & Sorting Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={'px-3 py-1.5 text-xs font-medium rounded-full transition ' + (selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300')}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <label className="text-gray-500">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* State Renderers: Loading / Error / Empty / Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-12">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-red-50 dark:bg-red-950/30 rounded-xl p-8">
          <p className="text-red-600 font-semibold mb-2">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500"
          >
            Try Again
          </button>
        </div>
      ) : paginatedProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm">No products found matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedProducts.map((product) => (
            <div
              key={product._id || product.id}
              onClick={() => handleOpenDetail(product)}
              className="product-card group cursor-pointer border rounded-2xl p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden mb-4 relative">
                <img
                  src={product.imageUrl || '/placeholder.png'}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                {product.stock <= 3 && product.stock > 0 && (
                  <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Only {product.stock} left!
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                  {product.category}
                </span>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mt-1 line-clamp-1">
                  {product.title}
                </h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {'$' + Number(product.price).toFixed(2)}
                  </span>
                  <span className="text-xs text-amber-500 font-semibold">
                    {'★ ' + (product.rating || '4.5')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-xs font-semibold border rounded-lg disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-xs font-semibold border rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {selectedProduct.title}
              </h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {selectedProduct.description || 'Premium quality product manufactured with precision.'}
            </p>

            <div className="flex items-center justify-between pt-2">
              <span className="text-2xl font-black text-indigo-600">
                {'$' + Number(selectedProduct.price).toFixed(2)}
              </span>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Qty:</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct.stock || 10}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-16 px-2 py-1 text-sm border rounded-lg text-center"
                />
              </div>
            </div>

            <button
              onClick={handleAddToCartSubmit}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/30"
            >
              Add to Shopping Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

ProductList.propTypes = {
  onAddToCart: PropTypes.func,
};
`;

const BACKEND_CODE = `const mongoose = require('mongoose');

// Simulated Mongoose Schema for standalone controller reference
const Product = mongoose.models.Product || mongoose.model('ProductModel', new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  imageUrl: { type: String },
}, { timestamps: true }));

const Order = mongoose.models.Order || mongoose.model('OrderModel', new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductModel' },
    quantity: { type: Number, default: 1 },
    priceAtPurchase: { type: Number },
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  shippingAddress: { type: String, required: true },
}, { timestamps: true }));

/**
 * GET /api/products
 * Retrieves products with search query, category filter, sorting, and pagination.
 */
const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

    const filter = {};

    // Category filter
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Vulnerability note: Unescaped regex can lead to ReDoS vulnerabilities with malformed input
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    // Price range filters
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sorting definition
    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      products,
    });
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching product catalog' });
  }
};

/**
 * GET /api/products/:id
 * Retrieves a single product by its ObjectId.
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Issue: Missing mongoose.Types.ObjectId.isValid(id) check will throw uncaught CastError
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('getProductById error:', error);
    // Inconsistent error response: exposes internal error details directly
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/products
 * Creates a new product item in the database.
 */
const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock, imageUrl } = req.body;

    // Basic validation
    if (!title || price === undefined || !category) {
      return res.status(400).json({ success: false, message: 'Title, price, and category are required' });
    }

    // Issue: Missing role verification check (e.g. req.user.role === 'Admin')
    const newProduct = await Product.create({
      title,
      description,
      price: Number(price),
      category,
      stock: Number(stock) || 0,
      imageUrl: imageUrl || '',
    });

    res.status(201).json({ success: true, message: 'Product created successfully', product: newProduct });
  } catch (error) {
    console.error('createProduct error:', error);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

/**
 * POST /api/orders
 * Creates an order, calculates total, and updates inventory stock.
 */
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    if (!shippingAddress || typeof shippingAddress !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid shipping address is required' });
    }

    let calculatedTotal = 0;
    const verifiedItems = [];

    // Issue: Sequential database queries in loop instead of batch query or transaction
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product ID ' + item.productId + ' not found' });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock for product ' + product.title + ' (Requested: ' + item.quantity + ', Available: ' + product.stock + ')',
        });
      }

      const itemSubtotal = product.price * item.quantity;
      calculatedTotal += itemSubtotal;

      // Decrement stock without database transaction (race condition vulnerability)
      product.stock -= item.quantity;
      await product.save();

      verifiedItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });
    }

    const order = await Order.create({
      customer: req.user ? req.user._id : null,
      items: verifiedItems,
      totalAmount: calculatedTotal,
      shippingAddress,
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId: order._id,
      totalAmount: calculatedTotal,
    });
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
};

/**
 * GET /api/orders/:id
 * Retrieves order status and purchased items.
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('items.product').populate('customer', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('getOrderById error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve order' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  createOrder,
  getOrderById,
};
`;

const UI_UX_CODE = `import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * ShoppingCart Component
 * Provides responsive cart drawer / page with quantity adjustments,
 * subtotal calculations, promo code discounts, and checkout initiation.
 */
export default function ShoppingCart({ cartItems = [], onUpdateQuantity, onRemoveItem, onProceedToCheckout }) {
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');

  // Calculate cart subtotal
  // Issue: Direct arithmetic on floating point prices without rounding / epsilon handling
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (Number(item.price) || 0) * (Number(item.quantity) || 1);
  }, 0);

  const discountAmount = (subtotal * discountPercent) / 100;
  const estimatedTax = (subtotal - discountAmount) * 0.08; // 8% sales tax
  const shippingFee = subtotal > 50 || subtotal === 0 ? 0 : 9.99;
  const orderTotal = subtotal - discountAmount + estimatedTax + shippingFee;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    if (promoCode.trim().toUpperCase() === 'DEVFLOW10') {
      setDiscountPercent(10);
    } else if (promoCode.trim().toUpperCase() === 'SUMMER20') {
      setDiscountPercent(20);
    } else {
      setPromoError('Invalid promotional code. Try DEVFLOW10');
      setDiscountPercent(0);
    }
  };

  const handleQuantityChange = (itemId, newQty) => {
    // Maintainability issue: loose validation on negative / zero inputs
    if (onUpdateQuantity) {
      onUpdateQuantity(itemId, parseInt(newQty, 10));
    }
  };

  return (
    <div className="shopping-cart-view max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Shopping Cart</h1>
        <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-3 py-1 rounded-full">
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart-state text-center py-20 bg-gray-50 dark:bg-gray-800/40 rounded-3xl p-8 border border-dashed">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            🛒
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Your cart is currently empty</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Looks like you haven't added anything to your cart yet. Explore our product catalog to discover deals!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => {
              const itemTotal = ((item.price || 0) * (item.quantity || 1)).toFixed(2);
              return (
                <div
                  key={item._id || item.id}
                  className="cart-item-row flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border bg-white dark:bg-gray-800 shadow-sm"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={item.imageUrl || '/placeholder.png'}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-xl bg-gray-100 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-indigo-600 font-semibold mt-0.5">{'$' + Number(item.price).toFixed(2)} each</p>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6">
                    <div className="flex items-center border rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-700">
                      <button
                        onClick={() => handleQuantityChange(item._id || item.id, item.quantity - 1)}
                        className="px-3 py-1 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                        title="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-gray-900 dark:text-white min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item._id || item.id, item.quantity + 1)}
                        className="px-3 py-1 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-sm font-black text-gray-900 dark:text-white">{'$' + itemTotal}</span>

                    <button
                      onClick={() => onRemoveItem && onRemoveItem(item._id || item.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold p-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Box */}
          <div className="lg:col-span-4">
            <div className="summary-card border rounded-3xl p-6 bg-gray-50 dark:bg-gray-800/80 shadow-md space-y-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-white border-b pb-3">Order Summary</h3>

              <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{'$' + subtotal.toFixed(2)}</span>
                </div>

                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({discountPercent}%):</span>
                    <span>{'-$' + discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Tax (8%):</span>
                  <span>{'$' + estimatedTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{shippingFee === 0 ? 'FREE' : '$' + shippingFee.toFixed(2)}</span>
                </div>

                <div className="border-t pt-3 flex justify-between text-sm font-black text-gray-900 dark:text-white">
                  <span>Total Amount:</span>
                  <span className="text-indigo-600">{'$' + orderTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code (e.g. DEVFLOW10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border rounded-xl bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-900 text-white dark:bg-gray-600 text-xs font-bold rounded-xl"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-[11px] text-red-500 mt-1.5">{promoError}</p>}
              </form>

              <button
                onClick={() => onProceedToCheckout && onProceedToCheckout({ cartItems, orderTotal })}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-600/30 hover:opacity-95 transition"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ShoppingCart.propTypes = {
  cartItems: PropTypes.array,
  onUpdateQuantity: PropTypes.func,
  onRemoveItem: PropTypes.func,
  onProceedToCheckout: PropTypes.func,
};
`;

const QA_TEST_CODE = `const request = require('supertest');
const express = require('express');

// Mock Express app for testing e-commerce endpoints
const app = express();
app.use(express.json());

// Simulated route handlers for verification suite
app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  const mockProducts = [
    { id: '1', title: 'Wireless Headphones', price: 99.99, category: 'Electronics', stock: 15 },
    { id: '2', title: 'Ergonomic Desk Chair', price: 199.50, category: 'Home & Kitchen', stock: 4 },
    { id: '3', title: 'Running Shoes', price: 79.00, category: 'Clothing', stock: 0 },
  ];

  let filtered = mockProducts;
  if (category && category !== 'All') {
    filtered = filtered.filter(p => p.category === category);
  }
  if (search) {
    filtered = filtered.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
  }

  res.status(200).json({ success: true, count: filtered.length, products: filtered });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  if (id === '999') {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.status(200).json({ success: true, product: { id, title: 'Sample Product', price: 49.99 } });
});

app.post('/api/orders', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Authentication token required' });
  }

  const { items, shippingAddress } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
  }
  if (!shippingAddress) {
    return res.status(400).json({ success: false, message: 'Shipping address is required' });
  }

  res.status(201).json({
    success: true,
    orderId: 'ord_987654321',
    message: 'Order created successfully',
  });
});

describe('E-Commerce Platform API & Workflow Verification Suite', () => {
  // Test Suite 1: Product Catalog & Search Workflows
  describe('GET /api/products', () => {
    it('should retrieve all products with HTTP 200 and return a valid list', async () => {
      const response = await request(app).get('/api/products');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.count).toBe(3);
    });

    it('should filter products correctly when category query is provided', async () => {
      const response = await request(app).get('/api/products?category=Electronics');
      expect(response.status).toBe(200);
      expect(response.body.products.length).toBe(1);
      expect(response.body.products[0].category).toBe('Electronics');
    });

    it('should search products by title query', async () => {
      const response = await request(app).get('/api/products?search=Headphones');
      // Issue: Weak assertion - checks status but misses payload property verification
      expect(response.status).toBe(200);
    });
  });

  // Test Suite 2: Product Details
  describe('GET /api/products/:id', () => {
    it('should return 200 and product object for valid existing ID', async () => {
      const response = await request(app).get('/api/products/1');
      expect(response.status).toBe(200);
      expect(response.body.product).toBeDefined();
      expect(response.body.product.id).toBe('1');
    });

    it('should return 404 when product ID does not exist', async () => {
      const response = await request(app).get('/api/products/999');
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  // Test Suite 3: Order Creation & Checkout Workflows
  describe('POST /api/orders', () => {
    it('should successfully create an order when payload and auth header are valid', async () => {
      const payload = {
        items: [{ productId: '1', quantity: 2 }],
        shippingAddress: '123 Innovation Way, Tech City, CA 94016',
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer mock_jwt_token_12345')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.orderId).toBeDefined();
    });

    it('should return 401 Unauthorized when Authorization header is missing', async () => {
      const payload = {
        items: [{ productId: '1', quantity: 1 }],
        shippingAddress: '123 Innovation Way',
      };

      const response = await request(app).post('/api/orders').send(payload);
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 Bad Request when cart items array is empty', async () => {
      const payload = {
        items: [],
        shippingAddress: '123 Innovation Way',
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer mock_jwt_token_12345')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Cart items cannot be empty');
    });

    it('should return 400 Bad Request when shipping address is missing', async () => {
      const payload = {
        items: [{ productId: '1', quantity: 1 }],
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer mock_jwt_token_12345')
        .send(payload);

      expect(response.status).toBe(400);
    });
  });
});
`;

// ==========================================
// SEED RUNNER FUNCTION
// ==========================================

async function seedEcommerceDemo() {
  console.log("==================================================");
  console.log("DEVFLOW AI - E-COMMERCE DEMO DATA SEEDER");
  console.log("==================================================");

  // 1. Connect to MongoDB
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is missing in server/.env");
  }

  await mongoose.connect(mongoUri);
  console.log("✓ Connected to MongoDB Atlas");

  // 2. Identify Existing Manager & Developer Accounts
  const managerUser = await User.findOne({ role: "Project Manager" }).sort({ createdAt: 1 });
  const frontendDev = await User.findOne({ role: "Frontend Developer" }).sort({ createdAt: 1 });
  const backendDev = await User.findOne({ role: "Backend Developer" }).sort({ createdAt: 1 });
  const uiuxDev = await User.findOne({ role: "UI/UX Designer" }).sort({ createdAt: 1 });
  const qaTester = await User.findOne({ role: "QA Tester" }).sort({ createdAt: 1 });

  if (!managerUser) throw new Error("No Project Manager user found in database");
  if (!frontendDev) throw new Error("No Frontend Developer user found in database");
  if (!backendDev) throw new Error("No Backend Developer user found in database");
  if (!uiuxDev) throw new Error("No UI/UX Designer user found in database");
  if (!qaTester) throw new Error("No QA Tester user found in database");

  console.log("\n--- IDENTIFIED EXISTING USERS ---");
  console.log(`• Project Manager   : ${managerUser.name} (${managerUser.email}) [ID: ${managerUser._id}]`);
  console.log(`• Frontend Developer: ${frontendDev.name} (${frontendDev.email}) [ID: ${frontendDev._id}]`);
  console.log(`• Backend Developer : ${backendDev.name} (${backendDev.email}) [ID: ${backendDev._id}]`);
  console.log(`• UI/UX Designer    : ${uiuxDev.name} (${uiuxDev.email}) [ID: ${uiuxDev._id}]`);
  console.log(`• QA Tester         : ${qaTester.name} (${qaTester.email}) [ID: ${qaTester._id}]`);

  // 3. Find or Create Demo Project: E-Commerce Platform
  const projectName = "E-Commerce Platform";
  let project = await Project.findOne({ name: projectName });

  if (!project) {
    const memberIds = [frontendDev._id, backendDev._id, uiuxDev._id, qaTester._id];
    project = await Project.create({
      name: projectName,
      description:
        "A full-stack e-commerce platform where customers can browse products, search and filter products, manage a shopping cart, place orders, and track order status.",
      manager: managerUser._id,
      members: memberIds,
      status: "Active",
      technologyStack: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
    console.log(`\n✓ Created new project: "${project.name}" [ID: ${project._id}]`);
  } else {
    // Ensure all 4 developers are members
    const memberSet = new Set(project.members.map((m) => m.toString()));
    [frontendDev._id, backendDev._id, uiuxDev._id, qaTester._id].forEach((id) => {
      memberSet.add(id.toString());
    });
    project.members = Array.from(memberSet);
    project.status = "Active";
    await project.save();
    console.log(`\n✓ Found existing project: "${project.name}" [ID: ${project._id}]`);
  }

  // 4. Find or Create Assigned Tasks
  console.log("\n--- ASSIGNING REALISTIC DEMO TASKS ---");
  const taskDefinitions = [
    {
      title: "Build Product Listing and Product Details Interface",
      description:
        "Create the React product listing page with product cards, search, category filtering, sorting, pagination, and a product details page.",
      assignedTo: frontendDev._id,
      assignedBy: managerUser._id,
      priority: "High",
      status: "In Progress",
    },
    {
      title: "Build Product and Order REST APIs",
      description:
        "Implement REST APIs for products, product search, cart operations, order creation, order retrieval, and order status updates.",
      assignedTo: backendDev._id,
      assignedBy: managerUser._id,
      priority: "High",
      status: "In Progress",
    },
    {
      title: "Design E-Commerce Shopping Experience",
      description:
        "Create responsive layouts for product listing, product details, shopping cart, checkout, and order tracking.",
      assignedTo: uiuxDev._id,
      assignedBy: managerUser._id,
      priority: "Medium",
      status: "In Progress",
    },
    {
      title: "Test Product, Cart, and Order Workflows",
      description:
        "Create test scenarios covering product browsing, search, cart operations, checkout, order creation, invalid input, authentication and order tracking.",
      assignedTo: qaTester._id,
      assignedBy: managerUser._id,
      priority: "High",
      status: "In Progress",
    },
  ];

  const seededTasks = [];
  for (const tDef of taskDefinitions) {
    let task = await Task.findOne({
      project: project._id,
      title: tDef.title,
      assignedTo: tDef.assignedTo,
    });

    if (!task) {
      task = await Task.create({
        title: tDef.title,
        description: tDef.description,
        project: project._id,
        assignedTo: tDef.assignedTo,
        assignedBy: tDef.assignedBy,
        priority: tDef.priority,
        status: tDef.status,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      });
      console.log(`✓ Created Task: "${task.title}" -> Assigned to: ${tDef.assignedTo}`);
    } else {
      console.log(`✓ Existing Task confirmed: "${task.title}" [ID: ${task._id}]`);
    }
    seededTasks.push(task);
  }

  // 5. Find or Create Realistic Code Submissions
  console.log("\n--- CREATING REALISTIC CODE SUBMISSIONS ---");
  const submissionDefinitions = [
    {
      developer: frontendDev._id,
      project: project._id,
      fileName: "ProductList.jsx",
      language: "javascript",
      code: FRONTEND_CODE.trim(),
    },
    {
      developer: backendDev._id,
      project: project._id,
      fileName: "productController.js",
      language: "javascript",
      code: BACKEND_CODE.trim(),
    },
    {
      developer: uiuxDev._id,
      project: project._id,
      fileName: "ShoppingCart.jsx",
      language: "javascript",
      code: UI_UX_CODE.trim(),
    },
    {
      developer: qaTester._id,
      project: project._id,
      fileName: "ecommerce.test.js",
      language: "javascript",
      code: QA_TEST_CODE.trim(),
    },
  ];

  const seededSubmissions = [];
  for (const sDef of submissionDefinitions) {
    let submission = await CodeSubmission.findOne({
      project: sDef.project,
      developer: sDef.developer,
      fileName: sDef.fileName,
    });

    if (!submission) {
      // NOTE: Following Rule 11, leave AI analysis fields in default initial state
      // so real DevFlow Gemini analysis can execute during demo.
      submission = await CodeSubmission.create({
        developer: sDef.developer,
        project: sDef.project,
        fileName: sDef.fileName,
        language: sDef.language,
        code: sDef.code,
        summary: "",
        errors: [],
        warnings: [],
        suggestions: [],
        qualityScore: 0,
        aiAnalysis: "",
      });
      console.log(`✓ Created Code Submission: ${sDef.fileName} (${sDef.code.split('\\n').length} lines) [ID: ${submission._id}]`);
    } else {
      // Update code if necessary to ensure substantial contents
      submission.code = sDef.code;
      await submission.save();
      console.log(`✓ Updated existing Code Submission: ${sDef.fileName} [ID: ${submission._id}]`);
    }
    seededSubmissions.push(submission);
  }

  console.log("\n==================================================");
  console.log("DEMO SEEDING COMPLETED SUCCESSFULLY! 🎉");
  console.log("==================================================");
  console.log(`• Project: "${project.name}" (ID: ${project._id})`);
  console.log(`• Total Assigned Tasks: ${seededTasks.length}`);
  console.log(`• Total Code Submissions: ${seededSubmissions.length}`);
  console.log("• Ready for Gemini AI Code Analysis & Manager Overall Project Analysis demonstration!");
  console.log("==================================================\n");

  await mongoose.disconnect();
}

if (require.main === module) {
  seedEcommerceDemo().catch((err) => {
    console.error("Seed Script Error:", err);
    process.exit(1);
  });
}

module.exports = seedEcommerceDemo;
