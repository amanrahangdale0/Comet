const express = require('express');
const router = express.Router();

// Product database (in a real app, this would be from a database)
const products = [
  {
    id: 1,
    title: "X Lows SNOW",
    price: 5000,
    description: "Premium quality sneakers with excellent comfort and style. Perfect for everyday wear.",
    colors: [
      { code: "gray", img: "./img/air.png" },
      { code: "black", img: "./img/air2.png" }
    ],
    sizes: [42, 43, 44],
    category: "sneakers",
    inStock: true
  },
  {
    id: 2,
    title: "Alter ROGUE",
    price: 6200,
    description: "Bold and modern design that makes a statement. Built for performance and style.",
    colors: [
      { code: "black", img: "./img/jordan.png" },
      { code: "#fff5d7", img: "./img/jordan2.png" }
    ],
    sizes: [42, 43, 44],
    category: "sneakers",
    inStock: true
  },
  {
    id: 3,
    title: "Alter GLACIER",
    price: 4500,
    description: "Cool and comfortable footwear designed for all-day wear. Lightweight and breathable.",
    colors: [
      { code: "white", img: "./img/blazer.png" },
      { code: "black", img: "./img/blazer2.png" }
    ],
    sizes: [42, 43, 44],
    category: "sneakers",
    inStock: true
  },
  {
    id: 4,
    title: "Aeon v2 SIERRA",
    price: 5400,
    description: "Latest version with improved cushioning and support. Your feet will thank you.",
    colors: [
      { code: "yellow", img: "./img/crater.png" },
      { code: "peachpuff", img: "./img/crater2.png" }
    ],
    sizes: [42, 43, 44],
    category: "sneakers",
    inStock: true
  },
  {
    id: 5,
    title: "X Lows TWISTER",
    price: 3999,
    description: "Affordable style without compromise. Great for casual outings and everyday comfort.",
    colors: [
      { code: "peachpuff", img: "./img/hippie.png" },
      { code: "blue", img: "./img/hippie2.png" }
    ],
    sizes: [42, 43, 44],
    category: "sneakers",
    inStock: true
  }
];

// GET all products
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// GET single product by ID
router.get('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

module.exports = router;
