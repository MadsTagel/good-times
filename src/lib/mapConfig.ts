export type BrandDimension = {
  id: string;
  label: string;
  description: string;
  lowLabel: string;
  highLabel: string;
};

export type AudienceDimension = {
  id: string;
  label: string;
  description: string;
  lowLabel: string;
  highLabel: string;
};

export type Surface = {
  id: string;
  label: string;
  example: string;
};

export type ProductionModel = {
  id: string;
  code: string;
  name: string;
  what: string;
  when: string;
};

export type Quadrant = {
  id: string;
  label: string;
  sublabel: string;
  color: string;
  bg: string;
  description: string;
};

export const BRAND_DIMENSIONS: BrandDimension[] = [
  {
    id: "archetype",
    label: "Brand archetype & positioning",
    description: "Does your brand sell craft, performance, or aspiration?",
    lowLabel: "Functional / commodity",
    highLabel: "Craft / signature aesthetic",
  },
  {
    id: "visual_codes",
    label: "Visual codes & signature elements",
    description: "How irreplaceable are your brand's visual signatures?",
    lowLabel: "Generic / repeatable",
    highLabel: "Deeply irreplaceable",
  },
  {
    id: "heritage",
    label: "Heritage & trust contract",
    description: "What did your audience buy into when they chose you?",
    lowLabel: "Rational / transactional",
    highLabel: "Emotional / human promise",
  },
  {
    id: "competitor_stance",
    label: "Competitor stance",
    description: "Are peers already visibly using AI in their content?",
    lowLabel: "Everyone is using AI",
    highLabel: "No-one is using AI",
  },
];

export const AUDIENCE_DIMENSIONS: AudienceDimension[] = [
  {
    id: "ai_fluency",
    label: "Audience AI fluency",
    description: "Are they noticing AI content? Do they care or punish it?",
    lowLabel: "High fluency / accepting",
    highLabel: "Low fluency / sceptical",
  },
  {
    id: "channel_sensitivity",
    label: "Channel sensitivity",
    description: "How much does this channel demand authenticity?",
    lowLabel: "Low (performance / PDP)",
    highLabel: "High (linear TV / hero)",
  },
  {
    id: "funnel_stage",
    label: "Funnel stage",
    description: "Where in the funnel does this content sit?",
    lowLabel: "Conversion / retention",
    highLabel: "Hero / brand building",
  },
  {
    id: "market_variance",
    label: "Cultural & market variance",
    description: "How much do attitudes toward AI differ across your markets?",
    lowLabel: "Uniform acceptance",
    highLabel: "High variance / sensitivity",
  },
];

export const SURFACES: Surface[] = [
  { id: "hero_tv", label: "Hero / Linear TV", example: "Brand films, launch campaigns" },
  { id: "midfunnel_social", label: "Mid-funnel Social", example: "Consideration content, reels" },
  { id: "pdp_ecom", label: "PDP / E-commerce", example: "Product imagery, configurators" },
  { id: "performance", label: "Performance / Volume", example: "Paid ads, A/B variants" },
  { id: "ooh", label: "OOH / Print", example: "Billboards, press, premium digital" },
  { id: "crm", label: "CRM / Retention", example: "Email, loyalty, personalised content" },
];

export const QUADRANTS: Quadrant[] = [
  {
    id: "no_go",
    label: "HOLD",
    sublabel: "No-go",
    color: "text-red-400",
    bg: "bg-red-950/40",
    description: "High brand sensitivity, low audience readiness. AI entry risks brand damage. Do not proceed.",
  },
  {
    id: "augment",
    label: "AUGMENT",
    sublabel: "Proceed with craft",
    color: "text-amber-400",
    bg: "bg-amber-950/40",
    description: "High brand sensitivity, high audience readiness. AI can enter but craft must lead. Augment, don't replace.",
  },
  {
    id: "pilot",
    label: "PILOT",
    sublabel: "Test & learn",
    color: "text-blue-400",
    bg: "bg-blue-950/40",
    description: "Low brand sensitivity, low audience readiness. Safe to experiment. Start with a contained pilot.",
  },
  {
    id: "lead",
    label: "LEAD",
    sublabel: "Scale now",
    color: "text-emerald-400",
    bg: "bg-emerald-950/40",
    description: "Low brand sensitivity, high audience readiness. AI fits naturally here. Move fast and scale.",
  },
];

export const PRODUCTION_MODELS: ProductionModel[] = [
  {
    id: "m01",
    code: "M01",
    name: "Traditional, AI-augmented in post",
    what: "Real shoot, real DP. AI enters downstream: retouch, environment extension, asset variants, localization, motion from stills.",
    when: "Brand where hero assets must be unmistakably crafted. AI scales and extends, not originates.",
  },
  {
    id: "m02",
    code: "M02",
    name: "Real cast, AI-built world",
    what: "Real performance, captured in studio. AI generates the surrounding world — locations, weather, light, motion.",
    when: "Brand where the human moment must feel real but the world around it needs to flex by market or season.",
  },
  {
    id: "m03",
    code: "M03",
    name: "AI generation, finished by craft",
    what: "AI generates imagery and footage. Traditional post — colour grading, sound, VFX — brings it to broadcast quality.",
    when: "Campaigns needing visual scale and variety that traditional production can't match in budget or time.",
  },
  {
    id: "m04",
    code: "M04",
    name: "Modular AI for scale",
    what: "A fixed art-direction framework with parametric AI generation and human QC. Built for SKU-level volume.",
    when: "Brands with massive SKU complexity needing visual consistency across thousands of variants.",
  },
  {
    id: "m05",
    code: "M05",
    name: "AI-first, end-to-end",
    what: "Concept to delivery entirely in AI. No traditional production.",
    when: "Low-risk channels, high-velocity needs, audiences with high AI tolerance. Almost never appropriate for hero brand-building.",
  },
];
