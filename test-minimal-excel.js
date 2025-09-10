const XLSX = require('xlsx');

// Test with absolutely minimal hardcoded data
console.log('Testing minimal hardcoded data...');

const minimalData = [
  { Title: 'Test Project 1', Status: 'active', Duration: 10 },
  { Title: 'Test Project 2', Status: 'complete', Duration: 15 }
];

// Create workbook exactly like the working version
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(minimalData);
XLSX.utils.book_append_sheet(wb, ws, 'Projects');

// Write with no options
XLSX.writeFile(wb, 'backups/test_minimal_hardcoded.xlsx');
console.log('✅ Created: backups/test_minimal_hardcoded.xlsx');

// Now test with our actual database data but simplified
const { Project } = require('./server/models');

async function testRealDataSimplified() {
  console.log('\nTesting real data but simplified...');
  
  const projects = await Project.findAll({
    where: { isActive: true },
    limit: 2  // Just first 2 projects
  });
  
  // Super simple mapping - no student joins, minimal fields
  const simpleData = projects.map(project => ({
    ID: project.id,
    Title: project.title || 'No Title',
    Status: project.status || 'Unknown'
  }));
  
  console.log('Simple data:', JSON.stringify(simpleData, null, 2));
  
  const wb2 = XLSX.utils.book_new();
  const ws2 = XLSX.utils.json_to_sheet(simpleData);
  XLSX.utils.book_append_sheet(wb2, ws2, 'Projects');
  
  XLSX.writeFile(wb2, 'backups/test_real_data_simple.xlsx');
  console.log('✅ Created: backups/test_real_data_simple.xlsx');
  
  // Now test with slightly more fields
  const mediumData = projects.map(project => ({
    ID: project.id,
    Title: project.title || '',
    Description: project.description || '',
    Duration: project.duration || 0,
    Status: project.status || ''
  }));
  
  console.log('Medium data:', JSON.stringify(mediumData, null, 2));
  
  const wb3 = XLSX.utils.book_new();
  const ws3 = XLSX.utils.json_to_sheet(mediumData);
  XLSX.utils.book_append_sheet(wb3, ws3, 'Projects');
  
  XLSX.writeFile(wb3, 'backups/test_real_data_medium.xlsx');
  console.log('✅ Created: backups/test_real_data_medium.xlsx');
}

testRealDataSimplified().catch(console.error);