import {forwardRef,useEffect,useImperativeHandle,useRef} from "react";
import * as THREE from "three";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader.js";
import {AnimationController} from "@/lib/companion/AnimationController";

const Character3D=forwardRef(function Character3D({className="",onCapabilities},ref){
 const mountRef=useRef(null);
 useImperativeHandle(ref,()=>({zoomToFace(){},resetCamera(){},exportModel(){}}),[]);
 useEffect(()=>{
  const mount=mountRef.current;if(!mount)return;
  let renderer=null,model=null,animation=null,raf=0,disposed=false;
  try{
   const width=mount.clientWidth||640,height=mount.clientHeight||480;
   const scene=new THREE.Scene();scene.background=new THREE.Color(0xf8fafc);
   const camera=new THREE.PerspectiveCamera(38,width/height,.1,100);camera.position.set(0,1.45,3);
   renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:"low-power"});renderer.setPixelRatio(1);renderer.setSize(width,height);mount.appendChild(renderer.domElement);
   scene.add(new THREE.HemisphereLight(0xffffff,0x64748b,2));
   new FBXLoader().load("/models/companion-female.fbx",asset=>{
    if(disposed)return;
    try{
     model=asset.scene||asset;
     const b=new THREE.Box3().setFromObject(model),s=b.getSize(new THREE.Vector3());
     if(s.y>.01){model.scale.multiplyScalar(1.85/s.y);const nb=new THREE.Box3().setFromObject(model),c=nb.getCenter(new THREE.Vector3());model.position.x-=c.x;model.position.z-=c.z;model.position.y-=nb.min.y;}
     animation=new AnimationController(model,asset.animations||[]);
     scene.add(model);
     onCapabilities?.({hasModel:true,clips:(asset.animations||[]).map(x=>x.name).filter(Boolean),morphs:{},wardrobe:{},diagnostic:"animation-controller-test"});
    }catch(error){
     console.error("Animation controller test failed:",error);
     mount.innerHTML="<div style='padding:24px;text-align:center;font-family:system-ui;color:#475569'>AnimationController failed: "+String(error?.message||error)+"</div>";
    }
   },undefined,error=>{
    mount.innerHTML="<div style='padding:24px;text-align:center;font-family:system-ui;color:#475569'>FBX load failed.</div>";
   });
   const clock=new THREE.Clock();
   const animate=()=>{if(disposed)return;animation?.update(Math.min(clock.getDelta(),.05));renderer.render(scene,camera);raf=requestAnimationFrame(animate)};animate();
  }catch(error){mount.innerHTML="<div style='padding:24px;text-align:center;font-family:system-ui;color:#475569'>Setup failed: "+String(error?.message||error)+"</div>";}
  return()=>{disposed=true;cancelAnimationFrame(raf);animation?.stop();renderer?.dispose();if(renderer?.domElement.parentNode===mount)mount.removeChild(renderer.domElement)};
 },[onCapabilities]);
 return <div ref={mountRef} className={className} style={{width:"100%",height:"100%",minHeight:260}}/>;
});
export default Character3D;
