const fs = require('fs');
const BackupService = require('./server/utils/backup.js');
const { Project, Student } = require('./server/models');

async function testExcelImport() {
  console.log('🧪 Testing Excel Import Functionality...\n');
  
  try {
    // First, create a fresh Excel export to test with
    console.log('1️⃣ Creating fresh Excel export for testing...');
    const exportResult = await BackupService.createFullBackup('excel', 'import-test');
    console.log('✅ Export created:', exportResult.filename);
    
    // Get current counts before import
    const beforeProjects = await Project.count({ where: { isActive: true } });
    const beforeStudents = await Student.count({ where: { isActive: true } });
    console.log(`\n📊 Before import: ${beforeProjects} projects, ${beforeStudents} students`);
    
    // Read the export file
    console.log('\n2️⃣ Reading Excel file for import...');
    const fileBuffer = fs.readFileSync(exportResult.path);
    console.log('✅ File read successfully, size:', fileBuffer.length, 'bytes');
    
    // Test the import function
    console.log('\n3️⃣ Testing Excel import...');
    const importResult = await BackupService.importFromExcel(fileBuffer);
    
    console.log('✅ Import completed!');
    console.log('📈 Import Results:');
    console.log(`  - Projects imported: ${importResult.projectsImported}`);
    console.log(`  - Students imported: ${importResult.studentsImported}`);
    console.log(`  - Errors: ${importResult.errors.length}`);
    
    if (importResult.errors.length > 0) {
      console.log('\n❌ Import Errors:');
      importResult.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    // Get counts after import
    const afterProjects = await Project.count({ where: { isActive: true } });
    const afterStudents = await Student.count({ where: { isActive: true } });
    console.log(`\n📊 After import: ${afterProjects} projects, ${afterStudents} students`);
    
    // Test with a custom Excel file (create one with new data)
    console.log('\n4️⃣ Testing with custom Excel data...');
    
    const XLSX = require('xlsx');
    const testWb = XLSX.utils.book_new();
    
    // Create test projects data
    const testProjects = [
      {
        'Title': 'Import Test Project',
        'Description': 'Testing Excel import functionality',
        'Genre': 'Documentary',
        'Duration': 10,
        'Status': 'pre-production',
        'Student ID': 'TEST001',
        'Student Name': 'Test Student',
        'Supervising Producer': 'Import Tester',
        'Director': 'Test Director',
        'Editor': 'Test Editor',
        'Shoot Date': '2025-01-01',
        'Grade Date': '',
        'Mix Date': '',
        'Final Delivery Date': '2025-02-01',
        'Notes': 'This is a test import'
      }
    ];
    
    // Create test students data
    const testStudents = [
      {
        'Student ID': 'TEST001',
        'First Name': 'Test',
        'Last Name': 'Student',
        'Email': 'test.student@filmschool.edu',
        'Phone': '555-TEST',
        'Year': 2,
        'Program': 'Film Production',
        'Status': 'Active',
        'Notes': 'Test student for import'
      }
    ];
    
    const projectsWs = XLSX.utils.json_to_sheet(testProjects);
    const studentsWs = XLSX.utils.json_to_sheet(testStudents);
    
    XLSX.utils.book_append_sheet(testWb, projectsWs, 'Projects');
    XLSX.utils.book_append_sheet(testWb, studentsWs, 'Students');
    
    const testFilePath = 'backups/test_import.xlsx';
    XLSX.writeFile(testWb, testFilePath);
    
    // Import the test file
    const testFileBuffer = fs.readFileSync(testFilePath);
    const testImportResult = await BackupService.importFromExcel(testFileBuffer);
    
    console.log('✅ Custom import completed!');
    console.log('📈 Custom Import Results:');
    console.log(`  - Projects imported: ${testImportResult.projectsImported}`);
    console.log(`  - Students imported: ${testImportResult.studentsImported}`);
    console.log(`  - Errors: ${testImportResult.errors.length}`);
    
    if (testImportResult.errors.length > 0) {
      console.log('\n❌ Custom Import Errors:');
      testImportResult.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    // Final counts
    const finalProjects = await Project.count({ where: { isActive: true } });
    const finalStudents = await Student.count({ where: { isActive: true } });
    console.log(`\n📊 Final counts: ${finalProjects} projects, ${finalStudents} students`);
    
    console.log('\n🎉 Excel import testing completed!');
    
  } catch (error) {
    console.error('❌ Import test failed:', error.message);
    console.error(error.stack);
  }
}

testExcelImport();