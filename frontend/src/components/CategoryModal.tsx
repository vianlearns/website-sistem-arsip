import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { Category, SubCategory, Position } from '@/types/archive.types';
import { Save, X, Plus, Trash2, Edit, ChevronDown, ChevronRight } from 'lucide-react';
import { useCategoryOperations } from '@/hooks/useCategories';
import { useSubCategoryOperations } from '@/hooks/useSubCategories';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PositionService from '@/services/position.service';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave }) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    id: 0,
    name: ''
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'category' | 'subcategory' | 'position'>('category');
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [expandedSubCategories, setExpandedSubCategories] = useState<number[]>([]);
  const [subCategoryFormData, setSubCategoryFormData] = useState({
    id: 0,
    name: '',
    category_id: 0
  });
  const [isEditingSubCategory, setIsEditingSubCategory] = useState<boolean>(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [positionFormData, setPositionFormData] = useState({
    id: 0,
    name: '',
    subcategory_id: 0
  });
  const [isEditingPosition, setIsEditingPosition] = useState<boolean>(false);
  
  const { 
    getCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory 
  } = useCategoryOperations();

  const {
    subCategories,
    getSubCategories,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory
  } = useSubCategoryOperations();

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
    fetchPositions();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat kategori",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async (categoryId?: number) => {
    try {
      await getSubCategories(categoryId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat sub kategori",
        variant: "destructive"
      });
    }
  };
  
  const fetchPositions = async (subcategoryId?: number) => {
    try {
      let data;
      if (subcategoryId) {
        data = await PositionService.getPositionsBySubcategoryId(subcategoryId);
      } else {
        data = await PositionService.getAllPositions();
      }
      setPositions(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat posisi",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({ id: 0, name: '' });
    setIsEditing(false);
    setSubCategoryFormData({ id: 0, name: '', category_id: 0 });
    setIsEditingSubCategory(false);
    setPositionFormData({ id: 0, name: '', subcategory_id: 0 });
    setIsEditingPosition(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Nama kategori tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      if (isEditing) {
        await updateCategory(formData.id, {
          name: formData.name
        });
        toast({
          title: "Sukses",
          description: `Kategori "${formData.name}" berhasil diperbarui.`
        });
      } else {
        await createCategory({
          name: formData.name
        });
        toast({
          title: "Sukses",
          description: `Kategori "${formData.name}" berhasil ditambahkan.`
        });
      }
      
      resetForm();
      fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan kategori",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      id: category.id,
      name: category.name
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await deleteCategory(id);
      toast({
        title: "Sukses",
        description: `Kategori "${name}" berhasil dihapus.`
      });
      fetchCategories();
      fetchSubCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus kategori",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subCategoryFormData.name.trim()) {
      toast({
        title: "Error",
        description: "Nama sub kategori tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }

    if (!subCategoryFormData.category_id) {
      toast({
        title: "Error",
        description: "Pilih kategori induk",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      if (isEditingSubCategory) {
        await updateSubCategory(
          subCategoryFormData.id, 
          subCategoryFormData.name, 
          subCategoryFormData.category_id
        );
        toast({
          title: "Sukses",
          description: `Sub kategori "${subCategoryFormData.name}" berhasil diperbarui.`
        });
      } else {
        await createSubCategory(
          subCategoryFormData.name, 
          subCategoryFormData.category_id
        );
        toast({
          title: "Sukses",
          description: `Sub kategori "${subCategoryFormData.name}" berhasil ditambahkan.`
        });
      }
      
      resetForm();
      fetchSubCategories();
      fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan sub kategori",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubCategory = (subCategory: SubCategory) => {
    setSubCategoryFormData({
      id: subCategory.id,
      name: subCategory.name,
      category_id: subCategory.category_id
    });
    setIsEditingSubCategory(true);
    setActiveTab('subcategory');
  };

  const handleDeleteSubCategory = async (id: number, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus sub kategori "${name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await deleteSubCategory(id);
      toast({
        title: "Sukses",
        description: `Sub kategori "${name}" berhasil dihapus.`
      });
      fetchSubCategories();
      fetchCategories();
      fetchPositions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus sub kategori",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePositionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!positionFormData.name.trim()) {
      toast({
        title: "Error",
        description: "Nama posisi tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }

    if (!positionFormData.subcategory_id) {
      toast({
        title: "Error",
        description: "Pilih sub kategori induk",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      if (isEditingPosition) {
        await PositionService.updatePosition(
          positionFormData.id, 
          {
            name: positionFormData.name,
            subcategory_id: positionFormData.subcategory_id
          }
        );
        toast({
          title: "Sukses",
          description: `Posisi "${positionFormData.name}" berhasil diperbarui.`
        });
      } else {
        await PositionService.createPosition({
          name: positionFormData.name,
          subcategory_id: positionFormData.subcategory_id
        });
        toast({
          title: "Sukses",
          description: `Posisi "${positionFormData.name}" berhasil ditambahkan.`
        });
      }
      
      resetForm();
      fetchPositions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan posisi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePositionEdit = (position: Position) => {
    setPositionFormData({
      id: position.id,
      name: position.name,
      subcategory_id: position.subcategory_id
    });
    setIsEditingPosition(true);
  };

  const handlePositionDelete = async (id: number, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus posisi "${name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await PositionService.deletePosition(id);
      toast({
        title: "Sukses",
        description: `Posisi "${name}" berhasil dihapus.`
      });
      fetchPositions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus posisi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryExpand = (categoryId: number) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };
  
  const toggleSubCategoryExpand = (subcategoryId: number) => {
    if (expandedSubCategories.includes(subcategoryId)) {
      setExpandedSubCategories(expandedSubCategories.filter(id => id !== subcategoryId));
    } else {
      setExpandedSubCategories([...expandedSubCategories, subcategoryId]);
      fetchPositions(subcategoryId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-dinus-text">
            Kelola Kategori & Sub Kategori
          </DialogTitle>
        </DialogHeader>

        <div className="flex space-x-2 mb-4">
          <Button
            type="button"
            variant={activeTab === 'category' ? 'default' : 'outline'}
            onClick={() => setActiveTab('category')}
            className={activeTab === 'category' ? 'bg-dinus-primary text-white' : 'border-dinus-primary/20 text-dinus-text'}
          >
            Kategori
          </Button>
          <Button
            type="button"
            variant={activeTab === 'subcategory' ? 'default' : 'outline'}
            onClick={() => setActiveTab('subcategory')}
            className={activeTab === 'subcategory' ? 'bg-dinus-primary text-white' : 'border-dinus-primary/20 text-dinus-text'}
          >
            Sub Kategori
          </Button>
          <Button
            type="button"
            variant={activeTab === 'position' ? 'default' : 'outline'}
            onClick={() => setActiveTab('position')}
            className={activeTab === 'position' ? 'bg-dinus-primary text-white' : 'border-dinus-primary/20 text-dinus-text'}
          >
            Posisi
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {activeTab === 'category' && (
            <form onSubmit={handleSubmit} className="space-y-4 border border-dinus-primary/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-dinus-text">
                {isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold text-dinus-text">
                    Nama Kategori *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama kategori"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 border-dinus-primary/20 text-dinus-text hover:bg-dinus-gray"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Batal Edit
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-dinus-primary to-dinus-primary-light hover:from-dinus-primary-dark hover:to-dinus-primary text-white"
                >
                  {loading ? (
                    "Menyimpan..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditing ? 'Perbarui' : 'Simpan'} Kategori
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'position' && (
            <form onSubmit={handlePositionSubmit} className="space-y-4 border border-dinus-primary/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-dinus-text">
                {isEditingPosition ? 'Edit Posisi' : 'Tambah Posisi Baru'}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="subcategory_id" className="text-sm font-semibold text-dinus-text">
                    Sub Kategori Induk *
                  </Label>
                  <Select
                    value={positionFormData.subcategory_id.toString()}
                    onValueChange={(value) => setPositionFormData({ ...positionFormData, subcategory_id: parseInt(value) })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih sub kategori induk" />
                    </SelectTrigger>
                    <SelectContent>
                      {subCategories.map((subCategory) => (
                        <SelectItem key={subCategory.id} value={subCategory.id.toString()}>
                          {subCategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="position_name" className="text-sm font-semibold text-dinus-text">
                    Nama Posisi *
                  </Label>
                  <Input
                    id="position_name"
                    type="text"
                    value={positionFormData.name}
                    onChange={(e) => setPositionFormData({ ...positionFormData, name: e.target.value })}
                    placeholder="Masukkan nama posisi"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {isEditingPosition && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 border-dinus-primary/20 text-dinus-text hover:bg-dinus-gray"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Batal Edit
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-dinus-primary to-dinus-primary-light hover:from-dinus-primary-dark hover:to-dinus-primary text-white"
                >
                  {loading ? (
                    "Menyimpan..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditingPosition ? 'Perbarui' : 'Simpan'} Posisi
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'subcategory' && (
            <form onSubmit={handleSubCategorySubmit} className="space-y-4 border border-dinus-primary/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-dinus-text">
                {isEditingSubCategory ? 'Edit Sub Kategori' : 'Tambah Sub Kategori Baru'}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="category_id" className="text-sm font-semibold text-dinus-text">
                    Kategori Induk *
                  </Label>
                  <Select
                    value={subCategoryFormData.category_id.toString()}
                    onValueChange={(value) => setSubCategoryFormData({ ...subCategoryFormData, category_id: parseInt(value) })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih kategori induk" />
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
                <div>
                  <Label htmlFor="subcategory_name" className="text-sm font-semibold text-dinus-text">
                    Nama Sub Kategori *
                  </Label>
                  <Input
                    id="subcategory_name"
                    type="text"
                    value={subCategoryFormData.name}
                    onChange={(e) => setSubCategoryFormData({ ...subCategoryFormData, name: e.target.value })}
                    placeholder="Masukkan nama sub kategori"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {isEditingSubCategory && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 border-dinus-primary/20 text-dinus-text hover:bg-dinus-gray"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Batal Edit
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-dinus-primary to-dinus-primary-light hover:from-dinus-primary-dark hover:to-dinus-primary text-white"
                >
                  {loading ? (
                    "Menyimpan..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditingSubCategory ? 'Perbarui' : 'Simpan'} Sub Kategori
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Daftar Kategori, Sub Kategori, atau Posisi sesuai tab aktif */}
          <div className="border border-dinus-primary/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-dinus-text mb-4">
              {activeTab === 'category'
                ? 'Daftar Kategori & Sub Kategori'
                : activeTab === 'subcategory'
                ? 'Daftar Sub Kategori'
                : 'Daftar Posisi'}
            </h3>
            {loading ? (
              <p className="text-center py-4 text-dinus-text/70">Memuat data...</p>
            ) : activeTab === 'category' ? (
              <div className="space-y-2">
                {categories.length === 0 ? (
                  <p className="text-center py-4 text-dinus-text/70">Belum ada kategori</p>
                ) : (
                  categories.map((category) => (
                    <div key={category.id} className="rounded-lg border border-dinus-gray/50 overflow-hidden mb-2">
                      <div 
                        className="flex items-center justify-between p-3 bg-dinus-gray/30 hover:bg-dinus-gray/50 transition-colors cursor-pointer"
                        onClick={() => toggleCategoryExpand(category.id)}
                      >
                        <div className="flex items-center">
                          {expandedCategories.includes(category.id) ? (
                            <ChevronDown className="w-4 h-4 mr-2 text-dinus-primary" />
                          ) : (
                            <ChevronRight className="w-4 h-4 mr-2 text-dinus-primary" />
                          )}
                          <h4 className="font-medium text-dinus-text">{category.name}</h4>
                          <span className="ml-2 text-xs bg-dinus-primary/10 text-dinus-primary px-2 py-0.5 rounded-full">
                            {category.subcategories?.length || 0} sub
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(category);
                            }}
                            className="h-8 border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(category.id, category.name);
                            }}
                            className="h-8 border-destructive/20 text-destructive hover:bg-destructive hover:text-white"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      {expandedCategories.includes(category.id) && category.subcategories && (
                        <div className="pl-6 pr-3 py-2 bg-white border-t border-dinus-gray/30">
                          {category.subcategories.length === 0 ? (
                            <p className="text-sm text-dinus-text/70 py-1">Belum ada sub kategori</p>
                          ) : (
                            <div className="space-y-1">
                              {category.subcategories.map((subCategory) => (
                                <div 
                                  key={subCategory.id} 
                                  className="flex items-center justify-between p-2 bg-dinus-gray/10 rounded-md hover:bg-dinus-gray/20 transition-colors"
                                >
                                  <div>
                                    <h5 className="text-sm font-medium text-dinus-text">{subCategory.name}</h5>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditSubCategory(subCategory)}
                                      className="h-7 px-2 border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteSubCategory(subCategory.id, subCategory.name)}
                                      className="h-7 px-2 border-destructive/20 text-destructive hover:bg-destructive hover:text-white"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : activeTab === 'subcategory' ? (
              <div className="space-y-2">
                {subCategories.length === 0 ? (
                  <p className="text-center py-4 text-dinus-text/70">Belum ada sub kategori</p>
                ) : (
                  subCategories.map((subCategory) => (
                    <div 
                      key={subCategory.id} 
                      className="flex items-center justify-between p-3 bg-dinus-gray/30 rounded-lg hover:bg-dinus-gray/50 transition-colors"
                    >
                      <div>
                        <h4 className="font-medium text-dinus-text">{subCategory.name}</h4>
                        <p className="text-xs text-dinus-text/70">Kategori: {subCategory.category_name || 'Tidak diketahui'}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditSubCategory(subCategory)}
                          className="h-8 border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSubCategory(subCategory.id, subCategory.name)}
                          className="h-8 border-destructive/20 text-destructive hover:bg-destructive hover:text-white"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {positions.length === 0 ? (
                  <p className="text-center py-4 text-dinus-text/70">Belum ada posisi</p>
                ) : (
                  positions.map((position) => (
                    <div 
                      key={position.id} 
                      className="flex items-center justify-between p-3 bg-dinus-gray/30 rounded-lg hover:bg-dinus-gray/50 transition-colors"
                    >
                      <div>
                        <h4 className="font-medium text-dinus-text">{position.name}</h4>
                        <p className="text-xs text-dinus-text/70">Sub Kategori: {(position as any).subcategory_name || position.subcategory_id || 'Tidak diketahui'}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handlePositionEdit(position)}
                          className="h-8 border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handlePositionDelete(position.id, position.name)}
                          className="h-8 border-destructive/20 text-destructive hover:bg-destructive hover:text-white"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-dinus-primary/20 text-dinus-text hover:bg-dinus-gray"
          >
            <X className="w-4 h-4 mr-2" />
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryModal;