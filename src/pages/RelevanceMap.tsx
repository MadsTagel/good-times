import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BRAND_DIMENSIONS,
  AUDIENCE_DIMENSIONS,
  SURFACES,
  QUADRANTS,
  PRODUCTION_MODELS,
} from "@/lib/mapConfig";
import { scoreSurfaces, type SurfaceResult, type Scores } from "@/lib/scoring";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";

type Step = "brand" | "surfaces" | "audience" | "map";

const QUADRANT_COLORS: Record<string, string> = {
  no_go: "#f87171",
  augment: "#fbbf24",
  pilot: "#60a5fa",
  lead: "#34d399",
};

function SliderRow({
  label,
  description,
  lowLabel,
  highLabel,
  value,
  onChange,
}: {
  label: string;
  description: string;
  lowLabel: string;
  highLabel: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="font-semibold text-white text-sm">{label}</p>
        <p className="text-xs text-white/50">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/40 w-32 text-right shrink-0">{lowLabel}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-white h-1 cursor-pointer"
        />
        <span className="text-xs text-white/40 w-32 shrink-0">{highLabel}</span>
      </div>
      <div className="text-right text-xs text-white/30">{value}</div>
    </div>
  );
}

function StepBrand({
  scores,
  onChange,
  onNext,
}: {
  scores: Scores;
  onChange: (id: string, v: number) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold tracking-widest text-white/40 uppercase mb-1">Step 1 of 3</p>
        <h2 className="text-2xl font-black text-white">Brand equity sensitivity</h2>
        <p className="text-white/50 text-sm mt-1">
          Rate how much of your brand's value lives in things AI cannot or should not replicate.
        </p>
      </div>
      <div className="space-y-6">
        {BRAND_DIMENSIONS.map((d) => (
          <SliderRow
            key={d.id}
            label={d.label}
            description={d.description}
            lowLabel={d.lowLabel}
            highLabel={d.highLabel}
            value={scores[d.id] ?? 50}
            onChange={(v) => onChange(d.id, v)}
          />
        ))}
      </div>
      <button
        onClick={onNext}
        className="w-full h-12 rounded-full bg-white text-gray-900 font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
      >
        Next <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function StepSurfaces({
  selected,
  onToggle,
  onNext,
  onBack,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold tracking-widest text-white/40 uppercase mb-1">Step 2 of 3</p>
        <h2 className="text-2xl font-black text-white">Content surfaces</h2>
        <p className="text-white/50 text-sm mt-1">
          Select the surfaces you want to map. You'll rate audience readiness for each.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {SURFACES.map((s) => {
          const active = selected.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => onToggle(s.id)}
              className={`text-left px-4 py-3 rounded-xl border transition-all ${
                active
                  ? "border-white bg-white/10 text-white"
                  : "border-white/20 text-white/50 hover:border-white/40"
              }`}
            >
              <p className="font-semibold text-sm">{s.label}</p>
              <p className="text-xs mt-0.5 opacity-60">{s.example}</p>
            </button>
          );
        })}
      </div>
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="h-12 px-5 rounded-full border-2 border-white/25 text-white font-bold flex items-center gap-2 hover:border-white/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onNext}
          disabled={selected.length === 0}
          className="flex-1 h-12 rounded-full bg-white text-gray-900 font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function StepAudience({
  surfaces,
  scores,
  onChange,
  onNext,
  onBack,
}: {
  surfaces: string[];
  scores: Record<string, Scores>;
  onChange: (surfaceId: string, dimId: string, v: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [activeSurface, setActiveSurface] = useState(surfaces[0]);
  const surface = SURFACES.find((s) => s.id === activeSurface)!;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold tracking-widest text-white/40 uppercase mb-1">Step 3 of 3</p>
        <h2 className="text-2xl font-black text-white">Audience & funnel readiness</h2>
        <p className="text-white/50 text-sm mt-1">Rate each surface independently.</p>
      </div>

      {surfaces.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {surfaces.map((sid) => {
            const s = SURFACES.find((x) => x.id === sid)!;
            return (
              <button
                key={sid}
                onClick={() => setActiveSurface(sid)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeSurface === sid
                    ? "bg-white text-gray-900"
                    : "border border-white/25 text-white/60 hover:border-white/50"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="space-y-6">
        <p className="text-sm font-bold text-white/70 uppercase tracking-widest">{surface.label}</p>
        {AUDIENCE_DIMENSIONS.map((d) => (
          <SliderRow
            key={d.id}
            label={d.label}
            description={d.description}
            lowLabel={d.lowLabel}
            highLabel={d.highLabel}
            value={scores[activeSurface]?.[d.id] ?? 50}
            onChange={(v) => onChange(activeSurface, d.id, v)}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="h-12 px-5 rounded-full border-2 border-white/25 text-white font-bold flex items-center gap-2 hover:border-white/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onNext}
          className="flex-1 h-12 rounded-full bg-white text-gray-900 font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
        >
          View map <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

type CustomDotProps = {
  cx?: number;
  cy?: number;
  payload?: SurfaceResult & { surfaceLabel: string };
};

function CustomDot({ cx = 0, cy = 0, payload }: CustomDotProps) {
  if (!payload) return null;
  const color = QUADRANT_COLORS[payload.quadrant];
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill={color} fillOpacity={0.25} stroke={color} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={4} fill={color} />
    </g>
  );
}

type CustomTooltipProps = {
  active?: boolean;
  payload?: { payload: SurfaceResult & { surfaceLabel: string } }[];
};

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const q = QUADRANTS.find((q) => q.id === d.quadrant)!;
  return (
    <div className="bg-gray-900 border border-white/20 rounded-lg p-3 text-xs max-w-xs">
      <p className="font-bold text-white mb-1">{d.surfaceLabel}</p>
      <p className={`font-semibold mb-1 ${q.color}`}>{q.label} — {q.sublabel}</p>
      <p className="text-white/50">{q.description}</p>
      <p className="text-white/40 mt-2">
        Brand sensitivity: {Math.round(d.brandSensitivity)} · Audience readiness: {Math.round(d.audienceReadiness)}
      </p>
    </div>
  );
}

function StepMap({
  results,
  onReset,
}: {
  results: SurfaceResult[];
  onReset: () => void;
}) {
  const navigate = useNavigate();

  const chartData = results.map((r) => ({
    ...r,
    surfaceLabel: SURFACES.find((s) => s.id === r.surfaceId)?.label ?? r.surfaceId,
    x: r.audienceReadiness,
    y: r.brandSensitivity,
  }));

  const uniqueModels = useMemo(() => {
    const seen = new Set<string>();
    const out: typeof PRODUCTION_MODELS = [];
    for (const r of results) {
      if (!seen.has(r.model.id)) {
        seen.add(r.model.id);
        out.push(r.model);
      }
    }
    return out;
  }, [results]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Your relevance map</h2>
          <p className="text-white/50 text-sm mt-1">Where AI fits — and where it doesn't.</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Quadrant legend */}
      <div className="grid grid-cols-2 gap-2">
        {QUADRANTS.map((q) => (
          <div key={q.id} className={`rounded-lg p-2.5 ${q.bg} border border-white/5`}>
            <p className={`text-xs font-bold ${q.color}`}>{q.label}</p>
            <p className="text-xs text-white/40">{q.sublabel}</p>
          </div>
        ))}
      </div>

      {/* Scatter plot */}
      <div className="rounded-xl border border-white/10 bg-white/3 p-4">
        <div className="flex justify-between text-xs text-white/30 mb-1 px-1">
          <span></span>
          <span>← Audience Readiness →</span>
          <span></span>
        </div>
        <div className="relative">
          {/* Quadrant bg overlays */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 rounded pointer-events-none" style={{ left: 40, right: 8, top: 4, bottom: 28 }}>
            <div className="bg-red-950/30 border-r border-b border-white/5" />
            <div className="bg-amber-950/20 border-b border-white/5" />
            <div className="bg-blue-950/20 border-r border-white/5" />
            <div className="bg-emerald-950/20" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                type="number"
                dataKey="x"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
                label={{ value: "Low ←  → High", position: "insideBottom", offset: -2, fontSize: 9, fill: "rgba(255,255,255,0.2)" }}
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
                label={{ value: "Brand sensitivity", angle: -90, position: "insideLeft", offset: 12, fontSize: 9, fill: "rgba(255,255,255,0.2)" }}
              />
              <ReferenceLine x={50} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
              <ReferenceLine y={50} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.2)" }} />
              <Scatter data={chartData} shape={<CustomDot />}>
                {chartData.map((d) => (
                  <Cell key={d.surfaceId} fill={QUADRANT_COLORS[d.quadrant]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-surface results */}
      <div className="space-y-3">
        <p className="text-xs font-bold tracking-widest text-white/40 uppercase">Surface breakdown</p>
        {results.map((r) => {
          const surface = SURFACES.find((s) => s.id === r.surfaceId)!;
          const q = QUADRANTS.find((q) => q.id === r.quadrant)!;
          return (
            <div key={r.surfaceId} className="rounded-xl border border-white/10 bg-white/3 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-white text-sm">{surface.label}</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${q.bg} ${q.color}`}>
                  {q.label}
                </span>
              </div>
              <p className="text-xs text-white/40 mb-3">{q.description}</p>
              <div className="border-t border-white/10 pt-3">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Recommended model</p>
                <p className="text-sm font-semibold text-white">
                  {r.model.code} — {r.model.name}
                </p>
                <p className="text-xs text-white/50 mt-1">{r.model.when}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model reference */}
      {uniqueModels.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold tracking-widest text-white/40 uppercase">Production models referenced</p>
          {uniqueModels.map((m) => (
            <div key={m.id} className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-1">
              <p className="text-xs font-bold text-white/40">{m.code}</p>
              <p className="font-semibold text-white text-sm">{m.name}</p>
              <p className="text-xs text-white/50">{m.what}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onReset}
          className="flex-1 h-12 rounded-full border-2 border-white/25 text-white font-bold flex items-center justify-center gap-2 hover:border-white/50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Start over
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex-1 h-12 rounded-full bg-white text-gray-900 font-bold flex items-center justify-center hover:bg-white/90 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default function RelevanceMap() {
  const [step, setStep] = useState<Step>("brand");
  const [brandScores, setBrandScores] = useState<Scores>({});
  const [selectedSurfaces, setSelectedSurfaces] = useState<string[]>([]);
  const [audienceScores, setAudienceScores] = useState<Record<string, Scores>>({});

  const results = useMemo(() => {
    if (step !== "map") return [];
    return scoreSurfaces(brandScores, audienceScores);
  }, [step, brandScores, audienceScores]);

  function toggleSurface(id: string) {
    setSelectedSurfaces((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function setAudienceDim(surfaceId: string, dimId: string, v: number) {
    setAudienceScores((prev) => ({
      ...prev,
      [surfaceId]: { ...(prev[surfaceId] ?? {}), [dimId]: v },
    }));
  }

  function reset() {
    setBrandScores({});
    setSelectedSurfaces([]);
    setAudienceScores({});
    setStep("brand");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 border-b border-white/10">
        <p className="text-xs font-bold tracking-widest text-white/40 uppercase">Accenture Song</p>
        <h1 className="text-xl font-black text-white tracking-tight">AI Relevance / Readiness Map</h1>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/10">
        <div
          className="h-full bg-white transition-all duration-500"
          style={{
            width:
              step === "brand" ? "25%" :
              step === "surfaces" ? "50%" :
              step === "audience" ? "75%" : "100%",
          }}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 max-w-2xl w-full mx-auto">
        {step === "brand" && (
          <StepBrand
            scores={brandScores}
            onChange={(id, v) => setBrandScores((p) => ({ ...p, [id]: v }))}
            onNext={() => setStep("surfaces")}
          />
        )}
        {step === "surfaces" && (
          <StepSurfaces
            selected={selectedSurfaces}
            onToggle={toggleSurface}
            onNext={() => setStep("audience")}
            onBack={() => setStep("brand")}
          />
        )}
        {step === "audience" && (
          <StepAudience
            surfaces={selectedSurfaces}
            scores={audienceScores}
            onChange={setAudienceDim}
            onNext={() => setStep("map")}
            onBack={() => setStep("surfaces")}
          />
        )}
        {step === "map" && (
          <StepMap results={results} onReset={reset} />
        )}
      </div>
    </div>
  );
}
