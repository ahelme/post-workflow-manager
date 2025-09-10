const fs = require('fs');
const BackupService = require('./server/utils/backup.js');

async function testExcelImportFixed() {
  console.log('🧪 Testing Excel Import with Fixed Test Data...\n');
  
  try {
    const XLSX = require('xlsx');
    const testWb = XLSX.utils.book_new();
    
    // Create test students data (import students first!)
    const testStudents = [
      {
        'Student ID': 'IMPORT001',
        'First Name': 'Import',
        'Last Name': 'Tester',
        'Email': 'import.tester@filmschool.edu',
        'Phone': '555-1234567',  // Fixed: proper length
        'Year': 2,
        'Program': 'Film Production',
        'Status': 'Active',
        'Notes': 'Test student for import functionality'
      }
    ];
    
    // Create test projects data (references the student above)
    const testProjects = [
      {
        'Title': 'Excel Import Test Film',
        'Description': 'Testing our Excel import system',
        'Genre': 'Documentary',
        'Duration': 15,
        'Status': 'pre-production',
        'Student ID': 'IMPORT001',  // Matches the student above
        'Student Name': 'Import Tester',
        'Supervising Producer': 'Import Test Producer',
        'Director': 'Test Director',
        'Editor': 'Test Editor',
        'Shoot Date': '2025-01-15',
        'Grade Date': '',
        'Mix Date': '',
        'Final Delivery Date': '2025-02-15',
        'Notes': 'Successfully testing Excel import feature'
      }
    ];
    
    const projectsWs = XLSX.utils.json_to_sheet(testProjects);
    const studentsWs = XLSX.utils.json_to_sheet(testStudents);
    
    XLSX.utils.book_append_sheet(testWb, projectsWs, 'Projects');
    XLSX.utils.book_append_sheet(testWb, studentsWs, 'Students');
    
    const testFilePath = 'backups/test_import_fixed.xlsx';
    XLSX.writeFile(testWb, testFilePath);
    console.log('✅ Created test Excel file:', testFilePath);
    
    // Import the fixed test file
    console.log('\n📥 Importing test Excel file...');
    const testFileBuffer = fs.readFileSync(testFilePath);
    const testImportResult = await BackupService.importFromExcel(testFileBuffer);
    
    console.log('✅ Import completed!');
    console.log('📈 Import Results:');
    console.log(`  - Projects imported: ${testImportResult.projectsImported}`);
    console.log(`  - Students imported: ${testImportResult.studentsImported}`);
    console.log(`  - Errors: ${testImportResult.errors.length}`);
    
    if (testImportResult.errors.length > 0) {
      console.log('\n❌ Import Errors:');
      testImportResult.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('\n🎉 No errors! Import was completely successful!');
    }
    
    // Verify the imported data
    const { Project, Student } = require('./server/models');
    
    const importedStudent = await Student.findOne({ 
      where: { studentId: 'IMPORT001' } 
    });
    
    const importedProject = await Project.findOne({ 
      where: { title: 'Excel Import Test Film' },
      include: [{ model: Student, as: 'student' }]
    });
    
    console.log('\n🔍 Verification:');
    if (importedStudent) {
      console.log('✅ Student imported:', `${importedStudent.firstName} ${importedStudent.lastName}`);
    }
    
    if (importedProject) {
      console.log('✅ Project imported:', importedProject.title);
      console.log('✅ Project linked to student:', importedProject.student?.firstName || 'No student linked');
    }
    
  } catch (error) {
    console.error('❌ Import test failed:', error.message);
  }
}

testExcelImportFixed();