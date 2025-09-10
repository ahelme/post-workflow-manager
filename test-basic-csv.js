const fs = require('fs');

// Create the most basic CSV possible for testing
const basicCsv = `Title,Status,Duration
The Silent Echo,post-production,15
Urban Rhythms,shooting,25
Midnight Coffee,complete,12`;

// Test different file formats
fs.writeFileSync('backups/test_basic.csv', basicCsv);
fs.writeFileSync('backups/test_basic_crlf.csv', basicCsv.replace(/\n/g, '\r\n'));
fs.writeFileSync('backups/test_basic.tsv', basicCsv.replace(/,/g, '\t'));

console.log('Created test files:');
console.log('1. test_basic.csv (Unix line endings)');  
console.log('2. test_basic_crlf.csv (Windows line endings)');
console.log('3. test_basic.tsv (Tab separated)');
console.log('\nTry opening each in Excel to see which works best!');

// Show the content
console.log('\nCSV content:');
console.log(basicCsv);