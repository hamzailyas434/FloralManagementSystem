// Import data to new Supabase database
// Run this with: node import-to-new-db.js

const newSupabaseUrl = 'https://hdufufkzirsleveysehe.supabase.co';
const newSupabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkdWZ1Zmt6aXJzbGV2ZXlzZWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNjkzODcsImV4cCI6MjA3OTg0NTM4N30.yqNhMJLk4GR38m0QLE33YedDGVRQu9Ft0DIN6vSu10w';

const fs = require('fs');

async function importData() {
  console.log('🔄 Importing data to new database...\n');
  
  // Read exported data
  const data = JSON.parse(fs.readFileSync('old-database-export.json', 'utf8'));
  
  // Import order matters due to foreign keys
  const importOrder = ['customers', 'sales', 'orders', 'order_items', 'delivery_costs', 'expenses'];
  
  for (const table of importOrder) {
    const records = data[table];
    
    if (!records || records.length === 0) {
      console.log(`⏭️  ${table}: No data to import`);
      continue;
    }
    
    try {
      const response = await fetch(`${newSupabaseUrl}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'apikey': newSupabaseKey,
          'Authorization': `Bearer ${newSupabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(records)
      });
      
      if (response.ok) {
        console.log(`✅ ${table}: ${records.length} records imported`);
      } else {
        const error = await response.text();
        console.log(`❌ ${table}: Failed - ${error}`);
      }
    } catch (error) {
      console.log(`❌ ${table}: Error - ${error.message}`);
    }
  }
  
  console.log('\n✨ Import completed!');
}

importData();
