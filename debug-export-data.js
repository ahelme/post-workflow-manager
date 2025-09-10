const { Project, Student } = require('./server/models');
const fs = require('fs');

async function debugExportData() {
  console.log('🔍 Debugging export data...\n');
  
  try {
    // Get the exact same data that the export function uses
    const projects = await Project.findAll({
      include: [{ model: Student, as: 'student' }],
      where: { isActive: true },
    });
    const students = await Student.findAll({
      where: { isActive: true },
    });

    console.log(`Found ${projects.length} projects and ${students.length} students\n`);

    // Create debug output
    let debugOutput = '=== RAW PROJECT DATA ===\n\n';
    
    projects.forEach((project, index) => {
      debugOutput += `PROJECT ${index + 1}:\n`;
      debugOutput += `  ID: ${JSON.stringify(project.id)}\n`;
      debugOutput += `  Title: ${JSON.stringify(project.title)}\n`;
      debugOutput += `  Description: ${JSON.stringify(project.description)}\n`;
      debugOutput += `  Genre: ${JSON.stringify(project.genre)}\n`;
      debugOutput += `  Duration: ${JSON.stringify(project.duration)}\n`;
      debugOutput += `  Status: ${JSON.stringify(project.status)}\n`;
      debugOutput += `  Student ID: ${JSON.stringify(project.student?.studentId)}\n`;
      debugOutput += `  Student Name: ${JSON.stringify(project.student ? `${project.student.firstName} ${project.student.lastName}` : '')}\n`;
      debugOutput += `  Supervising Producer: ${JSON.stringify(project.supervisingProducer)}\n`;
      debugOutput += `  Director: ${JSON.stringify(project.director)}\n`;
      debugOutput += `  Editor: ${JSON.stringify(project.editor)}\n`;
      debugOutput += `  Shoot Date: ${JSON.stringify(project.shootDate)} -> ${JSON.stringify(project.shootDate ? String(project.shootDate).split('T')[0] : '')}\n`;
      debugOutput += `  Grade Date: ${JSON.stringify(project.gradeDate)} -> ${JSON.stringify(project.gradeDate ? String(project.gradeDate).split('T')[0] : '')}\n`;
      debugOutput += `  Mix Date: ${JSON.stringify(project.mixDate)} -> ${JSON.stringify(project.mixDate ? String(project.mixDate).split('T')[0] : '')}\n`;
      debugOutput += `  Final Delivery Date: ${JSON.stringify(project.finalDeliveryDate)} -> ${JSON.stringify(project.finalDeliveryDate ? String(project.finalDeliveryDate).split('T')[0] : '')}\n`;
      debugOutput += `  Notes: ${JSON.stringify(project.notes)}\n`;
      debugOutput += `  Created At: ${JSON.stringify(project.createdAt)}\n`;
      debugOutput += `  Updated At: ${JSON.stringify(project.updatedAt)}\n`;
      debugOutput += '\n';
    });

    debugOutput += '\n=== RAW STUDENT DATA ===\n\n';
    
    students.forEach((student, index) => {
      debugOutput += `STUDENT ${index + 1}:\n`;
      debugOutput += `  ID: ${JSON.stringify(student.id)}\n`;
      debugOutput += `  Student ID: ${JSON.stringify(student.studentId)}\n`;
      debugOutput += `  First Name: ${JSON.stringify(student.firstName)}\n`;
      debugOutput += `  Last Name: ${JSON.stringify(student.lastName)}\n`;
      debugOutput += `  Email: ${JSON.stringify(student.email)}\n`;
      debugOutput += `  Phone: ${JSON.stringify(student.phone)}\n`;
      debugOutput += `  Year: ${JSON.stringify(student.year)}\n`;
      debugOutput += `  Program: ${JSON.stringify(student.program)}\n`;
      debugOutput += `  Is Active: ${JSON.stringify(student.isActive)}\n`;
      debugOutput += `  Notes: ${JSON.stringify(student.notes)}\n`;
      debugOutput += `  Created At: ${JSON.stringify(student.createdAt)}\n`;
      debugOutput += `  Updated At: ${JSON.stringify(student.updatedAt)}\n`;
      debugOutput += '\n';
    });

    // Now show the processed data (what goes into Excel)
    debugOutput += '\n=== PROCESSED DATA FOR EXCEL ===\n\n';
    
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

    debugOutput += 'PROCESSED PROJECTS DATA:\n';
    debugOutput += JSON.stringify(projectsData, null, 2);
    debugOutput += '\n\n';

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

    debugOutput += 'PROCESSED STUDENTS DATA:\n';
    debugOutput += JSON.stringify(studentsData, null, 2);

    // Write to file
    fs.writeFileSync('backups/debug_export_data.txt', debugOutput);
    console.log('✅ Debug data written to: backups/debug_export_data.txt');
    
    // Look for potential issues
    console.log('\n🔍 LOOKING FOR POTENTIAL ISSUES:');
    
    let issues = [];
    
    projects.forEach((project, index) => {
      // Check for null values that might cause issues
      if (project.shootDate === null) issues.push(`Project ${index + 1}: shootDate is null`);
      if (project.description && project.description.includes('\n')) issues.push(`Project ${index + 1}: description contains newlines`);
      if (project.notes && project.notes.includes('\n')) issues.push(`Project ${index + 1}: notes contains newlines`);
      
      // Check for weird characters
      const fields = [project.title, project.description, project.genre, project.status, project.notes];
      fields.forEach((field, fieldIndex) => {
        if (field && typeof field === 'string') {
          if (field.includes('\u0000')) issues.push(`Project ${index + 1}: field ${fieldIndex} contains null character`);
          if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(field)) issues.push(`Project ${index + 1}: field ${fieldIndex} contains control characters`);
        }
      });
    });

    if (issues.length > 0) {
      console.log('❌ POTENTIAL ISSUES FOUND:');
      issues.forEach(issue => console.log(`  - ${issue}`));
    } else {
      console.log('✅ No obvious issues found in the data');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugExportData();