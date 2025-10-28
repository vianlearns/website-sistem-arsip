# Backend - Sistem Arsip Digital Universitas Dinus

Backend API untuk sistem manajemen arsip digital yang dibangun dengan Node.js dan Express.js.

## 🏗️ Arsitektur

### Teknologi Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL dengan mysql2
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Security**: bcryptjs untuk hashing password
- **Environment**: dotenv untuk konfigurasi

### Struktur Direktori
```
backend/
├── config/
│   └── database.js          # Konfigurasi koneksi database MySQL
├── controllers/
│   ├── archive.controller.js    # Logika bisnis untuk arsip
│   ├── auth.controller.js       # Autentikasi dan otorisasi
│   ├── letter.controller.js     # Manajemen surat
│   └── staticField.controller.js # Data master (kategori, lokasi, dll)
├── middleware/
│   ├── auth.middleware.js       # Middleware autentikasi JWT
│   └── upload.middleware.js     # Middleware upload file
├── routes/
│   ├── index.js                 # Router utama
│   ├── archive.routes.js        # Routes untuk arsip
│   ├── auth.routes.js           # Routes untuk autentikasi
│   ├── letter.routes.js         # Routes untuk surat
│   └── staticField.routes.js    # Routes untuk data master
├── uploads/                     # Direktori penyimpanan file upload
├── server.js                    # Entry point aplikasi
└── package.json                 # Dependencies dan scripts
```

## 🔧 Fitur Utama

### 1. Manajemen Arsip
- **GET /api/archives** - Mendapatkan daftar arsip dengan pagination, pencarian, dan filter
- **GET /api/archives/:id** - Mendapatkan detail arsip berdasarkan ID
- **POST /api/archives** - Membuat arsip baru (Admin only)
- **PUT /api/archives/:id** - Mengupdate arsip (Admin only)
- **DELETE /api/archives/:id** - Menghapus arsip (Admin only)

### 2. Autentikasi & Otorisasi
- **POST /api/auth/login** - Login dengan username/password
- **JWT Token** - Sistem autentikasi berbasis token
- **Role-based Access** - Pembedaan akses admin dan user biasa

### 3. Manajemen Surat
- **CRUD Operations** - Create, Read, Update, Delete untuk surat
- **Status Tracking** - Pelacakan status surat
- **Detail Management** - Manajemen detail surat

### 4. Data Master (Static Fields)
- **Categories** - Manajemen kategori arsip
- **Subcategories** - Manajemen subkategori
- **Locations** - Manajemen lokasi penyimpanan
- **Cabinets** - Manajemen lemari arsip
- **Shelves** - Manajemen rak penyimpanan
- **Positions** - Manajemen posisi dalam rak
- **Education Levels** - Tingkat pendidikan
- **Faculties** - Fakultas
- **Programs** - Program studi

## 🔐 Sistem Keamanan

### Authentication Middleware
```javascript
// Verifikasi JWT Token
exports.verifyToken = async (req, res, next) => {
  // Validasi Bearer token dari header Authorization
  // Decode JWT dan set req.userId, req.isAdmin
}

// Verifikasi Admin Role
exports.verifyAdmin = (req, res, next) => {
  // Memastikan user memiliki role admin
}
```

### Route Protection
- **Public Routes**: GET archives, GET archive by ID
- **Admin Routes**: POST, PUT, DELETE operations (memerlukan verifyToken + verifyAdmin)

## 📊 Database Integration

### Connection Pool
```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

### Query Features
- **Pagination** - Limit dan offset untuk performa optimal
- **Search** - Full-text search pada title dan description
- **Filtering** - Filter berdasarkan kategori, lokasi, dll
- **Joins** - Relasi antar tabel untuk data lengkap
- **Location Hierarchy** - Struktur hierarki lokasi penyimpanan

## 🚀 Instalasi & Menjalankan

### Prerequisites
- Node.js (v14 atau lebih tinggi)
- MySQL Database
- npm atau yarn

### Environment Variables
Buat file `.env` dengan konfigurasi:
```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=arsip_udinus
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
PORT=5000
```

### Instalasi Dependencies
```bash
npm install
```

### Menjalankan Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server akan berjalan di `http://localhost:5000`

## 📁 File Upload

### Konfigurasi Multer
- **Destination**: `./uploads/`
- **Filename**: Timestamp + original filename
- **File Types**: Images (jpg, jpeg, png, gif)
- **Size Limit**: Sesuai konfigurasi

### Upload Endpoint
```javascript
// Upload file saat create/update archive
router.post('/', verifyToken, verifyAdmin, upload.single('image'), archiveController.createArchive);
```

## 🔄 API Response Format

### Success Response
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

### Error Response
```json
{
  "message": "Error description"
}
```

## 🛠️ Development

### Code Structure
- **Controllers** - Logika bisnis dan interaksi database
- **Routes** - Definisi endpoint dan middleware
- **Middleware** - Fungsi pembantu (auth, upload, dll)
- **Config** - Konfigurasi database dan environment

### Best Practices
- Async/await untuk operasi database
- Error handling yang konsisten
- Validasi input pada setiap endpoint
- Separation of concerns antar layer
- Environment-based configuration

## 📝 Logging & Monitoring

- Console logging untuk development
- Error tracking pada setiap controller
- Database query monitoring
- Authentication attempt logging

---

**Catatan**: Pastikan database MySQL sudah disetup dengan schema yang sesuai sebelum menjalankan aplikasi.