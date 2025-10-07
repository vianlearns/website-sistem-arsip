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
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Badge className="bg-dinus-primary text-white text-sm">
                  {archive.category?.name}
                </Badge>
                {archive.subcategory && (
                  <Badge className="bg-dinus-primary-light text-white text-sm">
                    {archive.subcategory.name}
                  </Badge>
                )}
                {archive.position && (
                  <Badge className="bg-dinus-secondary text-white text-sm">
                    {archive.position.name}
                  </Badge>
                )}
              </div>
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
                {archive.location && (
                  <div className="flex items-center gap-3 p-3 bg-dinus-gray/50 rounded-lg">
                    <MapPin className="w-5 h-5 text-dinus-primary" />
                    <div>
                      <p className="text-sm font-medium text-dinus-text">Lokasi</p>
                      <p className="text-sm text-dinus-text/70">{archive.location}</p>
                    </div>
                  </div>
                )}

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
                
                {archive.position && (
                  <div className="flex items-center gap-3 p-3 bg-dinus-gray/50 rounded-lg">
                    <div className="w-5 h-5 text-dinus-secondary flex items-center justify-center font-bold">P</div>
                    <div>
                      <p className="text-sm font-medium text-dinus-text">Posisi</p>
                      <p className="text-sm text-dinus-text/70">{archive.position.name}</p>
                    </div>
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