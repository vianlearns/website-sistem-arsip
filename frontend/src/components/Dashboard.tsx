import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { getImageUrl } from '@/lib/api';
import { Archive as ArchiveType } from '@/types/archive.types';
import { 
  Archive, 
  Plus, 
  Search, 
  LogOut, 
  User, 
  Calendar,
  MapPin,
  Camera,
  Eye,
  Edit,
  Trash2,
  Settings,
  Save,
  X,
  Mail,
  Filter,
  FilterX
} from 'lucide-react';
import ArchiveService from "@/services/archive.service";
import { useArchives, useArchiveOperations } from '@/hooks/useArchives';
import ArchiveModal from './ArchiveModal';
import FieldContentManagement from './FieldContentManagement';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStaticFields } from '@/hooks/useStaticFields';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const Dashboard = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Removed redirect to login - allowing non-authenticated users to access dashboard
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showArchiveForm, setShowArchiveForm] = useState(false);
  const [showFieldContentManagement, setShowFieldContentManagement] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState<ArchiveType | null>(null);
  const [editingArchive, setEditingArchive] = useState<ArchiveType | null>(null);
  
  // Filter states
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterSubcategory, setFilterSubcategory] = useState<string>('');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Reset child filters when parent filter changes
  useEffect(() => {
    if (filterCategory) {
      setFilterSubcategory('');
      setFilterLocation('');
    }
  }, [filterCategory]);

  useEffect(() => {
    if (filterSubcategory) {
      setFilterLocation('');
    }
  }, [filterSubcategory]);

  // Keyboard shortcut for filter toggle
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        setShowFilters(!showFilters);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showFilters]);

  const filters = useMemo(() => ({
    search: debouncedSearchTerm,
  }), [debouncedSearchTerm]);

  const { archives, loading, refreshArchives } = useArchives(filters);
  const { 
    categories, 
    subcategories, 
    locations, 
    cabinets, 
    shelves, 
    positions,
    loading: staticFieldsLoading 
  } = useStaticFields();
  const { deleteArchive } = useArchiveOperations();

  const handleDeleteArchive = async (id: number, title: string) => {
    try {
      await deleteArchive(id);
      refreshArchives();
      toast({
        title: "Arsip Dihapus",
        description: `Arsip "${title}" berhasil dihapus.`,
      });
    } catch (error) {
      // Error already handled by useArchiveOperations
    }
  };

  const handleEditArchive = (archive: ArchiveType) => {
    setEditingArchive(archive);
    setShowArchiveForm(true);
  };

  const handleViewArchive = (archive: ArchiveType) => {
    setSelectedArchive(archive);
    setShowArchiveModal(true);
  };

  const clearAllFilters = () => {
    setFilterCategory('');
    setFilterSubcategory('');
    setFilterLocation('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setSearchTerm('');
  };

  const hasActiveFilters = filterCategory || filterSubcategory || filterLocation || filterDateFrom || filterDateTo;

  // Advanced filtering logic
  const filteredArchives = useMemo(() => {
    return archives.filter(archive => {
      // Search term filter
      const matchesSearch = !debouncedSearchTerm || 
        archive.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        archive.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      // Category filter
      const matchesCategory = !filterCategory || 
        archive.category_id?.toString() === filterCategory;

      // Subcategory filter
      const matchesSubcategory = !filterSubcategory || 
        archive.subcategory_id?.toString() === filterSubcategory;

      // Location filter
      const matchesLocation = !filterLocation || 
        archive.location_id?.toString() === filterLocation;

      // Date range filter
      const archiveDate = new Date(archive.created_at);
      const matchesDateFrom = !filterDateFrom || 
        archiveDate >= new Date(filterDateFrom);
      const matchesDateTo = !filterDateTo || 
        archiveDate <= new Date(filterDateTo + 'T23:59:59');

      return matchesSearch && matchesCategory && matchesSubcategory && 
             matchesLocation && matchesDateFrom && matchesDateTo;
    });
  }, [archives, debouncedSearchTerm, filterCategory, filterSubcategory, filterLocation, filterDateFrom, filterDateTo]);

  const fieldCount = categories.length + subcategories.length + locations.length + cabinets.length + shelves.length + positions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dinus-primary/5 via-dinus-secondary/10 to-dinus-gray relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23003d82' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-dinus-primary/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4 mb-2 sm:mb-0">
              <div className="w-12 h-12 p-1.5 bg-white rounded-full shadow-md border-2 border-dinus-primary/10">
                <img 
                  src="/logo.png" 
                  alt="UDINUS Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-dinus-primary via-dinus-primary-light to-dinus-secondary bg-clip-text text-transparent">
                  DINUS Archive Dashboard
                </h1>
                <p className="text-sm text-dinus-text/60 font-medium">Universitas Dian Nuswantoro</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 text-sm text-dinus-text/70">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{user.name}</span>
                    {isAdmin && (
                      <Badge variant="outline" className="ml-2 border-dinus-primary/30 text-dinus-primary text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/surat')}
                    className="border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Surat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/surat')}
                    className="border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Surat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin')}
                    className="border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Login Admin
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-dinus-primary/10 rounded-xl flex items-center justify-center">
                  <Archive className="w-6 h-6 text-dinus-primary" />
                </div>
                <div>
                  <p className="text-sm text-dinus-text/60">Total Arsip</p>
                  <p className="text-2xl font-bold text-dinus-text">{loading ? '...' : archives.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-dinus-primary/10 rounded-xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-dinus-primary" />
                </div>
                <div>
                  <p className="text-sm text-dinus-text/60">Field Tersedia</p>
                  <p className="text-2xl font-bold text-dinus-text">{fieldCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-dinus-primary/10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-dinus-primary" />
                </div>
                <div>
                  <p className="text-sm text-dinus-text/60">Arsip Terbaru</p>
                  <p className="text-lg font-semibold text-dinus-text">
                    {archives.length > 0 ? new Date(archives[0].created_at).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dinus-text/40" />
              <Input
                placeholder="Cari arsip berdasarkan judul, deskripsi, atau tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-2 focus:border-dinus-primary"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              title="Toggle Filter (Ctrl+F)"
              className={`h-12 px-4 border-2 transition-all duration-200 ${
                showFilters || hasActiveFilters 
                  ? 'border-dinus-primary bg-dinus-primary text-white' 
                  : 'border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white'
              }`}
            >
              <Filter className="w-5 h-5" />
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                title="Hapus Semua Filter"
                className="h-12 px-4 border-2 border-red-200 text-red-600 hover:bg-red-50"
              >
                <FilterX className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-dinus-text">Kategori</Label>
                    <Select value={filterCategory || undefined} onValueChange={(value) => setFilterCategory(value || '')}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Semua Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subcategory Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-dinus-text">Sub Kategori</Label>
                    <Select value={filterSubcategory || undefined} onValueChange={(value) => setFilterSubcategory(value || '')}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Semua Sub Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategories
                          .filter(sub => !filterCategory || sub.category_id.toString() === filterCategory)
                          .map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                              {subcategory.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-dinus-text">Lokasi</Label>
                    <Select value={filterLocation || undefined} onValueChange={(value) => setFilterLocation(value || '')}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Semua Lokasi" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations
                          .filter(loc => !filterSubcategory || loc.subcategory_id.toString() === filterSubcategory)
                          .map((location) => (
                            <SelectItem key={location.id} value={location.id.toString()}>
                              {location.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date From Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-dinus-text">Tanggal Dari</Label>
                    <Input
                      type="date"
                      value={filterDateFrom}
                      onChange={(e) => setFilterDateFrom(e.target.value)}
                      className="h-10"
                    />
                  </div>

                  {/* Date To Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-dinus-text">Tanggal Sampai</Label>
                    <Input
                      type="date"
                      value={filterDateTo}
                      onChange={(e) => setFilterDateTo(e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Filter Summary */}
                {hasActiveFilters && (
                  <div className="mt-4 pt-4 border-t border-dinus-primary/10">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-dinus-text/70">Filter aktif:</span>
                      {filterCategory && (
                        <Badge variant="secondary" className="text-xs">
                          Kategori: {categories.find(c => c.id.toString() === filterCategory)?.name}
                        </Badge>
                      )}
                      {filterSubcategory && (
                        <Badge variant="secondary" className="text-xs">
                          Sub: {subcategories.find(s => s.id.toString() === filterSubcategory)?.name}
                        </Badge>
                      )}
                      {filterLocation && (
                        <Badge variant="secondary" className="text-xs">
                          Lokasi: {locations.find(l => l.id.toString() === filterLocation)?.name}
                        </Badge>
                      )}
                      {filterDateFrom && (
                        <Badge variant="secondary" className="text-xs">
                          Dari: {new Date(filterDateFrom).toLocaleDateString('id-ID')}
                        </Badge>
                      )}
                      {filterDateTo && (
                        <Badge variant="secondary" className="text-xs">
                          Sampai: {new Date(filterDateTo).toLocaleDateString('id-ID')}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-2">
            <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
              {/* Tombol Tambah Arsip */}
              {isAdmin && (
                <>
                  <Button
                    onClick={() => {
                      setEditingArchive(null);
                      setShowArchiveForm(true);
                    }}
                    className="h-12 px-6 bg-gradient-to-r from-dinus-primary to-dinus-primary-light hover:from-dinus-primary-dark hover:to-dinus-primary text-white shadow-lg w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Tambah Arsip
                  </Button>
                  <Button
                    onClick={() => setShowFieldContentManagement(true)}
                    variant="outline"
                    className="h-12 px-6 border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white shadow-lg w-full sm:w-auto justify-center"
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    Kelola Field
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Filter Results Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-dinus-text/70">
              Menampilkan {filteredArchives.length} dari {archives.length} arsip
            </span>
            {hasActiveFilters && (
              <Badge variant="outline" className="text-xs border-dinus-primary/30 text-dinus-primary">
                Terfilter
              </Badge>
            )}
          </div>
          {filteredArchives.length > 0 && (
            <span className="text-xs text-dinus-text/50">
              {loading ? 'Memuat...' : `Diperbarui ${new Date().toLocaleTimeString('id-ID')}`}
            </span>
          )}
        </div>

        {/* Archives Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArchives.map((archive) => (
            <Card key={archive.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={getImageUrl(archive.file_path) || 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Image_not_available.png/800px-Image_not_available.png?w=800&h=600&fit=crop'}
                    alt={archive.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {/* Location Hierarchy Badges - show first 3 fields */}
                    {Object.values(archive.location_hierarchy || {}).slice(0, 3).map((fieldValue, index) => (
                      <Badge 
                        key={index} 
                        className={`text-white text-xs ${
                          index === 0 ? 'bg-dinus-primary' : 
                          index === 1 ? 'bg-dinus-primary-light' : 
                          'bg-dinus-secondary'
                        }`}
                      >
                        {String(fieldValue) || '-'}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-dinus-text mb-2 line-clamp-1">
                    {archive.title}
                  </h3>
                  <p className="text-sm text-dinus-text/70 mb-4 line-clamp-2">
                    {archive.description}
                  </p>
                  
                  <div className="space-y-2 text-xs text-dinus-text/60 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(archive.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {/* Tag section removed as per requirement */}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewArchive(archive)}
                      className="flex-2 border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Lihat
                    </Button>
                    {isAdmin && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditArchive(archive)}
                          className="flex-2 border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteArchive(archive.id, archive.title)}
                          className="border-destructive/20 text-destructive hover:bg-destructive hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredArchives.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Archive className="w-16 h-16 mx-auto text-dinus-text/30 mb-4" />
              <p className="text-lg text-dinus-text/60">
                {archives.length === 0 ? 'Belum ada arsip' : 'Tidak ada arsip yang sesuai dengan filter'}
              </p>
              <p className="text-sm text-dinus-text/40 mb-6">
                {archives.length === 0 
                  ? 'Mulai dengan menambahkan arsip pertama Anda'
                  : hasActiveFilters 
                    ? 'Coba ubah atau hapus beberapa filter untuk melihat lebih banyak hasil'
                    : 'Coba ubah kata kunci pencarian'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="border-dinus-primary/30 text-dinus-primary hover:bg-dinus-primary hover:text-white"
                  >
                    <FilterX className="w-4 h-4 mr-2" />
                    Hapus Semua Filter
                  </Button>
                )}
                {isAdmin && (
                  <Button
                    onClick={() => {
                      setEditingArchive(null);
                      setShowArchiveForm(true);
                    }}
                    className="bg-gradient-to-r from-dinus-primary to-dinus-primary-light hover:from-dinus-primary-dark hover:to-dinus-primary text-white"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {archives.length === 0 ? 'Tambah Arsip Pertama' : 'Tambah Arsip Baru'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      {showArchiveModal && selectedArchive && (
        <ArchiveModal
          archive={selectedArchive}
          isOpen={showArchiveModal}
          onClose={() => setShowArchiveModal(false)}
          onEdit={(archive) => {
            handleEditArchive(archive);
            setShowArchiveModal(false);
          }}
          onDelete={async (id) => {
            await handleDeleteArchive(id, selectedArchive?.title || '');
            setShowArchiveModal(false);
          }}
          isAdmin={isAdmin}
        />
      )}

      {showArchiveForm && (
        <ArchiveFormComponent
          archive={editingArchive}
          onClose={() => {
            setShowArchiveForm(false);
            setEditingArchive(null);
          }}
          onSave={() => {
            refreshArchives();
            setShowArchiveForm(false);
            setEditingArchive(null);
          }}
        />
      )}

      {showFieldContentManagement && (
        <FieldContentManagement
          isOpen={showFieldContentManagement}
          onClose={() => setShowFieldContentManagement(false)}
          onSave={() => {
            // Refresh any data if needed
            setShowFieldContentManagement(false);
          }}
        />
      )}
    </div>
  );
};

interface ArchiveFormProps {
  archive?: ArchiveType | null;
  onClose: () => void;
  onSave: () => void;
}

const ArchiveFormComponent: React.FC<ArchiveFormProps> = ({ archive, onClose, onSave }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    image: null as File | null,
    category_id: null as number | null,
    subcategory_id: null as number | null,
    location_id: null as number | null,
    cabinet_id: null as number | null,
    shelf_id: null as number | null,
    position_id: null as number | null
  });

  const { createArchive, updateArchive } = useArchiveOperations();
  const { 
    categories, 
    subcategories, 
    locations, 
    cabinets, 
    shelves, 
    positions,
    loading: staticFieldsLoading,
    getSubcategoriesByCategory,
    getLocationsBySubcategory,
    getCabinetsByLocation,
    getShelvesByCabinet,
    getPositionsByShelf
  } = useStaticFields();

  // State for filtered options based on selections
  const [filteredSubcategories, setFilteredSubcategories] = useState<any[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<any[]>([]);
  const [filteredCabinets, setFilteredCabinets] = useState<any[]>([]);
  const [filteredShelves, setFilteredShelves] = useState<any[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<any[]>([]);
  const [isInitializingEdit, setIsInitializingEdit] = useState(false);
  
  // Refs to track previous values and prevent unnecessary resets
  const prevCategoryId = useRef<number | null>(null);
  const prevSubcategoryId = useRef<number | null>(null);
  const prevLocationId = useRef<number | null>(null);
  const prevCabinetId = useRef<number | null>(null);
  const prevShelfId = useRef<number | null>(null);

  // Reset refs when archive changes or form is opened/closed
  useEffect(() => {
    prevCategoryId.current = null;
    prevSubcategoryId.current = null;
    prevLocationId.current = null;
    prevCabinetId.current = null;
    prevShelfId.current = null;
  }, [archive]);

  useEffect(() => {
    if (archive && !staticFieldsLoading) {
      setIsInitializingEdit(true);
      setFormData({
        title: archive.title,
        description: archive.description || '',
        date: archive.date ? (new Date(archive.date).toISOString().split('T')[0]) : (archive.created_at ? new Date(archive.created_at).toISOString().split('T')[0] : ''),
        image: null,
        category_id: archive.category_id || null,
        subcategory_id: archive.subcategory_id || null,
        location_id: archive.location_id || null,
        cabinet_id: archive.cabinet_id || null,
        shelf_id: archive.shelf_id || null,
        position_id: archive.position_id || null
      });
      
      // Initialize filtered options for edit mode only after static fields are loaded
      // Use a more reliable approach than setTimeout
      if (categories.length > 0 && subcategories.length > 0) {
        if (archive.category_id) {
          const filteredSubs = getSubcategoriesByCategory(archive.category_id);
          setFilteredSubcategories(filteredSubs);
        }
        if (archive.subcategory_id) {
          const filteredLocs = getLocationsBySubcategory(archive.subcategory_id);
          setFilteredLocations(filteredLocs);
        }
        if (archive.location_id) {
          const filteredCabs = getCabinetsByLocation(archive.location_id);
          setFilteredCabinets(filteredCabs);
        }
        if (archive.cabinet_id) {
          const filteredShelvs = getShelvesByCabinet(archive.cabinet_id);
          setFilteredShelves(filteredShelvs);
        }
        if (archive.shelf_id) {
          const filteredPos = getPositionsByShelf(archive.shelf_id);
          setFilteredPositions(filteredPos);
        }
        
        // Set flag to false after initialization
        setIsInitializingEdit(false);
      }
    } else if (!archive) {
      // Reset form for new archive
      setFormData({
        title: '',
        description: '',
        date: '',
        image: null,
        category_id: null,
        subcategory_id: null,
        location_id: null,
        cabinet_id: null,
        shelf_id: null,
        position_id: null
      });
      setFilteredSubcategories([]);
      setFilteredLocations([]);
      setFilteredCabinets([]);
      setFilteredShelves([]);
      setFilteredPositions([]);
      setIsInitializingEdit(false);
    }
  }, [archive, staticFieldsLoading, categories, subcategories, locations, cabinets, shelves, positions, getSubcategoriesByCategory, getLocationsBySubcategory, getCabinetsByLocation, getShelvesByCabinet, getPositionsByShelf]);

  // Update filtered options when selections change
  useEffect(() => {
    // Only process if category_id actually changed
    if (prevCategoryId.current !== formData.category_id) {
      prevCategoryId.current = formData.category_id;
      
      if (formData.category_id) {
        const filtered = getSubcategoriesByCategory(formData.category_id);
        setFilteredSubcategories(filtered);
      } else {
        setFilteredSubcategories([]);
        // Only reset child fields if not initializing edit data
        if (!isInitializingEdit) {
          setFormData(prev => ({ ...prev, subcategory_id: null }));
        }
      }
    }
  }, [formData.category_id, isInitializingEdit]);

  useEffect(() => {
    // Only process if subcategory_id actually changed
    if (prevSubcategoryId.current !== formData.subcategory_id) {
      prevSubcategoryId.current = formData.subcategory_id;
      
      if (formData.subcategory_id) {
        const filtered = getLocationsBySubcategory(formData.subcategory_id);
        setFilteredLocations(filtered);
      } else {
        setFilteredLocations([]);
        // Only reset child fields if not initializing edit data
        if (!isInitializingEdit) {
          setFormData(prev => ({ ...prev, location_id: null }));
        }
      }
    }
  }, [formData.subcategory_id, isInitializingEdit]);

  useEffect(() => {
    // Only process if location_id actually changed
    if (prevLocationId.current !== formData.location_id) {
      prevLocationId.current = formData.location_id;
      
      if (formData.location_id) {
        const filtered = getCabinetsByLocation(formData.location_id);
        setFilteredCabinets(filtered);
      } else {
        setFilteredCabinets([]);
        // Only reset child fields if not initializing edit data
        if (!isInitializingEdit) {
          setFormData(prev => ({ ...prev, cabinet_id: null }));
        }
      }
    }
  }, [formData.location_id, isInitializingEdit]);

  useEffect(() => {
    // Only process if cabinet_id actually changed
    if (prevCabinetId.current !== formData.cabinet_id) {
      prevCabinetId.current = formData.cabinet_id;
      
      if (formData.cabinet_id) {
        const filtered = getShelvesByCabinet(formData.cabinet_id);
        setFilteredShelves(filtered);
      } else {
        setFilteredShelves([]);
        // Only reset child fields if not initializing edit data
        if (!isInitializingEdit) {
          setFormData(prev => ({ ...prev, shelf_id: null }));
        }
      }
    }
  }, [formData.cabinet_id, isInitializingEdit]);

  useEffect(() => {
    // Only process if shelf_id actually changed
    if (prevShelfId.current !== formData.shelf_id) {
      prevShelfId.current = formData.shelf_id;
      
      if (formData.shelf_id) {
        const filtered = getPositionsByShelf(formData.shelf_id);
        setFilteredPositions(filtered);
      } else {
        setFilteredPositions([]);
        // Only reset child fields if not initializing edit data
        if (!isInitializingEdit) {
          setFormData(prev => ({ ...prev, position_id: null }));
        }
      }
    }
  }, [formData.shelf_id, isInitializingEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const archiveData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        image: formData.image,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id,
        location_id: formData.location_id,
        cabinet_id: formData.cabinet_id,
        shelf_id: formData.shelf_id,
        position_id: formData.position_id
      };

      if (archive) {
        // Update existing archive
        await updateArchive(archive.id, archiveData);
        toast({
          title: "Arsip Diperbarui",
          description: `Arsip "${formData.title}" berhasil diperbarui.`,
        });
      } else {
        // Add new archive
        await createArchive(archiveData);
        toast({
          title: "Arsip Ditambahkan",
          description: `Arsip "${formData.title}" berhasil ditambahkan.`,
        });
      }

      onSave();
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat menyimpan arsip.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-dinus-text">
            {archive ? 'Edit Arsip' : 'Tambah Arsip Baru'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2">
              <Label htmlFor="title" className="text-sm font-semibold text-dinus-text">
                Judul Arsip *
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Masukkan judul arsip"
                required
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <Label htmlFor="description" className="text-sm font-semibold text-dinus-text">
                Deskripsi *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Masukkan deskripsi arsip"
                required
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="date" className="text-sm font-semibold text-dinus-text">
                Tanggal *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="text-sm font-semibold text-dinus-text">
                Kategori *
              </Label>
              <Select
                value={formData.category_id?.toString() || ''}
                onValueChange={(value) => setFormData({ ...formData, category_id: value ? parseInt(value) : null })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory */}
            <div>
              <Label htmlFor="subcategory" className="text-sm font-semibold text-dinus-text">
                Sub Kategori
              </Label>
              <Select
                value={formData.subcategory_id?.toString() || ''}
                onValueChange={(value) => setFormData({ ...formData, subcategory_id: value ? parseInt(value) : null })}
                disabled={!formData.category_id}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih sub kategori" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location" className="text-sm font-semibold text-dinus-text">
                Lokasi
              </Label>
              <Select
                value={formData.location_id?.toString() || ''}
                onValueChange={(value) => setFormData({ ...formData, location_id: value ? parseInt(value) : null })}
                disabled={!formData.subcategory_id}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih lokasi" />
                </SelectTrigger>
                <SelectContent>
                  {filteredLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id.toString()}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cabinet */}
            <div>
              <Label htmlFor="cabinet" className="text-sm font-semibold text-dinus-text">
                Kabinet
              </Label>
              <Select
                value={formData.cabinet_id?.toString() || ''}
                onValueChange={(value) => setFormData({ ...formData, cabinet_id: value ? parseInt(value) : null })}
                disabled={!formData.location_id}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih kabinet" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCabinets.map((cabinet) => (
                    <SelectItem key={cabinet.id} value={cabinet.id.toString()}>
                      {cabinet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Shelf */}
            <div>
              <Label htmlFor="shelf" className="text-sm font-semibold text-dinus-text">
                Rak
              </Label>
              <Select
                value={formData.shelf_id?.toString() || ''}
                onValueChange={(value) => setFormData({ ...formData, shelf_id: value ? parseInt(value) : null })}
                disabled={!formData.cabinet_id}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih rak" />
                </SelectTrigger>
                <SelectContent>
                  {filteredShelves.map((shelf) => (
                    <SelectItem key={shelf.id} value={shelf.id.toString()}>
                      {shelf.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Position */}
            <div>
              <Label htmlFor="position" className="text-sm font-semibold text-dinus-text">
                Posisi
              </Label>
              <Select
                value={formData.position_id?.toString() || ''}
                onValueChange={(value) => setFormData({ ...formData, position_id: value ? parseInt(value) : null })}
                disabled={!formData.shelf_id}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih posisi" />
                </SelectTrigger>
                <SelectContent>
                  {filteredPositions.map((position) => (
                    <SelectItem key={position.id} value={position.id.toString()}>
                      {position.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            <div className="sm:col-span-2">
              <Label htmlFor="image" className="text-sm font-semibold text-dinus-text">
                Upload Gambar
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData({ ...formData, image: file });
                }}
                className="mt-1"
              />
              {formData.image && (
                <p className="text-sm text-dinus-text/70 mt-1">
                  File terpilih: {formData.image.name}
                </p>
              )}
            </div>
          </div>

          {/* Preview */}
          {(formData.image || (archive && archive.file_path)) && (
            <div className="border border-dinus-primary/20 rounded-lg p-4 bg-dinus-gray/30">
              <Label className="text-sm font-semibold text-dinus-text mb-2 block">
                Preview Gambar
              </Label>
              <div className="relative w-full h-32 bg-dinus-gray rounded-lg overflow-hidden">
                <img
                  src={formData.image ? URL.createObjectURL(formData.image) : getImageUrl(archive?.file_path)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-dinus-primary/20 text-dinus-text hover:bg-dinus-gray mb-2 sm:mb-0"
            >
              <X className="w-4 h-4 mr-2" />
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-dinus-primary to-dinus-primary-light hover:from-dinus-primary-dark hover:to-dinus-primary text-white"
            >
              {isLoading ? (
                "Menyimpan..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {archive ? 'Perbarui' : 'Simpan'} Arsip
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Dashboard;