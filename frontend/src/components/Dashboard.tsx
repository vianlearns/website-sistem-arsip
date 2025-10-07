import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { getImageUrl } from '@/lib/api';
import { Archive as ArchiveType, Position } from '@/types/archive.types';
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
  X
} from 'lucide-react';
import ArchiveService from "@/services/archive.service";
import CategoryService from "@/services/category.service";
import SubCategoryService from "@/services/subcategory.service";
import PositionService from "@/services/position.service";
import { useArchives, useArchiveOperations, useCategories } from '@/hooks/useArchives';
import { useSubCategoryOperations, useSubCategories } from '@/hooks/useSubCategories';
import ArchiveModal from './ArchiveModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import CategoryModal from './CategoryModal';

const Dashboard = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Removed redirect to login - allowing non-authenticated users to access dashboard
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showArchiveForm, setShowArchiveForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState<ArchiveType | null>(null);
  const [editingArchive, setEditingArchive] = useState<ArchiveType | null>(null);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const filters = useMemo(() => ({
    category_id: selectedCategory || undefined,
    subcategory_id: selectedSubCategory || undefined,
    position_id: selectedPosition || undefined,
    search: debouncedSearchTerm || undefined
  }), [selectedCategory, selectedSubCategory, selectedPosition, debouncedSearchTerm]);

  const { archives, loading, refreshArchives } = useArchives(filters);
  const { categories } = useCategories();
  const { deleteArchive } = useArchiveOperations();
  const { getSubCategories } = useSubCategoryOperations();
  
  // Load subcategories when category changes
  useEffect(() => {
    const loadSubCategories = async () => {
      if (selectedCategory) {
        const data = await getSubCategories(selectedCategory);
        setSubCategories(data || []);
      } else {
        // Mengambil semua subkategori dari semua kategori
        const allSubCategories = [];
        if (categories) {
          for (const category of categories) {
            const subCats = await getSubCategories(category.id);
            if (subCats) {
              allSubCategories.push(...subCats);
            }
          }
        }
        setSubCategories(allSubCategories);
        setSelectedSubCategory(null);
      }
    };
    
    loadSubCategories();
  // Menghapus getSubCategories dari dependensi untuk mencegah loop tak terbatas
  }, [selectedCategory, categories]);

  useEffect(() => {
    if (selectedSubCategory) {
      const fetchPositions = async () => {
        try {
          const response = await PositionService.getPositionsBySubcategoryId(selectedSubCategory);
          setPositions(response);
        } catch (error) {
          console.error('Error fetching positions:', error);
          toast({
            title: "Error",
            description: "Gagal mengambil data posisi",
            variant: "destructive",
          });
        }
      };
      fetchPositions();
    } else {
      setPositions([]);
      setSelectedPosition(null);
    }
  }, [selectedSubCategory]);

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

  const filteredArchives = archives;

  const categoryNames = categories ? categories.map(cat => cat.name) : [];

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
                    onClick={logout}
                    className="border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white"
                >
                  <User className="w-4 h-4 mr-2" />
                  Login Admin
                </Button>
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
                  <p className="text-sm text-dinus-text/60">Kategori</p>
                  <p className="text-2xl font-bold text-dinus-text">{categories?.length || 0}</p>
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
                    {archives.length > 0 ? new Date(archives[0].date).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dinus-text/40" />
            <Input
              placeholder="Cari arsip berdasarkan judul, deskripsi, atau tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-2 focus:border-dinus-primary"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                className="px-4 py-3 border-2 border-input rounded-lg focus:border-dinus-primary outline-none bg-white w-full"
              >
                <option value="">Semua Kategori</option>
                {categories && categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              
              {selectedCategory !== null && (
                <select
                  value={selectedSubCategory === null ? '' : selectedSubCategory}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedSubCategory(value === '' ? null : Number(value));
                    // Reset posisi saat subkategori berubah untuk mencegah filter stale
                    setSelectedPosition(null);
                  }}
                  className="px-4 py-3 border-2 border-input rounded-lg focus:border-dinus-primary outline-none bg-white w-full"
                >
                  <option value="">Semua Subkategori</option>
                  {subCategories && subCategories.map(subcategory => (
                    <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                  ))}
                </select>
              )}
              
              {selectedSubCategory !== null && (
                <select
                  value={selectedPosition === null ? '' : selectedPosition}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedPosition(value === '' ? null : Number(value));
                  }}
                  className="px-4 py-3 border-2 border-input rounded-lg focus:border-dinus-primary outline-none bg-white w-full"
                >
                  <option value="">Semua Posisi</option>
                  {positions && positions.map(position => (
                    <option key={position.id} value={position.id}>{position.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
              {/* Tombol Kelola Kategori */}
              {isAdmin && (
                <>
                  <Button
                    onClick={() => setShowCategoryModal(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white w-full sm:w-auto justify-center"
                  >
                    <Settings className="w-4 h-4" />
                    Kelola Kategori
                  </Button>
                  <CategoryModal 
                    isOpen={showCategoryModal} 
                    onClose={() => setShowCategoryModal(false)} 
                    onSave={() => setShowCategoryModal(false)}
                  />
                </>
              )}
              
              {/* Tombol Tambah Arsip */}
              {isAdmin && (
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
              )}
            </div>
          </div>
        </div>

        {/* Archives Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArchives.map((archive) => (
            <Card key={archive.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={getImageUrl(archive.image) || 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Image_not_available.png/800px-Image_not_available.png?w=800&h=600&fit=crop'}
                    alt={archive.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <Badge className="bg-dinus-primary text-white">
                      {archive.category ? archive.category.name : categories?.find(cat => cat.id === archive.category_id)?.name || 'Kategori'}
                    </Badge>
                    {archive.subcategory_id && (
                      <Badge className="bg-dinus-primary-light text-white">
                        {subCategories?.find(sub => sub.id === archive.subcategory_id)?.name || archive.subcategory?.name || 'Subkategori'}
                      </Badge>
                    )}
                    {archive.position_id && (
                      <Badge className="bg-dinus-secondary text-white">
                        {archive.position_name || archive.position?.name || positions?.find(pos => pos.id === archive.position_id)?.name || 'Posisi'}
                      </Badge>
                    )}
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
                      <span>{new Date(archive.date).toLocaleDateString('id-ID')}</span>
                    </div>
                    {archive.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span>{archive.location}</span>
                      </div>
                    )}
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
              <p className="text-lg text-dinus-text/60">Tidak ada arsip yang ditemukan</p>
              <p className="text-sm text-dinus-text/40 mb-6">Coba ubah kata kunci pencarian atau kategori</p>
              {isAdmin && (
                <Button
                  onClick={() => {
                    setEditingArchive(null);
                    setShowArchiveForm(true);
                  }}
                  className="bg-gradient-to-r from-dinus-primary to-dinus-primary-light hover:from-dinus-primary-dark hover:to-dinus-primary text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Tambah Arsip Pertama
                </Button>
              )}
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
            setEditingArchive(archive);
            setShowArchiveForm(true);
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
    category_id: '',
    category_name: '',
    subcategory_id: '',
    subcategory_name: '',
    position_id: '',
    date: '',
    location: '',
    image: null as File | null
  });
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  const { createArchive, updateArchive } = useArchiveOperations();
  const { categories } = useCategories();
  const { getSubCategories } = useSubCategoryOperations();

  useEffect(() => {
    if (archive) {
      setFormData({
        title: archive.title,
        description: archive.description || '',
        category_id: archive.category_id?.toString() || '',
        category_name: archive.category?.name || '',
        subcategory_id: archive.subcategory_id?.toString() || '',
        subcategory_name: archive.subcategory?.name || '',
        position_id: archive.position_id?.toString() || '',
        date: archive.date || '',
        location: archive.location || '',
        image: null
      });
      
      // Load subcategories if category is selected
      if (archive.category_id) {
        loadSubCategories(archive.category_id);
      }
      // Load positions if subcategory is selected
      if (archive.subcategory_id) {
        loadPositions(archive.subcategory_id);
      }
    }
  }, [archive]);
  
  // Function to load subcategories based on selected category
  const loadSubCategories = async (categoryId: number) => {
    try {
      const data = await getSubCategories(categoryId);
      setSubCategories(data || []);
    } catch (error) {
      console.error('Error loading subcategories:', error);
    }
  };

  // Function to load positions based on selected subcategory
  const loadPositions = async (subcategoryId: number) => {
    try {
      const data = await PositionService.getPositionsBySubcategoryId(subcategoryId);
      setPositions(data || []);
    } catch (error) {
      console.error('Error loading positions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use selected category ID
      const categoryId = formData.category_id ? Number(formData.category_id) : undefined;
      const subcategoryId = formData.subcategory_id ? Number(formData.subcategory_id) : undefined;
      const positionId = formData.position_id ? Number(formData.position_id) : undefined;

      const archiveData = {
        title: formData.title,
        description: formData.description,
        category_id: categoryId,
        category_name: formData.category_name, // Send category name for backend to handle
        subcategory_id: subcategoryId,
        subcategory_name: formData.subcategory_name,
        position_id: positionId,
        date: formData.date,
        location: formData.location,
        image: formData.image
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

            {/* Category */}
            <div>
              <Label htmlFor="category" className="text-sm font-semibold text-dinus-text">
                Kategori *
              </Label>
            <select
              id="category"
              value={formData.category_id}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedCategory = categories?.find(cat => cat.id.toString() === selectedId);
                setFormData({ 
                  ...formData, 
                  category_id: selectedId,
                  category_name: selectedCategory ? selectedCategory.name : '',
                  subcategory_id: '', // Reset subcategory when category changes
                  subcategory_name: '',
                  position_id: '' // Reset position when category changes
                });
                
                // Load subcategories for the selected category
                if (selectedId) {
                  loadSubCategories(Number(selectedId));
                } else {
                  setSubCategories([]);
                  setPositions([]);
                }
              }}
                required
                className="w-full px-3 py-2 border-2 border-input rounded-md focus:border-dinus-primary outline-none bg-white mt-1"
              >
                <option value="">Pilih Kategori</option>
                {categories && categories.map(category => (
                  <option key={category.id} value={category.id.toString()}>{category.name}</option>
                ))}
              </select>
            </div>
            
            {/* Subcategory - only show if category is selected */}
            {formData.category_id && (
              <div>
                <Label htmlFor="subcategory" className="text-sm font-semibold text-dinus-text">
                  Sub Kategori
                </Label>
                <select
                  id="subcategory"
                  value={formData.subcategory_id}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedSubCategory = subCategories?.find(sub => sub.id.toString() === selectedId);
                    setFormData({ 
                      ...formData, 
                      subcategory_id: selectedId,
                      subcategory_name: selectedSubCategory ? selectedSubCategory.name : '',
                      position_id: '' // Reset position when subcategory changes
                    });
                    // Load positions for selected subcategory
                    if (selectedId) {
                      loadPositions(Number(selectedId));
                    } else {
                      setPositions([]);
                    }
                  }}
                  className="w-full px-3 py-2 border-2 border-input rounded-md focus:border-dinus-primary outline-none bg-white mt-1"
                >
                  <option value="">Pilih Sub Kategori (Opsional)</option>
                  {subCategories && subCategories.map(subcategory => (
                    <option key={subcategory.id} value={subcategory.id.toString()}>{subcategory.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Position - only show if subcategory is selected */}
            {formData.subcategory_id && (
              <div>
                <Label htmlFor="position" className="text-sm font-semibold text-dinus-text">
                  Posisi
                </Label>
                <select
                  id="position"
                  value={formData.position_id}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setFormData({
                      ...formData,
                      position_id: selectedId
                    });
                  }}
                  className="w-full px-3 py-2 border-2 border-input rounded-md focus:border-dinus-primary outline-none bg-white mt-1"
                >
                  <option value="">Pilih Posisi (Opsional)</option>
                  {positions && positions.map(position => (
                    <option key={position.id} value={position.id.toString()}>{position.name}</option>
                  ))}
                </select>
              </div>
            )}

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

            {/* Location */}
            <div>
              <Label htmlFor="location" className="text-sm font-semibold text-dinus-text">
                Lokasi
              </Label>
              <Input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Lokasi pengambilan foto"
                className="mt-1"
              />
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
          {(formData.image || (archive && archive.image)) && (
            <div className="border border-dinus-primary/20 rounded-lg p-4 bg-dinus-gray/30">
              <Label className="text-sm font-semibold text-dinus-text mb-2 block">
                Preview Gambar
              </Label>
              <div className="relative w-full h-32 bg-dinus-gray rounded-lg overflow-hidden">
                <img
                  src={formData.image ? URL.createObjectURL(formData.image) : getImageUrl(archive?.image)}
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