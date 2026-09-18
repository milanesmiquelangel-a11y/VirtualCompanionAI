import { ACTIVITIES } from "@/lib/companion/companionConfig";
import StatusBadge from "./StatusBadge";

/**
 * CharacterActivityController — selección de actividades del Companion.
 * Cada actividad reproduce su animación del GLB; si el clip no existe,
 * se usa animación idle como fallback (sin errores).
 */
export default function CharacterActivityController({ activity, capabilities, onChange }) {
  const clips = capabilities?.clips || [];
  const hasClips = clips.length > 0;
  return (
    <div className="pt-3">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <StatusBadge connected={hasClips} />
        <span className="text-xs text-slate-400">
          {hasClips
            ? `${clips.length} animaciones detectadas en el GLB`
            : "Sin clips GLB: se usa animación idle procedural como fallback"}
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {ACTIVITIES.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onChange(a.id)}
            className={`rounded-xl border px-2 py-2 text-xs transition ${
              activity === a.id
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 text-slate-600 hover:border-slate-400"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
