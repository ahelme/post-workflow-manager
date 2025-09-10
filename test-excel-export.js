const XLSX = require('xlsx');
const { Project, Student } = require('./server/models');
const path = require('path');

async function testSimpleExcelExport() {
  console.log('Testing simple Excel export...');
  
  try {
    // Get data
    const projects = await Project.findAll({
      include: [{ model: Student, as: 'student' }],
      where: { isActive: true },
    });
    const students = await Student.findAll({
      where: { isActive: true },
    });

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Simple projects data - no complex formatting
    const projectsData = projects.map(project => ({
      'Title': project.title || '',
      'Description': project.description || '',
      'Genre': project.genre || '',
      'Duration': project.duration || '',
      'Status': project.status || '',
      'Student ID': project.student?.studentId || '',
      'Student Name': project.student ? `${project.student.firstName} ${project.student.lastName}` : '',
      'Supervising Producer': project.supervisingProducer || '',
      'Director': project.director || '',
      'Editor': project.editor || '',
      'Shoot Date': project.shootDate ? String(project.shootDate).split('T')[0] : '',
      'Grade Date': project.gradeDate ? String(project.gradeDate).split('T')[0] : '',
      'Mix Date': project.mixDate ? String(project.mixDate).split('T')[0] : '',
      'Final Delivery Date': project.finalDeliveryDate ? String(project.finalDeliveryDate).split('T')[0] : '',
      'Notes': project.notes || '',
    }));
    
    // Simple students data
    const studentsData = students.map(student => ({
      'Student ID': student.studentId || '',
      'First Name': student.firstName || '',
      'Last Name': student.lastName || '',
      'Email': student.email || '',
      'Phone': student.phone || '',
      'Year': student.year || '',
      'Program': student.program || '',
      'Status': student.isActive ? 'Active' : 'Inactive',
      'Notes': student.notes || '',
    }));
    
    // Create worksheets with minimal options
    const projectsWs = XLSX.utils.json_to_sheet(projectsData);
    const studentsWs = XLSX.utils.json_to_sheet(studentsData);
    
    // Add to workbook
    XLSX.utils.book_append_sheet(wb, projectsWs, 'Projects');
    XLSX.utils.book_append_sheet(wb, studentsWs, 'Students');

    // Write with minimal options
    const filePath = path.join(__dirname, 'backups', 'test_simple_export.xlsx');
    XLSX.writeFile(wb, filePath);
    
    console.log('✅ Simple Excel export created:', filePath);
    
    // Test reading it back
    const testWb = XLSX.readFile(filePath);
    console.log('✅ File reads back successfully');
    console.log('Sheet names:', testWb.SheetNames);
    
  } catch (error) {
    console.error('❌ Error in simple export:', error);
  }
}

testSimpleExcelExport();