const XLSX = require('xlsx');
const { Project, Student } = require('./server/models');

async function testWithoutTimestamps() {
  console.log('Testing Excel export WITHOUT timestamp fields...');
  
  const projects = await Project.findAll({
    include: [{ model: Student, as: 'student' }],
    where: { isActive: true },
    limit: 2  // Just test with 2 projects first
  });

  // Map data but EXCLUDE createdAt/updatedAt timestamps completely
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
    'Notes': project.notes || ''
    // NO createdAt or updatedAt fields!
  }));

  console.log('Data without timestamps:', JSON.stringify(projectsData, null, 2));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(projectsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Projects');
  
  XLSX.writeFile(wb, 'backups/test_no_timestamps.xlsx');
  console.log('✅ Created: backups/test_no_timestamps.xlsx');
}

testWithoutTimestamps().catch(console.error);