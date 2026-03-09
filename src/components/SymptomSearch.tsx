import { useState } from 'react';
import { Search, Sparkles, AlertTriangle, Loader2, Stethoscope, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHospitalAI } from '@/hooks/useHospitalAI';

interface SymptomSearchProps {
  onDepartmentSelect: (department: string) => void;
  onEmergencyDetected: () => void;
}

export function SymptomSearch({ onDepartmentSelect, onEmergencyDetected }: SymptomSearchProps) {
  const [symptoms, setSymptoms] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState<{
    suggestedDepartments: string[];
    urgencyLevel: string;
    briefAdvice: string;
    warningSign: boolean;
    immediateAction?: string;
  } | null>(null);

  const { analyzeSymptoms, loading, error } = useHospitalAI();

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;

    const result = await analyzeSymptoms(symptoms);
    if (result) {
      setAnalysis(result);
      if (result.urgencyLevel === 'emergency') {
        onEmergencyDetected();
      }
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'emergency': return 'bg-[hsl(var(--emergency))] text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-warning text-warning-foreground';
      default: return 'bg-[hsl(var(--available))] text-white';
    }
  };

  const getUrgencyLabel = (level: string) => {
    switch (level) {
      case 'emergency': return 'EMERGENCY - Seek immediate care';
      case 'high': return 'High Priority - See a doctor soon';
      case 'medium': return 'Moderate - Schedule an appointment';
      default: return 'Low - Routine checkup';
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-primary to-[hsl(var(--healthcare-blue))] hover:opacity-90 text-white shadow-lg"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        AI Symptom Search
      </Button>
    );
  }

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            AI Symptom Analyzer
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => { setIsOpen(false); setAnalysis(null); }}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Describe your symptoms and our AI will suggest the right department
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g., I have a headache, fever, and sore throat since yesterday..."
            className="min-h-[100px] pr-4 resize-none"
            disabled={loading}
          />
        </div>

        <Button 
          onClick={handleAnalyze} 
          disabled={!symptoms.trim() || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Analyze Symptoms
            </>
          )}
        </Button>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            {error}
          </div>
        )}

        {analysis && (
          <div className="space-y-4 pt-2 border-t">
            {/* Urgency Level */}
            <div className={`p-3 rounded-lg ${getUrgencyColor(analysis.urgencyLevel)}`}>
              <div className="flex items-center gap-2">
                {analysis.urgencyLevel === 'emergency' && <AlertTriangle className="w-5 h-5" />}
                <span className="font-semibold">{getUrgencyLabel(analysis.urgencyLevel)}</span>
              </div>
              {analysis.immediateAction && (
                <p className="mt-1 text-sm opacity-90">{analysis.immediateAction}</p>
              )}
            </div>

            {/* Warning Sign */}
            {analysis.warningSign && analysis.urgencyLevel !== 'emergency' && (
              <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg text-warning">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">Warning signs detected. Monitor closely.</span>
              </div>
            )}

            {/* Suggested Departments */}
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Suggested Departments</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.suggestedDepartments.map((dept, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onDepartmentSelect(dept);
                      setIsOpen(false);
                      setAnalysis(null);
                    }}
                    className="group"
                  >
                    {dept}
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Advice */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{analysis.briefAdvice}</p>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              ⚕️ This is not a medical diagnosis. Please consult a healthcare professional.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
