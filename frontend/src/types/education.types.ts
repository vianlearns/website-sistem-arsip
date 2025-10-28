export interface EducationLevel {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Faculty {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Program {
  id: number;
  name: string;
  faculty_id: number;
  level_id: number | null; // reference to EducationLevel
  created_at?: string;
  updated_at?: string;
}