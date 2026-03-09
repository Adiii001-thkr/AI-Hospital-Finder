import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HospitalData {
  id: string;
  name: string;
  type: string;
  specialties: string[];
  emergency_services: boolean;
  available_24x7: boolean;
  sector: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
}

interface SymptomAnalysis {
  suggestedDepartments: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  briefAdvice: string;
  warningSign: boolean;
  immediateAction?: string;
}

interface HospitalRecommendation {
  recommendations: Array<{
    hospitalName: string;
    reason: string;
    matchScore: number;
    priorityOrder: number;
  }>;
  generalAdvice: string;
}

interface EmergencyTriage {
  severity: 'critical' | 'serious' | 'moderate';
  immediateSteps: string[];
  requiredCare: string[];
  callEmergency: boolean;
  timeframe: string;
}

export function useHospitalAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeSymptoms = async (symptoms: string): Promise<SymptomAnalysis | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('hospital-ai', {
        body: { type: 'symptom_analysis', symptoms, hospitals: [] }
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || 'Analysis failed');
      
      return data.data as SymptomAnalysis;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze symptoms';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async (
    symptoms: string,
    budget: 'low' | 'medium' | 'high',
    urgency: 'low' | 'medium' | 'high' | 'emergency',
    hospitals: HospitalData[]
  ): Promise<HospitalRecommendation | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('hospital-ai', {
        body: { type: 'hospital_recommendation', symptoms, budget, urgency, hospitals }
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || 'Recommendation failed');

      return data.data as HospitalRecommendation;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get recommendations';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const emergencyTriage = async (symptoms: string): Promise<EmergencyTriage | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('hospital-ai', {
        body: { type: 'emergency_triage', symptoms, hospitals: [] }
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || 'Triage failed');

      return data.data as EmergencyTriage;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to assess emergency';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { analyzeSymptoms, getRecommendations, emergencyTriage, loading, error };
}
