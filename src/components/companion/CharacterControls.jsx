import CharacterAppearance from "./CharacterAppearance";
import CharacterWardrobe from "./CharacterWardrobe";
import CharacterActivityController from "./CharacterActivityController";
import CharacterEmotionController from "./CharacterEmotionController";
import SceneManager from "./SceneManager";

export default function CharacterControls({ state, capabilities, onAppearance, onWardrobeSlot, onEmotion, onActivity, onScene, onExport }) {
  const tabs = [["appearance","Apariencia"],["wardrobe","Vestuario"],["activity","Actividades"],["emotion","Emociones"],["scene","Escenas"]];
  return <div className="rounded-3xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm">
    <div className="flex flex-wrap gap-2 mb-4">{tabs.map(([id,label]) => <a key={id} href={`#companion-${id}`} className="rounded-xl border border-slate-200 px-3 py-2 text-xs hover:border-slate-400">{label}</a>)}</div>
    <div id="companion-appearance" className="mb-6"><h3 className="font-semibold mb-2">Apariencia</h3><CharacterAppearance appearance={state.appearance} onChange={onAppearance}/></div>
    <div id="companion-wardrobe" className="mb-6"><h3 className="font-semibold mb-2">Vestuario</h3><CharacterWardrobe wardrobe={state.wardrobe} capabilities={capabilities} onChange={onWardrobeSlot}/></div>
    <div id="companion-activity" className="mb-6"><h3 className="font-semibold mb-2">Actividades</h3><CharacterActivityController activity={state.activity} capabilities={capabilities} onChange={onActivity}/></div>
    <div id="companion-emotion" className="mb-6"><h3 className="font-semibold mb-2">Emociones</h3><CharacterEmotionController emotion={state.emotion} capabilities={capabilities} onChange={onEmotion}/></div>
    <div id="companion-scene" className="mb-4"><h3 className="font-semibold mb-2">Escenas</h3><SceneManager scene={state.scene} onChange={onScene}/></div>
    <div className="pt-3 border-t border-slate-100 flex items-center gap-2"><span className="text-xs text-slate-500 mr-auto">Exportar modelo actual</span><button className="rounded-xl border px-3 py-2 text-sm" onClick={()=>onExport("glb")}>GLB</button><button className="rounded-xl border px-3 py-2 text-sm" onClick={()=>onExport("gltf")}>GLTF</button></div>
  </div>;
}
