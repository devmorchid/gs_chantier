export interface StockMouvement {
  id: number;
  reference?: string | null;
  produit_id: number;
  produit?: { id: number; name: string };
  items?: { id: number; produit: { id: number; name: string }; quantite: number }[];
  origine?: string | null;
  type: string;
  destination: string;
  quantite: number;
  date: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedStockMouvements {
  data: StockMouvement[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}
