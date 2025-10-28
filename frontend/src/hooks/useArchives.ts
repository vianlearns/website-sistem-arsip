import { useState, useEffect, useCallback } from 'react';
import { Archive, ArchiveFilter } from '@/types/archive.types';
import ArchiveService from '@/services/archive.service';
import { useToast } from '@/hooks/use-toast';

export const useArchives = (filters?: ArchiveFilter, page: number = 1, limit: number = 10) => {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const { toast } = useToast();

  const fetchArchives = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ArchiveService.getAllArchives(filters, page, limit);
      
      if (response && response.success) {
        setArchives(response.data);
        setTotalPages(response.pagination.total_pages);
        setTotalItems(response.pagination.total);
      } else if (response && response.data) {
        // Fallback untuk format respons lama
        setArchives(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(response.pagination?.total || 0);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gagal memuat data arsip';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit, toast]);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  const refreshArchives = useCallback(() => {
    fetchArchives();
  }, [fetchArchives]);

  return {
    archives,
    loading,
    error,
    totalPages,
    totalItems,
    refreshArchives,
    fetchArchives
  };
};

export const useArchive = (id: number) => {
  const [archive, setArchive] = useState<Archive | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchArchive = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await ArchiveService.getArchiveById(id);
      setArchive(data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gagal memuat detail arsip';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    if (id) {
      fetchArchive();
    }
  }, [id, fetchArchive]);

  return {
    archive,
    loading,
    error,
    fetchArchive
  };
};





// Hook untuk operasi CRUD
export const useArchiveOperations = () => {
  const { toast } = useToast();

  const createArchive = async (archiveData: any) => {
    try {
      const newArchive = await ArchiveService.createArchive(archiveData);
      toast({
        title: "Sukses",
        description: "Arsip berhasil ditambahkan",
      });
      return newArchive;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gagal menambahkan arsip';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateArchive = async (id: number, archiveData: any) => {
    try {
      const updatedArchive = await ArchiveService.updateArchive(id, archiveData);
      toast({
        title: "Sukses",
        description: "Arsip berhasil diperbarui",
      });
      return updatedArchive;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gagal memperbarui arsip';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteArchive = async (id: number) => {
    try {
      await ArchiveService.deleteArchive(id);
      toast({
        title: "Sukses",
        description: "Arsip berhasil dihapus",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gagal menghapus arsip';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    createArchive,
    updateArchive,
    deleteArchive
  };
};