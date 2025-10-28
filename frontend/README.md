# Frontend - Sistem Arsip Digital Universitas Dinus

Frontend aplikasi sistem manajemen arsip digital yang dibangun dengan React TypeScript dan Vite.

## 🏗️ Arsitektur

### Teknologi Stack
- **Framework**: React 18 dengan TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn/ui (Radix UI + Tailwind CSS)
- **Routing**: React Router DOM v6
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Struktur Direktori
```
frontend/
├── public/                      # Static assets
├── src/
│   ├── components/
│   │   ├── ui/                  # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   ├── ArchiveCard.tsx      # Komponen kartu arsip
│   │   ├── ArchiveForm.tsx      # Form create/edit arsip
│   │   ├── FilterPanel.tsx      # Panel filter dan pencarian
│   │   ├── Navbar.tsx           # Navigation bar
│   │   └── Pagination.tsx       # Komponen pagination
│   ├── contexts/
│   │   └── AuthContext.tsx      # Context untuk autentikasi
│   ├── pages/
│   │   ├── Dashboard.tsx        # Halaman utama arsip
│   │   ├── Login.tsx            # Halaman login admin
│   │   ├── AdminPanel.tsx       # Panel administrasi
│   │   └── SuratPage.tsx        # Halaman manajemen surat
│   ├── services/
│   │   ├── archive.service.ts   # Service untuk API arsip
│   │   ├── auth.service.ts      # Service untuk autentikasi
│   │   └── api.service.ts       # Base API service
│   ├── types/
│   │   ├── archive.types.ts     # Type definitions untuk arsip
│   │   ├── auth.types.ts        # Type definitions untuk auth
│   │   └── api.types.ts         # Type definitions untuk API
│   ├── utils/
│   │   └── helpers.ts           # Utility functions
│   ├── App.tsx                  # Root component dengan routing
│   ├── main.tsx                 # Entry point aplikasi
│   └── index.css                # Global styles
├── index.html                   # HTML template
├── package.json                 # Dependencies dan scripts
├── tailwind.config.js           # Konfigurasi Tailwind CSS
├── tsconfig.json                # Konfigurasi TypeScript
└── vite.config.ts               # Konfigurasi Vite
```

## 🔧 Fitur Utama

### 1. Dashboard Arsip
- **Tampilan Grid/List** - Menampilkan arsip dalam format kartu
- **Pencarian Real-time** - Search berdasarkan judul dan deskripsi
- **Filter Advanced** - Filter berdasarkan kategori, subkategori, lokasi, dll
- **Pagination** - Navigasi halaman dengan kontrol jumlah item per halaman
- **Responsive Design** - Optimized untuk desktop dan mobile

### 2. Manajemen Arsip (Admin)
- **Create Archive** - Form untuk menambah arsip baru dengan upload gambar
- **Edit Archive** - Update data arsip existing
- **Delete Archive** - Hapus arsip dengan konfirmasi
- **Image Upload** - Upload dan preview gambar arsip
- **Form Validation** - Validasi input dengan feedback real-time

### 3. Autentikasi & Otorisasi
- **Login System** - Autentikasi admin dengan username/password
- **JWT Token Management** - Automatic token handling dan refresh
- **Protected Routes** - Route protection berdasarkan role
- **Skip Auth Option** - Development mode untuk bypass authentication
- **Auto Logout** - Logout otomatis saat token expired

### 4. Manajemen Surat
- **CRUD Operations** - Create, Read, Update, Delete surat
- **Status Tracking** - Pelacakan status surat
- **Search & Filter** - Pencarian dan filter surat
- **Detail View** - Tampilan detail surat

## 🎨 UI/UX Design

### Design System
- **Shadcn/ui Components** - Konsisten dan accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Dark/Light Mode** - Support untuk tema gelap dan terang
- **Responsive Grid** - Adaptive layout untuk berbagai screen size
- **Loading States** - Skeleton loading dan spinner indicators
- **Error Handling** - User-friendly error messages

### Component Architecture
```typescript
// Contoh struktur komponen
interface ArchiveCardProps {
  archive: Archive;
  onEdit?: (archive: Archive) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

const ArchiveCard: React.FC<ArchiveCardProps> = ({
  archive,
  onEdit,
  onDelete,
  isAdmin
}) => {
  // Component logic
};
```

## 🔐 State Management

### Auth Context
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  skipAuth: () => void;
}
```

### Local State Management
- **useState** - Component-level state
- **useEffect** - Side effects dan lifecycle
- **useContext** - Global state access
- **Custom Hooks** - Reusable stateful logic

## 🌐 API Integration

### Service Layer
```typescript
// archive.service.ts
export const archiveService = {
  getArchives: (params: GetArchivesParams) => Promise<ArchiveResponse>,
  getArchiveById: (id: string) => Promise<Archive>,
  createArchive: (data: CreateArchiveData) => Promise<Archive>,
  updateArchive: (id: string, data: UpdateArchiveData) => Promise<Archive>,
  deleteArchive: (id: string) => Promise<void>
};
```

### Error Handling
- **Try-Catch Blocks** - Comprehensive error catching
- **User Feedback** - Toast notifications untuk success/error
- **Retry Logic** - Automatic retry untuk failed requests
- **Fallback UI** - Graceful degradation saat error

## 🚀 Routing

### Route Structure
```typescript
// App.tsx routing setup
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/surat" element={<SuratPage />} />
  <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
  <Route path="/login" element={<Login />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### Protected Routes
- **ProtectedRoute Component** - Wrapper untuk route yang memerlukan auth
- **Role-based Access** - Pembedaan akses berdasarkan user role
- **Redirect Logic** - Auto redirect ke login jika tidak authenticated

## 🛠️ Development

### Prerequisites
- Node.js (v16 atau lebih tinggi)
- npm atau yarn
- Modern browser dengan ES6+ support

### Instalasi Dependencies
```bash
npm install
```

### Development Scripts
```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Build untuk production
npm run build

# Preview build
npm run preview

# Linting
npm run lint
```

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_TITLE=Sistem Arsip Digital UDINUS
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations
- Touch-friendly buttons dan inputs
- Swipe gestures untuk navigation
- Optimized image loading
- Compressed bundle size

## 🔍 Search & Filter

### Search Features
- **Real-time Search** - Instant search results
- **Debounced Input** - Optimized API calls
- **Search Highlighting** - Highlight matching terms
- **Search History** - Recent search suggestions

### Filter System
```typescript
interface FilterState {
  category: string;
  subcategory: string;
  location: string;
  cabinet: string;
  shelf: string;
  position: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}
```

## 📊 Performance

### Optimizations
- **Code Splitting** - Lazy loading untuk routes
- **Image Optimization** - Lazy loading dan compression
- **Bundle Analysis** - Monitoring bundle size
- **Memoization** - React.memo untuk expensive components
- **Virtual Scrolling** - Untuk large datasets

### Build Optimizations
- **Tree Shaking** - Remove unused code
- **Minification** - Compressed production build
- **Gzip Compression** - Server-side compression
- **CDN Ready** - Static asset optimization

## 🧪 Testing

### Testing Strategy
- **Unit Tests** - Component testing dengan Jest
- **Integration Tests** - API integration testing
- **E2E Tests** - End-to-end user flows
- **Type Safety** - TypeScript compile-time checks

### Testing Commands
```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Build Process
```bash
# Production build
npm run build

# Output directory: dist/
```

### Deployment Options
- **Static Hosting** - Vercel, Netlify, GitHub Pages
- **CDN Deployment** - CloudFront, CloudFlare
- **Docker Container** - Containerized deployment
- **Traditional Hosting** - Apache, Nginx

---

**Catatan**: Pastikan backend API sudah berjalan di `http://localhost:5000` sebelum menjalankan frontend development server.