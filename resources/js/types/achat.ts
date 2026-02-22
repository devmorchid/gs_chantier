export interface AchatItem {
  id: number;
  produit: string | null;
  quantite: number;
  prix_achat: number;
}

export interface Achat {
  id: number;
  reference: string;
  date: string;
  fournisseur?: string | null;
  user?: string | null;
  remise?: number;
  tva_rate?: number;
  total_ht?: number;
  total_tva?: number;
  total_ttc?: number;
  notes?: string | null;
  items?: AchatItem[];
}

export interface PaginatedAchats {
  data: Achat[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}
