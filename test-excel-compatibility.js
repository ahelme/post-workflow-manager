const XLSX = require('xlsx');
const fs = require('fs');

async function testExcelCompatibility() {
  console.log('🧪 Testing different Excel export approaches...\n');
  
  // Test data
  const testData = [
    { Name: 'John Doe', Age: 25, City: 'New York' },
    { Name: 'Jane Smith', Age: 30, City: 'Los Angeles' },
    { Name: 'Bob Johnson', Age: 35, City: 'Chicago' }
  ];
  
  // Method 1: Ultra-simple approach
  console.log('1️⃣ Testing ultra-simple approach...');
  try {
    const wb1 = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(testData);
    XLSX.utils.book_append_sheet(wb1, ws1, 'Test');
    
    const path1 = 'backups/test_ultra_simple.xlsx';
    XLSX.writeFile(wb1, path1);
    console.log('✅ Created:', path1);
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
  
  // Method 2: Specify book type explicitly
  console.log('\n2️⃣ Testing with explicit bookType...');
  try {
    const wb2 = XLSX.utils.book_new();
    const ws2 = XLSX.utils.json_to_sheet(testData);
    XLSX.utils.book_append_sheet(wb2, ws2, 'Test');
    
    const path2 = 'backups/test_explicit_type.xlsx';
    XLSX.writeFile(wb2, path2, { bookType: 'xlsx' });
    console.log('✅ Created:', path2);
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
  
  // Method 3: Write as buffer then save
  console.log('\n3️⃣ Testing buffer approach...');
  try {
    const wb3 = XLSX.utils.book_new();
    const ws3 = XLSX.utils.json_to_sheet(testData);
    XLSX.utils.book_append_sheet(wb3, ws3, 'Test');
    
    const buffer = XLSX.write(wb3, { bookType: 'xlsx', type: 'buffer' });
    const path3 = 'backups/test_buffer.xlsx';
    fs.writeFileSync(path3, buffer);
    console.log('✅ Created:', path3);
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
  
  // Method 4: Try different Excel format (biff8/xls)
  console.log('\n4️⃣ Testing legacy .xls format...');
  try {
    const wb4 = XLSX.utils.book_new();
    const ws4 = XLSX.utils.json_to_sheet(testData);
    XLSX.utils.book_append_sheet(wb4, ws4, 'Test');
    
    const path4 = 'backups/test_legacy.xls';
    XLSX.writeFile(wb4, path4, { bookType: 'biff8' });
    console.log('✅ Created:', path4);
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
  
  // Method 5: CSV approach with .xlsx extension (should work universally)
  console.log('\n5️⃣ Testing CSV with Excel extension...');
  try {
    const csvContent = 'Name,Age,City\\nJohn Doe,25,New York\\nJane Smith,30,Los Angeles\\nBob Johnson,35,Chicago';
    const path5 = 'backups/test_csv_as_xlsx.xlsx';
    fs.writeFileSync(path5, csvContent);
    console.log('✅ Created (CSV as XLSX):', path5);
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
  
  console.log('\\n🎯 Try opening these files in Excel and let me know which ones work!');
  console.log('Files created in backups/ directory:');
  console.log('- test_ultra_simple.xlsx');
  console.log('- test_explicit_type.xlsx'); 
  console.log('- test_buffer.xlsx');
  console.log('- test_legacy.xls');
  console.log('- test_csv_as_xlsx.xlsx');
}

testExcelCompatibility();