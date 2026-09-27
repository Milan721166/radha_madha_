const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const DB_HOST = process.env.DB_HOST || '187.127.210.144';
const DB_PORT = process.env.DB_PORT || 7947;
const DB_USER = process.env.DB_USER || 'mysql';
const DB_PASSWORD = process.env.DB_PASSWORD || 'yFPG3DheUfoCQJmGPlO5k80vVkIDwkrWKjAPMpMk3eU6dMJv7enB32LkLnryaBAa';
const DB_NAME = process.env.DB_NAME || 'default';

let mysqlPool = null;
let sqliteDb = null;

const sqlitePath = path.join(__dirname, 'radhamav.sqlite');

async function getEngine() {
  if (mysqlPool) return { type: 'mysql', pool: mysqlPool };
  if (sqliteDb) return { type: 'sqlite', db: sqliteDb };

  // Attempt MySQL connection using connection string or credentials
  try {
    const config = DATABASE_URL ? { uri: DATABASE_URL, multipleStatements: true, connectTimeout: 10000, dateStrings: true } : {
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 10000,
      multipleStatements: true,
      dateStrings: true
    };

    mysqlPool = mysql.createPool(config);

    // Test ping
    await mysqlPool.query('SELECT 1');
    console.log(`✅ Connected to Remote MySQL Database at ${DB_HOST}:${DB_PORT}/${DB_NAME}`);
    return { type: 'mysql', pool: mysqlPool };
  } catch (err) {
    console.warn(`⚠️ Remote MySQL Connection Notice (${err.message}). Defaulting to embedded SQLite database...`);
    
    // SQLite Fallback setup
    const dbDir = path.dirname(sqlitePath);
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

    sqliteDb = new sqlite3.Database(sqlitePath);
    sqliteDb.run('PRAGMA foreign_keys = ON;');
    console.log(`✅ Connected to SQLite database at: ${sqlitePath}`);
    return { type: 'sqlite', db: sqliteDb };
  }
}

const dbAsync = {
  get: async (sql, params = []) => {
    const engine = await getEngine();
    if (engine.type === 'mysql') {
      const [rows] = await engine.pool.query(sql, params);
      return rows && rows.length > 0 ? rows[0] : null;
    } else {
      return new Promise((resolve, reject) => {
        engine.db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }
  },

  all: async (sql, params = []) => {
    const engine = await getEngine();
    if (engine.type === 'mysql') {
      const [rows] = await engine.pool.query(sql, params);
      return rows || [];
    } else {
      return new Promise((resolve, reject) => {
        engine.db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    }
  },

  run: async (sql, params = []) => {
    const engine = await getEngine();
    if (engine.type === 'mysql') {
      const [result] = await engine.pool.query(sql, params);
      return { id: result.insertId, changes: result.affectedRows };
    } else {
      return new Promise((resolve, reject) => {
        engine.db.run(sql, params, function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, changes: this.changes });
        });
      });
    }
  },

  exec: async (sql) => {
    const engine = await getEngine();
    if (engine.type === 'mysql') {
      // Split statements and execute individually
      const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
      for (const statement of statements) {
        await engine.pool.query(statement);
      }
    } else {
      return new Promise((resolve, reject) => {
        engine.db.exec(sql, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }
};

const initDatabase = async () => {
  const engine = await getEngine();

  const mysqlSchema = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      role VARCHAR(50) DEFAULT 'customer',
      status VARCHAR(50) DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      image TEXT,
      parent_id INT DEFAULT NULL,
      status VARCHAR(50) DEFAULT 'active',
      display_order INT DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      sku VARCHAR(100) UNIQUE NOT NULL,
      category_id INT NOT NULL,
      subcategory_id INT,
      short_desc TEXT,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      sale_price DECIMAL(10, 2),
      cost_price DECIMAL(10, 2),
      tax_percent DECIMAL(5, 2) DEFAULT 5.0,
      stock INT DEFAULT 0,
      low_stock_threshold INT DEFAULT 5,
      material VARCHAR(255),
      fabric VARCHAR(255),
      care_instructions TEXT,
      is_featured TINYINT DEFAULT 0,
      is_bestseller TINYINT DEFAULT 0,
      is_new_arrival TINYINT DEFAULT 1,
      status VARCHAR(50) DEFAULT 'published',
      seo_title VARCHAR(255),
      seo_description TEXT,
      seo_keywords VARCHAR(255),
      rating_avg DECIMAL(3, 1) DEFAULT 4.5,
      reviews_count INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS product_variants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      sku VARCHAR(100) NOT NULL,
      size VARCHAR(50),
      color VARCHAR(50),
      hex_code VARCHAR(20),
      price DECIMAL(10, 2),
      sale_price DECIMAL(10, 2),
      stock INT DEFAULT 0,
      image TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS product_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      image_url TEXT NOT NULL,
      is_primary TINYINT DEFAULT 0,
      display_order INT DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS cart (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNIQUE NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS cart_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cart_id INT NOT NULL,
      product_id INT NOT NULL,
      variant_id INT,
      size VARCHAR(50),
      color VARCHAR(50),
      quantity INT NOT NULL DEFAULT 1,
      FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS wishlist (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY user_product (user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS addresses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      house_flat VARCHAR(255) NOT NULL,
      street VARCHAR(255) NOT NULL,
      area VARCHAR(255),
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      pincode VARCHAR(20) NOT NULL,
      country VARCHAR(100) DEFAULT 'India',
      is_default TINYINT DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_number VARCHAR(100) UNIQUE NOT NULL,
      user_id INT NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50) NOT NULL,
      shipping_address TEXT NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      payment_status VARCHAR(50) DEFAULT 'pending',
      order_status VARCHAR(50) DEFAULT 'pending',
      tracking_number VARCHAR(100),
      courier_name VARCHAR(100),
      subtotal DECIMAL(10, 2) NOT NULL,
      shipping_fee DECIMAL(10, 2) DEFAULT 0,
      tax_amount DECIMAL(10, 2) DEFAULT 0,
      discount_amount DECIMAL(10, 2) DEFAULT 0,
      total_amount DECIMAL(10, 2) NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      variant_id INT,
      product_name VARCHAR(255) NOT NULL,
      sku VARCHAR(100) NOT NULL,
      size VARCHAR(50),
      color VARCHAR(50),
      image TEXT,
      price DECIMAL(10, 2) NOT NULL,
      quantity INT NOT NULL,
      total DECIMAL(10, 2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS order_status_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      status VARCHAR(50) NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS returns (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      reason VARCHAR(255) NOT NULL,
      description TEXT,
      images TEXT,
      status VARCHAR(50) DEFAULT 'requested',
      admin_comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS coupons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      discount_type VARCHAR(50) NOT NULL,
      discount_value DECIMAL(10, 2) NOT NULL,
      min_order_value DECIMAL(10, 2) DEFAULT 0,
      max_discount_amount DECIMAL(10, 2) DEFAULT 0,
      start_date DATE,
      end_date DATE,
      usage_limit INT DEFAULT 1000,
      used_count INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'active'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      user_id INT NOT NULL,
      user_name VARCHAR(255) NOT NULL,
      rating INT NOT NULL,
      review_text TEXT,
      images TEXT,
      status VARCHAR(50) DEFAULT 'approved',
      verified_purchase TINYINT DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS banners (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      subtitle TEXT,
      image TEXT NOT NULL,
      button_text VARCHAR(100) DEFAULT 'Shop Now',
      button_link VARCHAR(255) DEFAULT '/shop',
      section VARCHAR(50) DEFAULT 'hero',
      display_order INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'active'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS cms_pages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      content LONGTEXT NOT NULL,
      meta_title VARCHAR(255),
      meta_description TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'unread',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS inventory_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      variant_id INT,
      change_qty INT NOT NULL,
      type VARCHAR(50) NOT NULL,
      reference_id VARCHAR(100),
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      \`key\` VARCHAR(100) UNIQUE NOT NULL,
      \`value\` TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS otps (
      id INT AUTO_INCREMENT PRIMARY KEY,
      phone VARCHAR(50) NOT NULL,
      otp VARCHAR(10) NOT NULL,
      expires_at DATETIME NOT NULL,
      attempts INT DEFAULT 0,
      verified TINYINT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const sqliteSchema = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'customer',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      image TEXT,
      parent_id INTEGER DEFAULT NULL,
      status TEXT DEFAULT 'active',
      display_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      category_id INTEGER NOT NULL,
      subcategory_id INTEGER,
      short_desc TEXT,
      description TEXT,
      price REAL NOT NULL,
      sale_price REAL,
      cost_price REAL,
      tax_percent REAL DEFAULT 5.0,
      stock INTEGER DEFAULT 0,
      low_stock_threshold INTEGER DEFAULT 5,
      material TEXT,
      fabric TEXT,
      care_instructions TEXT,
      is_featured INTEGER DEFAULT 0,
      is_bestseller INTEGER DEFAULT 0,
      is_new_arrival INTEGER DEFAULT 1,
      status TEXT DEFAULT 'published',
      seo_title TEXT,
      seo_description TEXT,
      seo_keywords TEXT,
      rating_avg REAL DEFAULT 4.5,
      reviews_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      sku TEXT NOT NULL,
      size TEXT,
      color TEXT,
      hex_code TEXT,
      price REAL,
      sale_price REAL,
      stock INTEGER DEFAULT 0,
      image TEXT
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0,
      display_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cart_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      variant_id INTEGER,
      size TEXT,
      color TEXT,
      quantity INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      house_flat TEXT NOT NULL,
      street TEXT NOT NULL,
      area TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      country TEXT DEFAULT 'India',
      is_default INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      order_status TEXT DEFAULT 'pending',
      tracking_number TEXT,
      courier_name TEXT,
      subtotal REAL NOT NULL,
      shipping_fee REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      variant_id INTEGER,
      product_name TEXT NOT NULL,
      sku TEXT NOT NULL,
      size TEXT,
      color TEXT,
      image TEXT,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      total REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS returns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      reason TEXT NOT NULL,
      description TEXT,
      images TEXT,
      status TEXT DEFAULT 'requested',
      admin_comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value REAL NOT NULL,
      min_order_value REAL DEFAULT 0,
      max_discount_amount REAL DEFAULT 0,
      start_date DATE,
      end_date DATE,
      usage_limit INTEGER DEFAULT 1000,
      used_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      review_text TEXT,
      images TEXT,
      status TEXT DEFAULT 'approved',
      verified_purchase INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT,
      image TEXT NOT NULL,
      button_text TEXT DEFAULT 'Shop Now',
      button_link TEXT DEFAULT '/shop',
      section TEXT DEFAULT 'hero',
      display_order INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS cms_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      meta_title TEXT,
      meta_description TEXT
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'unread',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inventory_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      variant_id INTEGER,
      change_qty INTEGER NOT NULL,
      type TEXT NOT NULL,
      reference_id TEXT,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS otps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      otp TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      attempts INTEGER DEFAULT 0,
      verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    if (engine.type === 'mysql') {
      await dbAsync.exec(mysqlSchema);
      console.log('✅ Remote MySQL Database tables initialized successfully.');
    } else {
      await dbAsync.exec(sqliteSchema);
      console.log('✅ SQLite Database tables initialized successfully.');
    }
  } catch (error) {
    console.error('Failed to initialize database tables:', error.message);
  }
};


module.exports = {
  dbAsync,
  initDatabase,
  getEngine
};
