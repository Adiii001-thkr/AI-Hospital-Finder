import { useState } from 'react';
import { Sparkles, Brain, Loader2, Star, ChevronRight, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useHospitalAI } from '@/hooks/useHospitalAI';

interface Hospital {
  id: string;
  name: string;
  type: string | null;
  specialties: string[] | null;
  emergency_services: boolean | null;
  available_24x7: boolean | null;
  sector: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
}

interface AIRecommendationsProps {
  hospitals: Hospital[];
  onHospitalSelect: (hospitalName: string) => void;
}

export function AIRecommendations({ hospitals, onHospitalSelect }: AIRecommendationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [budget, setBudget] = useState<'low' | 'medium' | 'high'>('medium');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'emergency'>('medium');
  const [recommendations, setRecommendations] = useState<{
    recommendations: Array<{
      hospitalName: string;
      reason: string;
      matchScore: number;
      priorityOrder: number;
    }>;
    generalAdvice: string;
  } | null>(null);

  const { getRecommendations, loading, error } = useHospitalAI();

  const handleGetRecommendations = async () => {
    if (!symptoms.trim()) return;

    const hospitalData = hospitals.map(h => ({
      id: h.id,
      name: h.name,
      type: h.type || 'hospital',
      specialties: h.specialties || [],
      emergency_services: h.emergency_services || false,
      available_24x7: h.available_24x7 || false,
      sector: h.sector || '',
      address: h.address || '',
      latitude: h.latitude || 0,
      longitude: h.longitude || 0,
      rating: h.rating || 0,
    }));

    const result = await getRecommendations(symptoms, budget, urgency, hospitalData);
    if (result) {
      setRecommendations(result);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="border-2 border-primary/30 hover:bg-primary/5"
      >
        <Brain className="w-4 h-4 mr-2 text-primary" />
        AI Recommendations
      </Button>
    );
  }

  return (
    <Card className="border-2 border-primary/20 shadow-xl">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-primary rounded-lg">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            AI Hospital Finder
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { setIsOpen(false); setRecommendations(null); }}
          >
            Close
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Get personalized hospital recommendations based on your needs
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {!recommendations ? (
          <>
            {/* Symptoms Input */}
            <div>
              <label className="text-sm font-medium mb-1 block">What do you need help with?</label>
              <Textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe your symptoms, condition, or the type of care you need..."
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Options Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Budget
                </label>
                <Select value={budget} onValueChange={(v) => setBudget(v as typeof budget)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Government/Low Cost</SelectItem>
                    <SelectItem value="medium">Moderate</SelectItem>
                    <SelectItem value="high">Any (Including Private)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Urgency
                </label>
                <Select value={urgency} onValueChange={(v) => setUrgency(v as typeof urgency)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Routine Checkup</SelectItem>
                    <SelectItem value="medium">Within a Week</SelectItem>
                    <SelectItem value="high">Within 24 Hours</SelectItem>
                    <SelectItem value="emergency">Emergency Now</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleGetRecommendations}
              disabled={!symptoms.trim() || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finding Best Hospitals...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get AI Recommendations
                </>
              )}
            </Button>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {/* Recommendations List */}
            <div className="space-y-3">
              {recommendations.recommendations
                .sort((a, b) => a.priorityOrder - b.priorityOrder)
                .map((rec, index) => {
                  const hospital = hospitals.find(h => 
                    h.name.toLowerCase().includes(rec.hospitalName.toLowerCase()) ||
                    rec.hospitalName.toLowerCase().includes(h.name.toLowerCase())
                  );

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                        index === 0 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/30'
                      }`}
                      onClick={() => {
                        onHospitalSelect(rec.hospitalName);
                        setIsOpen(false);
                        setRecommendations(null);
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {index === 0 && (
                              <Badge className="bg-primary text-primary-foreground">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                Best Match
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {rec.matchScore}% match
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-foreground">{rec.hospitalName}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{rec.reason}</p>
                          {hospital && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              {hospital.sector && <span>Sector {hospital.sector}</span>}
                              {hospital.type && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize">{hospital.type}</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* General Advice */}
            {recommendations.generalAdvice && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 {recommendations.generalAdvice}
                </p>
              </div>
            )}

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setRecommendations(null)}
            >
              Search Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
