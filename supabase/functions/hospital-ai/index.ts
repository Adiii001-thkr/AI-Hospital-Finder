import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

interface AIRequest {
  type: "symptom_analysis" | "hospital_recommendation" | "emergency_triage";
  symptoms?: string;
  budget?: "low" | "medium" | "high";
  urgency?: "low" | "medium" | "high" | "emergency";
  userLocation?: { lat: number; lng: number };
  hospitals: HospitalData[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, symptoms, budget, urgency, userLocation, hospitals }: AIRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "symptom_analysis") {
      systemPrompt = `You are a medical AI assistant for a hospital finder app in Chandigarh, India. 
Your job is to analyze symptoms and suggest appropriate medical departments and urgency levels.

IMPORTANT: You are NOT providing medical diagnosis. You are only helping users find the right department.

Always respond in this exact JSON format:
{
  "suggestedDepartments": ["department1", "department2"],
  "urgencyLevel": "low" | "medium" | "high" | "emergency",
  "briefAdvice": "short advice text",
  "warningSign": true | false,
  "immediateAction": "if emergency, what to do immediately"
}`;

      userPrompt = `Patient describes: "${symptoms}"

Analyze and provide department recommendations. Be conservative with urgency - if symptoms could indicate something serious, mark urgency higher.`;

    } else if (type === "hospital_recommendation") {
      const hospitalList = hospitals.map(h => ({
        name: h.name,
        type: h.type,
        specialties: h.specialties,
        emergency: h.emergency_services,
        "24x7": h.available_24x7,
        sector: h.sector,
        rating: h.rating
      }));

      systemPrompt = `You are a hospital recommendation AI for Chandigarh, India.
Based on symptoms, budget, and urgency, recommend the best hospitals from the available list.

Budget guide:
- low: Prefer government hospitals
- medium: Government or trust hospitals
- high: Any including private hospitals

Respond in this exact JSON format:
{
  "recommendations": [
    {
      "hospitalName": "exact name from list",
      "reason": "why this hospital",
      "matchScore": 1-100,
      "priorityOrder": 1-5
    }
  ],
  "generalAdvice": "any relevant advice"
}`;

      userPrompt = `Patient symptoms: "${symptoms || 'general checkup'}"
Budget preference: ${budget || 'any'}
Urgency: ${urgency || 'medium'}

Available hospitals:
${JSON.stringify(hospitalList, null, 2)}

Recommend top 3-5 hospitals.`;

    } else if (type === "emergency_triage") {
      systemPrompt = `You are an emergency medical triage AI assistant.
Analyze the emergency situation and provide:
1. Immediate steps to take
2. What type of emergency care is needed
3. Critical warning signs

IMPORTANT: Always advise calling emergency services (108) for serious situations.

Respond in this exact JSON format:
{
  "severity": "critical" | "serious" | "moderate",
  "immediateSteps": ["step1", "step2"],
  "requiredCare": ["emergency", "ICU", "trauma", etc],
  "callEmergency": true | false,
  "timeframe": "immediate" | "within 1 hour" | "within 24 hours"
}`;

      userPrompt = `Emergency situation: "${symptoms}"

Provide triage guidance.`;
    }

    console.log("Making AI request for type:", type);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    console.log("AI Response received:", aiContent?.substring(0, 200));

    // Parse JSON from AI response
    let parsedResponse;
    try {
      // Extract JSON from response (may be wrapped in markdown)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = JSON.parse(aiContent);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      parsedResponse = { rawResponse: aiContent };
    }

    return new Response(
      JSON.stringify({ success: true, data: parsedResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Hospital AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
