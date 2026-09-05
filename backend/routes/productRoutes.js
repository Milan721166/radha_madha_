const express = require('express');
const router = express.Router();
const { dbAsync } = require('../db/database');

// GET products with search, filtering, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      subcategory,
      minPrice,
      maxPrice,
      size,
      color,
      rating,
      sort,
      page = 1,
      limit = 12,
      featured,
      bestseller,
      newArrival
    } = req.query;

    let whereClause = ["p.status = 'published'"];
    let params = [];

    if (search) {
      whereClause.push("(p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ? OR p.short_desc LIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (category) {
      if (isNaN(category)) {
        whereClause.push("c.slug = ?");
        params.push(category);
      } else {
        whereClause.push("p.category_id = ?");
        params.push(category);
      }
    }

    if (subcategory) {
      whereClause.push("p.subcategory_id = ?");
      params.push(subcategory);
    }

    if (minPrice) {
      whereClause.push("COALESCE(p.sale_price, p.price) >= ?");
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      whereClause.push("COALESCE(p.sale_price, p.price) <= ?");
      params.push(parseFloat(maxPrice));
    }

    if (rating) {
      whereClause.push("p.rating_avg >= ?");
      params.push(parseFloat(rating));
    }

    if (featured === 'true' || featured === '1') {
      whereClause.push("p.is_featured = 1");
    }

    if (bestseller === 'true' || bestseller === '1') {
      whereClause.push("p.is_bestseller = 1");
    }

    if (newArrival === 'true' || newArrival === '1') {
      whereClause.push("p.is_new_arrival = 1");
    }

    // Size / Color variant filtering join constraint
    let variantJoin = '';
    if (size || color) {
      variantJoin = 'INNER JOIN product_variants pv ON p.id = pv.product_id';
      if (size) {
        whereClause.push("pv.size = ?");
        params.push(size);
      }
      if (color) {
        whereClause.push("pv.color = ?");
        params.push(color);
      }
    }

    // Sorting
    let orderBy = 'p.id DESC';
    if (sort === 'price-low') {
      orderBy = 'COALESCE(p.sale_price, p.price) ASC';
    } else if (sort === 'price-high') {
      orderBy = 'COALESCE(p.sale_price, p.price) DESC';
    } else if (sort === 'popular') {
      orderBy = 'p.reviews_count DESC';
    } else if (sort === 'rating') {
      orderBy = 'p.rating_avg DESC';
    } else if (sort === 'latest') {
      orderBy = 'p.created_at DESC';
    }

    const whereString = whereClause.length ? 'WHERE ' + whereClause.join(' AND ') : '';

    // Count Total
    const countSql = `
      SELECT COUNT(DISTINCT p.id) as total 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      ${variantJoin}
      ${whereString}
    `;
    const countResult = await dbAsync.get(countSql, params);
    const total = countResult ? countResult.total : 0;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const dataSql = `
      SELECT DISTINCT p.*, c.name as category_name, c.slug as category_slug
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      ${variantJoin}
      ${whereString}
      ORDER BY ${orderBy}
      LIMIT ${limitNum} OFFSET ${offset}
    `;

    const products = await dbAsync.all(dataSql, params);

    // Fetch primary images and variants for each product
    for (let p of products) {
      p.images = await dbAsync.all('SELECT image_url, is_primary FROM product_images WHERE product_id = ? ORDER BY display_order ASC', [p.id]);
      p.variants = await dbAsync.all('SELECT * FROM product_variants WHERE product_id = ?', [p.id]);
    }

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      products
    });
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// Autosuggest for search bar
router.get('/autosuggest', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const term = `%${q}%`;
    const products = await dbAsync.all(`
      SELECT p.id, p.name, p.slug, p.price, p.sale_price, pi.image_url
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      WHERE p.name LIKE ? OR p.short_desc LIKE ? OR p.sku LIKE ?
      LIMIT 6
    `, [term, term, term]);

    const categories = await dbAsync.all(`
      SELECT id, name, slug FROM categories WHERE name LIKE ? LIMIT 3
    `, [term]);

    res.json({
      success: true,
      suggestions: {
        products,
        categories
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Autosuggest error' });
  }
});

// GET Single Product details by Slug or ID
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    let product;

    if (!isNaN(identifier)) {
      product = await dbAsync.get('SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?', [identifier]);
    } else {
      product = await dbAsync.get('SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ?', [identifier]);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const images = await dbAsync.all('SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC', [product.id]);
    const variants = await dbAsync.all('SELECT * FROM product_variants WHERE product_id = ?', [product.id]);
    const reviews = await dbAsync.all('SELECT * FROM reviews WHERE product_id = ? AND status = "approved" ORDER BY created_at DESC', [product.id]);

    // Related Products from same category
    const relatedProducts = await dbAsync.all(`
      SELECT p.*, pi.image_url 
      FROM products p 
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      WHERE p.category_id = ? AND p.id != ? AND p.status = 'published'
      LIMIT 4
    `, [product.category_id, product.id]);

    res.json({
      success: true,
      product: {
        ...product,
        images,
        variants,
        reviews,
        relatedProducts
      }
    });
  } catch (err) {
    console.error('Fetch product detail error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch product details' });
  }
});

module.exports = router;
