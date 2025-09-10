require('dotenv').config();
const { sequelize, User, Student, Project } = require('../models');

async function seedDatabase() {
  try {
    // Sync database and create tables
    await sequelize.sync({ force: true });
    console.log('Database synced successfully');

    // Create default admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@filmschool.edu',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });
    console.log('Admin user created');

    // Create producer user
    const producerUser = await User.create({
      username: 'producer1',
      email: 'producer@filmschool.edu',
      password: 'producer123',
      firstName: 'Jane',
      lastName: 'Producer',
      role: 'producer',
    });
    console.log('Producer user created');

    // Create sample students
    const students = await Student.bulkCreate([
      {
        studentId: 'FS001',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@student.filmschool.edu',
        phone: '555-0101',
        year: 3,
        program: 'Film Production',
      },
      {
        studentId: 'FS002',
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob.smith@student.filmschool.edu',
        phone: '555-0102',
        year: 2,
        program: 'Cinematography',
      },
      {
        studentId: 'FS003',
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie.brown@student.filmschool.edu',
        phone: '555-0103',
        year: 4,
        program: 'Film Editing',
      },
      {
        studentId: 'FS004',
        firstName: 'Diana',
        lastName: 'Wilson',
        email: 'diana.wilson@student.filmschool.edu',
        phone: '555-0104',
        year: 1,
        program: 'Sound Design',
      },
    ]);
    console.log('Sample students created');

    // Create sample projects
    const projects = await Project.bulkCreate([
      {
        title: 'The Silent Echo',
        description: 'A psychological thriller about memory and identity',
        genre: 'Thriller',
        duration: 15,
        status: 'post-production',
        studentId: students[0].id,
        shootDate: '2024-08-15',
        gradeDate: '2024-09-01',
        mixDate: '2024-09-15',
        rushesDeliveryDate: '2024-08-20',
        finalDeliveryDate: '2024-09-30',
        supervisingProducer: 'Jane Producer',
        director: 'Alice Johnson',
        editor: 'Alice Johnson',
        soundEngineer: 'TBD',
        cameraEquipment: 'Canon C300 Mark III',
        editingSuite: 'Suite A - Avid',
        notes: 'Student\'s thesis project. Requires color correction and sound mix.',
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      },
      {
        title: 'Urban Rhythms',
        description: 'A documentary exploring street art culture',
        genre: 'Documentary',
        duration: 25,
        status: 'shooting',
        studentId: students[1].id,
        shootDate: '2024-09-01',
        rushesDeliveryDate: '2024-09-10',
        finalDeliveryDate: '2024-10-15',
        supervisingProducer: 'Jane Producer',
        director: 'Bob Smith',
        editor: 'TBD',
        soundEngineer: 'TBD',
        cameraEquipment: 'Sony FX6',
        editingSuite: 'TBD',
        notes: 'Documentary in progress. Multiple shooting locations.',
        createdBy: producerUser.id,
        updatedBy: producerUser.id,
      },
      {
        title: 'Midnight Coffee',
        description: 'A romantic comedy set in a 24-hour diner',
        genre: 'Comedy',
        duration: 12,
        status: 'complete',
        studentId: students[2].id,
        shootDate: '2024-07-01',
        gradeDate: '2024-07-20',
        mixDate: '2024-08-01',
        rushesDeliveryDate: '2024-07-05',
        finalDeliveryDate: '2024-08-10',
        reviewDate: '2024-08-15',
        screeningDate: '2024-08-20',
        supervisingProducer: 'Jane Producer',
        director: 'Charlie Brown',
        editor: 'Charlie Brown',
        soundEngineer: 'Diana Wilson',
        cameraEquipment: 'ARRI Alexa Mini',
        editingSuite: 'Suite B - Premiere',
        notes: 'Completed project. Well received at screening.',
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      },
      {
        title: 'The Last Frame',
        description: 'Experimental short about the end of film photography',
        genre: 'Experimental',
        duration: 8,
        status: 'grading',
        studentId: students[3].id,
        shootDate: '2024-08-25',
        gradeDate: '2024-09-10',
        mixDate: '2024-09-20',
        rushesDeliveryDate: '2024-08-30',
        finalDeliveryDate: '2024-09-25',
        supervisingProducer: 'Jane Producer',
        director: 'Diana Wilson',
        editor: 'Charlie Brown',
        soundEngineer: 'Diana Wilson',
        cameraEquipment: '16mm Film Camera + Canon C70',
        editingSuite: 'Suite C - DaVinci',
        notes: 'Mixed media project combining film and digital. Currently in color grading.',
        createdBy: producerUser.id,
        updatedBy: producerUser.id,
      },
    ]);
    console.log('Sample projects created');

    console.log('\n=== SEED DATA SUMMARY ===');
    console.log('Users created: 2');
    console.log('Students created: 4');
    console.log('Projects created: 4');
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Admin: admin@filmschool.edu / admin123');
    console.log('Producer: producer@filmschool.edu / producer123');
    console.log('\nDatabase seeding completed successfully!');

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;