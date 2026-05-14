import { PRODUCTION_MODELS, type ProductionModel } from "./mapConfig";

export type Scores = Record<string, number>; // dimension id → 0–100

export function brandSensitivityScore(brandScores: Scores): number {
  const ids = ["archetype", "visual_codes", "heritage", "competitor_stance"];
  const vals = ids.map((id) => brandScores[id] ?? 50);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function audienceReadinessScore(audienceScores: Scores): number {
  const ids = ["ai_fluency", "channel_sensitivity", "funnel_stage", "market_variance"];
  // Readiness is the inverse of sensitivity for audience dimensions
  // High score on these dimensions = low readiness (more sensitive)
  const vals = ids.map((id) => audienceScores[id] ?? 50);
  const avgSensitivity = vals.reduce((a, b) => a + b, 0) / vals.length;
  return 100 - avgSensitivity;
}

export type QuadrantId = "no_go" | "augment" | "pilot" | "lead";

export function getQuadrant(brandSensitivity: number, audienceReadiness: number): QuadrantId {
  const highBrand = brandSensitivity >= 50;
  const highAudience = audienceReadiness >= 50;

  if (highBrand && !highAudience) return "no_go";
  if (highBrand && highAudience) return "augment";
  if (!highBrand && !highAudience) return "pilot";
  return "lead";
}

export function recommendModel(
  brandSensitivity: number,
  audienceReadiness: number
): ProductionModel {
  const q = getQuadrant(brandSensitivity, audienceReadiness);

  if (q === "no_go") return PRODUCTION_MODELS[0]; // M01 — traditional stays dominant
  if (q === "augment") {
    if (brandSensitivity >= 75) return PRODUCTION_MODELS[0]; // M01
    return PRODUCTION_MODELS[1]; // M02
  }
  if (q === "pilot") {
    if (audienceReadiness < 25) return PRODUCTION_MODELS[2]; // M03
    return PRODUCTION_MODELS[1]; // M02
  }
  // lead
  if (audienceReadiness >= 75 && brandSensitivity < 25) return PRODUCTION_MODELS[4]; // M05
  if (brandSensitivity < 35) return PRODUCTION_MODELS[3]; // M04
  return PRODUCTION_MODELS[2]; // M03
}

export type SurfaceResult = {
  surfaceId: string;
  brandSensitivity: number;
  audienceReadiness: number;
  quadrant: QuadrantId;
  model: ProductionModel;
};

export function scoreSurfaces(
  brandScores: Scores,
  surfaceAudienceScores: Record<string, Scores>
): SurfaceResult[] {
  const brand = brandSensitivityScore(brandScores);
  return Object.entries(surfaceAudienceScores).map(([surfaceId, audienceScores]) => {
    const audience = audienceReadinessScore(audienceScores);
    const quadrant = getQuadrant(brand, audience);
    const model = recommendModel(brand, audience);
    return { surfaceId, brandSensitivity: brand, audienceReadiness: audience, quadrant, model };
  });
}
