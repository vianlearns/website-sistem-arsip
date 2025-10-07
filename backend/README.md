# DINUS Archive Backend API

Backend API untuk aplikasi DINUS Archive yang mengelola arsip digital Universitas Dian Nuswantoro.

## Teknologi yang Digunakan

- Node.js
- Express.js
- MySQL
- JWT untuk autentikasi
- Multer untuk upload file

## Struktur Direktori

```
backend/
├── config/             # Konfigurasi database
├── controllers/        # Logic bisnis
├── middleware/         # Middleware autentikasi dan upload
├── routes/             # Definisi rute API
├── uploads/            # Direktori penyimpanan file upload
├── .env                # Variabel lingkungan
├── package.json        # Dependensi
└── server.js           # Entry point aplikasi
```

## Fitur

- Autentikasi admin dengan JWT
- Manajemen arsip (CRUD)
- Manajemen kategori (CRUD)
- Manajemen subkategori (CRUD)
- Manajemen posisi (CRUD)
- Upload gambar arsip
- Pencarian dan filter arsip (kategori, subkategori, posisi, tanggal, kata kunci)

## Endpoint API

Base URL: `http://localhost:5000/api`

### Autentikasi

- `POST /auth/login` - Login admin
- `GET /auth/profile` - Profil admin yang sedang login

### Arsip

- `GET /archives` - Mendapatkan semua arsip dengan pagination, pencarian, dan filter
  - Query params:
    - `page` (default: `1`)
    - `limit` (default: `10`)
    - `search` (opsional)
    - `category_id` (opsional)
    - `subcategory_id` (opsional)
    - `position_id` (opsional)
    - `start_date`, `end_date` (opsional, format `YYYY-MM-DD`)
  - Response (format baru):
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "title": "...",
          "category_id": 2,
          "subcategory_id": 5,
          "position_id": 12,
          "category_name": "Nama Kategori",
          "subcategory_name": "Nama Subkategori",
          "position_name": "Nama Posisi",
          "date": "2025-01-01",
          "location": "...",
          "image": "...",
          "created_at": "...",
          "updated_at": "..."
        }
      ],
      "pagination": { "page": 1, "limit": 10, "total": 25, "total_pages": 3 }
    }
    ```
- `GET /archives/:id` - Mendapatkan detail arsip berdasarkan ID
  - Response (format objek langsung, menyertakan `category_name`, `subcategory_name`, `position_name`).
- `POST /archives` - Membuat arsip baru (admin only, multipart/form-data)
- `PUT /archives/:id` - Mengupdate arsip (admin only, multipart/form-data)
- `DELETE /archives/:id` - Menghapus arsip (admin only)

### Kategori

- `GET /categories`
- `GET /categories/:id`
- `POST /categories` (admin)
- `PUT /categories/:id` (admin)
- `DELETE /categories/:id` (admin)

### Subkategori

- `GET /subcategories` (query: `category_id` opsional)
- `GET /subcategories/:id`
- `POST /subcategories` (admin)
- `PUT /subcategories/:id` (admin)
- `DELETE /subcategories/:id` (admin)

### Posisi

- `GET /positions` (query: `subcategory_id` opsional)
- `GET /positions/:id`
- `POST /positions` (admin)
- `PUT /positions/:id` (admin)
- `DELETE /positions/:id` (admin)

## Instalasi dan Penggunaan

1. Clone repository
2. Buka terminal di direktori `backend`
3. Install dependensi: `npm install`
   - Jika mengalami masalah izin eksekusi script di PowerShell, jalankan PowerShell sebagai Administrator:
     ```powershell
     Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
     ```
4. Buat file `.env` berdasarkan `.env.example` dan sesuaikan:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=password
   DB_NAME=nama_database_arsip
   JWT_SECRET=jwt-secret-key
   ```
5. Jalankan server:
   - Development: `npm run dev` atau `nodemon server.js`
   - Production: `npm start`
6. Server berjalan di `http://localhost:5000`

## Catatan Kompatibilitas Response

- Endpoint `GET /archives` menggunakan format respons baru yang menyertakan `success`, `data`, dan `pagination`.
- Endpoint `GET /archives/:id` mengembalikan objek arsip langsung (tanpa bungkus `success`). Frontend telah menyesuaikan kedua format ini.

## Keamanan

- Autentikasi menggunakan JWT
- Role-based access control (admin vs user biasa)
- Validasi input untuk mencegah SQL injection
- Sanitasi output untuk mencegah XSS

## Perubahan Terbaru

- Menambahkan `LEFT JOIN positions` pada daftar/detail arsip sehingga `position_name` tersedia.
- Menambahkan dukungan filter `position_id` di `GET /archives` (termasuk pada query utama dan query hitung total).