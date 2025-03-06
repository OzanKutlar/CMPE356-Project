import {useState, useEffect, useRef} from 'react';

const GoogleMapsRoutes = ({startAddress, targetAddress}) => {
    const [startLocation, setStartLocation] = useState(null);
    const [endLocation, setEndLocation] = useState(null);
    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const apikey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const polylineRef = useRef(null);
    const startMarkerRef = useRef(null);
    const destinationMarkerRef = useRef(null);

    // Initialize Google Maps
    useEffect(() => {
        const loadGoogleMapsScript = () => {
            if (window.google && window.google.maps) {
                initMap();
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apikey}&libraries=places,geometry`;
            script.async = true;
            script.defer = true;
            script.onload = initMap;
            script.onerror = () => setError('Failed to load Google Maps API');
            document.head.appendChild(script);
        };

        const initMap = () => {
            try {
                // Create map instance
                const map = new google.maps.Map(mapRef.current, {
                    zoom: 12,
                    center: {lat: 37.7749, lng: -122.4194}, // Default center (San Francisco)
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    mapTypeControl: false,
                    streetViewControl: false,
                    zoomControl: true,
                    fullscreenControl: false,
                });

                mapInstanceRef.current = map;
                setIsLoading(false);
            } catch (err) {
                setError(`Error initializing map: ${err.message}`);
                setIsLoading(false);
            }
        };

        loadGoogleMapsScript();

        // Cleanup function
        return () => {
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
            }

            if (startMarkerRef.current) {
                startMarkerRef.current.setMap(null);
            }

            if (destinationMarkerRef.current) {
                destinationMarkerRef.current.setMap(null);
            }
        };
    }, []);

    // Geocode address to coordinates
    const geocodeAddress = async (address) => {
        return new Promise((resolve, reject) => {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({address: address}, (results, status) => {
                if (status === "OK" && results.length > 0) {
                    resolve(results[0].geometry.location);
                } else {
                    reject(new Error(`Geocoding failed: ${status}`));
                }
            });
        });
    };

    // Calculate route when startAddress or targetAddress changes
    useEffect(() => {
        const processAddresses = async () => {
            if (!mapInstanceRef.current || !startAddress || !targetAddress) return;

            try {
                setIsLoading(true);

                // Geocode both addresses
                const startLatLng = await geocodeAddress(startAddress);
                const endLatLng = await geocodeAddress(targetAddress);

                setStartLocation(startLatLng);
                setEndLocation(endLatLng);

                // Calculate route
                await calculateRoute(startLatLng, endLatLng);

                setIsLoading(false);
            } catch (err) {
                setError(`Error processing addresses: ${err.message}`);
                setIsLoading(false);
            }
        };

        processAddresses();
    }, [startAddress, targetAddress]);

    // Function to calculate route
    const calculateRoute = async (origin, destination) => {
        if (!mapInstanceRef.current || !origin || !destination) return;

        try {
            // Clear existing route display if any
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
            }

            if (startMarkerRef.current) {
                startMarkerRef.current.setMap(null);
            }

            if (destinationMarkerRef.current) {
                destinationMarkerRef.current.setMap(null);
            }

            // Create start marker
            const startMarker = new google.maps.Marker({
                position: origin,
                map: mapInstanceRef.current,
                title: 'Start',
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#4285F4',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2,
                }
            });

            startMarkerRef.current = startMarker;

            // Create destination marker
            const destinationMarker = new google.maps.Marker({
                position: destination,
                map: mapInstanceRef.current,
                title: 'Destination'
            });

            destinationMarkerRef.current = destinationMarker;

            // Use fetch to call Routes API directly
            try {
                // Create origin and destination objects for routes API
                const originLatLng = {
                    latitude: typeof origin.lat === 'function' ? origin.lat() : origin.lat,
                    longitude: typeof origin.lng === 'function' ? origin.lng() : origin.lng
                };

                const destLatLng = {
                    latitude: typeof destination.lat === 'function' ? destination.lat() : destination.lat,
                    longitude: typeof destination.lng === 'function' ? destination.lng() : destination.lng
                };

                const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': apikey,
                        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
                    },
                    body: JSON.stringify({
                        origin: {
                            location: {
                                latLng: originLatLng
                            }
                        },
                        destination: {
                            location: {
                                latLng: destLatLng
                            }
                        },
                        travelMode: 'DRIVE',
                        routingPreference: 'TRAFFIC_AWARE',
                        computeAlternativeRoutes: false,
                        languageCode: 'en-US',
                        units: 'IMPERIAL'
                    })
                });

                if (!response.ok) {
                    throw new Error(`Routes API request failed with status: ${response.status}`);
                }

                const data = await response.json();

                if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0];

                    // Decode polyline and display on map
                    const decodedPath = google.maps.geometry.encoding.decodePath(
                        route.polyline.encodedPolyline
                    );

                    const polyline = new google.maps.Polyline({
                        path: decodedPath,
                        strokeColor: '#4285F4',
                        strokeWeight: 5,
                        strokeOpacity: 0.8,
                        map: mapInstanceRef.current
                    });

                    polylineRef.current = polyline;

                    // Fit bounds to show the entire route
                    const bounds = new google.maps.LatLngBounds();
                    decodedPath.forEach(point => bounds.extend(point));
                    mapInstanceRef.current.fitBounds(bounds);

                    // Format distance
                    const distanceMeters = parseInt(route.distanceMeters, 10);
                    const distanceMiles = (distanceMeters / 1609.34).toFixed(1);
                    setDistance(`${distanceMiles} mi`);

                    // Format duration (comes in format like "1200s")
                    const durationStr = route.duration;
                    const durationSeconds = parseInt(durationStr.replace('s', ''), 10);
                    const hours = Math.floor(durationSeconds / 3600);
                    const minutes = Math.floor((durationSeconds % 3600) / 60);

                    let durationText = '';
                    if (hours > 0) {
                        durationText = `${hours} hr ${minutes} min`;
                    } else {
                        durationText = `${minutes} min`;
                    }
                    setDuration(durationText);
                } else {
                    setError('No routes found');
                }
            } catch (fetchErr) {
                // Fallback to DirectionsService if Routes API fails
                console.warn('Routes API failed, falling back to Directions API:', fetchErr);

                const directionsService = new google.maps.DirectionsService();

                const results = await new Promise((resolve, reject) => {
                    directionsService.route(
                        {
                            origin: origin,
                            destination: destination,
                            travelMode: google.maps.TravelMode.DRIVING,
                        },
                        (result, status) => {
                            if (status === google.maps.DirectionsStatus.OK) {
                                resolve(result);
                            } else {
                                reject(new Error(`Directions request failed: ${status}`));
                            }
                        }
                    );
                });

                // Create a polyline from the directions result
                const path = results.routes[0].overview_path;
                const polyline = new google.maps.Polyline({
                    path: path,
                    strokeColor: '#4285F4',
                    strokeWeight: 5,
                    strokeOpacity: 0.8,
                    map: mapInstanceRef.current
                });

                polylineRef.current = polyline;

                // Fit bounds to show the entire route
                const bounds = new google.maps.LatLngBounds();
                path.forEach(point => bounds.extend(point));
                mapInstanceRef.current.fitBounds(bounds);

                // Set distance and duration
                const route = results.routes[0];
                if (route && route.legs[0]) {
                    setDistance(route.legs[0].distance.text);
                    setDuration(route.legs[0].duration.text);
                }
            }
        } catch (err) {
            console.error('Route calculation error:', err);
            setError(`Error calculating route: ${err.message}`);
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
                    <div className="text-gray-700">Loading map...</div>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}

            {distance && duration && (
                <div className="bg-gray-100 p-4 mb-4 rounded-md">
                    <div className="text-sm font-medium">
                        <span className="font-bold">Distance:</span> {distance}
                    </div>
                    <div className="text-sm font-medium">
                        <span className="font-bold">Duration:</span> {duration}
                    </div>
                </div>
            )}

            <div
                ref={mapRef}
                className="flex-grow w-full rounded-lg shadow-md"
                style={{minHeight: '400px'}}
            ></div>
        </div>
    );
};

export default GoogleMapsRoutes;