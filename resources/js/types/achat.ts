export interface AchatItem {
  id: number;
  produit: string | null;
  quantite: number;
  prix_achat: number;
}


export interface Paiement {
  id: number;
  montant: number;
  mode_paiement: string;
  date_paiement: string;
  file?: string | null;
  user?: string | null;
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
  montant_paye?: number;
  reste_a_payer?: number;
  notes?: string | null;
  items?: AchatItem[];
  paiements?: Paiement[];
  statut?: string; // Added for status badge and filtering
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
