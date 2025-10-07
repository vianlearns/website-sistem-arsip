# DINUS Archive Frontend

Frontend aplikasi untuk sistem manajemen arsip digital Universitas Dian Nuswantoro.

## Teknologi yang Digunakan

- React 18
- TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- shadcn/ui (komponen UI berbasis Radix UI)
- Axios untuk HTTP requests

## Struktur Folder

```
frontend/
├── public/           # File statis (favicon, images, dll)
├── src/              # Kode sumber
│   ├── components/   # Komponen React yang dapat digunakan kembali
│   │   └── ui/       # Komponen UI dari shadcn/ui
│   ├── contexts/     # Context API React (AuthContext, dll)
│   ├── hooks/        # Custom hooks (fetch arsip, kategori, dll)
│   ├── lib/          # Utilitas dan konfigurasi (Axios base URL)
│   ├── pages/        # Komponen halaman
│   ├── services/     # Layanan API (archives, categories, positions)
│   ├── types/        # Type definitions TypeScript
│   ├── App.tsx       # Komponen utama aplikasi
│   └── main.tsx      # Entry point aplikasi
├── package.json      # Metadata & scripts proyek
├── vite.config.ts    # Konfigurasi Vite
└── README.md         # Dokumentasi proyek
```

## Fitur

- Dashboard untuk manajemen arsip
- Manajemen kategori, subkategori, dan posisi
- Pencarian dan filter arsip (kategori, subkategori, posisi, kata kunci)
- Upload dan preview gambar arsip
- Tampilan responsif untuk desktop dan mobile

## Instalasi dan Penggunaan

### Prasyarat

- Node.js (versi 16.x atau lebih baru)
- npm atau yarn

### Langkah Instalasi

```powershell
cd frontend
npm install
# atau
yarn install
```

### Menjalankan Aplikasi

#### Mode Development

```powershell
npm run dev
# atau
yarn dev
```

Aplikasi akan berjalan di `http://localhost:8080`

## Integrasi Backend

- Pastikan backend berjalan di `http://localhost:5000`.
- Frontend memanggil endpoint `GET /api/archives` dengan query params: `page`, `limit`, `search`, `category_id`, `subcategory_id`, `position_id`.
- Badge pada kartu arsip menampilkan `category_name`, `subcategory_name`, dan `position_name` yang dikembalikan backend.

## Perubahan Terbaru

- Dashboard menampilkan nama posisi langsung dari field `position_name` jika tersedia.
- Filter arsip berdasarkan `position_id` telah didukung penuh (frontend dan backend).
- CategoryModal: tab “Posisi” menampilkan data posisi yang benar sesuai subkategori aktif.

## Troubleshooting

- API tidak terhubung: Pastikan backend server berjalan dan base URL di `src/lib/api.ts` sesuai.
- Filter posisi tidak bekerja: 
  - Pastikan Anda memilih subkategori sebelum memilih posisi.
  - Pastikan backend terbaru sudah mendukung filter `position_id` dan mengembalikan `position_name`.
  - Cek Network tab bahwa request berisi `position_id` dan response mengandung data yang sesuai.
- Error dependency: Jalankan `npm install` ulang atau hapus folder `node_modules` dan file `package-lock.json`, kemudian jalankan `npm install`.
- Port sudah dipakai: Ubah port di `vite.config.ts` atau matikan aplikasi lain yang menggunakan port yang sama.
- Tailwind tidak berfungsi: Pastikan konfigurasi di `tailwind.config.ts` dan import CSS di `main.tsx` sudah benar.