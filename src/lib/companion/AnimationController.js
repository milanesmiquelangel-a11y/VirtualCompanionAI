import * as THREE from "three";
import { ACTIVITY_CLIP_KEYWORDS } from "./companionConfig";
export class AnimationController {
  constructor(model,clips=[]){this.clips=clips;this.mixer=clips.length?new THREE.AnimationMixer(model):null;this.currentActivity=null;}
  findClip(activity,{idleFallback=true}={}) {
    const keywords=ACTIVITY_CLIP_KEYWORDS[activity]||[],names=this.clips.map(c=>(c.name||"").toLowerCase());
    let idx=names.findIndex(n=>keywords.some(k=>n.includes(k)));
    if(idx===-1&&idleFallback) idx=names.findIndex(n=>n.includes("idle"));
    return idx===-1?null:this.clips[idx];
  }
  play(activity,{idleFallback=true}={}) {
    if(!this.mixer)return null; this.mixer.stopAllAction();
    const clip=this.findClip(activity,{idleFallback}); if(!clip){this.currentActivity=null;return null;}
    this.mixer.clipAction(clip).reset().play();this.currentActivity=activity;return clip;
  }
  stop(){if(this.mixer)this.mixer.stopAllAction();this.currentActivity=null;}
  update(delta){if(this.mixer)this.mixer.update(delta);}
  get playing(){return this.currentActivity!==null;}
}
