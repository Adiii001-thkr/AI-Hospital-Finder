import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Phone, Clock, Siren, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGeolocation } from '@/hooks/useGeolocation';

interface Hospital {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  sector: string | null;
  latitude: number | null;
  longitude: number | null;
  emergency_services: boolean | null;
  available_24x7: boolean | null;
  type: string | null;
}

interface HospitalMapProps {
  hospitals: Hospital[];
  selectedHospital?: string | null;
  onHospitalSelect?: (hospital: Hospital) => void;
}

export function HospitalMap({ hospitals, selectedHospital, onHospitalSelect }: HospitalMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { latitude, longitude, loading: geoLoading, error: geoError, getLocation, calculateDistance } = useGeolocation();
  const [selectedMarker, setSelectedMarker] = useState<Hospital | null>(null);
  const [hospitalsWithDistance, setHospitalsWithDistance] = useState<(Hospital & { distance?: number })[]>([]);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  useEffect(() => {
    if (latitude && longitude) {
      const withDistance = hospitals
        .filter(h => h.latitude && h.longitude)
        .map(h => ({
          ...h,
          distance: calculateDistance(latitude, longitude, h.latitude!, h.longitude!)
        }))
        .sort((a, b) => (a.distance || 999) - (b.distance || 999));
      setHospitalsWithDistance(withDistance);
    } else {
      setHospitalsWithDistance(hospitals.filter(h => h.latitude && h.longitude));
    }
  }, [hospitals, latitude, longitude, calculateDistance]);

  useEffect(() => {
    if (selectedHospital) {
      const hospital = hospitals.find(h => 
        h.name.toLowerCase().includes(selectedHospital.toLowerCase())
      );
      if (hospital) {
        setSelectedMarker(hospital);
      }
    }
  }, [selectedHospital, hospitals]);

  const handleGetDirections = (hospital: Hospital) => {
    if (hospital.latitude && hospital.longitude) {
      const url = latitude && longitude
        ? `https://www.google.com/maps/dir/${latitude},${longitude}/${hospital.latitude},${hospital.longitude}`
        : `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`;
      window.open(url, '_blank');
    }
  };

  // Simple map visualization without Mapbox
  return (
    <div className="relative h-[500px] bg-muted rounded-xl overflow-hidden">
      {/* Map Background with Grid Pattern */}
      <div 
        ref={mapContainer}
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      >
        {/* User Location Indicator */}
        {latitude && longitude && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium">Your Location</span>
          </div>
        )}

        {geoLoading && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm">Getting location...</span>
          </div>
        )}

        {/* Hospital Markers Visualization */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full max-w-2xl h-80">
            {hospitalsWithDistance.slice(0, 10).map((hospital, index) => {
              const isSelected = selectedMarker?.id === hospital.id;
              // Create a circular layout
              const angle = (index / 10) * 2 * Math.PI - Math.PI / 2;
              const radius = 120 + (hospital.distance ? hospital.distance * 10 : index * 15);
              const x = 50 + Math.cos(angle) * Math.min(radius, 180) / 4;
              const y = 50 + Math.sin(angle) * Math.min(radius, 180) / 4;

              return (
                <button
                  key={hospital.id}
                  onClick={() => {
                    setSelectedMarker(hospital);
                    onHospitalSelect?.(hospital);
                  }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                    isSelected ? 'z-20 scale-125' : 'z-10 hover:scale-110'
                  }`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div className={`p-2 rounded-full shadow-lg ${
                    hospital.emergency_services 
                      ? 'bg-[hsl(var(--emergency))]' 
                      : isSelected 
                        ? 'bg-primary' 
                        : 'bg-card border-2 border-primary'
                  }`}>
                    {hospital.emergency_services ? (
                      <Siren className="w-5 h-5 text-white" />
                    ) : (
                      <MapPin className={`w-5 h-5 ${isSelected ? 'text-primary-foreground' : 'text-primary'}`} />
                    )}
                  </div>
                  {/* Distance Label */}
                  {hospital.distance !== undefined && (
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-xs font-medium bg-background px-1.5 py-0.5 rounded shadow-sm">
                        {hospital.distance.toFixed(1)} km
                      </span>
                    </div>
                  )}
                </button>
              );
            })}

            {/* Center User Icon */}
            {latitude && longitude && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                <div className="p-3 bg-primary rounded-full shadow-xl animate-pulse">
                  <Navigation className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Hospital Card */}
      {selectedMarker && (
        <Card className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 shadow-xl border-2 animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex flex-wrap gap-1">
                {selectedMarker.emergency_services && (
                  <Badge className="bg-[hsl(var(--emergency))]/10 text-[hsl(var(--emergency))] text-xs">
                    <Siren className="w-3 h-3 mr-1" />
                    Emergency
                  </Badge>
                )}
                {selectedMarker.available_24x7 && (
                  <Badge className="bg-[hsl(var(--available))]/10 text-[hsl(var(--available))] text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    24×7
                  </Badge>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedMarker(null)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>

            <h3 className="font-bold text-lg mb-1">{selectedMarker.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {selectedMarker.sector && `Sector ${selectedMarker.sector}, `}
              {selectedMarker.address || 'Chandigarh'}
            </p>

            {(selectedMarker as any).distance !== undefined && (
              <p className="text-sm font-medium text-primary mb-3">
                📍 {((selectedMarker as any).distance as number).toFixed(1)} km away
                <span className="text-muted-foreground font-normal">
                  {' '}• ~{Math.ceil(((selectedMarker as any).distance as number) * 3)} min
                </span>
              </p>
            )}

            <div className="flex gap-2">
              {selectedMarker.phone && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => window.location.href = `tel:${selectedMarker.phone}`}
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Call
                </Button>
              )}
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => handleGetDirections(selectedMarker)}
              >
                <Navigation className="w-4 h-4 mr-1" />
                Directions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Banner */}
      {geoError && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-warning/10 text-warning px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{geoError}</span>
        </div>
      )}
    </div>
  );
}
