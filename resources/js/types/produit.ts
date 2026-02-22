export interface Produit {
  id: number;
  code_barre: string;
  name: string;
  category?: { id: number; name: string } | null;
  category_id?: number | null;
  prix_achat: number;
  prix_vente: number;
  fournisseur?: { id: number; name: string } | null;
  fournisseur_id?: number | null;
  image?: string;
  quantite?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedProduits {
  data: Produit[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
