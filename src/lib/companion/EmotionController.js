const MANAGED_MORPHS=["mouthsmile","mouthfrown","browinnerup","jawopen","eyesquint","tongue"];
export function findMorph(dict,candidates){
  if(!dict)return null;
  for(const [name,index] of Object.entries(dict)){const lower=name.toLowerCase();if(candidates.some(c=>lower.includes(c)))return{name,index};}
  return null;
}
const EMOTION_TARGETS={
  CALM:[],HAPPY:[{candidates:["mouthsmile"],value:.75}],
  SAD:[{candidates:["mouthfrown"],value:.7},{candidates:["browinnerup"],value:.5}],
  EXCITED:[{candidates:["mouthsmile"],value:.95},{candidates:["jawopen"],value:.25},{candidates:["browinnerup"],value:.4}],
  PLAYFUL:[{candidates:["mouthsmile"],value:.55},{candidates:["eyesquint"],value:.5},{candidates:["tongue"],value:.6}]
};
export class EmotionController{
  constructor(meshes=[]){this.meshes=meshes;}
  setEmotion(emotion){const defs=EMOTION_TARGETS[emotion]||[];this.meshes.forEach(mesh=>{const dict=mesh.morphTargetDictionary;if(!dict)return;const targets=new Map();defs.forEach(({candidates,value})=>{const m=findMorph(dict,candidates);if(m)targets.set(m.name,value);});mesh.userData._emotionTargets=targets;});}
  update(delta){const k=Math.min(1,delta*6);this.meshes.forEach(mesh=>{const dict=mesh.morphTargetDictionary,influences=mesh.morphTargetInfluences,targets=mesh.userData._emotionTargets;if(!dict||!influences)return;for(const [name,index] of Object.entries(dict)){const lower=name.toLowerCase();if(!MANAGED_MORPHS.some(m=>lower.includes(m)))continue;const target=targets?(targets.get(name)??0):0;influences[index]+=(target-influences[index])*k;}});}
}
