import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Letter, LetterFilters, LetterStatus, LetterStatusHistoryItem, RekapItem } from '@/types/letter.types';
import LetterService from '@/services/letter.service';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, FilePlus, BarChart2, GraduationCap } from 'lucide-react';
import EducationModal from '@/components/EducationModal';
import EducationService from '@/services/education.service';
import { EducationLevel, Faculty, Program } from '@/types/education.types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LetterDetails } from '@/types/letter.types';

const STATUS_OPTIONS: LetterStatus[] = ['Diteruskan ke Fakultas', 'Diteruskan ke Rektor', 'Diteruskan ke Wakil', 'Selesai'];
// Sentinel values for Select items to avoid empty-string value errors in Radix
const SELECT_STATUS_ALL = '__ALL__';
const SELECT_STATUS_NONE = '__NONE__';
const SELECT_GROUP_NONE = '__GROUP_NONE__';
const SELECT_TYPE_NONE = '__TYPE_NONE__';

const LetterManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const formatDateID = useCallback((dateStr?: string | null) => {
    if (!dateStr) return '—';
    const s = String(dateStr).trim();
    // Prefer string parsing to avoid timezone shifts
    const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/); // handles 'YYYY-MM-DD' and 'YYYY-MM-DDTHH...'
    if (isoMatch) {
      const [, yyyy, mm, dd] = isoMatch;
      return `${dd}-${mm}-${yyyy}`;
    }
    const dm = s.match(/^(\d{2})-(\d{2})-(\d{4})$/); // already 'DD-MM-YYYY'
    if (dm) return s;
    return s; // fallback: return as-is
  }, []);
  const formatDateTimeID = useCallback((dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = String(d.getFullYear());
      const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      return `${dd}-${mm}-${yyyy} ${time}`;
    } catch {
      return String(dateStr);
    }
  }, []);
  // Create letter form state
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [letterType, setLetterType] = useState<'biasa' | 'pengganti_ijazah' | 'keterangan' | ''>('biasa');
  const [details, setDetails] = useState<LetterDetails>({});
  const [editingLetterId, setEditingLetterId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFilePath, setExistingFilePath] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<LetterFilters>({ sort_by: 'created_at', sort_order: 'DESC' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  // Real-time search (debounced like Dashboard)
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);
  const derivedFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearchTerm || undefined,
  }), [filters, debouncedSearchTerm]);

  // Data state
  const [letters, setLetters] = useState<Letter[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Status update state
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [statusDropdown, setStatusDropdown] = useState<string>('');
  const [statusManual, setStatusManual] = useState<string>('');
  const [statusNote, setStatusNote] = useState<string>('');
  const [history, setHistory] = useState<LetterStatusHistoryItem[]>([]);

  // Rekap state
  const [rekapStart, setRekapStart] = useState('');
  const [rekapEnd, setRekapEnd] = useState('');
  const [rekapGroup, setRekapGroup] = useState<'' | 'day' | 'week' | 'month'>('');
  const [rekap, setRekap] = useState<RekapItem[]>([]);
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRekapModal, setShowRekapModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);

  // Education datasets (from API)
  const [levels, setLevels] = useState<EducationLevel[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  // Load education datasets when the create modal opens and a special letter type is selected
  useEffect(() => {
    const shouldLoad = showCreateModal && (letterType === 'pengganti_ijazah' || letterType === 'keterangan');
    if (!shouldLoad) return;
    (async () => {
      try {
        const [lvl, fac, prog] = await Promise.all([
          EducationService.getLevels(),
          EducationService.getFaculties(),
          EducationService.getPrograms(),
        ]);
        setLevels(lvl || []);
        setFaculties(fac || []);
        setPrograms(prog || []);
      } catch (err) {
        console.error('Failed to load education datasets', err);
        toast({ title: 'Gagal memuat data pendidikan', description: 'Coba refresh halaman.', variant: 'destructive' });
      }
    })();
  }, [showCreateModal, letterType]);

  const fetchLetters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await LetterService.getLetters(derivedFilters, page, limit);
      setLetters(res.data);
      setTotalPages(res.pagination.total_pages);
      setTotal(res.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [derivedFilters, page, limit]);

  useEffect(() => {
    fetchLetters();
  }, [fetchLetters]);

  const resetForm = () => {
    setName('');
    setDate('');
    setSender('');
    setRecipient('');
    setSubject('');
    setLetterType('biasa');
    setDetails({});
    setSelectedFile(null);
    setExistingFilePath(null);
  };

  const handleSaveLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingLetterId;
    if (!name || (!date && !isEdit) || !sender || !recipient || !subject) return;
    // Additional validation based on letter type when creating
    if (!isEdit) {
      if (!letterType) {
        toast({ title: 'Jenis surat belum dipilih', description: 'Pilih jenis surat terlebih dahulu.', variant: 'destructive' });
        return;
      }
      if (letterType === 'pengganti_ijazah') {
        const required = ['nim', 'nama', 'jenjang_pendidikan', 'fakultas', 'program_studi', 'tanggal_lulus', 'no_seri', 'nirl'] as const;
        const missing = required.filter((k) => !(details as any)[k] || String((details as any)[k]).trim() === '');
        if (missing.length) {
          toast({ title: 'Data belum lengkap', description: `Wajib diisi: ${missing.join(', ')}`, variant: 'destructive' });
          return;
        }
      } else if (letterType === 'keterangan') {
        const required = ['nim', 'nama', 'jenjang_pendidikan', 'fakultas', 'program_studi'] as const;
        const missing = required.filter((k) => !(details as any)[k] || String((details as any)[k]).trim() === '');
        if (missing.length) {
          toast({ title: 'Data belum lengkap', description: `Wajib diisi: ${missing.join(', ')}`, variant: 'destructive' });
          return;
        }
      }
    }
    if (!isAdmin) {
      toast({ title: 'Akses ditolak', description: 'Hanya admin yang dapat menyimpan surat.', variant: 'destructive' });
      return;
    }
    try {
      if (editingLetterId) {
        const payload: any = { name, sender, recipient, subject };
        if (date) payload.date = date; // hanya kirim tanggal jika diubah/diisi
        if (selectedFile) payload.file = selectedFile;
        // If user clicked "Hapus" button, we need to clear the file
        if (existingFilePath === null && !selectedFile) {
          payload.clearFile = true; // Signal to backend to clear file
        }
        await LetterService.updateLetter(editingLetterId, payload);
        toast({ title: 'Berhasil', description: 'Surat berhasil diperbarui.' });
      } else {
        const payload: any = { name, date, sender, recipient, subject, letter_type: letterType };
        if (letterType !== 'biasa') {
          payload.details = details;
        }
        if (selectedFile) payload.file = selectedFile;
        await LetterService.createLetter(payload);
        toast({ title: 'Berhasil', description: 'Surat berhasil ditambahkan.' });
      }
      resetForm();
      setEditingLetterId(null);
      setShowCreateModal(false);
      fetchLetters();
    } catch (err) {
      console.error('Failed to save letter', err);
      const errorMessage = (err as any)?.response?.data?.message || 'Gagal menyimpan surat';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  const startEditLetter = async (letter: Letter) => {
    setName(letter.name);
    // Pastikan nilai input type="date" berupa 'YYYY-MM-DD'
    setDate((letter.date || '').slice(0, 10));
    setSender(letter.sender || '');
    setRecipient(letter.recipient || '');
    setSubject(letter.subject || '');
    // Tampilkan field tambahan sesuai jenis surat yang sebenarnya
    const lt = (letter.letter_type as any) || 'biasa';
    setLetterType(lt);
    // Muat detail surat ketika edit agar field NIM, jenjang, fakultas, dll tampil
    try {
      const full = await LetterService.getLetterById(letter.id);
      const d = (full as any)?.details || {};
      setDetails({
        nim: d.nim || '',
        nama: d.nama || '',
        jenjang_pendidikan: d.jenjang_pendidikan || '',
        fakultas: d.fakultas || '',
        program_studi: d.program_studi || '',
        tanggal_lulus: d.tanggal_lulus || '',
        no_seri: d.no_seri || '',
        nirl: d.nirl || '',
        telepon: d.telepon || '',
      });
      // Set existing file path if available
      setExistingFilePath(full.file_path || null);
    } catch (err) {
      console.error('Failed to load letter details for edit', err);
      setDetails({});
      setExistingFilePath(null);
    }
    setEditingLetterId(letter.id);
    setShowCreateModal(true);
  };

  // Cetak/Export PDF untuk surat khusus saat status 'Diterima'
  const handlePrintReceipt = async () => {
  if (!selectedLetter) return;
  try {
    const full = await LetterService.getLetterById(selectedLetter.id);
    const d = (full as any)?.details || {};

    const jenisSuratRaw = String(full.letter_type || '').trim();
    const jenisSurat =
      jenisSuratRaw === 'pengganti_ijazah'
        ? 'Surat Pengganti Ijazah & Transkrip'
        : 'Surat Keterangan';
    const isKeterangan = jenisSuratRaw === 'keterangan';

    const nama = d.nama || '';
    const nim = d.nim || '';
    const jenjang = d.jenjang_pendidikan || '';
    const fakultas = d.fakultas || '';
    const prodi = d.program_studi || '';
    const tglLulus = d.tanggal_lulus
      ? new Date(d.tanggal_lulus).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      : '';
    const noSeri = d.no_seri || '';
    const nirlVal = d.nirl || '';
    const todayStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const signatureName =
      (nama || '').toUpperCase() || '(................................................)';

    const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Tanda Terima</title>
<style>
  @media print { @page { size: A4; margin: 20mm; } }
  body { font-family: 'Times New Roman', Times, serif; color:#000; font-size:12pt; line-height:1.4; }
  .title { text-align:center; font-weight:bold; text-decoration:underline; font-size:18pt; margin-top:6px; }
  .container { width:720px; margin:0 auto; padding-top:8px; }
  .row { margin:4px 0; }
  .label { display:inline-block; width:220px; }
  .colon { display:inline-block; width:20px; text-align:center; }
  .value { display:inline-block; width:440px; vertical-align:top; }
  ol { margin:0; padding-left:18px; }

  /* === BLOK TANDA TANGAN KANAN (lurus kanan, teks sejajar kiri kolom) === */
.signblock{
  margin-top: 30px;
  margin-left: auto;     /* dorong seluruh kolom ke kanan */
  width: 340px;          /* lebar kolom kanan (silakan sesuaikan 300–380px) */
  display: grid;
  grid-auto-rows: min-content;
  row-gap: 0.25rem;
  justify-items: start;  /* isi kolom rata kiri */
  text-align: left;      /* teks dalam kolom rata kiri */
}
.signblock div { white-space: nowrap; } /* hindari pecah baris */
.signblock .gap{ height: 90px; }        /* tinggi area tanda tangan */
.signblock .name{
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: .2px;
}
/* ================================================================ */

</style>
</head>
<body>
  <div class="container">
    <div class="title">Tanda Terima</div>
    <div class="row">Telah diterima dari Biro Akademik Universitas Dian Nuswantoro Semarang</div>

    <div class="row">
      <span class="label">Berupa</span><span class="colon">:</span>
      <span class="value">
        <ol>
          <li>${jenisSurat}</li>
          <li>&nbsp;</li>
        </ol>
      </span>
    </div>

    <div class="row"><span class="label">Nama</span><span class="colon">:</span><span class="value">${nama}</span></div>
    <div class="row"><span class="label">Nomor Induk Mahasiswa</span><span class="colon">:</span><span class="value">${nim}</span></div>
    <div class="row"><span class="label">Jenjang Pendidikan</span><span class="colon">:</span><span class="value">${jenjang}</span></div>
    <div class="row"><span class="label">Fakultas</span><span class="colon">:</span><span class="value">${fakultas}</span></div>
    <div class="row"><span class="label">Program Studi</span><span class="colon">:</span><span class="value">${prodi}</span></div>
    ${
      !isKeterangan
        ? `
    <div class="row"><span class="label">Tanggal Kelulusan</span><span class="colon">:</span><span class="value">${tglLulus}</span></div>
    <div class="row"><span class="label">Nomor Seri Ijazah</span><span class="colon">:</span><span class="value">${noSeri}</span></div>
    <div class="row"><span class="label">NIRL</span><span class="colon">:</span><span class="value">${nirlVal}</span></div>
        `
        : ''
    }

    <!-- BLOK KANAN: tanggal, Penerima, dan Nama -> semuanya lurus kanan -->
    <div class="signblock">
      <div>Semarang, ${todayStr}</div>
      <div>Penerima,</div>
      <div class="gap"></div>
      <div class="name">${signatureName}</div>
    </div>
  </div>

  <script>window.print(); setTimeout(() => window.close(), 300);</script>
</body>
</html>`;

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  } catch (err) {
    console.error('Failed to prepare receipt for printing', err);
    toast({
      title: 'Gagal mencetak',
      description: 'Terjadi kesalahan saat menyiapkan PDF.',
      variant: 'destructive',
    });
  }
};


  const handleDeleteLetter = async (id: number) => {
    if (!isAdmin) {
      toast({ title: 'Akses ditolak', description: 'Hanya admin yang dapat menghapus surat.', variant: 'destructive' });
      return;
    }
    const ok = window.confirm('Hapus surat ini? Riwayat status akan ikut dihapus.');
    if (!ok) return;
    try {
      await LetterService.deleteLetter(id);
      toast({ title: 'Berhasil', description: 'Surat berhasil dihapus.' });
      fetchLetters();
    } catch (err) {
      console.error('Failed to delete letter', err);
      const errorMessage = (err as any)?.response?.data?.message || 'Gagal menghapus surat';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  const selectLetter = async (letter: Letter) => {
    setSelectedLetter(letter);
    setStatusDropdown(letter.current_status || '');
    setStatusManual('');
    setStatusNote('');
    try {
      const hist = await LetterService.getLetterHistory(letter.id);
      setHistory(hist);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const applyStatusUpdate = async () => {
    if (!selectedLetter) return;
    const status = statusManual?.trim() ? statusManual.trim() : statusDropdown;
    if (!status) return;
    if (!isAdmin) {
      toast({
        title: 'Akses ditolak',
        description: 'Hanya admin yang dapat memperbarui status surat. Silakan login sebagai admin.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await LetterService.updateLetterStatus(selectedLetter.id, status, statusNote?.trim() || undefined);
      // Refresh selected letter data
      const refreshed = await LetterService.getLetterById(selectedLetter.id);
      setSelectedLetter(refreshed);
      const hist = await LetterService.getLetterHistory(selectedLetter.id);
      setHistory(hist);
      // Also refresh list view
      fetchLetters();
      setStatusManual('');
      setStatusNote('');
    } catch (err: any) {
      console.error('Failed to update status', err);
      const errorMessage = err?.response?.data?.message || 'Gagal memperbarui status surat';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  // Edit/Delete History state & handlers
  const [editingHistoryId, setEditingHistoryId] = useState<number | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>('');
  const [editingNote, setEditingNote] = useState<string>('');

  const startEditHistory = (item: LetterStatusHistoryItem) => {
    setEditingHistoryId(item.id);
    setEditingStatus(item.status);
    setEditingNote(item.note || '');
  };
  const cancelEditHistory = () => {
    setEditingHistoryId(null);
    setEditingStatus('');
    setEditingNote('');
  };
  const saveEditHistory = async () => {
    if (!selectedLetter || !editingHistoryId) return;
    if (!isAdmin) {
      toast({ title: 'Akses ditolak', description: 'Hanya admin yang dapat mengedit riwayat.', variant: 'destructive' });
      return;
    }
    if (!editingStatus.trim()) return;
    try {
      await LetterService.updateHistoryItem(selectedLetter.id, editingHistoryId, { status: editingStatus.trim(), note: editingNote.trim() || null });
      const hist = await LetterService.getLetterHistory(selectedLetter.id);
      setHistory(hist);
      toast({ title: 'Berhasil', description: 'Riwayat berhasil diperbarui.' });
      cancelEditHistory();
    } catch (err: any) {
      console.error('Failed to update history item', err);
      const errorMessage = err?.response?.data?.message || 'Gagal memperbarui riwayat';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };
  const deleteHistoryItem = async (historyId: number) => {
    if (!selectedLetter) return;
    if (!isAdmin) {
      toast({ title: 'Akses ditolak', description: 'Hanya admin yang dapat menghapus riwayat.', variant: 'destructive' });
      return;
    }
    try {
      await LetterService.deleteHistoryItem(selectedLetter.id, historyId);
      const hist = await LetterService.getLetterHistory(selectedLetter.id);
      setHistory(hist);
      toast({ title: 'Berhasil', description: 'Riwayat berhasil dihapus.' });
      if (editingHistoryId === historyId) cancelEditHistory();
    } catch (err: any) {
      console.error('Failed to delete history item', err);
      const errorMessage = err?.response?.data?.message || 'Gagal menghapus riwayat';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  const fetchRekap = async () => {
    if (!rekapStart || !rekapEnd) return;
    try {
      const groupParam: 'day' | 'week' | 'month' = (rekapGroup || 'day');
      const data = await LetterService.getRekap(rekapStart, rekapEnd, groupParam);
      setRekap(data);
    } catch (err) {
      console.error('Failed to get rekap', err);
    }
  };

  // Auto-fill date range when group changes (choose group first → dates auto)
  useEffect(() => {
    if (!rekapGroup) return; // allow manual date selection when no group selected
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    if (rekapGroup === 'day') {
      setRekapStart(fmt(today));
      setRekapEnd(fmt(today));
    } else if (rekapGroup === 'week') {
      const dayIdx = today.getDay(); // 0=Sun..6=Sat
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((dayIdx + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      setRekapStart(fmt(monday));
      setRekapEnd(fmt(sunday));
    } else if (rekapGroup === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setRekapStart(fmt(start));
      setRekapEnd(fmt(end));
    }
  }, [rekapGroup]);

  const formatRekapPeriod = (period: string) => {
    const p = String(period);
    if (rekapGroup === 'month') {
      // Expect YYYY-MM → show MM-YYYY
      const [yyyy, mm] = p.split('-');
      if (yyyy && mm) return `${mm}-${yyyy}`;
      return p;
    }
    if (rekapGroup === 'week') {
      // MySQL YEARWEEK returns e.g., 202541 (YYYYWW)
      const yyyy = p.slice(0, 4);
      const ww = p.slice(4);
      if (yyyy && ww) return `Minggu ke-${ww} ${yyyy}`;
      return p;
    }
    // default day
    return formatDateID(p);
  };

  const onSort = (field: NonNullable<LetterFilters['sort_by']>) => {
    setFilters((prev) => ({
      ...prev,
      sort_by: field,
      sort_order: prev.sort_by === field && prev.sort_order === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  const statusBadge = (status?: string | null) => {
    const s = (status || '').toLowerCase();
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
    if (s.includes('diteruskan')) variant = 'secondary';
    else if (s.includes('diproses')) variant = 'outline';
    else if (s.includes('selesai')) variant = 'default';
    else variant = 'destructive';
    return <Badge variant={variant}>{status || '—'}</Badge>;
  };

  const totalLabel = useMemo(() => `${total} surat`, [total]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dinus-primary/5 via-dinus-secondary/10 to-dinus-gray relative">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23003d82' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Page container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-8">
        {/* Title & Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-dinus-primary via-dinus-primary-light to-dinus-secondary bg-clip-text text-transparent">
              Manajemen Surat (BIAK)
            </h2>
            <p className="text-sm text-dinus-text/60 font-medium">Kelola surat, status, pencarian, dan rekap laporan</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Arsip
            </Button>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="h-10 px-4 bg-gradient-to-r from-dinus-primary to-dinus-primary-light hover:from-dinus-primary-dark hover:to-dinus-primary text-white"
            >
              <FilePlus className="w-4 h-4 mr-2" />
              Tambah Surat
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRekapModal(true)}
              className="h-10 px-4 border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white"
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              Laporan & Rekap
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEducationModal(true)}
              className="h-10 px-4 border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Kelola Pendidikan
            </Button>
          </div>
        </div>

        {/* Modal: Input Surat */}
        <Dialog open={showCreateModal} onOpenChange={(open) => { setShowCreateModal(open); if (!open) { setEditingLetterId(null); } }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-dinus-text">{editingLetterId ? 'Edit Surat' : 'Input Data Surat'}</DialogTitle>
            </DialogHeader>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSaveLetter}>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-dinus-text">Jenis surat</label>
                <Select
                  value={letterType}
                  onValueChange={(v) => {
                    setLetterType(v as any);
                    if (v === 'pengganti_ijazah') {
                      setDetails({
                        nim: '',
                        nama: '',
                        jenjang_pendidikan: '',
                        fakultas: '',
                        program_studi: '',
                        tanggal_lulus: '',
                        no_seri: '',
                        nirl: '',
                      });
                    } else if (v === 'keterangan') {
                      setDetails({
                        nim: '',
                        nama: '',
                        jenjang_pendidikan: '',
                        fakultas: '',
                        program_studi: '',
                      });
                    } else {
                      setDetails({});
                    }
                  }}
                >
                  <SelectTrigger className="mt-1 h-10 border-2 focus:border-dinus-primary">
                    <SelectValue placeholder="Pilih Jenis Surat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="biasa">Surat Biasa</SelectItem>
                    <SelectItem value="pengganti_ijazah">Surat Pengganti Ijazah & Transkrip</SelectItem>
                    <SelectItem value="keterangan">Surat Keterangan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-dinus-text">Nama surat</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama surat" className="mt-1 h-10 border-2 focus:border-dinus-primary" />
              </div>
              <div>
                <label className="text-sm font-medium text-dinus-text">Tanggal surat</label>
                <Input type="date" value={date} onChange={(e) => { setDate(e.target.value); }} className="mt-1 h-10 border-2 focus:border-dinus-primary" />
              </div>
              <div>
                <label className="text-sm font-medium text-dinus-text">Pengirim</label>
                <Input value={sender} onChange={(e) => setSender(e.target.value)} placeholder="Pengirim" className="mt-1 h-10 border-2 focus:border-dinus-primary" />
              </div>
              <div>
                <label className="text-sm font-medium text-dinus-text">Penerima</label>
                <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Penerima" className="mt-1 h-10 border-2 focus:border-dinus-primary" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-dinus-text">Perihal surat</label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Perihal" className="mt-1 h-10 border-2 focus:border-dinus-primary" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-dinus-text">Upload File (Opsional)</label>
                {existingFilePath && !selectedFile && (
                  <div className="mt-1 mb-2 p-3 bg-gray-50 border rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">File saat ini: {existingFilePath.split('/').pop()}</span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`http://localhost:5000/uploads/${existingFilePath}`, '_blank')}
                        >
                          Download
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setExistingFilePath(null)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {(!existingFilePath || selectedFile) && (
                  <Input 
                    type="file" 
                    accept=".jpg,.jpeg,.png,.gif,.pdf" 
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} 
                    className="mt-1 h-10 border-2 focus:border-dinus-primary" 
                  />
                )}
                {selectedFile && (
                  <div className="mt-2 p-2 bg-blue-50 border rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">File baru: {selectedFile.name}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-dinus-text/60 mt-1">Format yang didukung: JPG, PNG, GIF, PDF (Maksimal 5MB)</p>
              </div>
              {/* Field tambahan berdasarkan jenis surat */}
              {letterType && letterType !== 'biasa' && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-md p-4">
                  {(letterType === 'pengganti_ijazah' || letterType === 'keterangan') && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-dinus-text">NIM</label>
                        <Input value={details.nim || ''} onChange={(e) => setDetails({ ...details, nim: e.target.value })} placeholder="NIM" className="mt-1 h-10 border-2 focus:border-dinus-primary" />
                      </div>
                      <div>
            <label className="text-sm font-medium text-dinus-text">Nama</label>
            <Input value={details.nama || ''} onChange={(e) => setDetails({ ...details, nama: e.target.value })} placeholder="Nama" className="mt-1 h-10 border-2 focus:border-dinus-primary" />
            <label className="mt-4 text-sm font-medium text-dinus-text">Nomor Telepon</label>
            <Input value={details.telepon || ''} onChange={(e) => setDetails({ ...details, telepon: e.target.value })} placeholder="Nomor Telepon" className="mt-1 h-10 border-2 focus:border-dinus-primary" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-dinus-text">Jenjang Pendidikan</label>
                        <Select value={details.jenjang_pendidikan || undefined} onValueChange={(v) => {
                          // reset program studi when changing level
                          setDetails({ ...details, jenjang_pendidikan: v, program_studi: '' });
                        }}>
                          <SelectTrigger className="mt-1 h-10 border-2 focus:border-dinus-primary">
                            <SelectValue placeholder="Pilih Jenjang" />
                          </SelectTrigger>
                          <SelectContent>
                            {levels.length
                              ? levels.map((l) => (
                                  <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>
                                ))
                              : <SelectItem key="placeholder-level" value="__PLACEHOLDER__" disabled>— Data jenjang belum tersedia —</SelectItem>}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-dinus-text">Fakultas</label>
                        <Select value={details.fakultas || undefined} onValueChange={(v) => {
                          // reset program studi when changing faculty
                          setDetails({ ...details, fakultas: v, program_studi: '' });
                        }}>
                          <SelectTrigger className="mt-1 h-10 border-2 focus:border-dinus-primary">
                            <SelectValue placeholder="Pilih Fakultas" />
                          </SelectTrigger>
                          <SelectContent>
                            {faculties.length
                              ? faculties.map((f) => (
                                  <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>
                                ))
                              : <SelectItem key="placeholder-faculty" value="__PLACEHOLDER__" disabled>— Data fakultas belum tersedia —</SelectItem>}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-dinus-text">Program Studi</label>
                        <Select value={details.program_studi || undefined} onValueChange={(v) => setDetails({ ...details, program_studi: v })}>
                          <SelectTrigger className="mt-1 h-10 border-2 focus:border-dinus-primary">
                            <SelectValue placeholder="Pilih Program Studi" />
                          </SelectTrigger>
                          <SelectContent>
                            {(() => {
                              const selectedFaculty = faculties.find((f) => f.name === (details.fakultas || ''));
                              const selectedLevel = levels.find((l) => l.name === (details.jenjang_pendidikan || ''));
                              const filtered = programs.filter((p) => {
                                const facOk = selectedFaculty ? p.faculty_id === selectedFaculty.id : false;
                                const lvlOk = selectedLevel ? (p.level_id == null || p.level_id === selectedLevel.id) : true;
                                return facOk && lvlOk;
                              });
                              const names = filtered.map((p) => p.name);
                              return names.length
                                ? names.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)
                                : [<SelectItem key="placeholder-program" value="__PLACEHOLDER__" disabled>— Pilih jenjang & fakultas terlebih dahulu —</SelectItem>];
                            })()}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  {letterType === 'pengganti_ijazah' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-dinus-text">Tanggal Lulus</label>
                        <Input type="date" value={details.tanggal_lulus || ''} onChange={(e) => setDetails({ ...details, tanggal_lulus: e.target.value })} className="mt-1 h-10 border-2 focus:border-dinus-primary" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-dinus-text">No. Seri</label>
                        <Input value={details.no_seri || ''} onChange={(e) => setDetails({ ...details, no_seri: e.target.value })} placeholder="Nomor Seri" className="mt-1 h-10 border-2 focus:border-dinus-primary" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-dinus-text">NIRL</label>
                        <Input value={details.nirl || ''} onChange={(e) => setDetails({ ...details, nirl: e.target.value })} placeholder="NIRL" className="mt-1 h-10 border-2 focus:border-dinus-primary" />
                      </div>
                    </>
                  )}
                </div>
              )}
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <Button type="submit" disabled={!name || !date || !sender || !recipient || !subject || (!editingLetterId && !letterType)} className="h-10 px-6 bg-gradient-to-r from-dinus-primary to-dinus-primary-light hover:from-dinus-primary-dark hover:to-dinus-primary text-white shadow-md">{editingLetterId ? 'Perbarui' : 'Simpan'}</Button>
                <Button type="button" variant="outline" onClick={resetForm} className="h-10 px-6 border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white">Reset</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal: Kelola Pendidikan */}
        <EducationModal isOpen={showEducationModal} onClose={() => setShowEducationModal(false)} />

        {/* Modal: Manajemen Status */}
        <Dialog open={!!selectedLetter} onOpenChange={(open) => { if (!open) setSelectedLetter(null); }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedLetter && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-dinus-text">Manajemen Status: {selectedLetter.name}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-dinus-text">Pilih status</label>
                    <Select
                      value={statusDropdown || undefined}
                      onValueChange={(v) => setStatusDropdown(v === SELECT_STATUS_NONE ? '' : v)}
                    >
                      <SelectTrigger className="mt-1 h-10 border-2 focus:border-dinus-primary">
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SELECT_STATUS_NONE}>—</SelectItem>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dinus-text">Atau ketik manual</label>
                    <Input value={statusManual} onChange={(e) => setStatusManual(e.target.value)} placeholder="Contoh: Diterima oleh TU" className="mt-1 h-10 border-2 focus:border-dinus-primary" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-dinus-text">Catatan (opsional)</label>
                    <Textarea value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="Catatan tambahan" className="mt-1" />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <Button onClick={applyStatusUpdate} disabled={!statusDropdown && !statusManual} className="h-10 px-6 bg-gradient-to-r from-dinus-primary to-dinus-primary-light hover:from-dinus-primary-dark hover:to-dinus-primary text-white">Simpan Status</Button>
                  </div>
                  {(selectedLetter.letter_type === 'pengganti_ijazah' || selectedLetter.letter_type === 'keterangan') && (String(selectedLetter.current_status || '').toLowerCase() === 'diterima') && (
                    <div className="md:col-span-2 flex justify-end">
                      <Button onClick={handlePrintReceipt} variant="outline" className="h-10 px-6 border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white">Cetak / Export PDF</Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2 mt-4">
                  <h4 className="font-medium text-dinus-text">Riwayat Status</h4>
                  <ul className="space-y-2">
                    {history.map((h) => (
                      <li key={h.id} className="text-sm text-dinus-text/80">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            [{formatDateTimeID(h.created_at)}] {h.status}{h.note ? ` — ${h.note}` : ''}
                          </div>
                          <div className="flex-shrink-0 flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => startEditHistory(h)} className="h-8 px-2 border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white">Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteHistoryItem(h.id)} className="h-8 px-2">Hapus</Button>
                          </div>
                        </div>
                        {editingHistoryId === h.id && (
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <Input value={editingStatus} onChange={(e) => setEditingStatus(e.target.value)} placeholder="Status" className="h-9" />
                            </div>
                            <div>
                              <Input value={editingNote} onChange={(e) => setEditingNote(e.target.value)} placeholder="Catatan (opsional)" className="h-9" />
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-2">
                              <Button size="sm" onClick={saveEditHistory} disabled={!editingStatus.trim()} className="h-9 px-3 bg-gradient-to-r from-dinus-primary to-dinus-primary-light hover:from-dinus-primary-dark hover:to-dinus-primary text-white">Simpan</Button>
                              <Button size="sm" variant="outline" onClick={cancelEditHistory} className="h-9 px-3 border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white">Batal</Button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                    {history.length === 0 && (
                      <li className="text-sm text-muted-foreground">Belum ada riwayat</li>
                    )}
                  </ul>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal: Laporan & Rekap */}
        <Dialog open={showRekapModal} onOpenChange={setShowRekapModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-dinus-text">Laporan & Rekap</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-dinus-text">Group</label>
                <Select value={rekapGroup || SELECT_GROUP_NONE} onValueChange={(v) => setRekapGroup(v === SELECT_GROUP_NONE ? '' : (v as 'day' | 'week' | 'month'))}>
                  <SelectTrigger className="mt-1 h-10 border-2 focus:border-dinus-primary">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SELECT_GROUP_NONE}>—</SelectItem>
                    <SelectItem value="day">Harian</SelectItem>
                    <SelectItem value="week">Mingguan</SelectItem>
                    <SelectItem value="month">Bulanan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-dinus-text">Mulai</label>
                <Input type="date" value={rekapStart} onChange={(e) => setRekapStart(e.target.value)} className="mt-1 h-10 border-2 focus:border-dinus-primary" />
              </div>
              <div>
                <label className="text-sm font-medium text-dinus-text">Sampai</label>
                <Input type="date" value={rekapEnd} onChange={(e) => setRekapEnd(e.target.value)} className="mt-1 h-10 border-2 focus:border-dinus-primary" />
              </div>
              <div className="flex items-end">
                <Button onClick={fetchRekap} disabled={!rekapStart || !rekapEnd} className="h-10 px-6 bg-gradient-to-r from-dinus-primary to-dinus-primary-light hover:from-dinus-primary-dark hover:to-dinus-primary text-white">Tampilkan</Button>
              </div>
            </div>
            <div className="overflow-auto mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periode</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rekap.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{formatRekapPeriod(r.period)}</TableCell>
                      <TableCell>{r.total}</TableCell>
                    </TableRow>
                  ))}
                  {rekap.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-sm text-muted-foreground py-6">Belum ada data</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Letter (moved to modal) */}
        {false && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-dinus-text">Input Data Surat</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSaveLetter}>
            <div>
              <label className="text-sm font-medium text-dinus-text">Nama surat</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama surat" className="mt-1 h-10 border-2 focus:border-dinus-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-dinus-text">Tanggal surat</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 h-10 border-2 focus:border-dinus-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-dinus-text">Pengirim</label>
              <Input value={sender} onChange={(e) => setSender(e.target.value)} placeholder="Pengirim" className="mt-1 h-10 border-2 focus:border-dinus-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-dinus-text">Penerima</label>
              <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Penerima" className="mt-1 h-10 border-2 focus:border-dinus-primary" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-dinus-text">Perihal surat</label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Perihal" className="mt-1 h-10 border-2 focus:border-dinus-primary" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <Button type="submit" disabled={!name || !date || !sender || !recipient || !subject} className="h-10 px-6 bg-gradient-to-r from-dinus-primary to-dinus-primary-light hover:from-dinus-primary-dark hover:to-dinus-primary text-white shadow-md">Simpan</Button>
              <Button type="button" variant="outline" onClick={resetForm} className="h-10 px-6 border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white">Reset</Button>
            </div>
          </form>
        </Card>
        )}

        {/* Filters: real-time search + single date */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-dinus-text">Pencarian & Filter</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Cari nama/perihal (real-time)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 border-2 focus-dinus-primary"
            />
            <Input
              type="date"
              value={filters.date || ''}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="h-10 border-2 focus-dinus-primary"
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-dinus-text/60">{totalLabel}</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => { setSearchTerm(''); setFilters({ sort_by: 'created_at', sort_order: 'DESC' }); setPage(1); }}
                className="h-10 px-6 border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white"
              >
                Reset
              </Button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-dinus-text">Daftar Surat</h3>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => onSort('name')} className="cursor-pointer">Nama</TableHead>
                  <TableHead onClick={() => onSort('date')} className="cursor-pointer">Tanggal</TableHead>
                  <TableHead onClick={() => onSort('sender')} className="cursor-pointer">Pengirim</TableHead>
                  <TableHead onClick={() => onSort('recipient')} className="cursor-pointer">Penerima</TableHead>
                  <TableHead onClick={() => onSort('current_status')} className="cursor-pointer">Status</TableHead>
                  <TableHead>Kelola Status</TableHead>
                  <TableHead>Edit</TableHead>
                  <TableHead>Hapus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {letters.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell>{formatDateID(l.date)}</TableCell>
                    <TableCell>{l.sender}</TableCell>
                    <TableCell>{l.recipient}</TableCell>
                    <TableCell>{statusBadge(l.current_status)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => selectLetter(l)} className="border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white">Kelola Status</Button>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => startEditLetter(l)} className="border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white">Edit</Button>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteLetter(l.id)} className="">Hapus</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {letters.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">{loading ? 'Memuat...' : 'Tidak ada data'}</TableCell>
                  </TableRow>
                )}
              </TableBody>
              {letters.length > 0 && (
                <TableCaption className="pt-4">Total {total} surat</TableCaption>
              )}
            </Table>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-dinus-text/70">Halaman {page} dari {totalPages}</div>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white">Prev</Button>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white">Next</Button>
            </div>
          </div>
        </Card>

        {/* Status Management */}
        {false && selectedLetter && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-dinus-text">Manajemen Status Surat: {selectedLetter.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-dinus-text">Pilih status</label>
                <Select
                  value={statusDropdown || undefined}
                  onValueChange={(v) => setStatusDropdown(v === SELECT_STATUS_NONE ? '' : v)}
                >
                  <SelectTrigger className="mt-1 h-10 border-2 focus:border-dinus-primary">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SELECT_STATUS_NONE}>—</SelectItem>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-dinus-text">Atau ketik manual</label>
                <Input value={statusManual} onChange={(e) => setStatusManual(e.target.value)} placeholder="Contoh: Diterima oleh TU" className="mt-1 h-10 border-2 focus:border-dinus-primary" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-dinus-text">Catatan (opsional)</label>
                <Textarea value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="Catatan tambahan" className="mt-1" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button onClick={applyStatusUpdate} disabled={!statusDropdown && !statusManual} className="h-10 px-6 bg-gradient-to-r from-dinus-primary to-dinus-primary-light hover:from-dinus-primary-dark hover:to-dinus-primary text-white">Simpan Status</Button>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-dinus-text">Riwayat Status</h4>
              <ul className="space-y-2">
                {history.map((h) => (
                  <li key={h.id} className="text-sm text-dinus-text/80">
                    [{new Date(h.created_at).toLocaleString()}] {h.status}{h.note ? ` — ${h.note}` : ''}
                  </li>
                ))}
                {history.length === 0 && (
                  <li className="text-sm text-muted-foreground">Belum ada riwayat</li>
                )}
              </ul>
            </div>
          </Card>
        )}

        {/* Rekap (moved to modal) */}
        {false && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-dinus-text">Laporan & Rekap</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-dinus-text">Mulai</label>
              <Input type="date" value={rekapStart} onChange={(e) => setRekapStart(e.target.value)} className="mt-1 h-10 border-2 focus:border-dinus-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-dinus-text">Sampai</label>
              <Input type="date" value={rekapEnd} onChange={(e) => setRekapEnd(e.target.value)} className="mt-1 h-10 border-2 focus:border-dinus-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-dinus-text">Group</label>
              <Select value={rekapGroup} onValueChange={(v) => setRekapGroup(v as 'day' | 'week' | 'month')}>
                <SelectTrigger className="mt-1 h-10 border-2 focus:border-dinus-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Harian</SelectItem>
                  <SelectItem value="week">Mingguan</SelectItem>
                  <SelectItem value="month">Bulanan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchRekap} disabled={!rekapStart || !rekapEnd} className="h-10 px-6 bg-gradient-to-r from-dinus-primary to-dinus-primary-light hover:from-dinus-primary-dark hover:to-dinus-primary text-white">Tampilkan</Button>
            </div>
          </div>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Periode</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rekap.map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{r.period}</TableCell>
                    <TableCell>{r.total}</TableCell>
                  </TableRow>
                ))}
                {rekap.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-sm text-muted-foreground py-6">Belum ada data</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LetterManagement;