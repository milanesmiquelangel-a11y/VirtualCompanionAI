import { COLOR_PALETTES } from "@/lib/companion/companionConfig";

// Preparado para el modelo definitivo (se conectará vía morph targets/huesos).
const PREPARED_FEATURES = [
  "Altura","Complexión","Cintura","Caderas","Piernas","Rostro","Ojos","Expresiones faciales","Poses",
];

export default function CharacterAppearance({ appearance, onChange }) {
  return (
    <div className="pt-3 space-y-4">
      {COLOR_PALETTES.map((group) => (
        <div key={group.key} className="flex items-center gap-3">
          <span className="w-16 shrink-0 text-xs text-slate-500">{group.label}</span>
          <div className="flex flex-wrap gap-2">
            {group.options.map((opt) => {
              const active = appearance[group.key] === opt.value;
              return (
                <button key={opt.label} type="button" title={opt.label} aria-label={opt.label} aria-pressed={active}
                  onClick={() => onChange(group.key, opt.value)}
                  className={`h-7 w-7 rounded-full border transition flex items-center justify-center ${active ? "border-slate-900 ring-2 ring-slate-900/25 scale-110" : "border-slate-200 hover:border-slate-400"}`}>
                  <span className="h-5 w-5 rounded-full" style={{ background: opt.value ? opt.value : opt.css }} />
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div>
        <h3 className="text-xs font-semibold text-slate-700 mb-2">Preparado para el modelo definitivo</h3>
        <div className="flex flex-wrap gap-1.5">
          {PREPARED_FEATURES.map((f) => <span key={f} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />{f}</span>)}
        </div>
        <p className="mt-2 text-xs text-slate-400">Se conectarán vía morph targets y huesos cuando el GLB definitivo los incluya. El color de cabello ya se aplica en vivo sobre el modelo actual.</p>
      </div>
    </div>
  );
}
