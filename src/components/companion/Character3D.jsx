import {forwardRef,useEffect,useImperativeHandle,useRef} from "react";
import * as THREE from "three";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader.js";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

const Character3D=forwardRef(function Character3D({className="",onCapabilities},ref){
  const mountRef=useRef(null);
  useImperativeHandle(ref,()=>({zoomToFace(){},resetCamera(){},exportModel(){}}),[]);
  useEffect(()=>{
    const mount=mountRef.current;if(!mount)return;
    let renderer=null,model=null,controls=null,raf=0,disposed=false;
    const showError=(title,detail)=>{mount.innerHTML="";const box=document.createElement("div");box.style.cssText="height:100%;min-height:260px;display:grid;place-items:center;padding:24px;text-align:center;font-family:system-ui,sans-serif;color:#475569;background:#f8fafc";box.innerHTML="<div><strong style='display:block;color:#0f172a;font-size:18px'>"+title+"</strong><span style='display:block;margin-top:8px;font-size:13px'>"+detail+"</span></div>";mount.appendChild(box)};
    try{
      const width=mount.clientWidth||640,height=mount.clientHeight||480;
      const scene=new THREE.Scene();scene.background=new THREE.Color(0xf8fafc);
      const camera=new THREE.PerspectiveCamera(38,width/height,.1,100);camera.position.set(0,1.45,3);
      renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:"low-power"});renderer.setPixelRatio(1);renderer.setSize(width,height);mount.appendChild(renderer.domElement);
      controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1,0);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=1.2;controls.maxDistance=7;controls.maxPolarAngle=Math.PI*.62;controls.update();
      scene.add(new THREE.HemisphereLight(0xffffff,0x64748b,2));
      new FBXLoader().load("/models/companion-female.fbx",asset=>{
        if(disposed)return;
        try{
          model=asset.scene||asset;
          const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
          if(size.y>.01){model.scale.multiplyScalar(1.85/size.y);const nb=new THREE.Box3().setFromObject(model),center=nb.getCenter(new THREE.Vector3());model.position.x-=center.x;model.position.z-=center.z;model.position.y-=nb.min.y;}
          model.traverse(o=>{if(o.isMesh){o.castShadow=false;o.frustumCulled=false;}});
          scene.add(model);
          onCapabilities?.({hasModel:true,clips:(asset.animations||[]).map(x=>x.name).filter(Boolean),morphs:{},wardrobe:{},diagnostic:"fbx-orbit-test-loaded"});
        }catch(error){console.error(error);showError("FBX processing failed",String(error?.message||error));}
      },undefined,error=>{console.error(error);showError("FBX model failed","The model could not be loaded or parsed.");});
      const clock=new THREE.Clock();const animate=()=>{if(disposed)return;if(model)model.rotation.y=clock.getElapsedTime()*.15;controls.update();renderer.render(scene,camera);raf=requestAnimationFrame(animate)};animate();
    }catch(error){console.error(error);showError("3D controls test failed",String(error?.message||error));}
    return()=>{disposed=true;cancelAnimationFrame(raf);controls?.dispose();if(model)model.traverse(o=>{o.geometry?.dispose();if(o.material)Array.isArray(o.material)?o.material.forEach(m=>m.dispose()):o.material.dispose()});renderer?.dispose();if(renderer?.domElement.parentNode===mount)mount.removeChild(renderer.domElement)};
  },[onCapabilities]);
  return <div ref={mountRef} className={className} style={{width:"100%",height:"100%",minHeight:260}}/>;
});
export default Character3D;
