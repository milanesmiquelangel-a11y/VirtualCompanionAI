import { SCENES } from "@/lib/companion/companionConfig";
export default function SceneManager({ scene, onChange }) {
  return <div className="pt-3">
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">{SCENES.map((s)=><button key={s.id} type="button" onClick={()=>onChange(s.id)}
      className={`rounded-xl border px-2 py-2 text-xs transition ${scene===s.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>{s.label}</button>)}</div>
    <p className="mt-3 text-xs text-slate-400">Cambiar de escenario solo altera el entorno: el personaje y su estado se conservan. Cada escenario incluye mobiliario 3D propio.</p>
  </div>;
}
