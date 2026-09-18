import { EMOTIONS } from "@/lib/companion/companionConfig";
import StatusBadge from "./StatusBadge";

export default function CharacterEmotionController({ emotion, capabilities, onChange }) {
  const morphs = capabilities?.morphs || {};
  const connected = !!(morphs.smile || morphs.frown);
  return (
    <div className="pt-3">
      <div className="flex items-center gap-2 mb-3 flex-wrap"><StatusBadge connected={connected}/><span className="text-xs text-slate-400">{connected ? "Blendshapes faciales conectados al modelo" : "La emoción se guarda en el estado; los blendshapes se conectarán con el modelo definitivo"}</span></div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {EMOTIONS.map((e) => <button key={e.id} type="button" onClick={()=>onChange(e.id)}
          className={`rounded-xl border px-2 py-2 text-xs flex items-center justify-center gap-1.5 transition ${emotion===e.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>
          <span aria-hidden="true">{e.icon}</span>{e.label}
        </button>)}
      </div>
    </div>
  );
}
