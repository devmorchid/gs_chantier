import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Navigation, Share2, Copy, Check } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LocationMapViewProps {
    latitude: number;
    longitude: number;
    address?: string;
    title?: string;
    className?: string;
}

export function LocationMapView({
    latitude,
    longitude,
    address,
    title = 'Localisation',
    className = '',
}: LocationMapViewProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [copied, setCopied] = useState(false);

    // Charger Leaflet dynamiquement
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Charger CSS Leaflet
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        // Charger JS Leaflet
        if (!(window as any).L) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => setIsLoaded(true);
            document.head.appendChild(script);
        } else {
            setIsLoaded(true);
        }
    }, []);

    // Initialiser la carte
    useEffect(() => {
        if (!mapRef.current || !isLoaded || mapInstanceRef.current) return;

        const L = (window as any).L;
        if (!L) return;

        const map = L.map(mapRef.current, {
            scrollWheelZoom: false,
            dragging: true,
            zoomControl: true,
        }).setView([latitude, longitude], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);

        // Marqueur personnalisé
        const marker = L.marker([latitude, longitude]).addTo(map);
        
        if (address) {
            marker.bindPopup(`<strong>${title}</strong><br/>${address}`).openPopup();
        }

        mapInstanceRef.current = map;

        // Fix pour le rendu
        setTimeout(() => {
            map.invalidateSize();
        }, 100);

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [isLoaded, latitude, longitude, address, title]);

    // Ouvrir dans Google Maps
    const openInGoogleMaps = () => {
        window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
    };

    // Ouvrir dans Google Maps avec itinéraire
    const openDirections = () => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
    };

    // Ouvrir dans Waze
    const openInWaze = () => {
        window.open(`https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`, '_blank');
    };

    // Copier les coordonnées
    const copyCoordinates = async () => {
        const text = `${latitude}, ${longitude}`;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Erreur de copie:', err);
        }
    };

    // Copier le lien Google Maps
    const copyGoogleMapsLink = async () => {
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Erreur de copie:', err);
        }
    };

    // Partager (si disponible)
    const shareLocation = async () => {
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const shareData = {
            title: title,
            text: address || `Localisation: ${latitude}, ${longitude}`,
            url: url,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Erreur de partage:', err);
            }
        } else {
            copyGoogleMapsLink();
        }
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Carte */}
            <div className="rounded-lg border overflow-hidden">
                <div 
                    ref={mapRef} 
                    className="h-[250px] w-full"
                    style={{ minHeight: '250px' }}
                >
                    {!isLoaded && (
                        <div className="h-full w-full flex items-center justify-center bg-muted">
                            <span className="text-muted-foreground">Chargement de la carte...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
                {/* Itinéraire */}
                <Button
                    variant="default"
                    size="sm"
                    onClick={openDirections}
                    className="flex-1 sm:flex-none"
                >
                    <Navigation className="h-4 w-4 mr-2" />
                    Itinéraire
                </Button>

                {/* Ouvrir dans... */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Ouvrir dans...
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={openInGoogleMaps}>
                            <img src="https://www.google.com/favicon.ico" className="h-4 w-4 mr-2" alt="" />
                            Google Maps
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={openInWaze}>
                            <img src="https://www.waze.com/favicon.ico" className="h-4 w-4 mr-2" alt="" />
                            Waze
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Partager */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                            {copied ? (
                                <Check className="h-4 w-4 mr-2 text-green-500" />
                            ) : (
                                <Share2 className="h-4 w-4 mr-2" />
                            )}
                            Partager
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={shareLocation}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Partager la position
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={copyGoogleMapsLink}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copier le lien
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={copyCoordinates}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copier les coordonnées
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Coordonnées */}
            <p className="text-xs text-muted-foreground">
                📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
        </div>
    );
}
