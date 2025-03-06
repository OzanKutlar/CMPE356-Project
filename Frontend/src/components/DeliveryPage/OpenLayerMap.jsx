import { useState, useEffect, useRef } from 'react';

const OpenLayerMap = ({ startLocation, destination }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [routeDetails, setRouteDetails] = useState(null);

  useEffect(() => {
    const loadResources = async () => {
      try {
        // Load OpenLayers CSS
        if (!document.getElementById('ol-css')) {
          const link = document.createElement('link');
          link.id = 'ol-css';
          link.rel = 'stylesheet';
          link.href = 'https://cdn.jsdelivr.net/npm/ol@7.5.1/ol.css';
          document.head.appendChild(link);
        }

        // Load OpenLayers JS
        if (!window.ol) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/ol@7.5.1/dist/ol.js';
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load OpenLayers'));
            document.head.appendChild(script);
          });
        }

        // Wait a bit to ensure OpenLayers is fully initialized
        await new Promise(resolve => setTimeout(resolve, 200));

        // Check if OpenLayers is available
        if (!window.ol) {
          throw new Error('OpenLayers not available after loading scripts');
        }

        // Initialize map after OpenLayers is loaded
        initializeMap();
      } catch (err) {
        console.error('Map resource loading error:', err);
        setError(`Failed to load map resources: ${err.message}`);
        setLoading(false);
      }
    };

    loadResources();

    return () => {
      // Cleanup when component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(null);
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (window.ol && mapInstanceRef.current && startLocation && destination) {
      // Find locations and show route
      findLocationsAndRoute();
    }
  }, [startLocation, destination]);

  const initializeMap = () => {
    if (!window.ol || !mapRef.current) {
      console.error('OpenLayers or map container not available');
      setError('Map initialization failed: required resources not available');
      setLoading(false);
      return;
    }

    // Check if a map instance already exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setTarget(null); // Dispose of the existing map
      mapInstanceRef.current = null;
    }

    try {
      // Create a new map instance
      const map = new window.ol.Map({
        target: mapRef.current,
        layers: [
          new window.ol.layer.Tile({
            source: new window.ol.source.OSM(),
            properties: { name: 'baseMap' }
          })
        ],
        view: new window.ol.View({
          center: window.ol.proj.fromLonLat([28.9784, 41.0082]), // Default to Istanbul
          zoom: 4
        })
      });

      mapInstanceRef.current = map;

      if (startLocation && destination) {
        findLocationsAndRoute();
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Map initialization error:', err);
      setError(`Error initializing map: ${err.message}`);
      setLoading(false);
    }
  };

  const findLocationsAndRoute = async () => {
    if (!mapInstanceRef.current) return;

    setLoading(true);
    setError(null);

    try {
      // Clear existing layers except base map
      const layersToRemove = [];
      mapInstanceRef.current.getLayers().forEach(layer => {
        if (layer && layer.getProperties() && layer.getProperties().name && layer.getProperties().name !== 'baseMap') {
          layersToRemove.push(layer);
        }
      });

      layersToRemove.forEach(layer => {
        mapInstanceRef.current.removeLayer(layer);
      });

      // Geocode the locations using Google Maps Geocoding API
      const [startCoord, endCoord] = await Promise.all([
        geocodeAddress(startLocation),
        geocodeAddress(destination)
      ]);

      // Add markers for start and destination
      addMarker(startCoord, 'start');
      addMarker(endCoord, 'destination');

      // Get the route between the points
      await getRoute(startCoord, endCoord);

      // Fit map to show all markers and route
      const vectorSource = new window.ol.source.Vector();

      // Add start and end points
      const startFeature = new window.ol.Feature({
        geometry: new window.ol.geom.Point(window.ol.proj.fromLonLat(startCoord))
      });

      const endFeature = new window.ol.Feature({
        geometry: new window.ol.geom.Point(window.ol.proj.fromLonLat(endCoord))
      });

      vectorSource.addFeature(startFeature);
      vectorSource.addFeature(endFeature);

      const extent = vectorSource.getExtent();
      mapInstanceRef.current.getView().fit(extent, {
        padding: [100, 100, 100, 100],
        duration: 1000
      });

      setLoading(false);
    } catch (err) {
      console.error('Error finding locations:', err);
      setError(`Error finding locations: ${err.message}`);
      setLoading(false);
    }
  };

  const geocodeAddress = async (address) => {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // Ensure this is set in your .env file
      if (!apiKey) {
        throw new Error('Google Maps API key not found');
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Google Maps Geocoding error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return [lng, lat]; // Return as [longitude, latitude]
      }

      throw new Error(`Address not found: ${address}`);
    } catch (err) {
      console.error('Geocoding error:', err);
      throw new Error(`Failed to geocode address "${address}": ${err.message}`);
    }
  };

  const addMarker = (coordinates, type) => {
    try {
      // Create vector layer for marker
      const markerStyle = new window.ol.style.Style({
        image: new window.ol.style.Circle({
          radius: 8,
          fill: new window.ol.style.Fill({
            color: type === 'start' ? 'rgba(0, 128, 0, 0.8)' : 'rgba(255, 0, 0, 0.8)'
          }),
          stroke: new window.ol.style.Stroke({
            color: '#fff',
            width: 2
          })
        })
      });

      const markerFeature = new window.ol.Feature({
        geometry: new window.ol.geom.Point(window.ol.proj.fromLonLat(coordinates))
      });

      const vectorSource = new window.ol.source.Vector({
        features: [markerFeature]
      });

      const vectorLayer = new window.ol.layer.Vector({
        source: vectorSource,
        style: markerStyle,
        properties: { name: `marker-${type}` }
      });

      mapInstanceRef.current.addLayer(vectorLayer);
    } catch (err) {
      console.error('Error adding marker:', err);
      setError(`Failed to add ${type} marker: ${err.message}`);
    }
  };

  const getRoute = async (startCoord, endCoord) => {
    try {
      // Try OSRM first as it doesn't require an API key
      return await getOSRMRoute(startCoord, endCoord);
    } catch (err) {
      console.warn('OSRM routing failed, trying OpenRouteService if API key exists:', err);

      // Only try OpenRouteService if API key is available
      const apiKey = import.meta.env.VITE_OPENROUTESERVICE_API_KEY;

      if (apiKey) {
        try {
          return await getOpenRouteServiceRoute(startCoord, endCoord, apiKey);
        } catch (routeErr) {
          console.error('OpenRouteService routing failed:', routeErr);
          throw new Error('All routing services failed');
        }
      } else {
        throw new Error('Routing failed and no API key for alternatives');
      }
    }
  };

  const getOSRMRoute = async (startCoord, endCoord) => {
    // Using OSRM public demo server (no API key required)
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${startCoord[0]},${startCoord[1]};${endCoord[0]},${endCoord[1]}?overview=full&geometries=geojson`
    );

    if (!response.ok) {
      throw new Error(`OSRM routing error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coordinates = route.geometry.coordinates;

      // Transform coordinates to the map's projection
      const transformedCoords = coordinates.map(coord =>
        window.ol.proj.fromLonLat(coord)
      );

      // Create line feature
      const routeFeature = new window.ol.Feature({
        geometry: new window.ol.geom.LineString(transformedCoords)
      });

      const routeStyle = new window.ol.style.Style({
        stroke: new window.ol.style.Stroke({
          color: '#0088FF',
          width: 6
        })
      });

      const vectorLayer = new window.ol.layer.Vector({
        source: new window.ol.source.Vector({
          features: [routeFeature]
        }),
        style: routeStyle,
        properties: { name: 'route' }
      });

      mapInstanceRef.current.addLayer(vectorLayer);

      // Extract route details
      setRouteDetails({
        distance: (route.distance / 1000).toFixed(2) + ' km',
        duration: Math.round(route.duration / 60) + ' minutes'
      });

      return true;
    }

    throw new Error('No route found from OSRM');
  };

  const getOpenRouteServiceRoute = async (startCoord, endCoord, apiKey) => {
    // Format coordinates as required by OpenRouteService
    const formattedCoords = [
      startCoord,
      endCoord
    ];

    const response = await fetch(
      'https://api.openrouteservice.org/v2/directions/driving-car',
      {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          coordinates: formattedCoords
        })
      }
    );

    if (!response.ok) {
      throw new Error(`OpenRouteService error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const route = data.features[0];

      // Add route to map
      const format = new window.ol.format.GeoJSON();
      const feature = format.readFeature(route, {
        featureProjection: 'EPSG:3857'
      });

      const routeStyle = new window.ol.style.Style({
        stroke: new window.ol.style.Stroke({
          color: '#0088FF',
          width: 6
        })
      });

      const vectorLayer = new window.ol.layer.Vector({
        source: new window.ol.source.Vector({
          features: [feature]
        }),
        style: routeStyle,
        properties: { name: 'route' }
      });

      mapInstanceRef.current.addLayer(vectorLayer);

      // Extract route details
      if (route.properties && route.properties.summary) {
        setRouteDetails({
          distance: (route.properties.summary.distance / 1000).toFixed(2) + ' km',
          duration: Math.round(route.properties.summary.duration / 60) + ' minutes'
        });
      }

      return true;
    }

    throw new Error('No route found from OpenRouteService');
  };

  return (
    <div className="route-map-container overflow-y-auto">
      {loading && <div className="loading p-2 text-center text-gray-600">Loading map...</div>}
      {error && <div className="error p-2 text-center text-red-600">Error: {error}</div>}
      <div
        ref={mapRef}
        className="w-full h-[calc(100vh-220px)] rounded-lg relative"
      ></div>
      {routeDetails && (
        <div className="route-info mt-1 p-1 bg-gray-100 rounded-lg">
          <p><strong className="font-semibold">Distance:</strong> {routeDetails.distance}</p>
          <p><strong className="font-semibold">Estimated Time:</strong> {routeDetails.duration}</p>
        </div>
      )}
      <div className="location-info mt-1 p-1 bg-gray-100 rounded-lg">
        <p><strong className="font-semibold">Start:</strong> {startLocation}</p>
        <p><strong className="font-semibold">Destination:</strong> {destination}</p>
      </div>
    </div>
  );
};

export default OpenLayerMap;