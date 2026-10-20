// Migration script to add new product columns
const { dbAsync, getEngine } = require('./db/database');

async function migrate() {
  console.log('🔄 Running product table migration...');
  
  const engine = await getEngine();
  console.log(`Database engine: ${engine.type}`);
  
  const newColumns = [
    { name: 'brand', type: engine.type === 'mysql' ? 'VARCHAR(255)' : 'TEXT', after: 'subcategory_id' },
    { name: 'color', type: engine.type === 'mysql' ? 'VARCHAR(255)' : 'TEXT', after: 'description' },
    { name: 'pattern', type: engine.type === 'mysql' ? 'VARCHAR(255)' : 'TEXT', after: 'color' },
    { name: 'fit_shape', type: engine.type === 'mysql' ? 'VARCHAR(255)' : 'TEXT', after: 'pattern' },
    { name: 'neck', type: engine.type === 'mysql' ? 'VARCHAR(255)' : 'TEXT', after: 'fit_shape' },
    { name: 'sleeve_length', type: engine.type === 'mysql' ? 'VARCHAR(255)' : 'TEXT', after: 'neck' },
    { name: 'length', type: engine.type === 'mysql' ? 'VARCHAR(255)' : 'TEXT', after: 'sleeve_length' },
    { name: 'occasion', type: engine.type === 'mysql' ? 'VARCHAR(255)' : 'TEXT', after: 'length' },
    { name: 'stitch_type', type: engine.type === 'mysql' ? 'VARCHAR(100)' : 'TEXT', after: 'occasion' },
    { name: 'gst_rate', type: engine.type === 'mysql' ? 'DECIMAL(5,2)' : 'REAL', after: 'tax_percent' },
    { name: 'hsn_code', type: engine.type === 'mysql' ? 'VARCHAR(50)' : 'TEXT', after: 'gst_rate' },
    { name: 'product_weight', type: engine.type === 'mysql' ? 'DECIMAL(10,2)' : 'REAL', after: 'low_stock_threshold' },
    { name: 'country_of_origin', type: engine.type === 'mysql' ? "VARCHAR(255) DEFAULT 'India'" : "TEXT DEFAULT 'India'", after: 'care_instructions' },
    { name: 'manufacturer_name', type: engine.type === 'mysql' ? 'VARCHAR(255)' : 'TEXT', after: 'country_of_origin' },
    { name: 'manufacturer_address', type: engine.type === 'mysql' ? 'TEXT' : 'TEXT', after: 'manufacturer_name' },
    { name: 'url_slug', type: engine.type === 'mysql' ? 'VARCHAR(255)' : 'TEXT', after: 'seo_keywords' },
    { name: 'tags', type: 'TEXT', after: 'url_slug' },
  ];

  for (const col of newColumns) {
    try {
      if (engine.type === 'mysql') {
        await dbAsync.run(`ALTER TABLE products ADD COLUMN ${col.name} ${col.type} AFTER ${col.after}`);
      } else {
        await dbAsync.run(`ALTER TABLE products ADD COLUMN ${col.name} ${col.type}`);
      }
      console.log(`  ✅ Added column: ${col.name}`);
    } catch (err) {
      if (err.message && (err.message.includes('Duplicate column') || err.message.includes('duplicate column'))) {
        console.log(`  ⏭️  Column already exists: ${col.name}`);
      } else {
        console.error(`  ❌ Error adding ${col.name}:`, err.message);
      }
    }
  }

  console.log('✅ Migration complete!');
  process.exit(0);
}

// Wait a bit for DB connection to establish
setTimeout(migrate, 2000);
