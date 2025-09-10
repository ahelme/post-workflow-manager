# PostFlow

A comprehensive web application designed to streamline post-production workflow management for film schools. PostFlow replaces Excel-based tracking with a modern, user-friendly interface that handles project lifecycle from initial shoot planning through final delivery.

## Features

- **Project Management**: Track titles, descriptions, genres, and durations
- **Student & Team Management**: Store student details, IDs, and production team information
- **Date Tracking**: Monitor critical dates including shoot, grade, mix, and delivery dates
- **Status Management**: Visual project status indicators and progress tracking
- **Automated Backups**: Configurable backup schedules (daily, weekly, monthly)
- **User Authentication**: Role-based access (admin, student, producer)
- **Reporting**: Export data to PDF and CSV formats
- **Search & Filter**: Advanced filtering by student, status, dates, and more

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite with Sequelize ORM
- **Frontend**: React.js (to be added)
- **Authentication**: JWT tokens
- **Security**: Helmet, rate limiting, input validation

## Quick Start

1. **Install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

The API server will run on http://localhost:3001 and the React app on http://localhost:3000.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get specific project
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Students
- `GET /api/students` - List all students
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Backups
- `POST /api/backup/create` - Create manual backup
- `GET /api/backup/list` - List available backups
- `POST /api/backup/restore` - Restore from backup

## Database Schema

The application uses SQLite with the following main tables:
- **Users**: Authentication and role management
- **Projects**: Core project information
- **Students**: Student details and contact information
- **ProjectTeam**: Production team assignments
- **ProjectDates**: Critical dates tracking
- **BackupLogs**: Backup history and status

## Deployment

For production deployment:

1. Set `NODE_ENV=production` in your `.env` file
2. Build the React app: `npm run build`
3. Start the server: `npm start`

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- Secure headers with Helmet
- CORS configuration

## Backup System

The application includes an automated backup system with:
- Configurable schedules (daily, weekly, monthly)
- Multiple export formats (JSON, CSV, SQL)
- Backup retention policies
- Email notifications for backup status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details