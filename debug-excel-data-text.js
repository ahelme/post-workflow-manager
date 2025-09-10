const { Project, Student } = require('./server/models');
const fs = require('fs');

async function dumpExcelDataToText() {
  console.log('🔍 Dumping EXACT Excel data to plain text...\n');
  
  try {
    // Get the EXACT same data that goes into Excel
    const projects = await Project.findAll({
      include: [{ model: Student, as: 'student' }],
      where: { isActive: true },
    });
    const students = await Student.findAll({
      where: { isActive: true },
    });

    // Create the EXACT same data transformation as Excel export
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
    }));
    
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

    // Create detailed text dump
    let output = '=== EXACT EXCEL EXPORT DATA INSPECTION ===\n\n';
    
    output += '=== PROJECTS DATA FOR EXCEL ===\n\n';
    projectsData.forEach((project, index) => {
      output += `PROJECT ${index + 1}:\n`;
      Object.keys(project).forEach(key => {
        const value = project[key];
        const valueType = typeof value;
        const valueLength = String(value).length;
        const hasSpecialChars = /[^\w\s\-.,@()]/.test(String(value));
        const hasColons = String(value).includes(':');
        const hasNewlines = String(value).includes('\n') || String(value).includes('\r');
        const hasQuotes = String(value).includes('"');
        const hasCommas = String(value).includes(',');
        
        output += `  ${key}: ${JSON.stringify(value)}\n`;
        output += `    Type: ${valueType}, Length: ${valueLength}\n`;
        output += `    Has colons: ${hasColons}, Has newlines: ${hasNewlines}\n`;
        output += `    Has quotes: ${hasQuotes}, Has commas: ${hasCommas}\n`;
        output += `    Has special chars: ${hasSpecialChars}\n`;
        
        // Show raw bytes for short values
        if (valueLength < 100 && value) {
          const bytes = Buffer.from(String(value), 'utf8');
          output += `    Bytes: [${Array.from(bytes).join(', ')}]\n`;
        }
        output += '\n';
      });
      output += '---\n\n';
    });
    
    output += '\n=== STUDENTS DATA FOR EXCEL ===\n\n';
    studentsData.forEach((student, index) => {
      output += `STUDENT ${index + 1}:\n`;
      Object.keys(student).forEach(key => {
        const value = student[key];
        const valueType = typeof value;
        const valueLength = String(value).length;
        const hasSpecialChars = /[^\w\s\-.,@()]/.test(String(value));
        const hasColons = String(value).includes(':');
        const hasNewlines = String(value).includes('\n') || String(value).includes('\r');
        
        output += `  ${key}: ${JSON.stringify(value)}\n`;
        output += `    Type: ${valueType}, Length: ${valueLength}\n`;
        output += `    Has colons: ${hasColons}, Has newlines: ${hasNewlines}\n`;
        output += `    Has special chars: ${hasSpecialChars}\n`;
        
        if (valueLength < 100 && value) {
          const bytes = Buffer.from(String(value), 'utf8');
          output += `    Bytes: [${Array.from(bytes).join(', ')}]\n`;
        }
        output += '\n';
      });
      output += '---\n\n';
    });
    
    // Write to text file
    fs.writeFileSync('backups/excel_data_inspection.txt', output);
    console.log('✅ Excel data inspection written to: backups/excel_data_inspection.txt');
    
    // Also create simple CSV version for comparison
    let csvOutput = 'PROJECTS CSV FORMAT:\n\n';
    
    // Headers
    const projectHeaders = Object.keys(projectsData[0] || {});
    csvOutput += projectHeaders.join(',') + '\n';
    
    // Data rows  
    projectsData.forEach(project => {
      const row = projectHeaders.map(header => {
        const value = project[header];
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvOutput += row.join(',') + '\n';
    });
    
    csvOutput += '\n\nSTUDENTS CSV FORMAT:\n\n';
    const studentHeaders = Object.keys(studentsData[0] || {});
    csvOutput += studentHeaders.join(',') + '\n';
    
    studentsData.forEach(student => {
      const row = studentHeaders.map(header => {
        const value = student[header];
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvOutput += row.join(',') + '\n';
    });
    
    fs.writeFileSync('backups/excel_data_as_csv.txt', csvOutput);
    console.log('✅ CSV format written to: backups/excel_data_as_csv.txt');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

dumpExcelDataToText();