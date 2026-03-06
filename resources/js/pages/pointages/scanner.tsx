import { useEffect, useRef, useState, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';
import { AlertCircle, CheckCircle2, Camera, RotateCw, Home, Building2, MapPin, Navigation } from 'lucide-react';
import QrScanner from 'qr-scanner';

interface Chantier {
    id: number;
    nom: string;
    reference: string;
}

interface GpsPosition {
    latitude: number;
    longitude: number;
    accuracy: number;
}

interface ScanResult {
    id: number;
    nom: string;
    prenom: string;
    specialite_label: string;
    qr_code: string;
    photo_reference: string | null;
    timestamp: string;
}

interface Props {
    chantiers: Chantier[];
}

export default function Scanner({ chantiers }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerRef = useRef<QrScanner | null>(null);
    const lastScanRef = useRef<{ code: string; time: number } | null>(null);
    const processingRef = useRef(false);
    const [isScanning, setIsScanning] = useState(false);
    const [lastResult, setLastResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedChantierId, setSelectedChantierId] = useState<number | null>(null);
    const [scannerReady, setScannerReady] = useState(false);
    
    // GPS State
    const [gpsPosition, setGpsPosition] = useState<GpsPosition | null>(null);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [gpsError, setGpsError] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pointages', href: '/pointages/dashboard' },
        { title: 'Scanner QR', href: '/pointages/scanner' },
    ];

    const selectedChantier = chantiers.find(c => c.id === selectedChantierId);

    // Get current GPS position
    const getGpsPosition = useCallback((): Promise<GpsPosition> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Géolocalisation non supportée par ce navigateur'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos: GpsPosition = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                    };
                    setGpsPosition(pos);
                    setGpsError(null);
                    resolve(pos);
                },
                (error) => {
                    let message = 'Erreur GPS';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            message = 'Permission GPS refusée. Activez la localisation.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = 'Position GPS non disponible.';
                            break;
                        case error.TIMEOUT:
                            message = 'Délai GPS dépassé. Réessayez.';
                            break;
                    }
                    setGpsError(message);
                    reject(new Error(message));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 60000, // Cache position for 60 seconds
                }
            );
        });
    }, []);

    // Initialize GPS when chantier is selected
    useEffect(() => {
        if (selectedChantierId) {
            setGpsLoading(true);
            getGpsPosition()
                .catch(err => console.warn('GPS init error:', err))
                .finally(() => setGpsLoading(false));
        }
    }, [selectedChantierId, getGpsPosition]);

    // Play success sound (two ascending tones)
    const playSuccessSound = () => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // First tone (higher)
            const osc1 = audioContext.createOscillator();
            const gain1 = audioContext.createGain();
            osc1.connect(gain1);
            gain1.connect(audioContext.destination);
            osc1.frequency.value = 880; // A5
            osc1.type = 'sine';
            gain1.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            osc1.start(audioContext.currentTime);
            osc1.stop(audioContext.currentTime + 0.15);

            // Second tone (even higher)
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.frequency.value = 1320; // E6
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.3, audioContext.currentTime + 0.15);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
            osc2.start(audioContext.currentTime + 0.15);
            osc2.stop(audioContext.currentTime + 0.35);
        } catch (err) {
            console.error('Sound error:', err);
        }
    };

    // Play error sound (two descending low tones)
    const playErrorSound = () => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // First tone
            const osc1 = audioContext.createOscillator();
            const gain1 = audioContext.createGain();
            osc1.connect(gain1);
            gain1.connect(audioContext.destination);
            osc1.frequency.value = 400; // Low G
            osc1.type = 'square';
            gain1.gain.setValueAtTime(0.25, audioContext.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            osc1.start(audioContext.currentTime);
            osc1.stop(audioContext.currentTime + 0.2);

            // Second tone (lower)
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.frequency.value = 250; // Lower
            osc2.type = 'square';
            gain2.gain.setValueAtTime(0.25, audioContext.currentTime + 0.2);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.45);
            osc2.start(audioContext.currentTime + 0.2);
            osc2.stop(audioContext.currentTime + 0.45);
        } catch (err) {
            console.error('Sound error:', err);
        }
    };

    // Handle QR scan result
    const handleScanResult = async (result: QrScanner.ScanResult) => {
        const qrCode = result.data.trim();
        if (!qrCode) return;

        // Prevent duplicate scans of same code within 3 seconds
        const now = Date.now();
        if (lastScanRef.current && 
            lastScanRef.current.code === qrCode && 
            now - lastScanRef.current.time < 3000) {
            return;
        }

        // Prevent concurrent processing
        if (processingRef.current) return;
        processingRef.current = true;

        lastScanRef.current = { code: qrCode, time: now };
        setLoading(true);
        setError(null);

        try {
            if (scannerRef.current) {
                await scannerRef.current.stop();
            }

            // Use cached GPS position if available (less than 60s old), otherwise get fresh
            let currentPosition: GpsPosition | null = gpsPosition;
            if (!currentPosition) {
                try {
                    currentPosition = await getGpsPosition();
                } catch (gpsErr) {
                    // Will be handled by server if GPS is required
                    console.warn('GPS unavailable:', gpsErr);
                }
            }

            const response = await fetch('/pointages/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    qr_code: qrCode,
                    chantier_id: selectedChantierId,
                    latitude: currentPosition?.latitude,
                    longitude: currentPosition?.longitude,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle GPS-specific errors
                if (data.require_gps) {
                    throw new Error('📍 ' + data.message);
                }
                if (data.hors_zone) {
                    throw new Error(`📍 ${data.message}`);
                }
                // Handle already completed pointage
                if (data.status === 'already_completed') {
                    throw new Error('✅ ' + data.message);
                }
                throw new Error(data.message || `Erreur ${response.status}`);
            }

            playSuccessSound();

            setLastResult({
                ...data.technicien,
                timestamp: new Date().toLocaleTimeString('fr-FR'),
            });

            // Restart scanner after success
            setTimeout(async () => {
                if (scannerRef.current) {
                    try {
                        await scannerRef.current.start();
                        setScannerReady(true);
                    } catch (err) {
                        console.error('Restart error:', err);
                        setScannerReady(false);
                    }
                }
            }, 800);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
            playErrorSound();

            // Restart scanner after error
            setTimeout(async () => {
                if (scannerRef.current) {
                    try {
                        await scannerRef.current.start();
                        setScannerReady(true);
                    } catch (e) {
                        console.error('Restart error:', e);
                        setScannerReady(false);
                    }
                }
            }, 500);
        } finally {
            setLoading(false);
            processingRef.current = false;
        }
    };

    // Initialize scanner when chantier is selected
    useEffect(() => {
        if (!videoRef.current || !selectedChantierId) return;

        const initScanner = async () => {
            try {
                setIsScanning(true);
                setError(null);
                setScannerReady(false);

                // Check if QrScanner is available and camera is supported
                const hasCamera = await QrScanner.hasCamera();
                if (!hasCamera) {
                    throw new Error('Aucune caméra détectée sur cet appareil');
                }

                // Create scanner with explicit options
                const scanner = new QrScanner(videoRef.current!, handleScanResult, {
                    onDecodeError: () => {
                        // Silently ignore decode errors
                    },
                    preferredCamera: 'environment',
                    highlightCodeOutline: true,
                    maxScansPerSecond: 15,
                    returnDetailedScanResult: true,
                });

                scannerRef.current = scanner;

                // Start scanning (this will prompt for camera permission if needed)
                try {
                    await scanner.start();
                    setScannerReady(true);
                } catch (cameraErr) {
                    const msg = cameraErr instanceof Error ? cameraErr.message : String(cameraErr);
                    console.error('Camera start error:', msg);
                    
                    if (msg.includes('NotAllowedError') || msg.includes('denied') || msg.includes('Permission denied')) {
                        throw new Error('Permission caméra refusée. Veuillez autoriser l\'accès à la caméra dans les paramètres du navigateur.');
                    } else if (msg.includes('NotFoundError') || msg.includes('not found')) {
                        throw new Error('Caméra non trouvée sur cet appareil.');
                    } else if (msg.includes('NotReadableError') || msg.includes('Could not start')) {
                        throw new Error('La caméra est utilisée par une autre application. Fermez les autres apps utilisant la caméra.');
                    } else if (msg.includes('OverconstrainedError')) {
                        throw new Error('La caméra ne supporte pas les paramètres demandés.');
                    } else if (msg.includes('Insecure')) {
                        throw new Error('HTTPS requis pour accéder à la caméra.');
                    }
                    throw new Error(`Erreur caméra: ${msg}`);
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erreur caméra inconnue';
                setError(errorMessage);
                setIsScanning(false);
                console.error('Camera init error:', err);
            }
        };

        initScanner();

        // Cleanup on unmount or chantier change
        return () => {
            if (scannerRef.current) {
                scannerRef.current.destroy();
                scannerRef.current = null;
            }
            setScannerReady(false);
        };
    }, [selectedChantierId]);

    // Retry camera initialization
    const retryCamera = async () => {
        setError(null);
        setIsScanning(false);
        setScannerReady(false);
        processingRef.current = false;
        
        // Destroy existing scanner if any
        if (scannerRef.current) {
            try {
                scannerRef.current.destroy();
            } catch (e) {
                console.error('Destroy error:', e);
            }
            scannerRef.current = null;
        }

        // Wait a bit then reinitialize
        setTimeout(async () => {
            if (!videoRef.current || !selectedChantierId) return;
            
            try {
                setIsScanning(true);
                
                const hasCamera = await QrScanner.hasCamera();
                if (!hasCamera) {
                    throw new Error('Aucune caméra détectée');
                }

                const scanner = new QrScanner(videoRef.current!, handleScanResult, {
                    onDecodeError: () => {},
                    preferredCamera: 'environment',
                    highlightCodeOutline: true,
                    maxScansPerSecond: 15,
                    returnDetailedScanResult: true,
                });

                scannerRef.current = scanner;
                await scanner.start();
                setScannerReady(true);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erreur caméra';
                setError(errorMessage);
                setIsScanning(false);
            }
        }, 300);
    };

    // Reset result
    const resetResult = () => {
        setLastResult(null);
        setError(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Scanner QR" />

            <div className="space-y-6 max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Pointage QR</h1>
                        <p className="text-gray-500 mt-1">Scannez le badge QR d'un technicien</p>
                    </div>
                    <Link href="/pointages/dashboard">
                        <Button variant="outline" size="sm">
                            <Home className="mr-2 h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                </div>

                {/* Chantier Selection Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Building2 className="mr-2 h-5 w-5" />
                            Sélectionner le Chantier
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select
                            value={selectedChantierId?.toString() ?? ''}
                            onValueChange={(value) => setSelectedChantierId(parseInt(value))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choisissez un chantier..." />
                            </SelectTrigger>
                            <SelectContent>
                                {chantiers.map((chantier) => (
                                    <SelectItem key={chantier.id} value={chantier.id.toString()}>
                                        {chantier.nom} ({chantier.reference})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedChantier && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    <strong>Chantier sélectionné:</strong> {selectedChantier.nom}
                                </p>
                            </div>
                        )}
                        
                        {/* GPS Status Indicator */}
                        {selectedChantierId && (
                            <div className="mt-3 p-3 rounded-lg border">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        <span className="text-sm font-medium">Position GPS</span>
                                    </div>
                                    {gpsLoading ? (
                                        <Badge variant="secondary" className="animate-pulse">
                                            <Navigation className="h-3 w-3 mr-1 animate-spin" />
                                            Localisation...
                                        </Badge>
                                    ) : gpsError ? (
                                        <Badge variant="destructive">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            {gpsError}
                                        </Badge>
                                    ) : gpsPosition ? (
                                        <Badge variant="default" className="bg-green-600">
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Localisé (±{Math.round(gpsPosition.accuracy)}m)
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">
                                            En attente
                                        </Badge>
                                    )}
                                </div>
                                {gpsError && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="mt-2 w-full"
                                        onClick={() => {
                                            setGpsLoading(true);
                                            setGpsError(null);
                                            getGpsPosition()
                                                .catch(err => console.error(err))
                                                .finally(() => setGpsLoading(false));
                                        }}
                                    >
                                        <RotateCw className="h-3 w-3 mr-1" />
                                        Réessayer GPS
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Camera Card - Only show when chantier is selected */}
                {selectedChantierId && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Camera className="mr-2 h-5 w-5" />
                            Caméra
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error ? (
                            <div className="space-y-4">
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                                <Button onClick={retryCamera} className="w-full">
                                    <RotateCw className="mr-2 h-4 w-4" />
                                    Réessayer la caméra
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="relative">
                                    <video
                                        ref={videoRef}
                                        className="w-full rounded-lg bg-black aspect-square object-cover border-2 border-gray-200"
                                        playsInline
                                        muted
                                        autoPlay
                                    />
                                    {!scannerReady && !error && (
                                        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                            <p className="text-gray-500">Initialisation de la caméra...</p>
                                        </div>
                                    )}
                                </div>
                                {isScanning && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                        <strong>Chantier:</strong> {selectedChantier?.nom} <br />
                                        En cours de numérisation... Veuillez pointer le badge vers la caméra
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
                )}

                {/* Result Card */}
                {lastResult && (
                    <Card className="border-green-200 bg-green-50">
                        <CardHeader>
                            <CardTitle className="flex items-center text-green-700">
                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                Pointage Enregistré
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Technicien</p>
                                    <p className="text-xl font-bold">
                                        {lastResult.prenom} {lastResult.nom}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Spécialité</p>
                                        <Badge variant="secondary">{lastResult.specialite_label}</Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Heure</p>
                                        <p className="font-semibold">{lastResult.timestamp}</p>
                                    </div>
                                </div>
                            </div>
                            {lastResult.photo_reference && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Photo</p>
                                    <img
                                        src={`/storage/${lastResult.photo_reference}`}
                                        alt={`${lastResult.prenom} ${lastResult.nom}`}
                                        className="w-32 h-32 rounded-lg object-cover border border-gray-300"
                                    />
                                </div>
                            )}
                            <Button
                                onClick={resetResult}
                                className="w-full"
                                variant="outline"
                            >
                                <RotateCw className="mr-2 h-4 w-4" />
                                Scanner un autre
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
