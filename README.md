# DINUS Archive - Sistem Manajemen Arsip Digital

Aplikasi manajemen arsip digital untuk Universitas Dian Nuswantoro yang memungkinkan penyimpanan, pencarian, dan pengelolaan arsip secara efisien.

## Daftar Isi

- Tentang Proyek
- Struktur Proyek
- Teknologi yang Digunakan
- Fitur
- Instalasi dan Penggunaan
- Dokumentasi Backend & Frontend
- Kontribusi

## Tentang Proyek

DINUS Archive adalah sistem manajemen arsip digital yang dirancang khusus untuk Universitas Dian Nuswantoro. Aplikasi ini memungkinkan pengguna untuk mengunggah, mengkategorikan, mencari, dan mengelola arsip digital dengan mudah dan efisien.

Proyek ini terdiri dari dua bagian utama:
- `frontend`: Antarmuka pengguna berbasis web (React + TypeScript)
- `backend`: API RESTful (Node.js + Express)

## Struktur Proyek

```
dinus-archive/
├── backend/           # API server Node.js/Express
├── frontend/          # Aplikasi React/TypeScript
├── arsip_udinus.sql   # File SQL untuk database
├── README.md          # Dokumentasi proyek (Bahasa Indonesia)
└── README_en.md       # Dokumentasi proyek (Bahasa Inggris)
```

## Teknologi yang Digunakan

### Frontend
- React 18
- TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- shadcn/ui (Radix UI-based components)
- Axios

### Backend
- Node.js
- Express.js
- MySQL
- JWT untuk autentikasi
- Multer untuk upload file

## Fitur

- Autentikasi dan manajemen pengguna
- Manajemen arsip digital (unggah, edit, hapus)
- Kategorisasi arsip (kategori, subkategori, posisi)
- Pencarian dan filter arsip (kategori, subkategori, posisi, kata kunci, tanggal)
- Preview gambar arsip
- Dashboard admin
- Responsif untuk desktop dan mobile

## Instalasi dan Penggunaan

### Prasyarat

- Node.js (versi 16.x atau lebih baru)
- MySQL (versi 5.7 atau lebih baru)
- npm atau yarn

### Setup Backend

```powershell
cd backend
npm install
```

Buat file `.env` berdasarkan `.env.example` dan sesuaikan dengan konfigurasi database Anda:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=nama_database_arsip
JWT_SECRET=jwt-secret-key
```

Jalankan server:

```powershell
npm run dev
# atau
nodemon server.js
```

Backend berjalan di `http://localhost:5000` (Base API: `http://localhost:5000/api`).

### Setup Frontend

```powershell
cd frontend
npm install
```

Jalankan aplikasi:

```powershell
npm run dev
```

Frontend berjalan di `http://localhost:8080`.

## Dokumentasi Backend & Frontend

- Backend: lihat `backend/README.md`
- Frontend: lihat `frontend/README.md`

## Perubahan Terbaru

- Backend: `GET /api/archives` kini mendukung filter `position_id` dan mengembalikan `position_name` melalui join `positions`.
- Frontend: Dashboard menampilkan badge posisi menggunakan `position_name` dari backend; filter posisi telah diperbaiki dan bekerja saat subkategori berubah.
- CategoryModal: Tab “Posisi” menampilkan data posisi yang benar sesuai subkategori.

## Kontribusi

Kontribusi sangat diterima. Silakan fork repository, buat branch baru, dan ajukan pull request.

---

Dikembangkan untuk Universitas Dian Nuswantoro © 2025