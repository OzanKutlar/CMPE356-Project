import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const GoogleMapsDirections = ({ targetAddress }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const apikey = "AIzaSyDbOQL-5NhQI-fft7fzJ74726ec6clN05M";//import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const mapRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const watchIdRef = useRef(null);
  
  // Initialize Google Maps, DirectionsService, and DirectionsRenderer
  useEffect(() => {
    const initMap = () => {
      if (!window.google) {
        setError('Google Maps API not loaded');
        return;
      }
      
      // Create map instance
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: true,
        fullscreenControl: false,
      });
      
      // Create directions service and renderer
      directionsServiceRef.current = new window.google.maps.DirectionsService();
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 5,
          strokeOpacity: 0.8
        }
      });
      
      // Get user's current location
      if (navigator.geolocation) {
        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const userLocation = { lat: latitude, lng: longitude };
            setCurrentLocation(userLocation);
            
            // Center map on user's location
            map.setCenter(userLocation);
            
            // Place a marker at user's location
            new window.google.maps.marker.AdvancedMarketElement({
              position: userLocation,
              map,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
              },
              title: 'Your location'
            });
            
            setIsLoading(false);
            
            // Start watching position for updates
            startWatchingPosition();
          },
          (err) => {
            setError(`Error getting location: ${err.message}`);
            setIsLoading(false);
          },
          { enableHighAccuracy: true }
        );
      } else {
        setError('Geolocation is not supported by your browser');
        setIsLoading(false);
      }
    };
    
    // Load Google Maps API if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDbOQL-5NhQI-fft7fzJ74726ec6clN05M&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => setError('Failed to load Google Maps API');
      document.head.appendChild(script);
    } else {
      initMap();
    }
    
    // Cleanup function
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);
  
  // Function to start watching user position
  const startWatchingPosition = () => {
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };
          
          setCurrentLocation(newLocation);
          
          // If we have active directions, update the route
          if (directionsResponse) {
            calculateRoute(newLocation, targetAddress);
          }
        },
        (err) => {
          console.error('Error watching position:', err);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }
  };
  
  // Calculate route when targetAddress or currentLocation changes
  useEffect(() => {
    if (currentLocation && targetAddress && directionsServiceRef.current) {
      calculateRoute(currentLocation, targetAddress);
    }
  }, [targetAddress, currentLocation]);
  
  // Function to calculate route
  const calculateRoute = async (origin, destination) => {
    if (!directionsServiceRef.current || !destination) return;
    
    try {
      const results = await new Promise((resolve, reject) => {
        directionsServiceRef.current.route(
          {
            origin: origin,
            destination: destination,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              resolve(result);
            } else {
              reject(new Error(`Directions request failed: ${status}`));
            }
          }
        );
      });
      
      setDirectionsResponse(results);
      directionsRendererRef.current.setDirections(results);
      
      const route = results.routes[0];
      if (route && route.legs[0]) {
        setDistance(route.legs[0].distance.text);
        setDuration(route.legs[0].duration.text);
      }
    } catch (err) {
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
        style={{ minHeight: '400px' }}
      ></div>
    </div>
  );
};

GoogleMapsDirections.propTypes = {
  targetAddress: PropTypes.any
};

export default GoogleMapsDirections;