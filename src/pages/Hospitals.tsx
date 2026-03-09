import { useState, useEffect } from 'react';
import { Building, MapPin, Siren, Clock, Search, X, Filter, Map as MapIcon, LayoutGrid, Phone, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { HospitalCard } from '@/components/HospitalCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { EmergencyMode } from '@/components/EmergencyMode';
import { SymptomSearch } from '@/components/SymptomSearch';
import { AIRecommendations } from '@/components/AIRecommendations';
import { HospitalMap } from '@/components/HospitalMap';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Hospital {
  id: string;
  name: string;
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  specialties: string[] | null;
  type: string | null;
  rating: number | null;
  emergency_services: boolean | null;
  available_24x7: boolean | null;
  website: string | null;
  sector: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function Hospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [available24x7Only, setAvailable24x7Only] = useState(false);
  const [sectors, setSectors] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [emergencyModeOpen, setEmergencyModeOpen] = useState(false);
  const [selectedHospitalFromAI, setSelectedHospitalFromAI] = useState<string | null>(null);

  useEffect(() => {
    fetchHospitals();
  }, [searchQuery, selectedSector, selectedType, selectedSpecialty, emergencyOnly, available24x7Only]);

  const fetchHospitals = async () => {
    setLoading(true);
    
    let query = supabase
      .from('hospitals')
      .select('*')
      .eq('city', 'Chandigarh')
      .order('rating', { ascending: false, nullsFirst: false });

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,sector.ilike.%${searchQuery}%`);
    }

    if (selectedSector) {
      query = query.eq('sector', selectedSector);
    }

    if (selectedType) {
      query = query.eq('type', selectedType);
    }

    if (emergencyOnly) {
      query = query.eq('emergency_services', true);
    }

    if (available24x7Only) {
      query = query.eq('available_24x7', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching hospitals:', error);
    } else {
      let filteredData = data || [];
      
      // Filter by specialty if selected
      if (selectedSpecialty) {
        filteredData = filteredData.filter(h => 
          h.specialties?.some(s => s.toLowerCase().includes(selectedSpecialty.toLowerCase()))
        );
      }

      setHospitals(filteredData);
      
      // Extract unique sectors
      const uniqueSectors = [...new Set(data?.map(h => h.sector).filter(Boolean) as string[])].sort();
      setSectors(uniqueSectors);
      
      // Extract unique specialties
      const allSpecialties = data?.flatMap(h => h.specialties || []) || [];
      const uniqueSpecialties = [...new Set(allSpecialties)].sort();
      setSpecialties(uniqueSpecialties);
    }
    
    setLoading(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSector(null);
    setSelectedType(null);
    setSelectedSpecialty(null);
    setEmergencyOnly(false);
    setAvailable24x7Only(false);
  };

  const handleDepartmentSelect = (department: string) => {
    // Find matching specialty
    const matchingSpecialty = specialties.find(s => 
      s.toLowerCase().includes(department.toLowerCase()) ||
      department.toLowerCase().includes(s.toLowerCase())
    );
    if (matchingSpecialty) {
      setSelectedSpecialty(matchingSpecialty);
    } else {
      setSearchQuery(department);
    }
  };

  const handleHospitalSelectFromAI = (hospitalName: string) => {
    setSearchQuery(hospitalName.split(' ')[0]); // Search by first word
    setSelectedHospitalFromAI(hospitalName);
    setViewMode('grid');
  };

  const hasActiveFilters = searchQuery || selectedSector || selectedType || selectedSpecialty || emergencyOnly || available24x7Only;

  const hospitalTypes = [
    { value: 'government', label: 'Government' },
    { value: 'private', label: 'Private' },
    { value: 'trust', label: 'Trust' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Emergency Mode Overlay */}
      <EmergencyMode 
        hospitals={hospitals}
        isOpen={emergencyModeOpen}
        onClose={() => setEmergencyModeOpen(false)}
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-chandigarh py-8 md:py-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTJoLTJ2Mmgyek0yNiAzNGgtMnYtNGgydjR6bTAtNnYtMmgtMnYyaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left: Title & Search */}
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-0">
                  <MapPin className="w-3 h-3 mr-1" />
                  Chandigarh, India
                </Badge>
              </div>
              <h1 className="font-display text-2xl md:text-4xl font-bold text-white mb-2">
                AI-Powered Hospital Finder
              </h1>
              <p className="text-white/90 text-base md:text-lg max-w-xl mb-6">
                Find the right hospital fast with AI assistance. Get instant recommendations based on your symptoms.
              </p>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hospitals, areas, or specialties..."
                  className="pl-12 pr-4 py-5 text-base bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-xl"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Emergency Button */}
            <div className="lg:pt-12">
              <Button
                onClick={() => setEmergencyModeOpen(true)}
                size="lg"
                className="w-full lg:w-auto bg-[hsl(var(--emergency))] hover:bg-[hsl(var(--emergency))]/90 text-white shadow-xl h-14 px-6 text-lg font-bold animate-pulse hover:animate-none"
              >
                <Siren className="w-6 h-6 mr-2" />
                EMERGENCY
                <Phone className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-white/70 text-xs text-center lg:text-right mt-2">
                One-tap access to nearest emergency care
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Bar */}
      <section className="py-4 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SymptomSearch 
                onDepartmentSelect={handleDepartmentSelect}
                onEmergencyDetected={() => setEmergencyModeOpen(true)}
              />
            </div>
            <div className="flex-1">
              <AIRecommendations 
                hospitals={hospitals}
                onHospitalSelect={handleHospitalSelectFromAI}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-3 bg-muted/50 border-b border-border sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">Filters:</span>
              </div>

              {/* Type Filter */}
              <Select value={selectedType || 'all'} onValueChange={(v) => setSelectedType(v === 'all' ? null : v)}>
                <SelectTrigger className="w-[120px] h-8 text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {hospitalTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sector Filter */}
              <Select value={selectedSector || 'all'} onValueChange={(v) => setSelectedSector(v === 'all' ? null : v)}>
                <SelectTrigger className="w-[120px] h-8 text-sm">
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      Sector {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Specialty Filter */}
              <Select value={selectedSpecialty || 'all'} onValueChange={(v) => setSelectedSpecialty(v === 'all' ? null : v)}>
                <SelectTrigger className="w-[130px] h-8 text-sm">
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.slice(0, 20).map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Quick Filters */}
              <Button
                variant={emergencyOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEmergencyOnly(!emergencyOnly)}
                className={`h-8 ${emergencyOnly ? 'bg-[hsl(var(--emergency))] hover:bg-[hsl(var(--emergency))]/90' : ''}`}
              >
                <Siren className="w-3.5 h-3.5 mr-1" />
                Emergency
              </Button>
              <Button
                variant={available24x7Only ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAvailable24x7Only(!available24x7Only)}
                className={`h-8 ${available24x7Only ? 'bg-[hsl(var(--available))] hover:bg-[hsl(var(--available))]/90' : ''}`}
              >
                <Clock className="w-3.5 h-3.5 mr-1" />
                24×7
              </Button>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-muted-foreground">
                  <X className="w-3.5 h-3.5 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* View Toggle */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'map')}>
              <TabsList className="h-8">
                <TabsTrigger value="grid" className="px-3 text-sm">
                  <LayoutGrid className="w-4 h-4 mr-1" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="map" className="px-3 text-sm">
                  <MapIcon className="w-4 h-4 mr-1" />
                  Map
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  <Search className="w-3 h-3" />
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}
              {selectedType && (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  {selectedType}
                  <button onClick={() => setSelectedType(null)} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}
              {selectedSector && (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  Sector {selectedSector}
                  <button onClick={() => setSelectedSector(null)} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}
              {selectedSpecialty && (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  {selectedSpecialty}
                  <button onClick={() => setSelectedSpecialty(null)} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          {loading ? (
            <LoadingSpinner text="Finding hospitals..." />
          ) : hospitals.length === 0 ? (
            <EmptyState 
              type={searchQuery ? 'search' : 'hospitals'} 
              message={searchQuery ? `No hospitals found for "${searchQuery}"` : 'No hospitals found matching your filters'}
            />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Found <span className="font-semibold text-foreground">{hospitals.length}</span> hospital{hospitals.length !== 1 ? 's' : ''}
                </p>
                {viewMode === 'map' && (
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Click markers for details
                  </Badge>
                )}
              </div>

              {viewMode === 'grid' ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hospitals.map((hospital, index) => (
                    <div key={hospital.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.02}s` }}>
                      <HospitalCard
                        name={hospital.name}
                        city={hospital.city}
                        address={hospital.address}
                        phone={hospital.phone}
                        email={hospital.email}
                        specialties={hospital.specialties}
                        type={hospital.type}
                        rating={hospital.rating}
                        emergencyServices={hospital.emergency_services || false}
                        available24x7={hospital.available_24x7 || false}
                        website={hospital.website}
                        sector={hospital.sector}
                        latitude={hospital.latitude}
                        longitude={hospital.longitude}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <HospitalMap 
                  hospitals={hospitals}
                  selectedHospital={selectedHospitalFromAI}
                  onHospitalSelect={(h) => setSelectedHospitalFromAI(h.name)}
                />
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
