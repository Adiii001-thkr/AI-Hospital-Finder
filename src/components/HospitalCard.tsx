import { Building, MapPin, Phone, Mail, Star, FlaskConical, Siren, Clock, Globe, Navigation, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface HospitalCardProps {
  name: string;
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  specialties: string[] | null;
  type: string | null;
  rating: number | null;
  emergencyServices?: boolean;
  available24x7?: boolean;
  website?: string | null;
  sector?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  onViewDetails?: () => void;
}

export function HospitalCard({ 
  name, 
  city, 
  address, 
  phone, 
  email, 
  specialties, 
  type, 
  rating,
  emergencyServices,
  available24x7,
  website,
  sector,
  latitude,
  longitude,
  onViewDetails
}: HospitalCardProps) {
  const isLab = type === 'lab';
  const isGovernment = type === 'government';
  const isPrivate = type === 'private';
  const isTrust = type === 'trust';
  
  const getTypeColor = () => {
    if (isGovernment) return 'bg-[hsl(var(--government))]/10 text-[hsl(var(--government))]';
    if (isPrivate) return 'bg-[hsl(var(--private))]/10 text-[hsl(var(--private))]';
    if (isTrust) return 'bg-[hsl(var(--trust))]/10 text-[hsl(var(--trust))]';
    if (isLab) return 'bg-healthcare-orange/10 text-healthcare-orange';
    return 'bg-primary/10 text-primary';
  };

  const getTypeLabel = () => {
    if (isGovernment) return 'Government';
    if (isPrivate) return 'Private';
    if (isTrust) return 'Trust';
    if (isLab) return 'Diagnostic Lab';
    return 'Hospital';
  };

  const handleGetDirections = () => {
    if (latitude && longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
    } else if (address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', ' + city)}`, '_blank');
    }
  };
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-2 hover:border-primary/30 h-full flex flex-col">
      <CardContent className="p-5 flex flex-col h-full">
        {/* Header with type and status badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5">
            <Badge className={`${getTypeColor()} border-0 text-xs font-medium`}>
              {isLab ? <FlaskConical className="w-3 h-3 mr-1" /> : <Building className="w-3 h-3 mr-1" />}
              {getTypeLabel()}
            </Badge>
            {emergencyServices && (
              <Badge className="bg-[hsl(var(--emergency))]/10 text-[hsl(var(--emergency))] border-0 text-xs font-medium">
                <Siren className="w-3 h-3 mr-1" />
                Emergency
              </Badge>
            )}
            {available24x7 && (
              <Badge className="bg-[hsl(var(--available))]/10 text-[hsl(var(--available))] border-0 text-xs font-medium">
                <Clock className="w-3 h-3 mr-1" />
                24×7
              </Badge>
            )}
          </div>
          
          {rating && rating > 0 && (
            <div className="flex items-center gap-1 bg-warning/10 text-warning px-2 py-1 rounded-full shrink-0">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-semibold">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        {/* Hospital Name */}
        <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-3 line-clamp-2">
          {name}
        </h3>
        
        {/* Contact Details */}
        <div className="space-y-2 text-sm flex-1">
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              {sector && `Sector ${sector}, `}{address || city}
            </span>
          </div>
          
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Phone className="w-4 h-4 shrink-0" />
              <span>{phone}</span>
            </a>
          )}
          
          {email && (
            <a href={`mailto:${email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Mail className="w-4 h-4 shrink-0" />
              <span className="line-clamp-1">{email}</span>
            </a>
          )}

          {website && (
            <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Globe className="w-4 h-4 shrink-0" />
              <span className="line-clamp-1">Visit Website</span>
            </a>
          )}
        </div>
        
        {/* Specialties */}
        {specialties && specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-3 mt-3 border-t border-border">
            {specialties.slice(0, 3).map((specialty, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{specialties.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-border">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleGetDirections}
          >
            <Navigation className="w-4 h-4 mr-1" />
            Directions
          </Button>
          {onViewDetails && (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={onViewDetails}
            >
              <Heart className="w-4 h-4 mr-1" />
              Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
