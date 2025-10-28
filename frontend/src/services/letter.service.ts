import api from '@/lib/api';
import { Letter, LetterFilters, LetterStatusHistoryItem, PaginatedLettersResponse, RekapItem, LetterDetails, LetterWithDetails } from '@/types/letter.types';

// Normalize date to 'YYYY-MM-DD' for API payloads, accepting:
// 'DD-MM-YYYY', 'YYYY-MM-DD', or ISO 'YYYY-MM-DDTHH:mm:ss.sssZ'
function normalizeDatePayload(input: string): string {
  if (!input) return input;
  const s = String(input).trim();
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    return s.slice(0, 10);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return s;
  }
  const dm = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dm) {
    const [, dd, mm, yyyy] = dm;
    return `${yyyy}-${mm}-${dd}`;
  }
  return s;
}

const LetterService = {
  getLetters: async (filters?: LetterFilters, page: number = 1, limit: number = 10): Promise<PaginatedLettersResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.sender) params.append('sender', filters.sender);
      if (filters.recipient) params.append('recipient', filters.recipient);
      if (filters.date) params.append('date', filters.date);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.status) params.append('status', filters.status);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);
    }
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/letters?${params.toString()}`);
    return response.data as PaginatedLettersResponse;
  },

  getLetterById: async (id: number): Promise<Letter> => {
    const response = await api.get(`/letters/${id}`);
    return response.data as LetterWithDetails;
  },

  createLetter: async (payload: (Omit<Letter, 'id' | 'current_status' | 'created_by' | 'created_at' | 'updated_at'> & { letter_type: 'biasa' | 'pengganti_ijazah' | 'keterangan'; details?: LetterDetails; file?: File })): Promise<{ success: boolean; id: number; message?: string }> => {
    const formData = new FormData();
    
    // Add text fields
    formData.append('name', payload.name);
    formData.append('sender', payload.sender);
    formData.append('recipient', payload.recipient);
    formData.append('subject', payload.subject);
    formData.append('letter_type', payload.letter_type);
    
    // Normalize date fields to 'YYYY-MM-DD'
    if (payload.date) {
      formData.append('date', normalizeDatePayload(payload.date as string));
    }
    
    // Add details if present
    if (payload.details) {
      formData.append('details', JSON.stringify({
        ...payload.details,
        tanggal_lulus: payload.details.tanggal_lulus ? normalizeDatePayload(payload.details.tanggal_lulus as string) : payload.details.tanggal_lulus
      }));
    }
    
    // Add file if present
    if (payload.file) {
      formData.append('file', payload.file);
    }
    
    const response = await api.post('/letters', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateLetter: async (id: number, payload: Partial<Pick<Letter, 'name' | 'date' | 'sender' | 'recipient' | 'subject'>> & { file?: File; clearFile?: boolean }): Promise<{ success: boolean; message: string }> => {
    const formData = new FormData();
    
    // Add text fields if present
    if (payload.name !== undefined) formData.append('name', payload.name);
    if (payload.sender !== undefined) formData.append('sender', payload.sender);
    if (payload.recipient !== undefined) formData.append('recipient', payload.recipient);
    if (payload.subject !== undefined) formData.append('subject', payload.subject);
    
    if (payload.date !== undefined) {
      formData.append('date', normalizeDatePayload(payload.date as string));
    }
    
    // Add file if present
    if (payload.file) {
      formData.append('file', payload.file);
    }
    
    // Add clearFile flag if present
    if (payload.clearFile) {
      formData.append('clearFile', 'true');
    }
    
    const response = await api.put(`/letters/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteLetter: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/letters/${id}`);
    return response.data;
  },

  updateLetterStatus: async (id: number, status: string, note?: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(`/letters/${id}/status`, { status, note });
    return response.data;
  },

  getLetterHistory: async (id: number): Promise<LetterStatusHistoryItem[]> => {
    const response = await api.get(`/letters/${id}/history`);
    // API wraps in { success, data }
    if (response.data && response.data.data) {
      return response.data.data as LetterStatusHistoryItem[];
    }
    return response.data as LetterStatusHistoryItem[];
  },

  updateHistoryItem: async (letterId: number, historyId: number, payload: { status: string; note?: string | null }): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(`/letters/${letterId}/history/${historyId}`, payload);
    return response.data;
  },

  deleteHistoryItem: async (letterId: number, historyId: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/letters/${letterId}/history/${historyId}`);
    return response.data;
  },

  getRekap: async (start_date: string, end_date: string, group_by: 'day' | 'week' | 'month' = 'day'): Promise<RekapItem[]> => {
    const params = new URLSearchParams({ start_date, end_date, group_by });
    const response = await api.get(`/letters/rekap/summary?${params.toString()}`);
    if (response.data && response.data.data) {
      return response.data.data as RekapItem[];
    }
    return response.data as RekapItem[];
  },
};

export default LetterService;