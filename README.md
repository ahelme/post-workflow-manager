# PostFlow
PostFlow v1.0.2b

A comprehensive web application designed to streamline post-production workflow management for film schools. PostFlow replaces Excel-based tracking with a modern, user-friendly interface that handles project lifecycle from initial shoot planning through final delivery.

## Features

- **Project Management**: Complete lifecycle tracking from development through delivery
- **Student & Team Management**: Student profiles with project associations
- **Workflow-Aware Navigation**: Status-based filtering with workflow-specific date columns
- **Excel Integration**: Full import/export functionality with data validation
- **Admin Tools**: Database reset with backup creation and double confirmation
- **Modern UI**: Yellow-themed, icon-free minimal design optimized for data density
- **Role-Based Access**: Admin, producer, and student permission levels
- **Automated Backups**: Daily backups with 30-day retention and multiple formats

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite with Sequelize ORM
- **Frontend**: React.js with TailwindCSS
- **Authentication**: JWT tokens
- **Security**: Helmet, rate limiting, input validation

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   cd client && npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your JWT_SECRET and database path
   ```

3. **Initialize database with sample data**:
   ```bash
   node server/scripts/seed.js
   ```

4. **Start development servers**:
   ```bash
   # Terminal 1 - Backend server
   npm start
   
   # Terminal 2 - Frontend React app  
   cd client && npm start
   ```

The API server will run on http://localhost:3001 and the React app on http://localhost:3000.

## Default Login Credentials

After seeding the database, you can log in with:

- **Admin**: `admin@filmschool.edu` / `admin123`
- **Producer**: `producer@filmschool.edu` / `producer123`

**Admin users** have access to:
- Database reset functionality with automatic backup creation
- All producer and student features
- System administration tools

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

### Admin (Admin-only endpoints)
- `POST /api/admin/backup` - Create SQL backup before reset
- `POST /api/admin/reset-database` - Reset all user data (preserves admin accounts)
- `GET /api/admin/system-info` - System statistics and information

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

## Current Status: Version 1.0.2 - UI Refinement Release

PostFlow **Version 1.0.2** delivers refined UI improvements for better data density and visual consistency:

### ✅ **Version 1.0.2: UI Polish & Refinement**
- **Typography Consistency**: Website title sizing aligned with page titles
- **Improved Data Density**: Reduced container padding (`py-2`) for more content visibility
- **Card Components**: Optimized padding for better information architecture
- **Professional Layout**: Tighter, more compact design without sacrificing readability
- **Visual Consistency**: Unified spacing standards across all interface elements

### ✅ **Phase 4: Admin Systems & Database Management** 
- **Database Reset**: Safe reset functionality preserving admin accounts
- **Automatic Backups**: SQL backups created before any destructive operations
- **Double Confirmation**: User-friendly safety dialogs prevent accidental resets
- **Transaction Safety**: Database rollbacks prevent data corruption
- **Audit Logging**: Complete tracking of all administrative actions

### ✅ **Previous Phases Complete**
- **Phase 1**: Core backend infrastructure and authentication
- **Phase 2**: Complete project and student management with Excel integration
- **Phase 3**: Yellow UI theme, icon-free design, workflow-aware navigation

## Backup System

- **Automated**: Daily backups with 30-day retention
- **Manual**: On-demand backup creation through admin interface  
- **Multiple Formats**: JSON, CSV, SQL, Excel with validation
- **Import/Export**: Full Excel integration with error handling
- **Database Reset**: Admin tools with automatic backup creation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details
