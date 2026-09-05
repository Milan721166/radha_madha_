const bcrypt = require('bcryptjs');
const { dbAsync, initDatabase } = require('./database');

async function seedData() {
  console.log('Initializing MySQL database tables...');
  await initDatabase();

  console.log('Seeding initial data for Radhamav Fashions...');

  // 1. Seed Users (Admin & Customer)
  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  await dbAsync.run(`
    INSERT INTO users (id, name, email, password_hash, phone, role, status)
    VALUES 
    (1, 'Radhamav Admin', 'admin@radhamav.com', ?, '+91 9876543210', 'admin', 'active'),
    (2, 'Ananya Sharma', 'customer@radhamav.com', ?, '+91 9876543211', 'customer', 'active')
    ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash);
  `, [adminPassword, customerPassword]);

  // 2. Seed Categories
  const categories = [
    { id: 1, name: 'Sarees', slug: 'sarees', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80', display_order: 1 },
    { id: 2, name: 'Kurtis', slug: 'kurtis', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=600&q=80', display_order: 2 },
    { id: 3, name: 'Designer Dresses', slug: 'designer-dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80', display_order: 3 },
    { id: 4, name: 'Salwar Suits', slug: 'salwar-suits', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80', display_order: 4 },
    { id: 5, name: 'Lehengas', slug: 'lehengas', image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80', display_order: 5 },
    { id: 6, name: 'Tops & Tunics', slug: 'tops-tunics', image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=600&q=80', display_order: 6 },
    { id: 7, name: 'Men Fashion', slug: 'mens-fashion', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80', display_order: 7 },
    { id: 8, name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80', display_order: 8 }
  ];

  for (const cat of categories) {
    await dbAsync.run(`
      INSERT INTO categories (id, name, slug, image, display_order, status)
      VALUES (?, ?, ?, ?, ?, 'active')
      ON DUPLICATE KEY UPDATE name=VALUES(name), image=VALUES(image);
    `, [cat.id, cat.name, cat.slug, cat.image, cat.display_order]);
  }

  // 3. Seed Products
  const products = [
    {
      id: 1,
      name: 'Kanjeevaram Royal Silk Saree - Ruby Red',
      slug: 'kanjeevaram-royal-silk-saree-ruby-red',
      sku: 'SAR-KAN-001',
      category_id: 1,
      short_desc: 'Handwoven Pure Silk Kanjeevaram Saree with Golden Zari Motif and Contrast Pallu.',
      description: 'Embrace royal elegance with this magnificent Ruby Red Kanjeevaram Saree from Radhamav Fashions. Crafted by master artisans from pure mulberry silk, featuring ornate temple zari borders and intricate floral jaal weaving. Comes with an unstitched matching blouse piece.',
      price: 12999,
      sale_price: 9499,
      cost_price: 6000,
      stock: 25,
      material: '100% Pure Silk',
      fabric: 'Handloom Kanjeevaram Silk with Real Zari',
      care_instructions: 'Dry Clean Only. Store in a cotton muslin bag away from direct sunlight.',
      is_featured: 1,
      is_bestseller: 1,
      is_new_arrival: 1,
      rating_avg: 4.9,
      reviews_count: 18,
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
      ],
      variants: [
        { size: 'Free Size', color: 'Ruby Red', hex_code: '#900C3F', price: 12999, sale_price: 9499, stock: 15, sku: 'SAR-KAN-001-RED' },
        { size: 'Free Size', color: 'Emerald Green', hex_code: '#004B23', price: 12999, sale_price: 9499, stock: 10, sku: 'SAR-KAN-001-GRN' }
      ]
    },
    {
      id: 2,
      name: 'Anarkali Chanderi Kurti Set with Dupatta',
      slug: 'anarkali-chanderi-kurti-set-dupatta',
      sku: 'KUR-ANK-002',
      category_id: 2,
      short_desc: 'Flowy Chanderi Silk Anarkali Kurti with Embroidery and Organza Dupatta.',
      description: 'Turn heads at celebrations with this majestic Anarkali Kurti set. Adorned with delicate Resham embroidery on the neckline, full-length flared silhouette, paired with matching pants and a sheer organza dupatta with scalloped borders.',
      price: 4999,
      sale_price: 3499,
      cost_price: 1800,
      stock: 40,
      material: 'Chanderi Silk Blend',
      fabric: 'Breathable Chanderi with Cotton Lining',
      care_instructions: 'Gentle hand wash or dry clean. Low iron on reverse side.',
      is_featured: 1,
      is_bestseller: 1,
      is_new_arrival: 1,
      rating_avg: 4.8,
      reviews_count: 24,
      images: [
        'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=800&q=80'
      ],
      variants: [
        { size: 'S', color: 'Dusty Pink', hex_code: '#D8A7B1', price: 4999, sale_price: 3499, stock: 10, sku: 'KUR-ANK-002-S' },
        { size: 'M', color: 'Dusty Pink', hex_code: '#D8A7B1', price: 4999, sale_price: 3499, stock: 12, sku: 'KUR-ANK-002-M' },
        { size: 'L', color: 'Dusty Pink', hex_code: '#D8A7B1', price: 4999, sale_price: 3499, stock: 10, sku: 'KUR-ANK-002-L' },
        { size: 'XL', color: 'Dusty Pink', hex_code: '#D8A7B1', price: 4999, sale_price: 3499, stock: 8, sku: 'KUR-ANK-002-XL' }
      ]
    },
    {
      id: 3,
      name: 'Bridal Velvet Lehenga Choli in Royal Maroon',
      slug: 'bridal-velvet-lehenga-choli-royal-maroon',
      sku: 'LEH-BRD-003',
      category_id: 5,
      short_desc: 'Heavy Zardozi Embroidered Velvet Bridal Lehenga with Dual Dupattas.',
      description: 'Make your special day unforgettable in Radhamav Fashions luxury velvet bridal lehenga. Crafted with exquisite handcrafted Zardozi, Gota Patti, and Sequin detailing across the kalis. Accompanied by a heavy velvet blouse and two hand-loomed net dupattas.',
      price: 28999,
      sale_price: 21999,
      cost_price: 12000,
      stock: 12,
      material: 'Micro Velvet & Net',
      fabric: 'Heavy Bridal Velvet with Satin Lining',
      care_instructions: 'Specialist Dry Clean Only.',
      is_featured: 1,
      is_bestseller: 1,
      is_new_arrival: 0,
      rating_avg: 5.0,
      reviews_count: 9,
      images: [
        'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'
      ],
      variants: [
        { size: 'Custom/M', color: 'Royal Maroon', hex_code: '#500B13', price: 28999, sale_price: 21999, stock: 6, sku: 'LEH-BRD-003-M' },
        { size: 'Custom/L', color: 'Royal Maroon', hex_code: '#500B13', price: 28999, sale_price: 21999, stock: 6, sku: 'LEH-BRD-003-L' }
      ]
    },
    {
      id: 4,
      name: 'Floral Print Georgette Indo-Western Dress',
      slug: 'floral-print-georgette-indo-western-dress',
      sku: 'DRS-IND-004',
      category_id: 3,
      short_desc: 'Modern tiered flared maxi dress with metallic waist belt.',
      description: 'Blending contemporary aesthetics with traditional charm, this flared Georgette dress features handcrafted botanical prints, comfortable smocked bodice, and subtle foil work highlights.',
      price: 3499,
      sale_price: 2299,
      cost_price: 1000,
      stock: 30,
      material: 'Faux Georgette',
      fabric: 'Soft Flowy Georgette with Shantoon Lining',
      care_instructions: 'Machine Wash cold inside out or gentle hand wash.',
      is_featured: 1,
      is_bestseller: 0,
      is_new_arrival: 1,
      rating_avg: 4.6,
      reviews_count: 14,
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'
      ],
      variants: [
        { size: 'S', color: 'Sky Blue', hex_code: '#87CEEB', price: 3499, sale_price: 2299, stock: 8, sku: 'DRS-IND-004-S' },
        { size: 'M', color: 'Sky Blue', hex_code: '#87CEEB', price: 3499, sale_price: 2299, stock: 12, sku: 'DRS-IND-004-M' },
        { size: 'L', color: 'Sky Blue', hex_code: '#87CEEB', price: 3499, sale_price: 2299, stock: 10, sku: 'DRS-IND-004-L' }
      ]
    },
    {
      id: 5,
      name: 'Straight Chanderi Silk Salwar Suit',
      slug: 'straight-chanderi-silk-salwar-suit',
      sku: 'SUT-SLW-005',
      category_id: 4,
      short_desc: 'Elegant pastels straight kurta with trousers and Banarasi dupatta.',
      description: 'Refined elegance for festive gatherings. Features intricate Zari neck highlight, matching straight pants, and a vibrant contrasting woven Banarasi silk dupatta.',
      price: 5299,
      sale_price: 3999,
      cost_price: 2100,
      stock: 18,
      material: 'Chanderi Silk',
      fabric: 'Fine Chanderi Silk Woven',
      care_instructions: 'Dry Clean Recommended.',
      is_featured: 0,
      is_bestseller: 1,
      is_new_arrival: 1,
      rating_avg: 4.7,
      reviews_count: 11,
      images: [
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
      ],
      variants: [
        { size: 'M', color: 'Mustard Yellow', hex_code: '#FFDB58', price: 5299, sale_price: 3999, stock: 8, sku: 'SUT-SLW-005-M' },
        { size: 'L', color: 'Mustard Yellow', hex_code: '#FFDB58', price: 5299, sale_price: 3999, stock: 10, sku: 'SUT-SLW-005-L' }
      ]
    },
    {
      id: 6,
      name: 'Royal Jacquard Silk Kurta Set for Men',
      slug: 'royal-jacquard-silk-kurta-set-men',
      sku: 'MEN-KRT-006',
      category_id: 7,
      short_desc: 'Self-design Jacquard Silk ethnic Kurta with Churidar Pyjama.',
      description: 'Distinguish your presence at weddings and grand celebrations. Features mandarin collar, subtle shine, concealed placket, paired with comfortable off-white cotton churidar.',
      price: 3999,
      sale_price: 2799,
      cost_price: 1300,
      stock: 22,
      material: 'Art Silk Jacquard',
      fabric: 'Jacquard Woven Silk',
      care_instructions: 'Dry Clean Only.',
      is_featured: 1,
      is_bestseller: 0,
      is_new_arrival: 1,
      rating_avg: 4.8,
      reviews_count: 7,
      images: [
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'
      ],
      variants: [
        { size: '38 (S)', color: 'Navy Blue', hex_code: '#000080', price: 3999, sale_price: 2799, stock: 6, sku: 'MEN-KRT-006-38' },
        { size: '40 (M)', color: 'Navy Blue', hex_code: '#000080', price: 3999, sale_price: 2799, stock: 8, sku: 'MEN-KRT-006-40' },
        { size: '42 (L)', color: 'Navy Blue', hex_code: '#000080', price: 3999, sale_price: 2799, stock: 8, sku: 'MEN-KRT-006-42' }
      ]
    },
    {
      id: 7,
      name: 'Handcrafted Kundan Choker Necklace Set',
      slug: 'handcrafted-kundan-choker-necklace-set',
      sku: 'ACC-JWL-007',
      category_id: 8,
      short_desc: 'Gold-plated Kundan choker with pearls and matching jhumka earrings.',
      description: 'Exquisite bridal jewelry piece handcrafted with high-grade Kundan stones, emerald green drop beads, and freshwater pearl clusters. Complete with adjustable dori and matching earrings.',
      price: 2499,
      sale_price: 1699,
      cost_price: 700,
      stock: 50,
      material: 'Brass & Kundan Stones',
      fabric: 'Gold Plated Alloy',
      care_instructions: 'Keep away from moisture, perfumes, and direct heat.',
      is_featured: 1,
      is_bestseller: 1,
      is_new_arrival: 1,
      rating_avg: 4.9,
      reviews_count: 32,
      images: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
      ],
      variants: [
        { size: 'Standard', color: 'Gold / Emerald', hex_code: '#D4AF37', price: 2499, sale_price: 1699, stock: 50, sku: 'ACC-JWL-007-GLD' }
      ]
    }
  ];

  for (const p of products) {
    await dbAsync.run(`
      INSERT INTO products (
        id, name, slug, sku, category_id, short_desc, description,
        price, sale_price, cost_price, stock, material, fabric, care_instructions,
        is_featured, is_bestseller, is_new_arrival, rating_avg, reviews_count, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
      ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), sale_price=VALUES(sale_price);
    `, [
      p.id, p.name, p.slug, p.sku, p.category_id, p.short_desc, p.description,
      p.price, p.sale_price, p.cost_price, p.stock, p.material, p.fabric, p.care_instructions,
      p.is_featured, p.is_bestseller, p.is_new_arrival, p.rating_avg, p.reviews_count
    ]);

    // Insert Product Images
    await dbAsync.run(`DELETE FROM product_images WHERE product_id = ?`, [p.id]);
    for (let i = 0; i < p.images.length; i++) {
      await dbAsync.run(`
        INSERT INTO product_images (product_id, image_url, is_primary, display_order)
        VALUES (?, ?, ?, ?)
      `, [p.id, p.images[i], i === 0 ? 1 : 0, i]);
    }

    // Insert Product Variants
    await dbAsync.run(`DELETE FROM product_variants WHERE product_id = ?`, [p.id]);
    for (const v of p.variants) {
      await dbAsync.run(`
        INSERT INTO product_variants (product_id, sku, size, color, hex_code, price, sale_price, stock, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [p.id, v.sku, v.size, v.color, v.hex_code, v.price, v.sale_price, v.stock, p.images[0]]);
    }
  }

  // 4. Seed Banners
  const banners = [
    {
      id: 1,
      title: 'Festive Luxury Couture 2026',
      subtitle: 'Flat 20% OFF on Kanjeevaram Sarees & Bridal Lehengas',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80',
      button_text: 'Explore Collection',
      button_link: '/shop',
      display_order: 1
    },
    {
      id: 2,
      title: 'Royal Anarkalis & Designer Kurtis',
      subtitle: 'Pure Silk & Handcrafted Chanderi Suits Starting ₹2,499',
      image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1600&q=80',
      button_text: 'Shop Kurtis',
      button_link: '/shop?category=kurtis',
      display_order: 2
    }
  ];

  for (const b of banners) {
    await dbAsync.run(`
      INSERT INTO banners (id, title, subtitle, image, button_text, button_link, section, display_order, status)
      VALUES (?, ?, ?, ?, ?, ?, 'hero', ?, 'active')
      ON DUPLICATE KEY UPDATE title=VALUES(title), image=VALUES(image);
    `, [b.id, b.title, b.subtitle, b.image, b.button_text, b.button_link, b.display_order]);
  }

  // 5. Seed Coupons
  await dbAsync.run(`
    INSERT INTO coupons (id, code, discount_type, discount_value, min_order_value, max_discount_amount, status)
    VALUES 
    (1, 'WELCOME10', 'percentage', 10, 1999, 1000, 'active'),
    (2, 'FESTIVE500', 'fixed', 500, 4999, 500, 'active'),
    (3, 'RADHAMAVVIP', 'percentage', 20, 9999, 3000, 'active')
    ON DUPLICATE KEY UPDATE discount_value=VALUES(discount_value);
  `);

  // 6. Seed Reviews
  await dbAsync.run(`
    INSERT INTO reviews (id, product_id, user_id, user_name, rating, review_text, verified_purchase, status)
    VALUES 
    (1, 1, 2, 'Priya S.', 5, 'The Kanjeevaram saree exceeded my expectations! The zari shine and rich crimson red look truly regal for weddings.', 1, 'approved'),
    (2, 2, 2, 'Ananya Sharma', 5, 'Super soft Chanderi silk and perfect fitting! Fast delivery within 3 days.', 1, 'approved'),
    (3, 7, 2, 'Meera Nair', 5, 'Stunning Kundan choker set. High quality polish that looks genuine gold.', 1, 'approved')
    ON DUPLICATE KEY UPDATE review_text=VALUES(review_text);
  `);

  // 7. Seed CMS Pages
  const cmsPages = [
    {
      slug: 'about-us',
      title: 'About Radhamav Fashions',
      content: `<h2>Welcome to Radhamav Fashions</h2><p>Radhamav Fashions is a premiere single-vendor Indian ethnic couture brand dedicated to preserving centuries-old weaving traditions while blending modern aesthetics.</p><p>Founded with a passion for handcrafted silk sarees, designer kurtis, bridal lehengas, and royal festive ensembles, our garments are crafted by master weavers from Kanchipuram, Banaras, Chanderi, and Jaipur.</p><h3>Our Commitment</h3><ul><li>100% Authentic Pure Handloom Silk</li><li>Certified Zari & Precision Tailoring</li><li>Pan-India & International Express Shipping</li><li>Exceptional Customer Support & Easy Returns</li></ul>`,
      meta_title: 'About Radhamav Fashions - Fine Ethnic Couture',
      meta_description: 'Discover Radhamav Fashions, your premier destination for authentic Kanjeevaram silk sarees, designer kurtis, and royal bridal lehengas.'
    },
    {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      content: `<h2>Privacy Policy</h2><p>At Radhamav Fashions, we respect your privacy. All personal data including name, shipping address, contact details, and payment authorizations are securely encrypted using standard industry SSL protocols.</p><p>We never sell or share your information with third-party unauthorized entities.</p>`,
      meta_title: 'Privacy Policy - Radhamav Fashions',
      meta_description: 'Read the privacy policy of Radhamav Fashions regarding data security and user protection.'
    },
    {
      slug: 'terms-and-conditions',
      title: 'Terms & Conditions',
      content: `<h2>Terms & Conditions</h2><p>By using the Radhamav Fashions store, you agree to our purchasing, shipping, and return terms. All product prices are inclusive of GST taxes unless specified otherwise.</p>`,
      meta_title: 'Terms & Conditions - Radhamav Fashions',
      meta_description: 'Terms and conditions for shopping on Radhamav Fashions online store.'
    },
    {
      slug: 'refund-policy',
      title: 'Refund & Return Policy',
      content: `<h2>Refund & Return Policy</h2><p>We offer a hassle-free 7-day return and replacement policy for all unused products in original packaging with intact price tags.</p><p>Refunds are processed within 3-5 business days upon receipt and verification of returned items at our warehouse.</p>`,
      meta_title: 'Refund Policy - Radhamav Fashions',
      meta_description: 'Radhamav Fashions 7-day hassle-free return and refund guidelines.'
    },
    {
      slug: 'shipping-policy',
      title: 'Shipping Policy',
      content: `<h2>Shipping Policy</h2><p>Free standard express shipping on all orders above ₹999 across India. Standard delivery takes 3 to 5 business days.</p>`,
      meta_title: 'Shipping Policy - Radhamav Fashions',
      meta_description: 'Delivery timelines, shipping charges, and tracking information.'
    }
  ];

  for (const cms of cmsPages) {
    await dbAsync.run(`
      INSERT INTO cms_pages (slug, title, content, meta_title, meta_description)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE title=VALUES(title), content=VALUES(content);
    `, [cms.slug, cms.title, cms.content, cms.meta_title, cms.meta_description]);
  }

  // 8. Seed Store Settings
  const settings = [
    { key: 'store_name', value: 'Radhamav Fashions' },
    { key: 'store_email', value: 'support@radhamav.com' },
    { key: 'store_phone', value: '+91 9876543210' },
    { key: 'store_address', value: '108 Silk Mill Avenue, Jubilee Hills, Hyderabad, Telangana 500033' },
    { key: 'free_shipping_min', value: '999' },
    { key: 'standard_shipping_charge', value: '99' },
    { key: 'cod_enabled', value: 'true' },
    { key: 'gst_number', value: '36AAAAA0000A1Z5' }
  ];

  for (const s of settings) {
    await dbAsync.run(`
      INSERT INTO settings (\`key\`, \`value\`)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE \`value\`=VALUES(\`value\`);
    `, [s.key, s.value]);
  }

  console.log('MySQL Database seeding completed successfully!');
}

if (require.main === module) {
  seedData().then(() => process.exit(0)).catch(err => {
    console.error('MySQL Seed error:', err.message);
    process.exit(1);
  });
}

module.exports = seedData;
