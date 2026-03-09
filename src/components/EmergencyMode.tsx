import { useState, useEffect } from 'react';
import { Siren, Phone, Navigation, AlertTriangle, X, Loader2, MapPin, Clock } from 'lucide-react';
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
}

interface EmergencyModeProps {
  hospitals: Hospital[];
  isOpen: boolean;
  onClose: () => void;
}

export function EmergencyMode({ hospitals, isOpen, onClose }: EmergencyModeProps) {
  const { latitude, longitude, loading: geoLoading, getLocation, calculateDistance } = useGeolocation();
  const [sortedHospitals, setSortedHospitals] = useState<(Hospital & { distance?: number })[]>([]);

  useEffect(() => {
    if (isOpen) {
      getLocation();
    }
  }, [isOpen, getLocation]);

  useEffect(() => {
    const emergencyHospitals = hospitals.filter(h => h.emergency_services);
    
    if (latitude && longitude) {
      const withDistance = emergencyHospitals
        .map(h => ({
          ...h,
          distance: h.latitude && h.longitude 
            ? calculateDistance(latitude, longitude, h.latitude, h.longitude)
            : undefined
        }))
        .sort((a, b) => (a.distance || 999) - (b.distance || 999));
      setSortedHospitals(withDistance);
    } else {
      setSortedHospitals(emergencyHospitals);
    }
  }, [hospitals, latitude, longitude, calculateDistance]);

  if (!isOpen) return null;

  const handleCall108 = () => {
    window.location.href = 'tel:108';
  };

  const handleGetDirections = (hospital: Hospital) => {
    if (hospital.latitude && hospital.longitude) {
      const url = latitude && longitude
        ? `https://www.google.com/maps/dir/${latitude},${longitude}/${hospital.latitude},${hospital.longitude}`
        : `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 animate-fade-in">
      <div className="h-full overflow-auto">
        {/* Emergency Header */}
        <div className="sticky top-0 bg-[hsl(var(--emergency))] text-white p-4 z-10">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl animate-pulse">
                  <Siren className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">EMERGENCY MODE</h1>
                  <p className="text-white/80 text-sm">Nearest emergency hospitals</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Call 108 Button */}
            <Button 
              onClick={handleCall108}
              className="w-full bg-white text-[hsl(var(--emergency))] hover:bg-white/90 h-14 text-lg font-bold"
            >
              <Phone className="w-6 h-6 mr-2" />
              CALL 108 - AMBULANCE
            </Button>

            {geoLoading && (
              <div className="flex items-center justify-center gap-2 mt-3 text-white/80">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Getting your location...</span>
              </div>
            )}
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-warning text-warning-foreground px-4 py-3">
          <div className="container mx-auto flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">
              For life-threatening emergencies, call 108 immediately. Do not delay seeking help.
            </p>
          </div>
        </div>

        {/* Emergency Hospitals List */}
        <div className="container mx-auto px-4 py-6">
          <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[hsl(var(--emergency))]" />
            {latitude && longitude 
              ? 'Nearest Emergency Hospitals'
              : 'Emergency Hospitals in Chandigarh'
            }
          </h2>

          <div className="space-y-4">
            {sortedHospitals.slice(0, 5).map((hospital, index) => (
              <Card 
                key={hospital.id} 
                className={`border-2 ${index === 0 ? 'border-[hsl(var(--emergency))] bg-[hsl(var(--emergency))]/5' : 'border-border'}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {index === 0 && (
                          <Badge className="bg-[hsl(var(--emergency))] text-white">
                            NEAREST
                          </Badge>
                        )}
                        {hospital.available_24x7 && (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            24×7
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-lg text-foreground mb-1">
                        {hospital.name}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm mb-2">
                        {hospital.sector && `Sector ${hospital.sector}, `}
                        {hospital.address || 'Chandigarh'}
                      </p>

                      {hospital.distance !== undefined && (
                        <p className="text-primary font-semibold text-sm">
                          📍 {hospital.distance.toFixed(1)} km away
                          <span className="text-muted-foreground font-normal">
                            {' '}• ~{Math.ceil(hospital.distance * 3)} min drive
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {hospital.phone && (
                        <Button 
                          size="sm"
                          className="bg-[hsl(var(--emergency))] hover:bg-[hsl(var(--emergency))]/90"
                          onClick={() => window.location.href = `tel:${hospital.phone}`}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                      )}
                      {hospital.latitude && hospital.longitude && (
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleGetDirections(hospital)}
                        >
                          <Navigation className="w-4 h-4 mr-1" />
                          Go
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {sortedHospitals.length === 0 && (
            <div className="text-center py-8">
              <Siren className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No emergency hospitals found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
