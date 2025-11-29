// Export data from old Supabase database
// Run this with: node export-old-data.js

const oldSupabaseUrl = 'https://ttohwauryneywdvhstim.supabase.co';
const oldSupabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0b2h3YXVyeW5leXdkdmhzdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjU1NjMsImV4cCI6MjA3OTc0MTU2M30.kxxBso5KIKin5OTg63Q47fbq4oQux_pMagWrZGcmbNQ';

const tables = ['customers', 'sales', 'orders', 'order_items', 'delivery_costs', 'expenses'];

async function exportData() {
  console.log('🔄 Exporting data from old database...\n');
  
  const allData = {};
  
  for (const table of tables) {
    try {
      const response = await fetch(`${oldSupabaseUrl}/rest/v1/${table}?select=*`, {
        headers: {
          'apikey': oldSupabaseKey,
          'Authorization': `Bearer ${oldSupabaseKey}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        allData[table] = data;
        console.log(`✅ ${table}: ${data.length} records`);
      } else {
        console.log(`❌ ${table}: Failed to fetch`);
      }
    } catch (error) {
      console.log(`❌ ${table}: Error - ${error.message}`);
    }
  }
  
  console.log('\n📊 Export Summary:');
  console.log(JSON.stringify(allData, null, 2));
  
  // Save to file
  const fs = require('fs');
  fs.writeFileSync('old-database-export.json', JSON.stringify(allData, null, 2));
  console.log('\n💾 Data saved to: old-database-export.json');
}

exportData();
