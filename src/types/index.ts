export interface Ecole {
  id: string;
  nom: string;
  statut: boolean;
  created_at: string;
}

export interface Cours {
  id: string;
  ecole_id: string;
  nom_cours: string;
  thematique: string;
  description?: string | null;
  statut: 'actif' | 'archive' | string;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  cours_id: string;
  numero_module: number;
  sous_titre: string;
  url_cours: string;
  created_at: string;
  updated_at: string;
}

export interface CoursWithDetails extends Cours {
  ecole?: Ecole;
  modules: Module[];
}

export interface EcoleWithCourses extends Ecole {
  courses: CoursWithDetails[];
}

export interface CatalogStats {
  totalEcoles: number;
  totalCours: number;
  totalModules: number;
  totalArchives: number;
}

export interface CreateModulePayload {
  ecole_nom: string;
  nom_cours: string;
  thematique: string;
  numero_module: number;
  sous_titre: string;
  url_cours: string;
  replace_if_exists?: boolean;
}

export interface UpdateModulePayload {
  numero_module?: number;
  sous_titre?: string;
  url_cours?: string;
  replace_if_exists?: boolean;
}

export interface UpdateCoursPayload {
  nom_cours?: string;
  thematique?: string;
  description?: string | null;
  statut?: 'actif' | 'archive';
}

export interface UpdateEcolePayload {
  nom?: string;
  statut?: boolean;
}
