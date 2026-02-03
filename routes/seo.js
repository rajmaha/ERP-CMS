const express = require('express');
const router = express.Router();
const Page = require('../models/Page');
const Product = require('../models/Product');
const Portfolio = require('../models/Portfolio');
const asyncHandler = require('../middleware/asyncHandler');

// @route   GET /api/seo/sitemap
// @desc    Generate sitemap
// @access  Public
router.get('/sitemap', asyncHandler(async (req, res) => {
  const pages = await Page.find({ isPublished: true }).select('slug updatedAt');
  const products = await Product.find({ isActive: true }).select('slug updatedAt');
  const portfolio = await Portfolio.find({ isActive: true }).select('slug updatedAt');

  const sitemap = {
    pages: pages.map(p => ({
      url: `/pages/${p.slug}`,
      lastmod: p.updatedAt
    })),
    products: products.map(p => ({
      url: `/products/${p.slug}`,
      lastmod: p.updatedAt
    })),
    portfolio: portfolio.map(p => ({
      url: `/portfolio/${p.slug}`,
      lastmod: p.updatedAt
    }))
  };

  res.json({ success: true, data: sitemap });
}));

// @route   GET /api/seo/robots
// @desc    Generate robots.txt
// @access  Public
router.get('/robots', (req, res) => {
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${process.env.SITE_URL}/sitemap.xml`;

  res.type('text/plain');
  res.send(robotsTxt);
});

module.exports = router;
