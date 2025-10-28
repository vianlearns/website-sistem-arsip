import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { Save, X, Plus, Trash2, Edit2, ChevronDown, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStaticFields } from '@/hooks/useStaticFields';
import { 
  Category, 
  Subcategory, 
  Location, 
  Cabinet, 
  Shelf, 
  Position,
  CreateCategoryDTO,
  CreateSubcategoryDTO,
  CreateLocationDTO,
  CreateCabinetDTO,
  CreateShelfDTO,
  CreatePositionDTO
} from '@/types/staticField.types';

interface FieldContentManagementProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

type ActiveTab = 'category' | 'subcategory' | 'location' | 'cabinet' | 'shelf' | 'position';

const FieldContentManagement: React.FC<FieldContentManagementProps> = ({ isOpen, onClose, onSave }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('category');
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [expandedSubcategories, setExpandedSubcategories] = useState<number[]>([]);
  const [expandedLocations, setExpandedLocations] = useState<number[]>([]);
  const [expandedCabinets, setExpandedCabinets] = useState<number[]>([]);
  const [expandedShelves, setExpandedShelves] = useState<number[]>([]);

  // Form states for each field type
  const [categoryForm, setCategoryForm] = useState<CreateCategoryDTO & { id?: number }>({ name: '', description: '' });
  const [subcategoryForm, setSubcategoryForm] = useState<CreateSubcategoryDTO & { id?: number }>({ name: '', description: '', category_id: 0 });
  const [locationForm, setLocationForm] = useState<CreateLocationDTO & { id?: number }>({ name: '', description: '', subcategory_id: 0 });
  const [cabinetForm, setCabinetForm] = useState<CreateCabinetDTO & { id?: number }>({ name: '', description: '', location_id: 0 });
  const [shelfForm, setShelfForm] = useState<CreateShelfDTO & { id?: number }>({ name: '', description: '', cabinet_id: 0 });
  const [positionForm, setPositionForm] = useState<CreatePositionDTO & { id?: number }>({ name: '', description: '', shelf_id: 0 });

  // Edit states
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingSubcategory, setIsEditingSubcategory] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingCabinet, setIsEditingCabinet] = useState(false);
  const [isEditingShelf, setIsEditingShelf] = useState(false);
  const [isEditingPosition, setIsEditingPosition] = useState(false);

  const {
    categories,
    subcategories,
    locations,
    cabinets,
    shelves,
    positions,
    loading,
    error,
    fetchCategories,
    fetchSubcategoriesByCategory,
    fetchLocationsBySubcategory,
    fetchCabinetsByLocation,
    fetchShelvesByCabinet,
    fetchPositionsByShelf,
    createCategory,
    createSubcategory,
    createLocation,
    createCabinet,
    createShelf,
    createPosition,
    updateCategory,
    updateSubcategory,
    updateLocation,
    updateCabinet,
    updateShelf,
    updatePosition,
    deleteCategory,
    deleteSubcategory,
    deleteLocation,
    deleteCabinet,
    deleteShelf,
    deletePosition
  } = useStaticFields();

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, fetchCategories]);

  const resetForms = () => {
    setCategoryForm({ name: '', description: '' });
    setSubcategoryForm({ name: '', description: '', category_id: 0 });
    setLocationForm({ name: '', description: '', subcategory_id: 0 });
    setCabinetForm({ name: '', description: '', location_id: 0 });
    setShelfForm({ name: '', description: '', cabinet_id: 0 });
    setPositionForm({ name: '', description: '', shelf_id: 0 });
    
    setIsEditingCategory(false);
    setIsEditingSubcategory(false);
    setIsEditingLocation(false);
    setIsEditingCabinet(false);
    setIsEditingShelf(false);
    setIsEditingPosition(false);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryForm.name.trim()) {
      toast({
        title: "Error",
        description: "Nama kategori tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isEditingCategory && categoryForm.id) {
        await updateCategory(categoryForm.id, { name: categoryForm.name, description: categoryForm.description });
      } else {
        await createCategory(categoryForm);
      }
      toast({
        title: "Sukses",
        description: `Kategori "${categoryForm.name}" berhasil ${isEditingCategory ? 'diperbarui' : 'ditambahkan'}.`
      });
      resetForms();
      fetchCategories();
      onSave();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan kategori",
        variant: "destructive"
      });
    }
  };

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subcategoryForm.name.trim()) {
      toast({
        title: "Error",
        description: "Nama sub kategori tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }

    if (!subcategoryForm.category_id) {
      toast({
        title: "Error",
        description: "Pilih kategori induk",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isEditingSubcategory && subcategoryForm.id) {
        await updateSubcategory(subcategoryForm.id, { 
          name: subcategoryForm.name, 
          description: subcategoryForm.description,
          category_id: subcategoryForm.category_id 
        });
      } else {
        await createSubcategory(subcategoryForm);
      }
      toast({
        title: "Sukses",
        description: `Sub kategori "${subcategoryForm.name}" berhasil ${isEditingSubcategory ? 'diperbarui' : 'ditambahkan'}.`
      });
      resetForms();
      fetchSubcategoriesByCategory(subcategoryForm.category_id);
      onSave();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan sub kategori",
        variant: "destructive"
      });
    }
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!locationForm.name.trim()) {
      toast({
        title: "Error",
        description: "Nama lokasi tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }

    if (!locationForm.subcategory_id) {
      toast({
        title: "Error",
        description: "Pilih sub kategori induk",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isEditingLocation && locationForm.id) {
        await updateLocation(locationForm.id, { 
          name: locationForm.name, 
          description: locationForm.description,
          subcategory_id: locationForm.subcategory_id 
        });
      } else {
        await createLocation(locationForm);
      }
      toast({
        title: "Sukses",
        description: `Lokasi "${locationForm.name}" berhasil ${isEditingLocation ? 'diperbarui' : 'ditambahkan'}.`
      });
      resetForms();
      fetchLocationsBySubcategory(locationForm.subcategory_id);
      onSave();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan lokasi",
        variant: "destructive"
      });
    }
  };

  const handleCabinetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cabinetForm.name.trim()) {
      toast({
        title: "Error",
        description: "Nama kabinet tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }

    if (!cabinetForm.location_id) {
      toast({
        title: "Error",
        description: "Pilih lokasi induk",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isEditingCabinet && cabinetForm.id) {
        await updateCabinet(cabinetForm.id, { 
          name: cabinetForm.name, 
          description: cabinetForm.description,
          location_id: cabinetForm.location_id 
        });
      } else {
        await createCabinet(cabinetForm);
      }
      toast({
        title: "Sukses",
        description: `Kabinet "${cabinetForm.name}" berhasil ${isEditingCabinet ? 'diperbarui' : 'ditambahkan'}.`
      });
      resetForms();
      fetchCabinetsByLocation(cabinetForm.location_id);
      onSave();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan kabinet",
        variant: "destructive"
      });
    }
  };

  const handleShelfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shelfForm.name.trim()) {
      toast({
        title: "Error",
        description: "Nama rak tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }

    if (!shelfForm.cabinet_id) {
      toast({
        title: "Error",
        description: "Pilih kabinet induk",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isEditingShelf && shelfForm.id) {
        await updateShelf(shelfForm.id, { 
          name: shelfForm.name, 
          description: shelfForm.description,
          cabinet_id: shelfForm.cabinet_id 
        });
      } else {
        await createShelf(shelfForm);
      }
      toast({
        title: "Sukses",
        description: `Rak "${shelfForm.name}" berhasil ${isEditingShelf ? 'diperbarui' : 'ditambahkan'}.`
      });
      resetForms();
      fetchShelvesByCabinet(shelfForm.cabinet_id);
      onSave();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan rak",
        variant: "destructive"
      });
    }
  };

  const handlePositionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!positionForm.name.trim()) {
      toast({
        title: "Error",
        description: "Nama posisi tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }

    if (!positionForm.shelf_id) {
      toast({
        title: "Error",
        description: "Pilih rak induk",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isEditingPosition && positionForm.id) {
        await updatePosition(positionForm.id, { 
          name: positionForm.name, 
          description: positionForm.description,
          shelf_id: positionForm.shelf_id 
        });
      } else {
        await createPosition(positionForm);
      }
      toast({
        title: "Sukses",
        description: `Posisi "${positionForm.name}" berhasil ${isEditingPosition ? 'diperbarui' : 'ditambahkan'}.`
      });
      resetForms();
      fetchPositionsByShelf(positionForm.shelf_id);
      onSave();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan posisi",
        variant: "destructive"
      });
    }
  };

  const toggleCategoryExpand = (categoryId: number) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
    if (!expandedCategories.includes(categoryId)) {
      fetchSubcategoriesByCategory(categoryId);
    }
  };

  const toggleSubcategoryExpand = (subcategoryId: number) => {
    setExpandedSubcategories(prev => 
      prev.includes(subcategoryId) 
        ? prev.filter(id => id !== subcategoryId) 
        : [...prev, subcategoryId]
    );
    if (!expandedSubcategories.includes(subcategoryId)) {
      fetchLocationsBySubcategory(subcategoryId);
    }
  };

  const toggleLocationExpand = (locationId: number) => {
    setExpandedLocations(prev => 
      prev.includes(locationId) 
        ? prev.filter(id => id !== locationId) 
        : [...prev, locationId]
    );
    if (!expandedLocations.includes(locationId)) {
      fetchCabinetsByLocation(locationId);
    }
  };

  const toggleCabinetExpand = (cabinetId: number) => {
    setExpandedCabinets(prev => 
      prev.includes(cabinetId) 
        ? prev.filter(id => id !== cabinetId) 
        : [...prev, cabinetId]
    );
    if (!expandedCabinets.includes(cabinetId)) {
      fetchShelvesByCabinet(cabinetId);
    }
  };

  const toggleShelfExpand = (shelfId: number) => {
    setExpandedShelves(prev => 
      prev.includes(shelfId) 
        ? prev.filter(id => id !== shelfId) 
        : [...prev, shelfId]
    );
    if (!expandedShelves.includes(shelfId)) {
      fetchPositionsByShelf(shelfId);
    }
  };

  const renderHierarchyView = () => (
    <div className="space-y-2 max-h-96 overflow-y-auto border border-dinus-primary/20 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-dinus-text mb-4">Hierarki Field</h3>
      
      {categories.map((category) => (
        <div key={category.id} className="space-y-1">
          <div className="flex items-center justify-between p-2 hover:bg-dinus-gray/50 rounded group">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleCategoryExpand(category.id)}
                className="p-1 hover:bg-dinus-primary/10 rounded"
              >
                {expandedCategories.includes(category.id) ? 
                  <ChevronDown className="w-4 h-4" /> : 
                  <ChevronRight className="w-4 h-4" />
                }
              </button>
              <span className="font-medium text-dinus-text">{category.name}</span>
            </div>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  setCategoryForm({ id: category.id, name: category.name, description: category.description || '' });
                  setIsEditingCategory(true);
                  setActiveTab('category');
                }}
                className="p-1 hover:bg-blue-100 rounded text-blue-600"
                title="Edit kategori"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Apakah Anda yakin ingin menghapus kategori "${category.name}"?`)) {
                    deleteCategory(category.id);
                  }
                }}
                className="p-1 hover:bg-red-100 rounded text-red-600"
                title="Hapus kategori"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          {expandedCategories.includes(category.id) && (
            <div className="ml-6 space-y-1">
              {subcategories
                .filter(sub => sub.category_id === category.id)
                .map((subcategory) => (
                <div key={subcategory.id} className="space-y-1">
                  <div className="flex items-center justify-between p-2 hover:bg-dinus-gray/50 rounded group">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleSubcategoryExpand(subcategory.id)}
                        className="p-1 hover:bg-dinus-primary/10 rounded"
                      >
                        {expandedSubcategories.includes(subcategory.id) ? 
                          <ChevronDown className="w-4 h-4" /> : 
                          <ChevronRight className="w-4 h-4" />
                        }
                      </button>
                      <span className="text-dinus-text">{subcategory.name}</span>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setSubcategoryForm({ 
                            id: subcategory.id, 
                            name: subcategory.name, 
                            description: subcategory.description || '', 
                            category_id: subcategory.category_id 
                          });
                          setIsEditingSubcategory(true);
                          setActiveTab('subcategory');
                        }}
                        className="p-1 hover:bg-blue-100 rounded text-blue-600"
                        title="Edit sub kategori"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Apakah Anda yakin ingin menghapus sub kategori "${subcategory.name}"?`)) {
                            deleteSubcategory(subcategory.id);
                          }
                        }}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                        title="Hapus sub kategori"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  {expandedSubcategories.includes(subcategory.id) && (
                    <div className="ml-6 space-y-1">
                      {locations
                        .filter(loc => loc.subcategory_id === subcategory.id)
                        .map((location) => (
                        <div key={location.id} className="space-y-1">
                          <div className="flex items-center justify-between p-2 hover:bg-dinus-gray/50 rounded group">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => toggleLocationExpand(location.id)}
                                className="p-1 hover:bg-dinus-primary/10 rounded"
                              >
                                {expandedLocations.includes(location.id) ? 
                                  <ChevronDown className="w-4 h-4" /> : 
                                  <ChevronRight className="w-4 h-4" />
                                }
                              </button>
                              <span className="text-dinus-text">{location.name}</span>
                            </div>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setLocationForm({ 
                                    id: location.id, 
                                    name: location.name, 
                                    description: location.description || '', 
                                    subcategory_id: location.subcategory_id 
                                  });
                                  setIsEditingLocation(true);
                                  setActiveTab('location');
                                }}
                                className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                title="Edit lokasi"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Apakah Anda yakin ingin menghapus lokasi "${location.name}"?`)) {
                                    deleteLocation(location.id);
                                  }
                                }}
                                className="p-1 hover:bg-red-100 rounded text-red-600"
                                title="Hapus lokasi"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          {expandedLocations.includes(location.id) && (
                            <div className="ml-6 space-y-1">
                              {cabinets
                                .filter(cab => cab.location_id === location.id)
                                .map((cabinet) => (
                                <div key={cabinet.id} className="space-y-1">
                                  <div className="flex items-center justify-between p-2 hover:bg-dinus-gray/50 rounded group">
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => toggleCabinetExpand(cabinet.id)}
                                        className="p-1 hover:bg-dinus-primary/10 rounded"
                                      >
                                        {expandedCabinets.includes(cabinet.id) ? 
                                          <ChevronDown className="w-4 h-4" /> : 
                                          <ChevronRight className="w-4 h-4" />
                                        }
                                      </button>
                                      <span className="text-dinus-text">{cabinet.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => {
                                          setCabinetForm({ 
                                            id: cabinet.id, 
                                            name: cabinet.name, 
                                            description: cabinet.description || '', 
                                            location_id: cabinet.location_id 
                                          });
                                          setIsEditingCabinet(true);
                                          setActiveTab('cabinet');
                                        }}
                                        className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                        title="Edit lemari"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (window.confirm(`Apakah Anda yakin ingin menghapus lemari "${cabinet.name}"?`)) {
                                            deleteCabinet(cabinet.id);
                                          }
                                        }}
                                        className="p-1 hover:bg-red-100 rounded text-red-600"
                                        title="Hapus lemari"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {expandedCabinets.includes(cabinet.id) && (
                                    <div className="ml-6 space-y-1">
                                      {shelves
                                        .filter(shelf => shelf.cabinet_id === cabinet.id)
                                        .map((shelf) => (
                                        <div key={shelf.id} className="space-y-1">
                                          <div className="flex items-center justify-between p-2 hover:bg-dinus-gray/50 rounded group">
                                            <div className="flex items-center space-x-2">
                                              <button
                                                onClick={() => toggleShelfExpand(shelf.id)}
                                                className="p-1 hover:bg-dinus-primary/10 rounded"
                                              >
                                                {expandedShelves.includes(shelf.id) ? 
                                                  <ChevronDown className="w-4 h-4" /> : 
                                                  <ChevronRight className="w-4 h-4" />
                                                }
                                              </button>
                                              <span className="text-dinus-text">{shelf.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button
                                                onClick={() => {
                                                  setShelfForm({ 
                                                    id: shelf.id, 
                                                    name: shelf.name, 
                                                    description: shelf.description || '', 
                                                    cabinet_id: shelf.cabinet_id 
                                                  });
                                                  setIsEditingShelf(true);
                                                  setActiveTab('shelf');
                                                }}
                                                className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                                title="Edit rak"
                                              >
                                                <Edit2 className="w-3 h-3" />
                                              </button>
                                              <button
                                                onClick={() => {
                                                  if (window.confirm(`Apakah Anda yakin ingin menghapus rak "${shelf.name}"?`)) {
                                                    deleteShelf(shelf.id);
                                                  }
                                                }}
                                                className="p-1 hover:bg-red-100 rounded text-red-600"
                                                title="Hapus rak"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </div>
                                          
                                          {expandedShelves.includes(shelf.id) && (
                                            <div className="ml-6 space-y-1">
                                              {positions
                                                .filter(pos => pos.shelf_id === shelf.id)
                                                .map((position) => (
                                                <div key={position.id} className="flex items-center justify-between p-2 hover:bg-dinus-gray/50 rounded group">
                                                  <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-4"></div>
                                                    <span className="text-dinus-text">{position.name}</span>
                                                  </div>
                                                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                      onClick={() => {
                                                        setPositionForm({ 
                                                          id: position.id, 
                                                          name: position.name, 
                                                          description: position.description || '', 
                                                          shelf_id: position.shelf_id 
                                                        });
                                                        setIsEditingPosition(true);
                                                        setActiveTab('position');
                                                      }}
                                                      className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                                      title="Edit posisi"
                                                    >
                                                      <Edit2 className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                      onClick={() => {
                                                        if (window.confirm(`Apakah Anda yakin ingin menghapus posisi "${position.name}"?`)) {
                                                          deletePosition(position.id);
                                                        }
                                                      }}
                                                      className="p-1 hover:bg-red-100 rounded text-red-600"
                                                      title="Hapus posisi"
                                                    >
                                                      <Trash2 className="w-3 h-3" />
                                                    </button>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderFormByTab = () => {
    switch (activeTab) {
      case 'category':
        return (
          <form onSubmit={handleCategorySubmit} className="space-y-4 border border-dinus-primary/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-dinus-text">
              {isEditingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="category_name" className="text-sm font-semibold text-dinus-text">
                  Nama Kategori *
                </Label>
                <Input
                  id="category_name"
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Masukkan nama kategori"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category_description" className="text-sm font-semibold text-dinus-text">
                  Deskripsi
                </Label>
                <Textarea
                  id="category_description"
                  value={categoryForm.description || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Masukkan deskripsi kategori (opsional)"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {isEditingCategory && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForms}
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
                    {isEditingCategory ? 'Perbarui' : 'Simpan'} Kategori
                  </>
                )}
              </Button>
            </div>
          </form>
        );

      case 'subcategory':
        return (
          <form onSubmit={handleSubcategorySubmit} className="space-y-4 border border-dinus-primary/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-dinus-text">
              {isEditingSubcategory ? 'Edit Sub Kategori' : 'Tambah Sub Kategori Baru'}
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="subcategory_category" className="text-sm font-semibold text-dinus-text">
                  Kategori Induk *
                </Label>
                <Select
                  value={subcategoryForm.category_id.toString()}
                  onValueChange={(value) => setSubcategoryForm({ ...subcategoryForm, category_id: parseInt(value) })}
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
                  value={subcategoryForm.name}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                  placeholder="Masukkan nama sub kategori"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="subcategory_description" className="text-sm font-semibold text-dinus-text">
                  Deskripsi
                </Label>
                <Textarea
                  id="subcategory_description"
                  value={subcategoryForm.description || ''}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                  placeholder="Masukkan deskripsi sub kategori (opsional)"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {isEditingSubcategory && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForms}
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
                    {isEditingSubcategory ? 'Perbarui' : 'Simpan'} Sub Kategori
                  </>
                )}
              </Button>
            </div>
          </form>
        );

      case 'location':
        return (
          <form onSubmit={handleLocationSubmit} className="space-y-4 border border-dinus-primary/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-dinus-text">
              {isEditingLocation ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="location_subcategory" className="text-sm font-semibold text-dinus-text">
                  Sub Kategori Induk *
                </Label>
                <Select
                  value={locationForm.subcategory_id.toString()}
                  onValueChange={(value) => setLocationForm({ ...locationForm, subcategory_id: parseInt(value) })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih sub kategori induk" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location_name" className="text-sm font-semibold text-dinus-text">
                  Nama Lokasi *
                </Label>
                <Input
                  id="location_name"
                  type="text"
                  value={locationForm.name}
                  onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                  placeholder="Masukkan nama lokasi"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="location_description" className="text-sm font-semibold text-dinus-text">
                  Deskripsi
                </Label>
                <Textarea
                  id="location_description"
                  value={locationForm.description || ''}
                  onChange={(e) => setLocationForm({ ...locationForm, description: e.target.value })}
                  placeholder="Masukkan deskripsi lokasi (opsional)"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {isEditingLocation && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForms}
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
                    {isEditingLocation ? 'Perbarui' : 'Simpan'} Lokasi
                  </>
                )}
              </Button>
            </div>
          </form>
        );

      case 'cabinet':
        return (
          <form onSubmit={handleCabinetSubmit} className="space-y-4 border border-dinus-primary/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-dinus-text">
              {isEditingCabinet ? 'Edit Kabinet' : 'Tambah Kabinet Baru'}
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="cabinet_location" className="text-sm font-semibold text-dinus-text">
                  Lokasi Induk *
                </Label>
                <Select
                  value={cabinetForm.location_id.toString()}
                  onValueChange={(value) => setCabinetForm({ ...cabinetForm, location_id: parseInt(value) })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih lokasi induk" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cabinet_name" className="text-sm font-semibold text-dinus-text">
                  Nama Kabinet *
                </Label>
                <Input
                  id="cabinet_name"
                  type="text"
                  value={cabinetForm.name}
                  onChange={(e) => setCabinetForm({ ...cabinetForm, name: e.target.value })}
                  placeholder="Masukkan nama kabinet"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cabinet_description" className="text-sm font-semibold text-dinus-text">
                  Deskripsi
                </Label>
                <Textarea
                  id="cabinet_description"
                  value={cabinetForm.description || ''}
                  onChange={(e) => setCabinetForm({ ...cabinetForm, description: e.target.value })}
                  placeholder="Masukkan deskripsi kabinet (opsional)"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {isEditingCabinet && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForms}
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
                    {isEditingCabinet ? 'Perbarui' : 'Simpan'} Kabinet
                  </>
                )}
              </Button>
            </div>
          </form>
        );

      case 'shelf':
        return (
          <form onSubmit={handleShelfSubmit} className="space-y-4 border border-dinus-primary/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-dinus-text">
              {isEditingShelf ? 'Edit Rak' : 'Tambah Rak Baru'}
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="shelf_cabinet" className="text-sm font-semibold text-dinus-text">
                  Kabinet Induk *
                </Label>
                <Select
                  value={shelfForm.cabinet_id.toString()}
                  onValueChange={(value) => setShelfForm({ ...shelfForm, cabinet_id: parseInt(value) })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih kabinet induk" />
                  </SelectTrigger>
                  <SelectContent>
                    {cabinets.map((cabinet) => (
                      <SelectItem key={cabinet.id} value={cabinet.id.toString()}>
                        {cabinet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="shelf_name" className="text-sm font-semibold text-dinus-text">
                  Nama Rak *
                </Label>
                <Input
                  id="shelf_name"
                  type="text"
                  value={shelfForm.name}
                  onChange={(e) => setShelfForm({ ...shelfForm, name: e.target.value })}
                  placeholder="Masukkan nama rak"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="shelf_description" className="text-sm font-semibold text-dinus-text">
                  Deskripsi
                </Label>
                <Textarea
                  id="shelf_description"
                  value={shelfForm.description || ''}
                  onChange={(e) => setShelfForm({ ...shelfForm, description: e.target.value })}
                  placeholder="Masukkan deskripsi rak (opsional)"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {isEditingShelf && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForms}
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
                    {isEditingShelf ? 'Perbarui' : 'Simpan'} Rak
                  </>
                )}
              </Button>
            </div>
          </form>
        );

      case 'position':
        return (
          <form onSubmit={handlePositionSubmit} className="space-y-4 border border-dinus-primary/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-dinus-text">
              {isEditingPosition ? 'Edit Posisi' : 'Tambah Posisi Baru'}
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="position_shelf" className="text-sm font-semibold text-dinus-text">
                  Rak Induk *
                </Label>
                <Select
                  value={positionForm.shelf_id.toString()}
                  onValueChange={(value) => setPositionForm({ ...positionForm, shelf_id: parseInt(value) })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih rak induk" />
                  </SelectTrigger>
                  <SelectContent>
                    {shelves.map((shelf) => (
                      <SelectItem key={shelf.id} value={shelf.id.toString()}>
                        {shelf.name}
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
                  value={positionForm.name}
                  onChange={(e) => setPositionForm({ ...positionForm, name: e.target.value })}
                  placeholder="Masukkan nama posisi"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="position_description" className="text-sm font-semibold text-dinus-text">
                  Deskripsi
                </Label>
                <Textarea
                  id="position_description"
                  value={positionForm.description || ''}
                  onChange={(e) => setPositionForm({ ...positionForm, description: e.target.value })}
                  placeholder="Masukkan deskripsi posisi (opsional)"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {isEditingPosition && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForms}
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
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-dinus-text">
            Kelola Konten Field
          </DialogTitle>
        </DialogHeader>

        <div className="flex space-x-2 mb-4 flex-wrap">
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
            variant={activeTab === 'location' ? 'default' : 'outline'}
            onClick={() => setActiveTab('location')}
            className={activeTab === 'location' ? 'bg-dinus-primary text-white' : 'border-dinus-primary/20 text-dinus-text'}
          >
            Lokasi
          </Button>
          <Button
            type="button"
            variant={activeTab === 'cabinet' ? 'default' : 'outline'}
            onClick={() => setActiveTab('cabinet')}
            className={activeTab === 'cabinet' ? 'bg-dinus-primary text-white' : 'border-dinus-primary/20 text-dinus-text'}
          >
            Kabinet
          </Button>
          <Button
            type="button"
            variant={activeTab === 'shelf' ? 'default' : 'outline'}
            onClick={() => setActiveTab('shelf')}
            className={activeTab === 'shelf' ? 'bg-dinus-primary text-white' : 'border-dinus-primary/20 text-dinus-text'}
          >
            Rak
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            {renderFormByTab()}
          </div>
          
          <div>
            {renderHierarchyView()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FieldContentManagement;