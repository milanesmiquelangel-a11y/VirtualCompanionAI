import { useCallback,useEffect,useRef,useState } from "react";
const defaultWardrobe=()=>({top:{equipped:true,color:null},pants:{equipped:true,color:null},dress:{equipped:true,color:null},sport:{equipped:false,color:null},formal:{equipped:false,color:null},shoes:{equipped:true,color:null},accessories:{equipped:true,color:null}});
const defaultAppearance=()=>({hairColor:null,topColor:null,bottomColor:null});
const defaultState=()=>({characterId:"female",appearance:defaultAppearance(),wardrobe:defaultWardrobe(),emotion:"CALM",activity:"idle",scene:"sala"});
const LOCAL_KEY_PREFIX="virtual_companion_state_v2:";
function getDeviceKey(){if(typeof window==="undefined")return"server";const key="virtual_companion_device_id";let value=window.localStorage.getItem(key);if(!value){value=typeof crypto!=="undefined"&&crypto.randomUUID?crypto.randomUUID():`device-${Date.now()}-${Math.random().toString(36).slice(2)}`;window.localStorage.setItem(key,value);}return value;}
function mergeState(raw){const base=defaultState(),wardrobe={...base.wardrobe,...(raw?.wardrobe||{})};Object.keys(wardrobe).forEach(slot=>{wardrobe[slot]={...base.wardrobe[slot],...(wardrobe[slot]||{})};});return{characterId:raw?.characterId==="male"?"male":base.characterId,appearance:{...base.appearance,...(raw?.appearance||{})},wardrobe,emotion:raw?.emotion||base.emotion,activity:raw?.activity||base.activity,scene:raw?.scene||base.scene};}
export function useCompanionState(){
 const[state,setState]=useState(defaultState),[loaded,setLoaded]=useState(false),loadedRef=useRef(false),latestRef=useRef(state),timerRef=useRef(null),deviceKeyRef=useRef(null);
 useEffect(()=>{let cancelled=false;(async()=>{deviceKeyRef.current=getDeviceKey();const localKey=LOCAL_KEY_PREFIX+deviceKeyRef.current;try{const local=window.localStorage.getItem(localKey);if(local&&!cancelled){const restored=mergeState(JSON.parse(local));latestRef.current=restored;setState(restored);}}catch(e){console.warn("CompanionState: estado local no disponible",e);}if(!cancelled){loadedRef.current=true;setLoaded(true);}})();return()=>{cancelled=true;if(timerRef.current)clearTimeout(timerRef.current);};},[]);
 const scheduleSave=useCallback(()=>{if(!loadedRef.current)return;if(timerRef.current)clearTimeout(timerRef.current);timerRef.current=setTimeout(async()=>{const s=latestRef.current,payload={characterId:s.characterId,appearance:s.appearance,wardrobe:s.wardrobe,emotion:s.emotion,activity:s.activity,scene:s.scene,anonymous_device_id:deviceKeyRef.current||getDeviceKey()},localKey=LOCAL_KEY_PREFIX+payload.anonymous_device_id;try{window.localStorage.setItem(localKey,JSON.stringify(s));}catch(e){console.warn("CompanionState: no se pudo guardar localmente",e);}},600);},[]);
 const update=useCallback((patchFn)=>{setState(prev=>{const next=patchFn(prev);latestRef.current=next;return next;});scheduleSave();},[scheduleSave]);
 const setCharacterId=useCallback(id=>update(p=>({...p,characterId:id==="male"?"male":"female"})),[update]);
 const setAppearance=useCallback((key,value)=>update(p=>({...p,appearance:{...p.appearance,[key]:value}})),[update]);
 const setWardrobeSlot=useCallback((slot,patch)=>update(p=>({...p,wardrobe:{...p.wardrobe,[slot]:{...(p.wardrobe[slot]||{equipped:true,color:null}),...patch}}}),[update]);
 const setEmotion=useCallback(emotion=>update(p=>({...p,emotion})),[update]);
 const setActivity=useCallback(activity=>update(p=>({...p,activity})),[update]);
 const setScene=useCallback(scene=>update(p=>({...p,scene})),[update]);
 return{state,loaded,setCharacterId,setAppearance,setWardrobeSlot,setEmotion,setActivity,setScene};
}