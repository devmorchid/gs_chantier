import { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, X, Navigation } from 'lucide-react';

interface GoogleMapsPickerProps {
    value: string;
    latitude?: number | null;
    longitude?: number | null;
    onChange: (location: {
        address: string;
        latitude: number | null;
        longitude: number | null;
    }) => void;
    placeholder?: string;
    apiKey: string;
    defaultCenter?: { lat: number; lng: number };
    defaultZoom?: number;
}

export function GoogleMapsPicker({
    value,
    latitude,
    longitude,
    onChange,
    placeholder = 'Rechercher une adresse...',
    apiKey,
    defaultCenter = { lat: 33.5731, lng: -7.5898 }, // Casablanca par défaut
    defaultZoom = 12,
}: GoogleMapsPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [marker, setMarker] = useState<google.maps.Marker | null>(null);
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [searchValue, setSearchValue] = useState(value);
    const [showMap, setShowMap] = useState(false);

    // Charger le script Google Maps
    useEffect(() => {
        if (typeof window !== 'undefined' && window.google?.maps) {
            setIsLoaded(true);
            return;
        }

        const existingScript = document.getElementById('google-maps-script');
        if (existingScript) {
            existingScript.addEventListener('load', () => setIsLoaded(true));
            return;
        }

        (window as any).initGoogleMaps = () => {
            setIsLoaded(true);
        };

        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        return () => {
            // Cleanup si nécessaire
        };
    }, [apiKey]);

    // Initialiser la carte
    const initMap = useCallback(() => {
        if (!mapRef.current || !isLoaded || map) return;

        const center = latitude && longitude 
            ? { lat: latitude, lng: longitude }
            : defaultCenter;

        const newMap = new window.google.maps.Map(mapRef.current, {
            center,
            zoom: latitude && longitude ? 15 : defaultZoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
        });

        const newMarker = new window.google.maps.Marker({
            map: newMap,
            draggable: true,
            position: latitude && longitude ? center : undefined,
            visible: !!(latitude && longitude),
        });

        // Événement de clic sur la carte
        newMap.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                newMarker.setPosition(e.latLng);
                newMarker.setVisible(true);
                
                // Géocodage inverse pour obtenir l'adresse
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ location: e.latLng }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
                    if (status === 'OK' && results?.[0]) {
                        const address = results[0].formatted_address;
                        setSearchValue(address);
                        onChange({ address, latitude: lat, longitude: lng });
                    } else {
                        onChange({ address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, latitude: lat, longitude: lng });
                    }
                });
            }
        });

        // Événement de drag du marqueur
        newMarker.addListener('dragend', () => {
            const position = newMarker.getPosition();
            if (position) {
                const lat = position.lat();
                const lng = position.lng();
                
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ location: position }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
                    if (status === 'OK' && results?.[0]) {
                        const address = results[0].formatted_address;
                        setSearchValue(address);
                        onChange({ address, latitude: lat, longitude: lng });
                    }
                });
            }
        });

        setMap(newMap);
        setMarker(newMarker);
    }, [isLoaded, map, latitude, longitude, defaultCenter, defaultZoom, onChange]);

    // Initialiser l'autocomplete
    useEffect(() => {
        if (!inputRef.current || !isLoaded || autocomplete) return;

        const newAutocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: 'ma' }, // Restreindre au Maroc
            fields: ['formatted_address', 'geometry', 'name'],
        });

        newAutocomplete.addListener('place_changed', () => {
            const place = newAutocomplete.getPlace();
            
            if (place.geometry?.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const address = place.formatted_address || place.name || '';
                
                setSearchValue(address);
                onChange({ address, latitude: lat, longitude: lng });
                
                if (map && marker) {
                    map.setCenter(place.geometry.location);
                    map.setZoom(16);
                    marker.setPosition(place.geometry.location);
                    marker.setVisible(true);
                }
            }
        });

        setAutocomplete(newAutocomplete);
    }, [isLoaded, autocomplete, map, marker, onChange]);

    // Initialiser la carte quand elle est affichée
    useEffect(() => {
        if (showMap && isLoaded) {
            initMap();
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
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const latLng = new window.google.maps.LatLng(lat, lng);
                    
                    if (map && marker) {
                        map.setCenter(latLng);
                        map.setZoom(16);
                        marker.setPosition(latLng);
                        marker.setVisible(true);
                    }
                    
                    // Géocodage inverse
                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode({ location: latLng }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
                        if (status === 'OK' && results?.[0]) {
                            const address = results[0].formatted_address;
                            setSearchValue(address);
                            onChange({ address, latitude: lat, longitude: lng });
                        }
                    });
                },
                (error) => {
                    console.error('Erreur de géolocalisation:', error);
                }
            );
        }
    };

    const clearLocation = () => {
        setSearchValue('');
        onChange({ address: '', latitude: null, longitude: null });
        if (marker) {
            marker.setVisible(false);
        }
    };

    return (
        <div className="space-y-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={placeholder}
                    className="pl-9 pr-20"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
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
                    >
                        <MapPin className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {showMap && (
                <div className="rounded-lg border overflow-hidden">
                    <div className="flex items-center justify-between bg-muted/50 px-3 py-2">
                        <span className="text-sm text-muted-foreground">
                            Cliquez sur la carte pour sélectionner un emplacement
                        </span>
                        {isLoaded && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={getCurrentLocation}
                            >
                                <Navigation className="h-4 w-4 mr-1" />
                                Ma position
                            </Button>
                        )}
                    </div>
                    <div 
                        ref={mapRef} 
                        className="h-[300px] w-full"
                        style={{ minHeight: '300px' }}
                    >
                        {!isLoaded && (
                            <div className="h-full w-full flex items-center justify-center bg-muted">
                                <span className="text-muted-foreground">Chargement de la carte...</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {latitude && longitude && (
                <p className="text-xs text-muted-foreground">
                    Coordonnées: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
            )}
        </div>
    );
}
