import { Switch } from "@/components/ui/switch";
import { WARDROBE_SLOTS, WARDROBE_COLORS } from "@/lib/companion/companionConfig";
import StatusBadge from "./StatusBadge";

export default function CharacterWardrobe({ wardrobe, capabilities, onChange }) {
  const caps = capabilities?.wardrobe || {};
  return (
    <div className="pt-3 space-y-3">
      {WARDROBE_SLOTS.map((slot) => {
        const state = wardrobe[slot.id] || { equipped: true, color: null };
        const connected = !!caps[slot.id];
        return <div key={slot.id} className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-600 w-24 shrink-0">{slot.label}</span><StatusBadge connected={connected}/>
          <div className="flex gap-1.5 ml-auto">{WARDROBE_COLORS.map((c) => <button key={c} type="button" aria-label={`Color ${slot.label}`} disabled={!connected || !state.equipped} onClick={()=>onChange(slot.id,{color:state.color===c?null:c})}
            className={`h-5 w-5 rounded-full border disabled:opacity-40 ${state.color===c ? "border-slate-900 ring-2 ring-slate-900/30" : "border-slate-200"}`} style={{backgroundColor:c}} />)}</div>
          <Switch checked={state.equipped} disabled={!connected} onCheckedChange={(v)=>onChange(slot.id,{equipped:v})}/>
        </div>;
      })}
      <p className="text-xs text-slate-400">La ropa se intercambia en vivo sin reconstruir la escena. El personaje permanece siempre vestido.</p>
    </div>
  );
}
