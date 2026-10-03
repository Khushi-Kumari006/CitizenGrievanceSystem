import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Crosshair,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Loader2,
  Info,
} from 'lucide-react';

// Default center coordinates (New Delhi / Municipal HQ)
const DEFAULT_CENTER = [28.6139, 77.209];
const DEFAULT_ZOOM = 13;

// Create custom SVG marker icon
const createCustomMarkerIcon = (isConfirmed = false) => {
  const pinColor = isConfirmed ? '#166534' : '#1e4635';
  const svgHtml = `
    <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -100%);">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="${pinColor}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 5px rgba(0,0,0,0.3)); position: relative; z-index: 2;">
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
        <circle cx="12" cy="10" r="3" fill="#ffffff" stroke="none" />
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-civic-pin',
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
};

export const LocationPickerMap = ({
  latitude = null,
  longitude = null,
  onLocationSelect,
  onConfirmLocation,
  isConfirmed = false,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [currentLat, setCurrentLat] = useState(latitude);
  const [currentLng, setCurrentLng] = useState(longitude);

  // Set or move the marker on the map
  const updateMarker = useCallback((lat, lng, confirmed = false, map = mapInstanceRef.current) => {
    if (!map) return;

    const icon = createCustomMarkerIcon(confirmed);

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.setIcon(icon);
    } else {
      markerRef.current = L.marker([lat, lng], {
        icon,
        draggable: true,
      }).addTo(map);

      // Allow dragging marker
      markerRef.current.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        const roundedLat = parseFloat(pos.lat.toFixed(6));
        const roundedLng = parseFloat(pos.lng.toFixed(6));
        setCurrentLat(roundedLat);
        setCurrentLng(roundedLng);
        if (onLocationSelect) {
          onLocationSelect(roundedLat, roundedLng);
        }
      });
    }
  }, [onLocationSelect]);

  // Initialize Map on mount
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const initialCenter = latitude && longitude ? [latitude, longitude] : DEFAULT_CENTER;
    const initialZoom = latitude && longitude ? 15 : DEFAULT_ZOOM;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Place initial marker if coordinates exist
    if (latitude && longitude) {
      updateMarker(latitude, longitude, isConfirmed, map);
    }

    // Map click event: select location
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      const roundedLat = parseFloat(lat.toFixed(6));
      const roundedLng = parseFloat(lng.toFixed(6));
      setCurrentLat(roundedLat);
      setCurrentLng(roundedLng);
      setGeoError('');
      updateMarker(roundedLat, roundedLng, false, map);

      if (onLocationSelect) {
        onLocationSelect(roundedLat, roundedLng);
      }
    });

    // Invalidate map size after mount for smooth rendering
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update marker icon when confirmed status changes
  useEffect(() => {
    if (currentLat && currentLng && mapInstanceRef.current) {
      updateMarker(currentLat, currentLng, isConfirmed);
    }
  }, [isConfirmed, currentLat, currentLng, updateMarker]);

  // Geolocation Handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));

        setCurrentLat(lat);
        setCurrentLng(lng);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 16, { animate: true, duration: 1 });
          updateMarker(lat, lng, false, mapInstanceRef.current);
        }

        if (onLocationSelect) {
          onLocationSelect(lat, lng);
        }
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError('Location permission was denied. Please pinpoint on the map manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError('Location information is unavailable. Please click on the map to place a pin.');
            break;
          case error.TIMEOUT:
            setGeoError('Location request timed out. Please retry or click on the map.');
            break;
          default:
            setGeoError('An error occurred while retrieving your location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Confirm Location Handler
  const handleConfirm = () => {
    if (currentLat && currentLng && onConfirmLocation) {
      onConfirmLocation(currentLat, currentLng);
    }
  };

  // Clear Location Handler
  const handleClearLocation = () => {
    setCurrentLat(null);
    setCurrentLng(null);
    setGeoError('');
    if (markerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    if (onLocationSelect) {
      onLocationSelect(null, null);
    }
  };

  return (
    <div className="card">
      {/* Map Control Toolbar */}
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={16} color="var(--primary)" />
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-heading)' }}>
            Map Location Picker
          </span>
          {currentLat && currentLng && (
            <span
              className={`badge ${isConfirmed ? 'badge-resolved' : 'badge-pending'}`}
              style={{ fontSize: '0.7rem' }}
            >
              {isConfirmed ? 'Confirmed' : 'Pin Placed'}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="btn btn-secondary btn-sm"
            disabled={isLocating}
          >
            {isLocating ? (
              <>
                <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <Crosshair size={13} />
                <span>Detect Location</span>
              </>
            )}
          </button>

          {currentLat && currentLng && (
            <button
              type="button"
              onClick={handleClearLocation}
              className="btn btn-outline btn-sm"
              style={{ color: 'var(--status-danger-text)' }}
              title="Reset coordinates"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Geolocation Error Alert */}
      {geoError && (
        <div
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--status-danger-bg)',
            borderBottom: '1px solid var(--status-danger-border)',
            color: 'var(--status-danger-text)',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <AlertCircle size={14} />
          <span>{geoError}</span>
        </div>
      )}

      {/* Map Canvas Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '260px',
          backgroundColor: 'var(--bg-subtle)',
          position: 'relative',
          zIndex: 1,
        }}
      />

      {/* Map Footer: Coordinates & Confirmation Bar */}
      <div className="card-footer" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {currentLat && currentLng ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span>
                Lat: <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{currentLat}</strong>
              </span>
              <span>•</span>
              <span>
                Lng: <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{currentLng}</strong>
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Info size={13} />
              <span>Click the map or use GPS to set the issue location</span>
            </div>
          )}
        </div>

        {currentLat && currentLng && (
          <button
            type="button"
            onClick={handleConfirm}
            className={`btn btn-sm ${isConfirmed ? 'btn-secondary' : 'btn-primary'}`}
          >
            <CheckCircle2 size={13} />
            <span>{isConfirmed ? 'Location Saved' : 'Confirm Location'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default LocationPickerMap;
