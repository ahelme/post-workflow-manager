const BackupService = require('./server/utils/backup.js');

async function testSimplifiedExcelBackup() {
  console.log('🧪 Testing simplified Excel backup...');
  
  try {
    const result = await BackupService.createFullBackup('excel', 'claude-test-simplified');
    console.log('✅ Success!', result);
    
    // Test if file can be read back
    const XLSX = require('xlsx');
    console.log('📖 Testing if file can be read...');
    const wb = XLSX.readFile(result.path);
    console.log('✅ File reads successfully!');
    console.log('📊 Sheets:', wb.SheetNames);
    
    if (wb.Sheets['Projects']) {
      const projectsData = XLSX.utils.sheet_to_json(wb.Sheets['Projects']);
      console.log('📁 Projects found:', projectsData.length);
    }
    
    if (wb.Sheets['Students']) {
      const studentsData = XLSX.utils.sheet_to_json(wb.Sheets['Students']);
      console.log('👥 Students found:', studentsData.length);
    }
    
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testSimplifiedExcelBackup();