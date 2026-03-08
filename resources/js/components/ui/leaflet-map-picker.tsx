import { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, X, Navigation, Loader2 } from 'lucide-react';

interface LeafletMapPickerProps {
    value: string;
    latitude?: number | null;
    longitude?: number | null;
    onChange: (location: {
        address: string;
        latitude: number | null;
        longitude: number | null;
    }) => void;
    placeholder?: string;
    defaultCenter?: { lat: number; lng: number };
    defaultZoom?: number;
}

export function LeafletMapPicker({
    value,
    latitude,
    longitude,
    onChange,
    placeholder = 'Rechercher une adresse...',
    defaultCenter = { lat: 33.5731, lng: -7.5898 }, // Casablanca par défaut
    defaultZoom = 12,
}: LeafletMapPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [searchValue, setSearchValue] = useState(value);
    const [showMap, setShowMap] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    const initMap = useCallback(() => {
        if (!mapRef.current || !isLoaded || mapInstanceRef.current) return;

        const L = (window as any).L;
        if (!L) return;

        const center = latitude && longitude 
            ? [latitude, longitude] 
            : [defaultCenter.lat, defaultCenter.lng];

        const map = L.map(mapRef.current).setView(center, latitude && longitude ? 15 : defaultZoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);

        // Créer le marqueur
        const marker = L.marker(center, { draggable: true });
        
        if (latitude && longitude) {
            marker.addTo(map);
        }

        // Événement de clic sur la carte
        map.on('click', async (e: any) => {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            if (!map.hasLayer(marker)) {
                marker.addTo(map);
            }
            
            // Géocodage inverse
            const address = await reverseGeocode(lat, lng);
            setSearchValue(address);
            onChange({ address, latitude: lat, longitude: lng });
        });

        // Événement de drag du marqueur
        marker.on('dragend', async () => {
            const { lat, lng } = marker.getLatLng();
            const address = await reverseGeocode(lat, lng);
            setSearchValue(address);
            onChange({ address, latitude: lat, longitude: lng });
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        // Fix pour le rendu de la carte
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }, [isLoaded, latitude, longitude, defaultCenter, defaultZoom, onChange]);

    // Géocodage inverse (coordonnées -> adresse)
    const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`
            );
            const data = await response.json();
            return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        } catch {
            return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
    };

    // Recherche d'adresse (adresse -> coordonnées)
    const searchAddress = async (query: string) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ma&limit=5&accept-language=fr`
            );
            const data = await response.json();
            setSuggestions(data);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Erreur de recherche:', error);
            setSuggestions([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Gérer la recherche avec debounce
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchValue(query);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            searchAddress(query);
        }, 500);
    };

    // Sélectionner une suggestion
    const selectSuggestion = (suggestion: any) => {
        const lat = parseFloat(suggestion.lat);
        const lng = parseFloat(suggestion.lon);
        const address = suggestion.display_name;

        setSearchValue(address);
        setSuggestions([]);
        setShowSuggestions(false);
        onChange({ address, latitude: lat, longitude: lng });

        // Mettre à jour la carte
        if (mapInstanceRef.current && markerRef.current) {
            const L = (window as any).L;
            mapInstanceRef.current.setView([lat, lng], 16);
            markerRef.current.setLatLng([lat, lng]);
            if (!mapInstanceRef.current.hasLayer(markerRef.current)) {
                markerRef.current.addTo(mapInstanceRef.current);
            }
        }
    };

    // Initialiser la carte quand elle est affichée
    useEffect(() => {
        if (showMap && isLoaded) {
            // Petit délai pour que le DOM soit prêt
            setTimeout(initMap, 50);
        }
    }, [showMap, isLoaded, initMap]);

    // Mettre à jour la valeur de recherche quand la prop change
    useEffect(() => {
        setSearchValue(value);
    }, [value]);

    // Obtenir la position actuelle
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // Mettre à jour la carte
                    if (mapInstanceRef.current && markerRef.current) {
                        mapInstanceRef.current.setView([lat, lng], 16);
                        markerRef.current.setLatLng([lat, lng]);
                        if (!mapInstanceRef.current.hasLayer(markerRef.current)) {
                            markerRef.current.addTo(mapInstanceRef.current);
                        }
                    }
                    
                    // Géocodage inverse
                    const address = await reverseGeocode(lat, lng);
                    setSearchValue(address);
                    onChange({ address, latitude: lat, longitude: lng });
                },
                (error) => {
                    console.error('Erreur de géolocalisation:', error);
                    alert('Impossible d\'obtenir votre position. Vérifiez les permissions de géolocalisation.');
                }
            );
        } else {
            alert('La géolocalisation n\'est pas supportée par votre navigateur.');
        }
    };

    const clearLocation = () => {
        setSearchValue('');
        setSuggestions([]);
        onChange({ address: '', latitude: null, longitude: null });
        if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.removeLayer(markerRef.current);
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div className="space-y-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    value={searchValue}
                    onChange={handleSearchChange}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder={placeholder}
                    className="pl-9 pr-20"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                    {isSearching && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-1" />
                    )}
                    {searchValue && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={clearLocation}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setShowMap(!showMap)}
                        title={showMap ? "Masquer la carte" : "Afficher la carte"}
                    >
                        <MapPin className={`h-4 w-4 ${showMap ? 'text-primary' : ''}`} />
                    </Button>
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm hover:bg-muted focus:bg-muted focus:outline-none"
                                onClick={() => selectSuggestion(suggestion)}
                            >
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                    <span className="line-clamp-2">{suggestion.display_name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {showMap && (
                <div className="rounded-lg border overflow-hidden">
                    <div className="flex items-center justify-between bg-muted/50 px-3 py-2">
                        <span className="text-sm text-muted-foreground">
                            Cliquez sur la carte pour sélectionner
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={getCurrentLocation}
                        >
                            <Navigation className="h-4 w-4 mr-1" />
                            Ma position
                        </Button>
                    </div>
                    <div 
                        ref={mapRef} 
                        className="h-[300px] w-full"
                        style={{ minHeight: '300px' }}
                    >
                        {!isLoaded && (
                            <div className="h-full w-full flex items-center justify-center bg-muted">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                <span className="text-muted-foreground">Chargement de la carte...</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {latitude && longitude && (
                <p className="text-xs text-muted-foreground">
                    📍 Coordonnées: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
            )}
        </div>
    );
}
