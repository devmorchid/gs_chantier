export interface Charge {
  id: number;
  reference: string;
  libelle?: string | null;
  type: string;
  type_label?: string;
  montant: number;
  date: string;
  status: string;
  status_label: string;
  rejection_reason?: string | null;
  payment_method?: string | null;
  can_edit?: boolean;
  chantier?: { id: number; reference: string; nom: string } | null;
  description?: string | null;
  attachments?: ChargeAttachment[];
}

export interface ChargeAttachment {
  id: number;
  name: string;
  mime_type: string;
  size: number;
  url: string;
}

export interface PaginatedCharges {
  data: Charge[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}
