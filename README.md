# DINUS Archive - Sistem Manajemen Arsip Digital

Sistem manajemen arsip digital yang komprehensif untuk Universitas Dinus (Dian Nuswantoro) yang dibangun dengan teknologi web modern.

## 🏗️ Arsitektur Sistem

### Stack Teknologi
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **UI Framework**: Shadcn/ui + Tailwind CSS
- **File Upload**: Multer middleware

### Struktur Proyek
```
dinus-archive/
├── frontend/                    # Aplikasi React TypeScript
│   ├── src/
│   │   ├── components/          # Komponen UI yang dapat digunakan kembali
│   │   ├── pages/               # Halaman aplikasi
│   │   ├── contexts/            # React Context providers
│   │   ├── services/            # Layer service API
│   │   └── types/               # Definisi tipe TypeScript
│   └── package.json
├── backend/                     # Server API Express.js
│   ├── controllers/             # Controller logika bisnis
│   ├── routes/                  # Definisi route API
│   ├── middleware/              # Middleware autentikasi & upload
│   ├── config/                  # Konfigurasi database
│   └── package.json
├── arsip_udinus.sql            # Schema database yang dioptimasi
├── README.md                   # Dokumentasi bahasa Indonesia
└── README_en.md               # Dokumentasi bahasa Inggris
```

## 🚀 Fitur Utama

### 📚 Manajemen Arsip
- **Penyimpanan Arsip Digital** - Manajemen arsip komprehensif dengan metadata
- **Pencarian Lanjutan** - Pencarian real-time dengan berbagai opsi filter
- **Organisasi Kategori** - Sistem kategorisasi hierarkis
- **Pelacakan Lokasi** - Manajemen lokasi fisik (lemari, rak, posisi)
- **Upload Gambar** - Penyimpanan dan preview gambar arsip
- **Pagination** - Loading data yang efisien dengan pagination

### 🔐 Autentikasi & Otorisasi
- **Autentikasi Admin** - Sistem login aman dengan JWT token
- **Kontrol Akses Berbasis Role** - Level akses berbeda untuk admin dan user
- **Protected Routes** - Proteksi route berdasarkan status autentikasi
- **Manajemen Sesi** - Refresh token otomatis dan logout

### 📄 Manajemen Dokumen
- **Manajemen Surat** - Operasi CRUD lengkap untuk surat
- **Pelacakan Status** - Monitoring status dokumen
- **Manajemen Detail** - Detail dokumen yang komprehensif
- **Pencarian & Filter** - Kemampuan pencarian lanjutan

### 🏛️ Manajemen Data Master
- **Kategori & Subkategori** - Sistem klasifikasi arsip
- **Hierarki Lokasi** - Manajemen lokasi penyimpanan fisik
- **Tingkat Pendidikan** - Kategorisasi level akademik
- **Fakultas & Program** - Struktur organisasi universitas
- **Manajemen User** - Manajemen user admin

## 🎨 Antarmuka Pengguna

### Sistem Desain
- **UI Modern** - Desain antarmuka yang bersih dan intuitif
- **Desain Responsif** - Dioptimasi untuk desktop, tablet, dan mobile
- **Aksesibilitas** - Komponen yang sesuai dengan WCAG
- **Mode Gelap/Terang** - Kemampuan switching tema
- **Loading States** - Skeleton loading dan indikator progress
- **Error Handling** - Pesan error yang user-friendly dan fallback

### Komponen Utama
- **Dashboard** - Overview arsip utama dengan pencarian dan filter
- **Archive Cards** - Representasi visual item arsip
- **Filter Panel** - Opsi filtering lanjutan
- **Admin Panel** - Antarmuka administratif untuk manajemen data
- **Form Components** - Form tervalidasi untuk input data

## 🔧 Instalasi & Setup

### Prasyarat
- Node.js (v16 atau lebih tinggi)
- MySQL Database
- npm atau yarn package manager

### Setup Database
1. Import schema database yang dioptimasi:
```sql
mysql -u username -p database_name < arsip_udinus.sql
```

2. Konfigurasi koneksi database di file `.env` backend

### Setup Backend
```bash
cd backend
npm install

# Buat file .env dengan konfigurasi
cp .env.example .env

# Jalankan development server
npm run dev
```

### Setup Frontend
```bash
cd frontend
npm install

# Jalankan development server
npm run dev
```

### Konfigurasi Environment

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
VITE_APP_TITLE=Sistem Arsip Digital UDINUS
```

## 📊 Schema Database

### Tabel Utama
- **archives** - Record arsip utama dengan metadata
- **categories** - Kategori arsip
- **subcategories** - Subkategori arsip
- **locations** - Lokasi penyimpanan fisik
- **cabinets** - Lemari penyimpanan
- **shelves** - Rak penyimpanan
- **positions** - Posisi spesifik dalam rak

### Tabel Pendukung
- **admin** - User administratif
- **letters** - Manajemen surat
- **letter_details** - Informasi detail surat
- **letter_status_history** - Pelacakan status surat
- **education_levels** - Level akademik
- **faculties** - Fakultas universitas
- **programs** - Program studi

### Fitur Utama
- **Schema Teroptimasi** - Desain database efisien dengan indexing yang tepat
- **Foreign Key Constraints** - Penegakan integritas data
- **Full-text Search** - Optimasi pencarian untuk konten arsip
- **Sample Data** - Data pre-populated untuk testing dan development

## 🌐 Dokumentasi API

### Endpoint Autentikasi
- `POST /api/auth/login` - Login admin
- `GET /api/auth/profile` - Dapatkan profil user saat ini

### Endpoint Arsip
- `GET /api/archives` - Dapatkan arsip dengan pagination dan filter
- `GET /api/archives/:id` - Dapatkan detail arsip spesifik
- `POST /api/archives` - Buat arsip baru (Admin only)
- `PUT /api/archives/:id` - Update arsip (Admin only)
- `DELETE /api/archives/:id` - Hapus arsip (Admin only)

### Endpoint Data Master
- `GET /api/categories` - Dapatkan semua kategori
- `GET /api/subcategories` - Dapatkan subkategori
- `GET /api/locations` - Dapatkan lokasi
- `GET /api/cabinets` - Dapatkan lemari
- `GET /api/shelves` - Dapatkan rak
- `GET /api/positions` - Dapatkan posisi

### Format Response
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

## 🔒 Fitur Keamanan

### Keamanan Autentikasi
- **JWT Token Authentication** - Autentikasi berbasis token yang aman
- **Password Hashing** - Enkripsi password dengan bcrypt
- **Token Expiration** - Expirasi token otomatis dan refresh
- **Route Protection** - Proteksi route berbasis middleware

### Keamanan Data
- **Validasi Input** - Validasi input yang komprehensif
- **Pencegahan SQL Injection** - Query berparameter
- **Proteksi XSS** - Sanitasi output
- **Keamanan File Upload** - Penanganan upload file yang aman

## 📱 Responsivitas Mobile

### Fitur Responsif
- **Desain Mobile-first** - Dioptimasi untuk perangkat mobile
- **Antarmuka Touch-friendly** - Target sentuh yang besar dan gesture
- **Layout Adaptif** - Sistem grid yang fleksibel
- **Optimasi Performa** - Dioptimasi untuk jaringan mobile

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

### Opsi Deployment
- **Static Hosting** - Vercel, Netlify untuk frontend
- **VPS/Cloud** - DigitalOcean, AWS, Google Cloud
- **Docker** - Deployment containerized
- **Traditional Hosting** - Apache, Nginx

### Optimasi Performa
- **Code Splitting** - Lazy loading untuk performa optimal
- **Optimasi Gambar** - Gambar terkompresi dan dioptimasi
- **Caching** - Browser dan server-side caching
- **Integrasi CDN** - Dukungan content delivery network

## 🧪 Testing

### Strategi Testing
- **Unit Tests** - Testing komponen dan fungsi
- **Integration Tests** - Testing endpoint API
- **E2E Tests** - Testing alur pengguna end-to-end
- **Type Safety** - Validasi compile-time TypeScript

### Quality Assurance
- **Code Linting** - ESLint dan Prettier
- **Type Checking** - TypeScript strict mode
- **Performance Monitoring** - Analisis ukuran bundle
- **Security Scanning** - Pemeriksaan kerentanan dependency

## 📈 Metrik Performa

### Performa Frontend
- **Bundle Size** - Dioptimasi untuk loading cepat
- **First Contentful Paint** - < 2 detik
- **Time to Interactive** - < 3 detik
- **Lighthouse Score** - Skor performa 90+

### Performa Backend
- **Response Time** - Rata-rata < 200ms
- **Database Queries** - Dioptimasi dengan indexing yang tepat
- **Memory Usage** - Manajemen memori yang efisien
- **Concurrent Users** - Mendukung multiple user simultan

## 🤝 Kontribusi

### Panduan Development
- Ikuti best practices TypeScript
- Gunakan formatting kode yang konsisten (Prettier)
- Tulis test yang komprehensif
- Dokumentasikan fitur baru
- Ikuti konvensi Git commit

### Code Style
- **TypeScript** - Strict type checking
- **ESLint** - Penegakan kualitas kode
- **Prettier** - Formatting kode yang konsisten
- **Conventional Commits** - Pesan commit yang terstandarisasi

## 📞 Dukungan

Untuk dukungan teknis atau pertanyaan tentang sistem DINUS Archive:

- **Dokumentasi**: Periksa file README di direktori masing-masing
- **Issues**: Laporkan bug atau request fitur via project issues
- **Development**: Ikuti panduan development untuk kontribusi

---

**Catatan**: Pastikan semua prasyarat telah diinstal dan dikonfigurasi sebelum menjalankan aplikasi. Sistem memerlukan layanan frontend dan backend berjalan secara bersamaan untuk fungsionalitas penuh.