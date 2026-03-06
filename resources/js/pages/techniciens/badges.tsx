import { useState, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from '@/types';
import { Printer, Home, Search } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface Technicien {
    id: number;
    nom: string;
    prenom: string;
    specialite: string;
    specialite_label: string;
    qr_code: string;
    photo_reference: string | null;
}

interface Props {
    techniciens: Technicien[];
}

export default function BadgesGallery({ techniciens }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialite, setSelectedSpecialite] = useState<string | null>(null);
    const galleryRef = useRef<HTMLDivElement>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Techniciens', href: '/techniciens' },
        { title: 'Tous les badges', href: '#' },
    ];

    // Filter techniciens
    const filtered = techniciens.filter((tech) => {
        const matchSearch = `${tech.prenom} ${tech.nom}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchSpecialite = !selectedSpecialite || tech.specialite === selectedSpecialite;
        return matchSearch && matchSpecialite;
    });

    // Get unique specialites
    const specialites = Array.from(new Set(techniciens.map((t) => t.specialite)));

    const handlePrintAll = () => {
        window.print();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tous les Badges" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Tous les Badges QR</h1>
                        <p className="text-gray-500 mt-1">
                            {filtered.length} badge{filtered.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/dashboard">
                            <Button variant="outline" size="sm">
                                <Home className="mr-2 h-4 w-4" />
                                Dashboard
                            </Button>
                        </Link>
                        <Button onClick={handlePrintAll} size="sm" className="print:hidden">
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimer tout
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="print:shadow-none">
                    <CardContent className="pt-6 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Chercher par nom ou prénom..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {specialites.length > 1 && (
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={!selectedSpecialite ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedSpecialite(null)}
                                >
                                    Tous
                                </Button>
                                {specialites.map((spec) => {
                                    const label = techniciens.find((t) => t.specialite === spec)?.specialite_label || spec;
                                    return (
                                        <Button
                                            key={spec}
                                            variant={selectedSpecialite === spec ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setSelectedSpecialite(spec)}
                                        >
                                            {label}
                                        </Button>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Badges Grid */}
                <div ref={galleryRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((technicien) => (
                        <Card key={technicien.id} className="print:break-inside-avoid print:page-break-inside-avoid">
                            <CardHeader className="text-center pb-3">
                                <CardTitle className="text-lg">
                                    {technicien.prenom} {technicien.nom}
                                </CardTitle>
                                <Badge variant="secondary" className="mt-2 w-fit mx-auto text-xs">
                                    {technicien.specialite_label}
                                </Badge>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* QR Code */}
                                <div className="flex justify-center">
                                    <div className="p-4 bg-white rounded-lg border border-gray-300">
                                        <QRCodeSVG
                                            value={technicien.qr_code}
                                            size={128}
                                            level="H"
                                            includeMargin={true}
                                        />
                                    </div>
                                </div>

                                {/* QR Code Text */}
                                <div className="text-center">
                                    <p className="text-xs text-gray-600">Code</p>
                                    <p className="text-sm font-mono font-bold">{technicien.qr_code}</p>
                                </div>

                                {/* Photo if available */}
                                {technicien.photo_reference && (
                                    <div className="flex justify-center">
                                        <img
                                            src={`/storage/${technicien.photo_reference}`}
                                            alt={`${technicien.prenom} ${technicien.nom}`}
                                            className="w-20 h-20 rounded-lg object-cover border border-gray-300"
                                        />
                                    </div>
                                )}

                                {/* View Badge Button */}
                                <Link href={`/techniciens/${technicien.id}/badge`}>
                                    <Button variant="outline" size="sm" className="w-full print:hidden">
                                        Voir badge
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-500">Aucun badge ne correspond à votre recherche</p>
                        </CardContent>
                    </Card>
                )}

                {/* Print Styles */}
                <style>{`
                    @media print {
                        body {
                            background: white;
                        }
                        .print\\:hidden {
                            display: none !important;
                        }
                        .print\\:shadow-none {
                            box-shadow: none !important;
                        }
                        .print\\:break-inside-avoid {
                            break-inside: avoid !important;
                        }
                        .print\\:page-break-inside-avoid {
                            page-break-inside: avoid !important;
                        }
                        .grid {
                            grid-template-columns: repeat(2, 1fr) !important;
                        }
                    }
                `}</style>
            </div>
        </AppLayout>
    );
}
