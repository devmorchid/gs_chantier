import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Plus,
    Pencil,
    Trash2,
    MoreHorizontal,
    MapPin,
    CheckCircle2,
    Clock,
    XCircle,
    Pause,
    Building2,
    Users,
    Banknote,
    GripVertical,
    Check,
    Calendar,
    Home,
    Wrench,
    UserCheck,
    BadgeCheck,
    Filter,
    FileText,
    FileSpreadsheet,
    Download,
    Eye,
    X,
} from 'lucide-react';

interface Equipe {
    id: number;
    name: string;
    specialite?: string;
}

interface Technicien {
    id: number;
    nom: string;
    prenom: string;
    nom_complet?: string;
    specialite?: string;
}

interface ServiceDetail {
    id: number;
    // Unité (Appartement, Studio...)
    unite_type: string;
    unite_type_label: string;
    unite_numero: string | null;
    // Emplacement dans l'unité
    emplacement: string;
    localisation_complete: string;
    // Description et phase
    description: string;
    phase: string | null;
    phase_label: string | null;
    // Quantité et prix
    quantite: number;
    unite: string;
    unite_label: string;
    prix_unitaire: number;
    prix_total: number;
    // Statut
    statut: string;
    statut_label: string;
    statut_color: string;
    // Dates
    date_debut: string | null;
    date_fin: string | null;
    date_validation: string | null;
    // Équipe et technicien
    equipe_id: number | null;
    equipe: Equipe | null;
    technicien_id: number | null;
    technicien: Technicien | null;
    notes: string | null;
    ordre: number;
}

interface Service {
    id: number;
    name: string;
    type: string;
    type_label: string;
    price: number | null;
    status: string;
    status_label: string;
    chantier: {
        id: number;
        reference: string;
        nom: string;
    } | null;
    equipe: {
        id: number;
        name: string;
    } | null;
    details: ServiceDetail[];
    details_total: number;
    progress_percentage: number;
}

interface Props {
    service: Service;
    uniteTypes: Record<string, string>;
    emplacements: string[];
    phases: Record<string, string>;
    unites: Record<string, string>;
    statuts: Record<string, string>;
    statutColors: Record<string, string>;
    equipes: Equipe[];
    techniciens: { id: number; nom: string; prenom: string; specialite: string | null }[];
}

const statutBadgeConfig: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
    en_attente: { color: 'bg-gray-100 text-gray-800', icon: Clock },
    en_cours: { color: 'bg-blue-100 text-blue-800', icon: Clock },
    termine: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    valide: { color: 'bg-emerald-100 text-emerald-800', icon: BadgeCheck },
    annule: { color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function ServiceDetailsIndex({
    service,
    uniteTypes,
    emplacements,
    phases,
    unites,
    statuts,
    statutColors,
    equipes,
    techniciens,
}: Props) {
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState<ServiceDetail | null>(null);
    const [filterUniteType, setFilterUniteType] = useState<string>('all');
    const [filterPhase, setFilterPhase] = useState<string>('all');
    const [filterStatut, setFilterStatut] = useState<string>('all');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Services', href: '/services' },
        { title: service.name, href: `/services/${service.id}` },
        { title: 'Détails', href: `/services/${service.id}/details` },
    ];

    // Form pour ajouter - avec les nouveaux champs
    const addForm = useForm({
        unite_type: 'appartement',
        unite_numero: '',
        emplacement: '',
        description: '',
        phase: 'preparation',
        quantite: 1,
        unite: 'unité',
        prix_unitaire: 0,
        equipe_id: '',
        technicien_id: '',
        date_debut: '',
        date_fin: '',
        notes: '',
    });

    // Form pour éditer - avec les nouveaux champs
    const editForm = useForm({
        unite_type: 'appartement',
        unite_numero: '',
        emplacement: '',
        description: '',
        phase: 'preparation',
        quantite: 1,
        unite: 'unité',
        prix_unitaire: 0,
        statut: 'en_attente',
        equipe_id: '',
        technicien_id: '',
        date_debut: '',
        date_fin: '',
        notes: '',
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(`/services/${service.id}/details`, {
            onSuccess: () => {
                setAddDialogOpen(false);
                addForm.reset();
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDetail) return;
        editForm.put(`/services/${service.id}/details/${selectedDetail.id}`, {
            onSuccess: () => {
                setEditDialogOpen(false);
                setSelectedDetail(null);
            },
        });
    };

    const handleDelete = () => {
        if (!selectedDetail) return;
        router.delete(`/services/${service.id}/details/${selectedDetail.id}`, {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setSelectedDetail(null);
            },
        });
    };

    const handleStatusChange = (detail: ServiceDetail, newStatus: string) => {
        router.patch(`/services/${service.id}/details/${detail.id}/status`, {
            statut: newStatus,
        });
    };

    const openEditDialog = (detail: ServiceDetail) => {
        setSelectedDetail(detail);
        editForm.setData({
            unite_type: detail.unite_type || 'appartement',
            unite_numero: detail.unite_numero || '',
            emplacement: detail.emplacement,
            description: detail.description,
            phase: detail.phase || 'preparation',
            quantite: detail.quantite,
            unite: detail.unite,
            prix_unitaire: detail.prix_unitaire,
            statut: detail.statut,
            equipe_id: detail.equipe_id?.toString() || '',
            technicien_id: detail.technicien_id?.toString() || '',
            date_debut: detail.date_debut || '',
            date_fin: detail.date_fin || '',
            notes: detail.notes || '',
        });
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (detail: ServiceDetail) => {
        setSelectedDetail(detail);
        setDeleteDialogOpen(true);
    };

    // Filtrer les détails
    const filteredDetails = service.details.filter((detail) => {
        if (filterUniteType !== 'all' && detail.unite_type !== filterUniteType) return false;
        if (filterPhase !== 'all' && detail.phase !== filterPhase) return false;
        if (filterStatut !== 'all' && detail.statut !== filterStatut) return false;
        return true;
    });

    // Grouper les détails par unité (Type + Numéro)
    const detailsByUnite = filteredDetails.reduce((acc, detail) => {
        const key = detail.localisation_complete || detail.unite_type_label || 'Non spécifié';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(detail);
        return acc;
    }, {} as Record<string, ServiceDetail[]>);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-MA', {
            style: 'currency',
            currency: 'MAD',
            minimumFractionDigits: 2,
        }).format(price);
    };

    const formatDate = (date: string | null) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Détails - ${service.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={`/services/${service.id}`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Détails du service
                            </h1>
                            <p className="text-muted-foreground">
                                {service.name} - {service.type_label}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Export Buttons */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Exporter
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <a href={`/services/${service.id}/details/pdf`} className="flex items-center cursor-pointer">
                                        <FileText className="mr-2 h-4 w-4 text-red-600" />
                                        Télécharger PDF
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a href={`/services/${service.id}/details/pdf-stream`} target="_blank" className="flex items-center cursor-pointer">
                                        <Eye className="mr-2 h-4 w-4 text-red-600" />
                                        Voir PDF
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <a href={`/services/${service.id}/details/excel`} className="flex items-center cursor-pointer">
                                        <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                                        Télécharger Excel (CSV)
                                    </a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter un détail
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Ajouter un détail</DialogTitle>
                                    <DialogDescription>
                                        Ajoutez un travail spécifique à réaliser
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAdd} className="space-y-4">
                                    {/* Unité (Appartement, Studio...) */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Type d'unité *</Label>
                                            <Select
                                                value={addForm.data.unite_type}
                                                onValueChange={(value) => addForm.setData('unite_type', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choisir..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(uniteTypes).map(([value, label]) => (
                                                        <SelectItem key={value} value={value}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Numéro d'unité</Label>
                                            <Input
                                                value={addForm.data.unite_numero}
                                                onChange={(e) => addForm.setData('unite_numero', e.target.value)}
                                                placeholder="Ex: A01, B02..."
                                            />
                                        </div>
                                    </div>

                                    {/* Emplacement et Phase */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="emplacement">Emplacement *</Label>
                                            <Select
                                                value={addForm.data.emplacement}
                                                onValueChange={(value) => addForm.setData('emplacement', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choisir..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {emplacements.map((emp) => (
                                                        <SelectItem key={emp} value={emp}>
                                                            {emp}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {addForm.errors.emplacement && (
                                                <p className="text-sm text-destructive">{addForm.errors.emplacement}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phase *</Label>
                                            <Select
                                                value={addForm.data.phase}
                                                onValueChange={(value) => addForm.setData('phase', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(phases).map(([value, label]) => (
                                                        <SelectItem key={value} value={value}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description *</Label>
                                        <Textarea
                                            id="description"
                                            value={addForm.data.description}
                                            onChange={(e) => addForm.setData('description', e.target.value)}
                                            placeholder="Ex: Installation de 6 prises + câblage éclairage"
                                            rows={2}
                                        />
                                        {addForm.errors.description && (
                                            <p className="text-sm text-destructive">{addForm.errors.description}</p>
                                        )}
                                    </div>

                                    {/* Équipe et Technicien */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Équipe</Label>
                                            <Select
                                                value={addForm.data.equipe_id || 'none'}
                                                onValueChange={(value) => addForm.setData('equipe_id', value === 'none' ? '' : value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Non assignée</SelectItem>
                                                    {equipes.map((eq) => (
                                                        <SelectItem key={eq.id} value={eq.id.toString()}>
                                                            {eq.name}{eq.specialite ? ` (${eq.specialite})` : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Technicien</Label>
                                            <Select
                                                value={addForm.data.technicien_id || 'none'}
                                                onValueChange={(value) => addForm.setData('technicien_id', value === 'none' ? '' : value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Non assigné</SelectItem>
                                                    {techniciens.map((tech) => (
                                                        <SelectItem key={tech.id} value={tech.id.toString()}>
                                                            {tech.prenom} {tech.nom}{tech.specialite ? ` (${tech.specialite})` : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Date début</Label>
                                            <Input
                                                type="date"
                                                value={addForm.data.date_debut}
                                                onChange={(e) => addForm.setData('date_debut', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date fin prévue</Label>
                                            <Input
                                                type="date"
                                                value={addForm.data.date_fin}
                                                onChange={(e) => addForm.setData('date_fin', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Quantité et Prix */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="quantite">Quantité *</Label>
                                            <Input
                                                id="quantite"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={addForm.data.quantite}
                                                onChange={(e) => addForm.setData('quantite', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="unite">Unité de mesure *</Label>
                                            <Select
                                                value={addForm.data.unite}
                                                onValueChange={(value) => addForm.setData('unite', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(unites).map(([value, label]) => (
                                                        <SelectItem key={value} value={value}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="prix_unitaire">Prix unitaire (DH) *</Label>
                                            <Input
                                                id="prix_unitaire"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={addForm.data.prix_unitaire}
                                                onChange={(e) => addForm.setData('prix_unitaire', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-sm text-muted-foreground">Total:</p>
                                        <p className="text-lg font-semibold">
                                            {formatPrice(addForm.data.quantite * addForm.data.prix_unitaire)}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={addForm.data.notes}
                                            onChange={(e) => addForm.setData('notes', e.target.value)}
                                            placeholder="Notes supplémentaires..."
                                            rows={2}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                                            Annuler
                                        </Button>
                                        <Button type="submit" disabled={addForm.processing}>
                                            Ajouter
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Chantier</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {service.chantier ? (
                                <Link 
                                    href={`/chantiers/${service.chantier.id}`}
                                    className="text-lg font-bold text-primary hover:underline"
                                >
                                    {service.chantier.nom}
                                </Link>
                            ) : (
                                <p className="text-muted-foreground">-</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Équipe</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {service.equipe ? (
                                <p className="text-lg font-bold">{service.equipe.name}</p>
                            ) : (
                                <p className="text-muted-foreground">Non assignée</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total détails</CardTitle>
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{formatPrice(service.details_total)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Progression</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-2xl font-bold">{service.progress_percentage}%</p>
                                <Progress value={service.progress_percentage} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                {service.details.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    Filtres
                                </CardTitle>
                                <span className="text-sm text-muted-foreground">
                                    {filteredDetails.length} / {service.details.length} affichés
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex-1 min-w-[150px]">
                                    <Label className="text-xs text-muted-foreground mb-1 block">Type d'unité</Label>
                                    <Select value={filterUniteType} onValueChange={setFilterUniteType}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous les types</SelectItem>
                                            {Object.entries(uniteTypes).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <Label className="text-xs text-muted-foreground mb-1 block">Phase</Label>
                                    <Select value={filterPhase} onValueChange={setFilterPhase}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Toutes les phases</SelectItem>
                                            {Object.entries(phases).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <Label className="text-xs text-muted-foreground mb-1 block">Statut</Label>
                                    <Select value={filterStatut} onValueChange={setFilterStatut}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous les statuts</SelectItem>
                                            {Object.entries(statuts).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {(filterUniteType !== 'all' || filterPhase !== 'all' || filterStatut !== 'all') && (
                                    <div className="flex items-end">
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => {
                                                setFilterUniteType('all');
                                                setFilterPhase('all');
                                                setFilterStatut('all');
                                            }}
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Réinitialiser
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Details List - Grouped by Unité */}
                {service.details.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground text-center mb-4">
                                Aucun détail ajouté pour ce service.
                            </p>
                            <Button onClick={() => setAddDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter le premier détail
                            </Button>
                        </CardContent>
                    </Card>
                ) : filteredDetails.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Filter className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground text-center mb-4">
                                Aucun détail ne correspond aux filtres sélectionnés.
                            </p>
                            <Button variant="outline" onClick={() => {
                                setFilterUniteType('all');
                                setFilterPhase('all');
                                setFilterStatut('all');
                            }}>
                                Réinitialiser les filtres
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(detailsByUnite).map(([uniteKey, details]) => {
                            const firstDetail = details[0];
                            const uniteLabel = firstDetail?.unite_type ? uniteTypes[firstDetail.unite_type] || firstDetail.unite_type : 'Sans unité';
                            const uniteNumero = firstDetail?.unite_numero || '';
                            const uniteTotal = details.reduce((sum, d) => sum + d.prix_total, 0);
                            const completedCount = details.filter(d => d.statut === 'termine' || d.statut === 'valide').length;
                            const uniteProgress = details.length > 0 
                                ? Math.round((completedCount / details.length) * 100)
                                : 0;
                            
                            return (
                                <Card key={uniteKey} className="overflow-hidden">
                                    <CardHeader className="pb-3 bg-muted/30">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <Building2 className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <span className="font-bold">{uniteLabel}</span>
                                                    {uniteNumero && <span className="ml-1 text-primary font-mono">{uniteNumero}</span>}
                                                </div>
                                            </CardTitle>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="secondary" className="text-xs">
                                                    {details.length} {details.length > 1 ? 'travaux' : 'travail'}
                                                </Badge>
                                                <Badge variant={uniteProgress === 100 ? 'default' : 'outline'} className={uniteProgress === 100 ? 'bg-green-600' : ''}>
                                                    {completedCount}/{details.length} terminés
                                                </Badge>
                                                <div className="text-right">
                                                    <span className="text-lg font-bold text-primary">
                                                        {formatPrice(uniteTotal)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Progress 
                                            value={uniteProgress} 
                                            className={`h-2 mt-3 ${uniteProgress === 100 ? '[&>div]:bg-green-600' : ''}`} 
                                        />
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y">
                                            {details.map((detail, index) => {
                                                const StatusIcon = statutBadgeConfig[detail.statut]?.icon || Clock;
                                                const statusColor = statutBadgeConfig[detail.statut]?.color || 'bg-gray-100 text-gray-800';
                                                
                                                return (
                                                    <div 
                                                        key={detail.id}
                                                        className={`p-4 hover:bg-muted/30 transition-colors ${
                                                            detail.statut === 'termine' || detail.statut === 'valide' 
                                                                ? 'bg-green-50/50 dark:bg-green-950/20' 
                                                                : detail.statut === 'en_cours' 
                                                                    ? 'bg-blue-50/50 dark:bg-blue-950/20' 
                                                                    : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            {/* Numéro */}
                                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                                                                {index + 1}
                                                            </div>
                                                            
                                                            {/* Contenu principal */}
                                                            <div className="flex-1 min-w-0 space-y-2">
                                                                {/* Ligne 1: Description + Phase + Statut */}
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <p className="font-semibold text-base">{detail.description}</p>
                                                                            {detail.phase && (
                                                                                <Badge variant="outline" className="text-xs font-normal">
                                                                                    {phases[detail.phase] || detail.phase}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <Badge className={`${statusColor} flex-shrink-0`}>
                                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                                        {detail.statut_label}
                                                                    </Badge>
                                                                </div>
                                                                
                                                                {/* Ligne 2: Infos (emplacement, équipe, technicien, dates) */}
                                                                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <MapPin className="h-3.5 w-3.5" />
                                                                        {detail.emplacement}
                                                                    </span>
                                                                    {detail.equipe && (
                                                                        <span className="inline-flex items-center gap-1">
                                                                            <Users className="h-3.5 w-3.5" />
                                                                            {detail.equipe.name}
                                                                        </span>
                                                                    )}
                                                                    {detail.technicien && (
                                                                        <span className="inline-flex items-center gap-1">
                                                                            <UserCheck className="h-3.5 w-3.5" />
                                                                            {detail.technicien.prenom} {detail.technicien.nom}
                                                                        </span>
                                                                    )}
                                                                    {(detail.date_debut || detail.date_fin) && (
                                                                        <span className="inline-flex items-center gap-1">
                                                                            <Calendar className="h-3.5 w-3.5" />
                                                                            {detail.date_debut && formatDate(detail.date_debut)}
                                                                            {detail.date_debut && detail.date_fin && ' → '}
                                                                            {detail.date_fin && formatDate(detail.date_fin)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                
                                                                {/* Notes si présentes */}
                                                                {detail.notes && (
                                                                    <p className="text-sm text-muted-foreground italic bg-muted/50 px-2 py-1 rounded">
                                                                        💬 {detail.notes}
                                                                    </p>
                                                                )}
                                                                
                                                                {/* Ligne 3: Prix */}
                                                                <div className="flex items-center justify-between pt-1">
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <span className="bg-muted px-2 py-0.5 rounded font-mono">
                                                                            {detail.quantite} {detail.unite_label}
                                                                        </span>
                                                                        <span className="text-muted-foreground">×</span>
                                                                        <span className="font-medium">{formatPrice(detail.prix_unitaire)}</span>
                                                                    </div>
                                                                    <span className="text-lg font-bold text-primary">
                                                                        {formatPrice(detail.prix_total)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Actions */}
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => openEditDialog(detail)}>
                                                                        <Pencil className="mr-2 h-4 w-4" />
                                                                        Modifier
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    {detail.statut !== 'valide' && (
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleStatusChange(detail, 'valide')}
                                                                            className="text-purple-600"
                                                                        >
                                                                            <BadgeCheck className="mr-2 h-4 w-4" />
                                                                            Valider
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {detail.statut !== 'termine' && (
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleStatusChange(detail, 'termine')}
                                                                            className="text-green-600"
                                                                        >
                                                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                            Marquer terminé
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {detail.statut !== 'en_cours' && (
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleStatusChange(detail, 'en_cours')}
                                                                            className="text-blue-600"
                                                                        >
                                                                            <Clock className="mr-2 h-4 w-4" />
                                                                            En cours
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {detail.statut !== 'en_attente' && (
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleStatusChange(detail, 'en_attente')}
                                                                        >
                                                                            <Pause className="mr-2 h-4 w-4" />
                                                                            En attente
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem 
                                                                        onClick={() => openDeleteDialog(detail)}
                                                                        className="text-destructive"
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Supprimer
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {/* Sous-total de l'unité */}
                                        <div className="p-3 bg-muted/50 border-t flex items-center justify-between">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Sous-total {uniteLabel} {uniteNumero}
                                            </span>
                                            <span className="font-bold text-lg">
                                                {formatPrice(uniteTotal)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {/* Summary */}
                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total général</p>
                                        <p className="text-3xl font-bold">{formatPrice(service.details_total)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">
                                            {service.details.filter(d => d.statut === 'termine').length} / {service.details.length} terminés
                                        </p>
                                        <Progress value={service.progress_percentage} className="w-32 h-3 mt-2" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Modifier le détail</DialogTitle>
                        <DialogDescription>
                            Modifiez les informations du travail
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4">
                        {/* Unité */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type d'unité *</Label>
                                <Select
                                    value={editForm.data.unite_type}
                                    onValueChange={(value) => editForm.setData('unite_type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(uniteTypes).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Numéro d'unité</Label>
                                <Input
                                    value={editForm.data.unite_numero}
                                    onChange={(e) => editForm.setData('unite_numero', e.target.value)}
                                    placeholder="Ex: A01, B02..."
                                />
                            </div>
                        </div>

                        {/* Emplacement, Phase et Statut */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-emplacement">Emplacement *</Label>
                                <Select
                                    value={editForm.data.emplacement}
                                    onValueChange={(value) => editForm.setData('emplacement', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {emplacements.map((emp) => (
                                            <SelectItem key={emp} value={emp}>
                                                {emp}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Phase *</Label>
                                <Select
                                    value={editForm.data.phase}
                                    onValueChange={(value) => editForm.setData('phase', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(phases).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-statut">Statut *</Label>
                                <Select
                                    value={editForm.data.statut}
                                    onValueChange={(value) => editForm.setData('statut', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(statuts).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description *</Label>
                            <Textarea
                                id="edit-description"
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                                rows={2}
                            />
                        </div>

                        {/* Équipe et Technicien */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Équipe</Label>
                                <Select
                                    value={editForm.data.equipe_id || 'none'}
                                    onValueChange={(value) => editForm.setData('equipe_id', value === 'none' ? '' : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Non assignée</SelectItem>
                                        {equipes.map((eq) => (
                                            <SelectItem key={eq.id} value={eq.id.toString()}>
                                                {eq.name}{eq.specialite ? ` (${eq.specialite})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Technicien</Label>
                                <Select
                                    value={editForm.data.technicien_id || 'none'}
                                    onValueChange={(value) => editForm.setData('technicien_id', value === 'none' ? '' : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Non assigné</SelectItem>
                                        {techniciens.map((tech) => (
                                            <SelectItem key={tech.id} value={tech.id.toString()}>
                                                {tech.prenom} {tech.nom}{tech.specialite ? ` (${tech.specialite})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date début</Label>
                                <Input
                                    type="date"
                                    value={editForm.data.date_debut}
                                    onChange={(e) => editForm.setData('date_debut', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Date fin prévue</Label>
                                <Input
                                    type="date"
                                    value={editForm.data.date_fin}
                                    onChange={(e) => editForm.setData('date_fin', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Quantité et Prix */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-quantite">Quantité *</Label>
                                <Input
                                    id="edit-quantite"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editForm.data.quantite}
                                    onChange={(e) => editForm.setData('quantite', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-unite">Unité mesure *</Label>
                                <Select
                                    value={editForm.data.unite}
                                    onValueChange={(value) => editForm.setData('unite', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(unites).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-prix_unitaire">Prix unit. (DH) *</Label>
                                <Input
                                    id="edit-prix_unitaire"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editForm.data.prix_unitaire}
                                    onChange={(e) => editForm.setData('prix_unitaire', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Total:</p>
                            <p className="text-lg font-semibold">
                                {formatPrice(editForm.data.quantite * editForm.data.prix_unitaire)}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-notes">Notes</Label>
                            <Textarea
                                id="edit-notes"
                                value={editForm.data.notes}
                                onChange={(e) => editForm.setData('notes', e.target.value)}
                                rows={2}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                                Annuler
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                Enregistrer
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce détail ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Le détail sera définitivement supprimé.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
