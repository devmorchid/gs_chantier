export interface VenteItem {
  id: number;
  produit: string | null;
  quantite: number;
  prix_vente: number;
}

export interface Vente {
  id: number;
  reference: string;
  date: string;
  client?: string | null;
  user?: string | null;
  remise?: number;
  tva_rate?: number;
  total_ht?: number;
  total_tva?: number;
  total_ttc?: number;
  notes?: string | null;
  items?: VenteItem[];
}

export interface PaginatedVentes {
  data: Vente[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}
