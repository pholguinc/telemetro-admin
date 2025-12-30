import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { Trash2, Edit2, MapPin, AlertCircle } from 'lucide-react';

// Coordenadas de Lima, Perú como centro por defecto
const DEFAULT_CENTER = { lat: -12.046374, lng: -77.042793 };
const DEFAULT_ZOOM = 17;

interface GeoLocation {
  type: 'Point' | 'Polygon';
  coordinates: number[] | number[][][];
}

interface MapDrawerProps {
  value: GeoLocation | null;
  onChange: (location: GeoLocation) => void;
  apiKey: string;
  height?: string;
  disabled?: boolean;
}

interface MapComponentProps {
  center: { lat: number; lng: number };
  zoom: number;
  onShapeComplete: (shape: any) => void;
  existingLocation: GeoLocation | null;
  disabled?: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center,
  zoom,
  onShapeComplete,
  existingLocation,
  disabled = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager>();
  const [currentShape, setCurrentShape] = useState<google.maps.Polygon | google.maps.Marker | null>(null);

  // Inicializar el mapa con controles nativos de búsqueda
  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER,
        },
        // Agregar el control de búsqueda nativo de Google Maps
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_RIGHT,
        },
      });

      // Crear y agregar el PlacesService para búsqueda nativa
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = '🔍 Buscar lugar...';
      input.className = 'pac-input';
      input.style.cssText = `
        width: 300px;
        height: 40px;
        margin: 10px;
        padding: 0 15px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
        outline: none;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      `;

      const autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.bindTo('bounds', newMap);
      autocomplete.setFields(['address_components', 'geometry', 'icon', 'name']);

      newMap.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
          return;
        }

        if (place.geometry.viewport) {
          newMap.fitBounds(place.geometry.viewport);
        } else {
          newMap.setCenter(place.geometry.location);
          newMap.setZoom(17);
        }
      });

      setMap(newMap);
    }
  }, [ref, map, center, zoom]);

  // Inicializar el Drawing Manager
  useEffect(() => {
    if (map && !drawingManager && !disabled) {
      const newDrawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [
            google.maps.drawing.OverlayType.POLYGON,
            google.maps.drawing.OverlayType.MARKER,
          ],
        },
        polygonOptions: {
          fillColor: '#3B82F6',
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: '#1D4ED8',
          clickable: false,
          editable: true,
          zIndex: 1,
        },
        markerOptions: {
          draggable: true,
        },
      });

      newDrawingManager.setMap(map);
      setDrawingManager(newDrawingManager);

      // Listener para cuando se completa un dibujo
      google.maps.event.addListener(
        newDrawingManager,
        'overlaycomplete',
        (event: google.maps.drawing.OverlayCompleteEvent) => {
          // Remover el shape anterior si existe
          if (currentShape) {
            if (currentShape instanceof google.maps.Polygon) {
              currentShape.setMap(null);
            } else if (currentShape instanceof google.maps.Marker) {
              currentShape.setMap(null);
            }
          }

          // Guardar el nuevo shape
          const newShape = event.overlay;
          setCurrentShape(newShape as google.maps.Polygon | google.maps.Marker);
          onShapeComplete(newShape as google.maps.Polygon | google.maps.Marker);

          // Desactivar el modo de dibujo
          newDrawingManager.setDrawingMode(null);
        }
      );
    }
  }, [map, drawingManager, currentShape, onShapeComplete, disabled]);

  // Renderizar ubicación existente
  useEffect(() => {
    if (map && existingLocation && !currentShape) {
      if (existingLocation.type === 'Polygon') {
        const coordinates = existingLocation.coordinates as number[][][];
        const paths = coordinates[0].map(([lng, lat]) => ({ lat, lng }));

        const polygon = new google.maps.Polygon({
          paths,
          fillColor: '#3B82F6',
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: '#1D4ED8',
          editable: !disabled,
          draggable: false,
        });

        polygon.setMap(map);
        setCurrentShape(polygon);

        // Centrar mapa en el polígono
        const bounds = new google.maps.LatLngBounds();
        paths.forEach((path) => bounds.extend(path));
        map.fitBounds(bounds);

        // Listener para cambios en el polígono
        if (!disabled) {
          google.maps.event.addListener(polygon.getPath(), 'set_at', () => {
            onShapeComplete(polygon);
          });
          google.maps.event.addListener(polygon.getPath(), 'insert_at', () => {
            onShapeComplete(polygon);
          });
        }
      } else if (existingLocation.type === 'Point') {
        const [lng, lat] = existingLocation.coordinates as number[];
        const position = { lat, lng };

        const marker = new google.maps.Marker({
          position,
          map,
          draggable: !disabled,
        });

        setCurrentShape(marker);
        map.setCenter(position);

        // Listener para cambios en el marcador
        if (!disabled) {
          google.maps.event.addListener(marker, 'dragend', () => {
            onShapeComplete(marker);
          });
        }
      }
    }
  }, [map, existingLocation, currentShape, onShapeComplete, disabled]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

const LoadingState: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Cargando Google Maps...</p>
    </div>
  </div>
);

const ErrorState: React.FC<{ status: Status }> = ({ status }) => (
  <div className="w-full h-full flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
    <div className="text-center text-red-600 p-6">
      <AlertCircle className="w-12 h-12 mx-auto mb-4" />
      <p className="font-semibold mb-2">Error al cargar Google Maps</p>
      <p className="text-sm">Estado: {status}</p>
    </div>
  </div>
);

const MapDrawer: React.FC<MapDrawerProps> = ({
  value,
  onChange,
  apiKey,
  height = '500px',
  disabled = false,
}) => {
  const [shapeType, setShapeType] = useState<string>(value?.type || 'none');

  const handleShapeComplete = useCallback(
    (shape: google.maps.Polygon | google.maps.Marker) => {
      if (shape instanceof google.maps.Polygon) {
        const path = shape.getPath();
        const coordinates: number[][] = [];

        for (let i = 0; i < path.getLength(); i++) {
          const point = path.getAt(i);
          coordinates.push([point.lng(), point.lat()]);
        }

        // Cerrar el polígono (primer punto = último punto)
        if (coordinates.length > 0) {
          coordinates.push([...coordinates[0]]);
        }

        const geoLocation: GeoLocation = {
          type: 'Polygon',
          coordinates: [coordinates],
        };

        setShapeType('Polygon');
        onChange(geoLocation);
      } else if (shape instanceof google.maps.Marker) {
        const position = shape.getPosition();
        if (position) {
          const geoLocation: GeoLocation = {
            type: 'Point',
            coordinates: [position.lng(), position.lat()],
          };

          setShapeType('Point');
          onChange(geoLocation);
        }
      }
    },
    [onChange]
  );

  const handleClear = () => {
    setShapeType('none');
    onChange({ type: 'Point', coordinates: [0, 0] });
    // Recargar el componente
    window.location.reload();
  };

  const render = (status: Status) => {
    if (status === Status.LOADING) return <LoadingState />;
    if (status === Status.FAILURE) return <ErrorState status={status} />;
    return (
      <MapComponent
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        onShapeComplete={handleShapeComplete}
        existingLocation={value}
        disabled={disabled}
      />
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Área Geográfica</h3>
        </div>
        {value && value.type !== 'Point' && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <span className="font-semibold">💡 Instrucciones:</span> 
        </p>
        <ul className="text-xs text-blue-700 mt-2 ml-4 space-y-1">
          <li>• <strong>🔍 Buscador</strong>: Usa el buscador en la esquina superior izquierda del mapa para encontrar lugares</li>
          <li>• <strong>Polígono</strong>: Dibuja el área donde aplica la oferta (click para cada punto)</li>
          <li>• <strong>Marcador</strong>: Coloca un pin en una ubicación específica</li>
          <li>• Puedes editar el área arrastrando los puntos después de dibujar</li>
        </ul>
      </div>

      {shapeType !== 'none' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-800">
            ✅ <strong>Área seleccionada:</strong>{' '}
            {shapeType === 'Polygon' ? 'Polígono dibujado' : 'Punto específico'}
          </p>
        </div>
      )}

      <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-md" style={{ height }}>
        <Wrapper apiKey={apiKey} render={render} libraries={['drawing', 'places']} />
      </div>
    </div>
  );
};

export default MapDrawer;

