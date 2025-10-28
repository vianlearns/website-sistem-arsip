import api from '@/lib/api';
import { EducationLevel, Faculty, Program } from '@/types/education.types';

export default class EducationService {
  // Levels (Jenjang Pendidikan)
  static async getLevels(): Promise<EducationLevel[]> {
    const res = await api.get('/education/levels');
    return res.data?.data ?? res.data;
  }
  static async createLevel(name: string): Promise<{ id: number; message: string }> {
    const res = await api.post('/education/levels', { name });
    return res.data;
  }
  static async updateLevel(id: number, data: Partial<EducationLevel>): Promise<{ message: string }> {
    const res = await api.put(`/education/levels/${id}`, data);
    return res.data;
  }
  static async deleteLevel(id: number): Promise<{ message: string }> {
    const res = await api.delete(`/education/levels/${id}`);
    return res.data;
  }

  // Faculties (Fakultas)
  static async getFaculties(): Promise<Faculty[]> {
    const res = await api.get('/education/faculties');
    return res.data?.data ?? res.data;
  }
  static async createFaculty(name: string): Promise<{ id: number; message: string }> {
    const res = await api.post('/education/faculties', { name });
    return res.data;
  }
  static async updateFaculty(id: number, data: Partial<Faculty>): Promise<{ message: string }> {
    const res = await api.put(`/education/faculties/${id}`, data);
    return res.data;
  }
  static async deleteFaculty(id: number): Promise<{ message: string }> {
    const res = await api.delete(`/education/faculties/${id}`);
    return res.data;
  }

  // Programs (Program Studi)
  static async getPrograms(): Promise<Program[]> {
    const res = await api.get('/education/programs');
    return res.data?.data ?? res.data;
  }
  static async createProgram(name: string, faculty_id: number, level_id: number): Promise<{ id: number; message: string }> {
    const res = await api.post('/education/programs', { name, faculty_id, level_id });
    return res.data;
  }
  static async updateProgram(id: number, data: Partial<Program>): Promise<{ message: string }> {
    const res = await api.put(`/education/programs/${id}`, data);
    return res.data;
  }
  static async deleteProgram(id: number): Promise<{ message: string }> {
    const res = await api.delete(`/education/programs/${id}`);
    return res.data;
  }
}