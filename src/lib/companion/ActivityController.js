export class ActivityController {
  constructor(animationController){ this.animation=animationController; }
  apply(activity,{wave}={}) {
    if(activity==="saludar"){
      const clip=this.animation.play("saludar",{idleFallback:false});
      if(clip) return {mode:"clip",clip:clip.name};
      this.animation.stop(); if(wave) wave(); return {mode:"wave"};
    }
    const clip=this.animation.play(activity);
    if(clip) return {mode:"clip",clip:clip.name};
    this.animation.stop(); return {mode:"idle"};
  }
}
