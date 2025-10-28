import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EducationService from '@/services/education.service';
import { EducationLevel, Faculty, Program } from '@/types/education.types';
import { Save, X, Plus, Trash2, Edit, GraduationCap, School, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EducationModal: React.FC<EducationModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'level' | 'faculty' | 'program'>('level');

  // Levels state
  const [levels, setLevels] = useState<EducationLevel[]>([]);
  const [levelForm, setLevelForm] = useState<{ id: number | null; name: string }>({ id: null, name: '' });
  const [editingLevel, setEditingLevel] = useState(false);

  // Faculties state
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [facultyForm, setFacultyForm] = useState<{ id: number | null; name: string }>({ id: null, name: '' });
  const [editingFaculty, setEditingFaculty] = useState(false);

  // Programs state
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programForm, setProgramForm] = useState<{ id: number | null; name: string; faculty_id: number | null; level_id: number | null }>({ id: null, name: '', faculty_id: null, level_id: null });
  const [editingProgram, setEditingProgram] = useState(false);

  const resetForms = () => {
    setLevelForm({ id: null, name: '' });
    setEditingLevel(false);
    setFacultyForm({ id: null, name: '' });
    setEditingFaculty(false);
    setProgramForm({ id: null, name: '', faculty_id: null, level_id: null });
    setEditingProgram(false);
  };

  const reloadAll = async () => {
    const [lv, fc, pr] = await Promise.all([
      EducationService.getLevels(),
      EducationService.getFaculties(),
      EducationService.getPrograms(),
    ]);
    setLevels(lv);
    setFaculties(fc);
    setPrograms(pr);
  };

  useEffect(() => {
    if (isOpen) reloadAll();
  }, [isOpen]);

  const programsByFaculty = useMemo(() => {
    const map: Record<number, Program[]> = {};
    programs.forEach((p) => {
      if (!map[p.faculty_id]) map[p.faculty_id] = [];
      map[p.faculty_id].push(p);
    });
    return map;
  }, [programs]);

  // Handlers: Levels
  const submitLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelForm.name.trim()) {
      toast({ title: 'Error', description: 'Nama jenjang tidak boleh kosong', variant: 'destructive' });
      return;
    }
    if (editingLevel && levelForm.id) {
      await EducationService.updateLevel(levelForm.id, { name: levelForm.name });
      toast({ title: 'Sukses', description: 'Jenjang diperbarui' });
    } else {
      await EducationService.createLevel(levelForm.name);
      toast({ title: 'Sukses', description: 'Jenjang ditambahkan' });
    }
    resetForms();
    await reloadAll();
  };
  const editLevel = (l: EducationLevel) => {
    setLevelForm({ id: l.id, name: l.name });
    setEditingLevel(true);
    setActiveTab('level');
  };
  const deleteLevel = async (id: number) => {
    if (!window.confirm('Hapus jenjang ini?')) return;
    await EducationService.deleteLevel(id);
    toast({ title: 'Sukses', description: 'Jenjang dihapus' });
    await reloadAll();
  };

  // Handlers: Faculties
  const submitFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyForm.name.trim()) {
      toast({ title: 'Error', description: 'Nama fakultas tidak boleh kosong', variant: 'destructive' });
      return;
    }
    if (editingFaculty && facultyForm.id) {
      await EducationService.updateFaculty(facultyForm.id, { name: facultyForm.name });
      toast({ title: 'Sukses', description: 'Fakultas diperbarui' });
    } else {
      await EducationService.createFaculty(facultyForm.name);
      toast({ title: 'Sukses', description: 'Fakultas ditambahkan' });
    }
    resetForms();
    await reloadAll();
  };
  const editFaculty = (f: Faculty) => {
    setFacultyForm({ id: f.id, name: f.name });
    setEditingFaculty(true);
    setActiveTab('faculty');
  };
  const deleteFaculty = async (id: number) => {
    if (!window.confirm('Hapus fakultas ini?')) return;
    await EducationService.deleteFaculty(id);
    toast({ title: 'Sukses', description: 'Fakultas dihapus' });
    await reloadAll();
  };

  // Handlers: Programs
  const submitProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programForm.name.trim()) {
      toast({ title: 'Error', description: 'Nama program studi tidak boleh kosong', variant: 'destructive' });
      return;
    }
    if (!programForm.faculty_id) {
      toast({ title: 'Error', description: 'Pilih fakultas induk', variant: 'destructive' });
      return;
    }
    if (!programForm.level_id) {
      toast({ title: 'Error', description: 'Pilih jenjang pendidikan', variant: 'destructive' });
      return;
    }
    if (editingProgram && programForm.id) {
      await EducationService.updateProgram(programForm.id, { name: programForm.name, faculty_id: programForm.faculty_id!, level_id: programForm.level_id! });
      toast({ title: 'Sukses', description: 'Program studi diperbarui' });
    } else {
      await EducationService.createProgram(programForm.name, programForm.faculty_id!, programForm.level_id!);
      toast({ title: 'Sukses', description: 'Program studi ditambahkan' });
    }
    resetForms();
    await reloadAll();
  };
  const editProgram = (p: Program) => {
    setProgramForm({ id: p.id, name: p.name, faculty_id: p.faculty_id, level_id: p.level_id ?? null });
    setEditingProgram(true);
    setActiveTab('program');
  };
  const deleteProgram = async (id: number) => {
    if (!window.confirm('Hapus program studi ini?')) return;
    await EducationService.deleteProgram(id);
    toast({ title: 'Sukses', description: 'Program studi dihapus' });
    await reloadAll();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-dinus-text">Kelola Jenjang, Fakultas & Prodi</DialogTitle>
        </DialogHeader>

        <div className="flex space-x-2 mb-4">
          <Button type="button" variant={activeTab === 'level' ? 'default' : 'outline'} onClick={() => setActiveTab('level')} className={activeTab === 'level' ? 'bg-dinus-primary text-white' : 'border-dinus-primary/20 text-dinus-text'}>
            <GraduationCap className="w-4 h-4 mr-2" /> Jenjang
          </Button>
          <Button type="button" variant={activeTab === 'faculty' ? 'default' : 'outline'} onClick={() => setActiveTab('faculty')} className={activeTab === 'faculty' ? 'bg-dinus-primary text-white' : 'border-dinus-primary/20 text-dinus-text'}>
            <School className="w-4 h-4 mr-2" /> Fakultas
          </Button>
          <Button type="button" variant={activeTab === 'program' ? 'default' : 'outline'} onClick={() => setActiveTab('program')} className={activeTab === 'program' ? 'bg-dinus-primary text-white' : 'border-dinus-primary/20 text-dinus-text'}>
            <BookOpen className="w-4 h-4 mr-2" /> Program Studi
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {activeTab === 'level' && (
            <div className="space-y-4">
              <form onSubmit={submitLevel} className="space-y-4 border border-dinus-primary/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-dinus-text">{editingLevel ? 'Edit Jenjang' : 'Tambah Jenjang Baru'}</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="level_name" className="text-sm font-semibold text-dinus-text">Nama Jenjang *</Label>
                    <Input id="level_name" type="text" value={levelForm.name} onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })} placeholder="Contoh: S1" required className="mt-1" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  {editingLevel && (
                    <Button type="button" variant="outline" onClick={resetForms} className="flex-1 border-dinus-primary/20 text-dinus-text hover:bg-dinus-gray">
                      <X className="w-4 h-4 mr-2" /> Batal Edit
                    </Button>
                  )}
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-dinus-primary to-dinus-primary-light hover:from-dinus-primary-dark hover:to-dinus-primary text-white">
                    <Save className="w-4 h-4 mr-2" /> {editingLevel ? 'Perbarui' : 'Simpan'} Jenjang
                  </Button>
                </div>
              </form>
              <div className="border border-dinus-primary/20 rounded-lg p-4">
                <h4 className="font-medium text-dinus-text">Daftar Jenjang</h4>
                <ul className="space-y-2 mt-2">
                  {levels.map((l) => (
                    <li key={l.id} className="flex items-center justify-between text-sm text-dinus-text/90">
                      <span>{l.name}</span>
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => editLevel(l)} className="h-8 px-2 border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white"><Edit className="w-4 h-4" /></Button>
                        <Button type="button" size="sm" variant="destructive" onClick={() => deleteLevel(l.id)} className="h-8 px-2"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </li>
                  ))}
                  {levels.length === 0 && <li className="text-sm text-muted-foreground">Belum ada data</li>}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'faculty' && (
            <div className="space-y-4">
              <form onSubmit={submitFaculty} className="space-y-4 border border-dinus-primary/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-dinus-text">{editingFaculty ? 'Edit Fakultas' : 'Tambah Fakultas Baru'}</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="faculty_name" className="text-sm font-semibold text-dinus-text">Nama Fakultas *</Label>
                    <Input id="faculty_name" type="text" value={facultyForm.name} onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })} placeholder="Contoh: FIK" required className="mt-1" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  {editingFaculty && (
                    <Button type="button" variant="outline" onClick={resetForms} className="flex-1 border-dinus-primary/20 text-dinus-text hover:bg-dinus-gray">
                      <X className="w-4 h-4 mr-2" /> Batal Edit
                    </Button>
                  )}
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-dinus-primary to-dinus-primary-light hover:from-dinus-primary-dark hover:to-dinus-primary text-white">
                    <Save className="w-4 h-4 mr-2" /> {editingFaculty ? 'Perbarui' : 'Simpan'} Fakultas
                  </Button>
                </div>
              </form>
              <div className="border border-dinus-primary/20 rounded-lg p-4">
                <h4 className="font-medium text-dinus-text">Daftar Fakultas</h4>
                <ul className="space-y-2 mt-2">
                  {faculties.map((f) => (
                    <li key={f.id} className="flex items-center justify-between text-sm text-dinus-text/90">
                      <span>{f.name}</span>
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => editFaculty(f)} className="h-8 px-2 border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white"><Edit className="w-4 h-4" /></Button>
                        <Button type="button" size="sm" variant="destructive" onClick={() => deleteFaculty(f.id)} className="h-8 px-2"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </li>
                  ))}
                  {faculties.length === 0 && <li className="text-sm text-muted-foreground">Belum ada data</li>}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'program' && (
            <div className="space-y-4">
              <form onSubmit={submitProgram} className="space-y-4 border border-dinus-primary/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-dinus-text">{editingProgram ? 'Edit Program Studi' : 'Tambah Program Studi Baru'}</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="program_name" className="text-sm font-semibold text-dinus-text">Nama Program Studi *</Label>
                    <Input id="program_name" type="text" value={programForm.name} onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })} placeholder="Contoh: Sistem Informasi" required className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-dinus-text">Fakultas Induk *</Label>
                    <Select value={programForm.faculty_id?.toString() || ''} onValueChange={(v) => setProgramForm({ ...programForm, faculty_id: parseInt(v) })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Pilih fakultas" />
                      </SelectTrigger>
                      <SelectContent>
                        {faculties.map((f) => (
                          <SelectItem key={f.id} value={f.id.toString()}>{f.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-dinus-text">Jenjang Pendidikan *</Label>
                    <Select value={programForm.level_id?.toString() || ''} onValueChange={(v) => setProgramForm({ ...programForm, level_id: parseInt(v) })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Pilih jenjang" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((l) => (
                          <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  {editingProgram && (
                    <Button type="button" variant="outline" onClick={resetForms} className="flex-1 border-dinus-primary/20 text-dinus-text hover:bg-dinus-gray">
                      <X className="w-4 h-4 mr-2" /> Batal Edit
                    </Button>
                  )}
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-dinus-primary to-dinus-primary-light hover:from-dinus-primary-dark hover:to-dinus-primary text-white">
                    <Save className="w-4 h-4 mr-2" /> {editingProgram ? 'Perbarui' : 'Simpan'} Program Studi
                  </Button>
                </div>
              </form>

              <div className="border border-dinus-primary/20 rounded-lg p-4">
                <h4 className="font-medium text-dinus-text">Daftar Program Studi</h4>
                <ul className="space-y-2 mt-2">
                  {programs.map((p) => (
                    <li key={p.id} className="text-sm text-dinus-text/90">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-dinus-text/60">Fakultas: {faculties.find((f) => f.id === p.faculty_id)?.name || '—'} • Jenjang: {levels.find((l) => l.id === (p.level_id ?? -1))?.name || '—'}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => editProgram(p)} className="h-8 px-2 border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white"><Edit className="w-4 h-4" /></Button>
                          <Button type="button" size="sm" variant="destructive" onClick={() => deleteProgram(p.id)} className="h-8 px-2"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </li>
                  ))}
                  {programs.length === 0 && <li className="text-sm text-muted-foreground">Belum ada data</li>}
                </ul>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EducationModal;