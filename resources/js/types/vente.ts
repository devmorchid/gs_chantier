
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
  montant_paye?: number;
  reste_a_payer?: number;
  notes?: string | null;
  statut?: string;
  statut_label?: string;
  items?: VenteItem[];
  paiements?: Paiement[];
}

export interface Paiement {
  id: number;
  montant: number;
  mode_paiement: string;
  date_paiement: string;
  file?: string | null;
  user?: string | null;
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


