# DINUS Archive - Digital Archive Management System

A comprehensive digital archive management system for Universitas Dinus (Dian Nuswantoro University) built with modern web technologies.

## 🏗️ System Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **UI Framework**: Shadcn/ui + Tailwind CSS
- **File Upload**: Multer middleware

### Project Structure
```
dinus-archive/
├── frontend/                    # React TypeScript application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Application pages
│   │   ├── contexts/            # React Context providers
│   │   ├── services/            # API service layer
│   │   └── types/               # TypeScript type definitions
│   └── package.json
├── backend/                     # Express.js API server
│   ├── controllers/             # Business logic controllers
│   ├── routes/                  # API route definitions
│   ├── middleware/              # Authentication & upload middleware
│   ├── config/                  # Database configuration
│   └── package.json
├── arsip_udinus.sql            # Optimized database schema
├── README.md                   # Indonesian documentation
└── README_en.md               # English documentation
```

## 🚀 Features

### 📚 Archive Management
- **Digital Archive Storage** - Comprehensive archive management with metadata
- **Advanced Search** - Real-time search with multiple filter options
- **Category Organization** - Hierarchical categorization system
- **Location Tracking** - Physical location management (cabinets, shelves, positions)
- **Image Upload** - Archive image storage and preview
- **Pagination** - Efficient data loading with pagination

### 🔐 Authentication & Authorization
- **Admin Authentication** - Secure login system with JWT tokens
- **Role-based Access Control** - Different access levels for admin and users
- **Protected Routes** - Route protection based on authentication status
- **Session Management** - Automatic token refresh and logout

### 📄 Document Management
- **Letter Management** - Complete CRUD operations for letters
- **Status Tracking** - Document status monitoring
- **Detail Management** - Comprehensive document details
- **Search & Filter** - Advanced search capabilities

### 🏛️ Master Data Management
- **Categories & Subcategories** - Archive classification system
- **Location Hierarchy** - Physical storage location management
- **Education Levels** - Academic level categorization
- **Faculties & Programs** - University organizational structure
- **User Management** - Admin user management

## 🎨 User Interface

### Design System
- **Modern UI** - Clean and intuitive interface design
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Accessibility** - WCAG compliant components
- **Dark/Light Mode** - Theme switching capability
- **Loading States** - Skeleton loading and progress indicators
- **Error Handling** - User-friendly error messages and fallbacks

### Key Components
- **Dashboard** - Main archive overview with search and filters
- **Archive Cards** - Visual representation of archive items
- **Filter Panel** - Advanced filtering options
- **Admin Panel** - Administrative interface for data management
- **Form Components** - Validated forms for data entry

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL Database
- npm or yarn package manager

### Database Setup
1. Import the optimized database schema:
```sql
mysql -u username -p database_name < arsip_udinus.sql
```

2. Configure database connection in backend `.env` file

### Backend Setup
```bash
cd backend
npm install

# Create .env file with configuration
cp .env.example .env

# Start development server
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install

# Start development server
npm run dev
```

### Environment Configuration

#### Backend (.env)
```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=arsip_udinus
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
PORT=5000
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_TITLE=DINUS Archive System
```

## 📊 Database Schema

### Core Tables
- **archives** - Main archive records with metadata
- **categories** - Archive categories
- **subcategories** - Archive subcategories
- **locations** - Physical storage locations
- **cabinets** - Storage cabinets
- **shelves** - Storage shelves
- **positions** - Specific positions within shelves

### Supporting Tables
- **admin** - Administrative users
- **letters** - Letter management
- **letter_details** - Letter detail information
- **letter_status_history** - Letter status tracking
- **education_levels** - Academic levels
- **faculties** - University faculties
- **programs** - Study programs

### Key Features
- **Optimized Schema** - Efficient database design with proper indexing
- **Foreign Key Constraints** - Data integrity enforcement
- **Full-text Search** - Search optimization for archive content
- **Sample Data** - Pre-populated data for testing and development

## 🌐 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - Admin login
- `GET /api/auth/profile` - Get current user profile

### Archive Endpoints
- `GET /api/archives` - Get archives with pagination and filters
- `GET /api/archives/:id` - Get specific archive details
- `POST /api/archives` - Create new archive (Admin only)
- `PUT /api/archives/:id` - Update archive (Admin only)
- `DELETE /api/archives/:id` - Delete archive (Admin only)

### Master Data Endpoints
- `GET /api/categories` - Get all categories
- `GET /api/subcategories` - Get subcategories
- `GET /api/locations` - Get locations
- `GET /api/cabinets` - Get cabinets
- `GET /api/shelves` - Get shelves
- `GET /api/positions` - Get positions

### Response Format
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "total_pages": 10
  }
}
```

## 🔒 Security Features

### Authentication Security
- **JWT Token Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt password encryption
- **Token Expiration** - Automatic token expiration and refresh
- **Route Protection** - Middleware-based route protection

### Data Security
- **Input Validation** - Comprehensive input validation
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Output sanitization
- **File Upload Security** - Secure file upload handling

## 📱 Mobile Responsiveness

### Responsive Features
- **Mobile-first Design** - Optimized for mobile devices
- **Touch-friendly Interface** - Large touch targets and gestures
- **Adaptive Layout** - Flexible grid system
- **Performance Optimization** - Optimized for mobile networks

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 Deployment

### Production Build
```bash
# Frontend build
cd frontend
npm run build

# Backend preparation
cd backend
npm install --production
```

### Deployment Options
- **Static Hosting** - Vercel, Netlify for frontend
- **VPS/Cloud** - DigitalOcean, AWS, Google Cloud
- **Docker** - Containerized deployment
- **Traditional Hosting** - Apache, Nginx

### Performance Optimizations
- **Code Splitting** - Lazy loading for optimal performance
- **Image Optimization** - Compressed and optimized images
- **Caching** - Browser and server-side caching
- **CDN Integration** - Content delivery network support

## 🧪 Testing

### Testing Strategy
- **Unit Tests** - Component and function testing
- **Integration Tests** - API endpoint testing
- **E2E Tests** - End-to-end user flow testing
- **Type Safety** - TypeScript compile-time validation

### Quality Assurance
- **Code Linting** - ESLint and Prettier
- **Type Checking** - TypeScript strict mode
- **Performance Monitoring** - Bundle size analysis
- **Security Scanning** - Dependency vulnerability checks

## 📈 Performance Metrics

### Frontend Performance
- **Bundle Size** - Optimized for fast loading
- **First Contentful Paint** - < 2 seconds
- **Time to Interactive** - < 3 seconds
- **Lighthouse Score** - 90+ performance score

### Backend Performance
- **Response Time** - < 200ms average
- **Database Queries** - Optimized with proper indexing
- **Memory Usage** - Efficient memory management
- **Concurrent Users** - Supports multiple simultaneous users

## 🤝 Contributing

### Development Guidelines
- Follow TypeScript best practices
- Use consistent code formatting (Prettier)
- Write comprehensive tests
- Document new features
- Follow Git commit conventions

### Code Style
- **TypeScript** - Strict type checking
- **ESLint** - Code quality enforcement
- **Prettier** - Consistent code formatting
- **Conventional Commits** - Standardized commit messages

## 📞 Support

For technical support or questions about the DINUS Archive system:

- **Documentation**: Check README files in respective directories
- **Issues**: Report bugs or feature requests via project issues
- **Development**: Follow the development guidelines for contributions

---

**Note**: Ensure all prerequisites are installed and configured before running the application. The system requires both frontend and backend services to be running simultaneously for full functionality.