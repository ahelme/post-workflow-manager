const XLSX = require('xlsx');
const path = require('path');

// Create sample Excel file with proper format
const wb = XLSX.utils.book_new();

// Sample Projects worksheet with proper headers and sample data
const projectsData = [
  {
    'Title': 'My First Film',
    'Description': 'A short documentary about film school life',
    'Genre': 'Documentary',
    'Duration (min)': '15',
    'Status': 'pre-production',
    'Student ID': 'FS001',
    'Supervising Producer': 'Jane Smith',
    'Director': 'John Doe',
    'Editor': 'Mike Wilson',
    'Sound Engineer': 'Sarah Brown',
    'Camera Equipment': 'Canon EOS R5',
    'Editing Suite': 'Avid Suite A',
    'Shoot Date': '2025-01-15',
    'Grade Date': '2025-02-01',
    'Mix Date': '2025-02-05',
    'Rushes Delivery Date': '2025-01-18',
    'Final Delivery Date': '2025-02-10',
    'Review Date': '2025-02-08',
    'Screening Date': '2025-02-15',
    'Notes': 'First student project, needs extra guidance'
  },
  {
    'Title': 'Urban Stories',
    'Description': 'Narrative film about city life',
    'Genre': 'Drama',
    'Duration (min)': '20',
    'Status': 'shooting',
    'Student ID': 'FS002', 
    'Supervising Producer': 'Tom Johnson',
    'Director': 'Emily Davis',
    'Editor': 'Chris Lee',
    'Sound Engineer': 'Alex Taylor',
    'Camera Equipment': 'Sony FX6',
    'Editing Suite': 'Premiere Suite B',
    'Shoot Date': '2025-01-20',
    'Grade Date': '2025-02-15',
    'Mix Date': '2025-02-20',
    'Rushes Delivery Date': '2025-01-23',
    'Final Delivery Date': '2025-02-25',
    'Review Date': '2025-02-22',
    'Screening Date': '2025-03-01',
    'Notes': 'Complex narrative structure, monitor progress closely'
  }
];

const projectsWs = XLSX.utils.json_to_sheet(projectsData);
XLSX.utils.book_append_sheet(wb, projectsWs, 'Projects');

// Sample Students worksheet with proper headers and sample data
const studentsData = [
  {
    'Student ID': 'FS001',
    'First Name': 'John',
    'Last Name': 'Doe',
    'Email': 'john.doe@filmschool.edu',
    'Phone': '(555) 123-4567',
    'Year': 2,
    'Program': 'Film Production',
    'Status': 'Active',
    'Notes': 'Talented director, shows great potential'
  },
  {
    'Student ID': 'FS002',
    'First Name': 'Emily',
    'Last Name': 'Davis',
    'Email': 'emily.davis@filmschool.edu',
    'Phone': '(555) 234-5678',
    'Year': 3,
    'Program': 'Cinematography',
    'Status': 'Active',
    'Notes': 'Excellent technical skills'
  },
  {
    'Student ID': 'FS003',
    'First Name': 'Michael',
    'Last Name': 'Wilson',
    'Email': 'mike.wilson@filmschool.edu',
    'Phone': '(555) 345-6789',
    'Year': 1,
    'Program': 'Film Editing',
    'Status': 'Active',
    'Notes': 'New student, eager to learn'
  }
];

const studentsWs = XLSX.utils.json_to_sheet(studentsData);
XLSX.utils.book_append_sheet(wb, studentsWs, 'Students');

// Write the sample file
const filePath = path.join(__dirname, 'Import_Sample.xlsx');
XLSX.writeFile(wb, filePath);

console.log('Sample Excel file created:', filePath);