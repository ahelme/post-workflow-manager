# System Patterns

## Architecture Patterns

### Full-Stack JavaScript Pattern
- **Backend**: Node.js + Express.js with RESTful API design
- **Database**: SQLite with Sequelize ORM for simplicity and portability
- **Frontend**: React.js with functional components and hooks
- **Styling**: TailwindCSS for consistent, responsive design
- **State Management**: React useState/useEffect for local state

### Security Pattern
- **Authentication**: JWT tokens with role-based access control
- **Password Security**: bcrypt hashing for password storage
- **API Protection**: Helmet for security headers, rate limiting
- **Input Validation**: Comprehensive validation on both client and server
- **File Upload Security**: Multer with file type and size restrictions

### Database Schema Patterns

#### Entity Relationships
- **Users**: Authentication and role management (admin, producer, student)
- **Projects**: Core entity with comprehensive production tracking
- **Students**: Separate entity linked to projects for contact management
- **BackupLogs**: Audit trail for all backup operations

#### Date Management Pattern
- Single date fields for major milestones (shootDate, gradeDate, mixDate, deliveryDate)
- ISO date format storage with frontend date picker components
- Nullable dates to handle flexible scheduling

## Code Patterns

### API Route Structure
```
/api/auth/* - Authentication endpoints
/api/projects/* - Project CRUD operations
/api/students/* - Student management
/api/backup/* - Backup and restore operations
```

### Error Handling Pattern
- Consistent error response format: `{ error: "message", details?: object }`
- HTTP status codes: 200 (success), 400 (validation), 401 (auth), 404 (not found), 500 (server)
- Try-catch blocks in all async route handlers
- Database transaction rollback on errors

### Frontend Component Pattern
- **Page Components**: Dashboard, Projects, Students, Backup (in src/pages/)
- **Shared Components**: Navigation, forms, modals
- **Styling**: Consistent TailwindCSS classes for buttons, forms, tables
- **State Management**: Local component state with API calls in useEffect

### Data Export/Import Pattern
- **Multiple Formats**: JSON, CSV, SQL, Excel (.xlsx)
- **Excel Integration**: xlsx library with proper formatting
- **File Validation**: Type checking, size limits, format validation
- **Smart Import Logic**: Update existing records, create new ones
- **Transaction Safety**: Database rollback on import failures

## Backup System Patterns

### Automated Backup Strategy
- **Schedule**: Daily automated backups at 2 AM
- **Retention**: 30-day automatic cleanup of old backups
- **Formats**: Multiple export formats for different use cases
- **Logging**: Comprehensive backup operation tracking

### Manual Backup Features
- **On-Demand**: Manual backup creation with format selection
- **Download Management**: Direct file downloads from backup interface
- **History Tracking**: Complete audit trail of backup operations

## Documentation Patterns

### File Structure
```
/
├── README.md (overview, quick start, API docs)
├── memory-bank/ (project context and progress)
├── client/src/ (React frontend)
├── server/ (Node.js backend)
├── uploads/ (temporary file storage)
└── backups/ (backup file storage)
```

### Commit Message Pattern
- "feat: description" for new features
- "fix: description" for bug fixes  
- "refactor: description" for code improvements
- "docs: description" for documentation updates

### Environment Configuration
- `.env` files for environment-specific settings
- `.env.example` as template for required variables
- Separate development/production configurations

## User Experience Patterns

### Navigation Pattern
- **Top Navigation**: Logo, main sections (Dashboard, Projects, Students, Backup)
- **Role-Based**: Menu items adjusted based on user permissions
- **Active States**: Clear indication of current page/section

### Form Patterns
- **Validation**: Client-side validation with server-side verification
- **Error Display**: Inline validation messages with red styling
- **Success Feedback**: Green success messages and redirects
- **Date Inputs**: Consistent date picker components

### Table/List Patterns
- **Responsive Tables**: Horizontal scroll on mobile devices
- **Action Buttons**: Edit/Delete buttons with consistent styling
- **Status Indicators**: Color-coded project status badges
- **Empty States**: Clear messaging when no data is available

## Performance Patterns

### Database Optimization
- **Eager Loading**: Include related data in queries to avoid N+1 problems
- **Indexing**: Primary keys and foreign key relationships
- **Connection Management**: Proper database connection handling

### File Handling
- **Temporary Storage**: Uploads folder for file processing
- **Cleanup**: Automatic removal of processed upload files
- **Size Limits**: Reasonable file size restrictions for imports

## Error Recovery Patterns

### Database Integrity
- **Transactions**: Wrap multi-step operations in database transactions
- **Validation**: Multiple layers of data validation
- **Rollback**: Automatic rollback on operation failures

### Excel Compatibility
- **Format Standardization**: ISO date formats, clean text data
- **Error Handling**: Graceful handling of Excel generation errors
- **Alternative Formats**: Fallback to CSV if Excel generation fails