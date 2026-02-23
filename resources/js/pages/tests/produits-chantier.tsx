import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BreadcrumbItem } from '@/types';

interface ChantierInfo {
    id: number;
    nom: string;
    reference: string;
}

interface ProduitChantier {
    id: number;
    name: string;
    code_barre?: string | null;
    category?: string | null;
    fournisseur?: string | null;
    quantite: number;
}

interface Props {
    chantier: ChantierInfo;
    produits: ProduitChantier[];
}

export default function ProduitsChantierTest({ chantier, produits }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Test Produits Chantier', href: '/test/produits-chantier' },
    ];

    const totalQuantite = produits.reduce((total, produit) => total + (produit.quantite ?? 0), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Test - Produits Chantier" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
                    <h1 className="text-2xl font-bold tracking-tight">Produits du chantier</h1>
                    <p className="text-muted-foreground">
                        Chantier {chantier.reference} - {chantier.nom}
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total produits</CardTitle>
                            <CardDescription>References uniques sur ce chantier</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">{produits.length}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Quantite totale</CardTitle>
                            <CardDescription>Somme des quantites en stock</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">{totalQuantite}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Liste des produits</CardTitle>
                        <CardDescription>Produits disponibles pour ce chantier</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {produits.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Aucun produit pour ce chantier.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produit</TableHead>
                                        <TableHead>Code barre</TableHead>
                                        <TableHead>Categorie</TableHead>
                                        <TableHead>Fournisseur</TableHead>
                                        <TableHead className="text-right">Quantite</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {produits.map((produit) => (
                                        <TableRow key={produit.id}>
                                            <TableCell className="font-medium">{produit.name}</TableCell>
                                            <TableCell>{produit.code_barre ?? '-'}</TableCell>
                                            <TableCell>{produit.category ?? '-'}</TableCell>
                                            <TableCell>{produit.fournisseur ?? '-'}</TableCell>
                                            <TableCell className="text-right">{produit.quantite}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
