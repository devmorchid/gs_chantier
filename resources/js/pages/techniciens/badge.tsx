import { useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/types';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
    technicien: {
        id: number;
        nom: string;
        prenom: string;
        specialite_label: string;
        qr_code: string;
        photo_reference: string | null;
    };
}

export default function BadgePage({ technicien }: Props) {
    const qrRef = useRef<HTMLDivElement>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Techniciens', href: '/techniciens' },
        { title: `${technicien.prenom} ${technicien.nom}`, href: `/techniciens/${technicien.id}` },
        { title: 'Badge', href: '#' },
    ];

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        if (qrRef.current) {
            const canvas = qrRef.current.querySelector('canvas') as HTMLCanvasElement;
            if (canvas) {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = `badge-${technicien.id}.png`;
                link.click();
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Badge - ${technicien.prenom} ${technicien.nom}`} />

            <div className="space-y-6 max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Badge QR</h1>
                        <p className="text-gray-500 mt-1">
                            {technicien.prenom} {technicien.nom}
                        </p>
                    </div>
                    <Link href={`/techniciens/${technicien.id}`}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour
                        </Button>
                    </Link>
                </div>

                {/* Badge Card */}
                <Card className="print:shadow-none">
                    <CardHeader className="text-center">
                        <CardTitle>{technicien.prenom} {technicien.nom}</CardTitle>
                        <Badge variant="secondary" className="mt-2 w-fit mx-auto">
                            {technicien.specialite_label}
                        </Badge>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* QR Code - Centered */}
                        <div className="flex justify-center">
                            <div
                                ref={qrRef}
                                className="p-6 bg-white rounded-lg border-2 border-gray-300 print:border-none print:p-0"
                            >
                                <QRCodeSVG
                                    value={technicien.qr_code}
                                    size={256}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                        </div>

                        {/* QR Code Text */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Code QR</p>
                            <p className="text-2xl font-mono font-bold">{technicien.qr_code}</p>
                        </div>

                        {/* Photo if available */}
                        {technicien.photo_reference && (
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-2">Photo</p>
                                <img
                                    src={`/storage/${technicien.photo_reference}`}
                                    alt={`${technicien.prenom} ${technicien.nom}`}
                                    className="w-40 h-40 rounded-lg object-cover border-2 border-gray-300 mx-auto"
                                />
                            </div>
                        )}

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-4 text-center border-t pt-4">
                            <div>
                                <p className="text-sm text-gray-600">Nom</p>
                                <p className="font-semibold">{technicien.nom}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Prénom</p>
                                <p className="font-semibold">{technicien.prenom}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-gray-600">Spécialité</p>
                                <p className="font-semibold">{technicien.specialite_label}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3 print:hidden">
                    <Button onClick={handleDownload} variant="outline" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger
                    </Button>
                    <Button onClick={handlePrint} className="flex-1">
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimer
                    </Button>
                </div>

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
                        .print\\:border-none {
                            border: none !important;
                        }
                        .print\\:p-0 {
                            padding: 0 !important;
                        }
                    }
                `}</style>
            </div>
        </AppLayout>
    );
}
