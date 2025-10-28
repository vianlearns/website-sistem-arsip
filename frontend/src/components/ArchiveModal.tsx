import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Camera, MapPin, Clock } from 'lucide-react';
import { type Archive } from '@/types/archive.types';
import { getImageUrl } from '@/lib/api';

interface ArchiveModalProps {
  archive: Archive;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (archive: Archive) => void;
  onDelete: (id: number) => void;
  isAdmin?: boolean;
}

import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

const ArchiveModal: React.FC<ArchiveModalProps> = ({ archive, isOpen, onClose, onEdit, onDelete, isAdmin }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-dinus-text">
            Detail Arsip
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg bg-dinus-gray">
              <img
                src={getImageUrl(archive.image)}
                alt={archive.title}
                className="w-full h-64 lg:h-80 object-cover"
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-dinus-text mb-3">
                {archive.title}
              </h2>
              <p className="text-dinus-text/70 leading-relaxed">
                {archive.description}
              </p>
            </div>

            {/* Metadata */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 bg-dinus-gray/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-dinus-primary" />
                  <div>
                    <p className="text-sm font-medium text-dinus-text">Tanggal</p>
                    <p className="text-sm text-dinus-text/70">
                      {new Date(archive.date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                {/* Static Hierarchical Fields */}
                {(archive.category_id || archive.subcategory_id || archive.location_id || archive.cabinet_id || archive.shelf_id || archive.position_id) && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-dinus-text mb-2">Lokasi Hierarki</h3>
                    
                    {/* Display location hierarchy if available */}
                    {archive.location_hierarchy && (
                      <div className="flex items-start gap-3 p-3 bg-dinus-gray/50 rounded-lg">
                        <MapPin className="w-5 h-5 text-dinus-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-dinus-text mb-2">Hierarki Lokasi</p>
                          <div className="text-sm text-dinus-text/70 space-y-1">
                            {archive.location_hierarchy.category && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Kategori</span>
                                <span>{archive.location_hierarchy.category}</span>
                              </div>
                            )}
                            {archive.location_hierarchy.subcategory && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Sub Kategori</span>
                                <span>{archive.location_hierarchy.subcategory}</span>
                              </div>
                            )}
                            {archive.location_hierarchy.location && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Lokasi</span>
                                <span>{archive.location_hierarchy.location}</span>
                              </div>
                            )}
                            {archive.location_hierarchy.cabinet && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Lemari</span>
                                <span>{archive.location_hierarchy.cabinet}</span>
                              </div>
                            )}
                            {archive.location_hierarchy.shelf && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Rak</span>
                                <span>{archive.location_hierarchy.shelf}</span>
                              </div>
                            )}
                            {archive.location_hierarchy.position && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Posisi</span>
                                <span>{archive.location_hierarchy.position}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fallback display for individual IDs if hierarchy object is not available */}
                    {!archive.location_hierarchy && (
                      <div className="flex items-start gap-3 p-3 bg-dinus-gray/50 rounded-lg">
                        <MapPin className="w-5 h-5 text-dinus-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-dinus-text mb-2">Lokasi</p>
                          <div className="text-sm text-dinus-text/70 space-y-1">
                            {archive.category_id && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Kategori ID</span>
                                <span>{archive.category_id}</span>
                              </div>
                            )}
                            {archive.subcategory_id && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Sub Kategori ID</span>
                                <span>{archive.subcategory_id}</span>
                              </div>
                            )}
                            {archive.location_id && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Lokasi ID</span>
                                <span>{archive.location_id}</span>
                              </div>
                            )}
                            {archive.cabinet_id && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Lemari ID</span>
                                <span>{archive.cabinet_id}</span>
                              </div>
                            )}
                            {archive.shelf_id && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Rak ID</span>
                                <span>{archive.shelf_id}</span>
                              </div>
                            )}
                            {archive.position_id && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Posisi ID</span>
                                <span>{archive.position_id}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="border-t border-dinus-primary/10 pt-4">
                <div className="grid grid-cols-1 gap-2 text-xs text-dinus-text/50">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>Dibuat: {new Date(archive.created_at).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>Diperbarui: {new Date(archive.updated_at).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(archive)}
              className="border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(archive.id)}
              className="border-destructive/20 text-destructive hover:bg-destructive hover:text-white"
            >
              <Trash2 className="w-4 h-4" />
              Hapus
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveModal;