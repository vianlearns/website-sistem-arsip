export type LetterStatus = 'Diteruskan ke Fakultas' | 'Diteruskan ke Rektor' | 'Diteruskan ke Wakil' | 'Selesai';

export interface Letter {
  id: number;
  name: string;
  date: string; // ISO date (YYYY-MM-DD)
  sender: string;
  recipient: string;
  subject: string;
  letter_type?: string; // 'biasa' | 'pengganti_ijazah' | 'keterangan'
  current_status?: string | null;
  file_path?: string | null;
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface LetterStatusHistoryItem {
  id: number;
  status: string;
  note?: string | null;
  created_at: string;
}

export interface LetterFilters {
  search?: string;
  sender?: string;
  recipient?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  sort_by?: 'created_at' | 'date' | 'name' | 'sender' | 'recipient' | 'current_status';
  sort_order?: 'ASC' | 'DESC';
}

export interface PaginatedLettersResponse {
  success: boolean;
  data: Letter[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface RekapItem {
  period: string; // e.g., 2025-10-12 or 2025-41 or 2025-10
  total: number;
}

export interface LetterDetails {
  nim?: string | null;
  nama?: string | null;
  jenjang_pendidikan?: string | null; // D3 | D4 | S1 | S2 | S3
  fakultas?: string | null; // FIK | FEB | FIB | Fkes | FT | FK
  program_studi?: string | null;
  tanggal_lulus?: string | null; // YYYY-MM-DD
  no_seri?: string | null;
  nirl?: string | null;
  telepon?: string | null;
}

export type LetterWithDetails = Letter & { details?: LetterDetails };