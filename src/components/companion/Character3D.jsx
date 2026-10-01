import {forwardRef,useEffect,useImperativeHandle,useRef} from "react";
import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {AnimationController} from "../../lib/companion/AnimationController.js";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {buildSceneEnvironment} from "../../lib/companion/sceneEnvironments.js";

const findMorph=(mesh,names)=>{
  const dict=mesh?.morphTargetDictionary;if(!dict)return null;
  const entries=Object.entries(dict);
  for(const wanted of names){
    const exact=entries.find(([name])=>name.toLowerCase()===wanted.toLowerCase());
    if(exact)return exact[1];
  }
  for(const wanted of names){
    const partial=entries.find(([name])=>name.toLowerCase().includes(wanted.toLowerCase()));
    if(partial)return partial[1];
  }
  return null;
};

const Character3D=forwardRef(function Character3D({className="",onCapabilities},ref){
  const mountRef=useRef(null);
  useImperativeHandle(ref,()=>({
    zoomToFace(){
      if(!controls)return;
      controls.target.set(0,1.58,0);
      camera.position.set(0,1.58,1.15);
      controls.update();
    },
    resetCamera(){
      if(!controls)return;
      controls.target.set(0,1.18,0);
      camera.position.set(0,1.42,3.05);
      controls.update();
    },
    exportModel(){}
  }),[]);
  useEffect(()=>{
    const mount=mountRef.current;if(!mount)return;
    let renderer=null,model=null,animationController=null,controls=null,environment=null,raf=0,disposed=false;
    const morphMeshes=[];
    const showError=(title,detail)=>{
      mount.innerHTML="";
      const box=document.createElement("div");
      box.style.cssText="height:100%;min-height:260px;display:grid;place-items:center;padding:24px;text-align:center;font-family:system-ui,sans-serif;color:#475569;background:#f8fafc";
      box.innerHTML="<div><strong style='display:block;color:#0f172a;font-size:18px'>"+title+"</strong><span style='display:block;margin-top:8px;font-size:13px'>"+detail+"</span></div>";
      mount.appendChild(box);
    };
    try{
      const width=mount.clientWidth||640,height=mount.clientHeight||480;
      const scene=new THREE.Scene();scene.background=new THREE.Color(0xf8fafc);
      const camera=new THREE.PerspectiveCamera(32,width/height,.1,100);
      camera.position.set(0,1.42,3.05);
      camera.lookAt(0,1.18,0);
      renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:"low-power"});
      renderer.setPixelRatio(1);renderer.setSize(width,height);mount.appendChild(renderer.domElement);
      controls=new OrbitControls(camera,renderer.domElement);
      controls.enableDamping=false;controls.enablePan=false;controls.enableZoom=true;controls.zoomSpeed=1.25;controls.minDistance=.65;controls.maxDistance=5.5;
      controls.target.set(0,1.18,0);controls.update();
      let faceZoomed=false,lastTap=0;
      const toggleFaceZoom=()=>{
        faceZoomed=!faceZoomed;
        if(faceZoomed){
          controls.target.set(0,1.58,0);
          camera.position.set(0,1.58,1.15);
        }else{
          controls.target.set(0,1.18,0);
          camera.position.set(0,1.42,3.05);
        }
        controls.update();
      };
      const handleDoubleTap=()=>{
        const now=performance.now();
        if(now-lastTap<350)toggleFaceZoom();
        lastTap=now;
      };
      mount.addEventListener("pointerup",handleDoubleTap);
      environment=buildSceneEnvironment("sala");
      if(environment){environment.position.z=-.35;scene.add(environment);}
      scene.add(new THREE.HemisphereLight(0xffffff,0x64748b,2));
      const key=new THREE.DirectionalLight(0xffffff,2.2);key.position.set(2,4,3);scene.add(key);

      const status=document.createElement("div");
      status.style.cssText="position:absolute;left:12px;top:12px;padding:7px 10px;border-radius:8px;background:rgba(15,23,42,.82);color:white;font:600 13px system-ui,sans-serif;z-index:2;pointer-events:none";
      status.textContent="Cargando expresiones…";
      mount.style.position="relative";mount.appendChild(status);

      new GLTFLoader().load("/models/companion.glb",gltf=>{
        if(disposed)return;
        model=gltf.scene;
        animationController=new AnimationController(model,gltf.animations||[]);
        const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
        if(size.y>.01){
          model.scale.multiplyScalar(1.85/size.y);
          const nb=new THREE.Box3().setFromObject(model),center=nb.getCenter(new THREE.Vector3());
          model.position.x-=center.x;model.position.z-=center.z;model.position.y-=nb.min.y;
        }

        let boneCount=0,meshCount=0,morphCount=0;
        model.traverse(o=>{
          if(o.isBone)boneCount++;
          if(!o.isMesh)return;
          meshCount++;
          if(!o.morphTargetDictionary)return;
          const names=Object.keys(o.morphTargetDictionary);
          morphCount+=names.length;
          morphMeshes.push({
            mesh:o,
            smile:findMorph(o,["mouthSmile"]),
            jawOpen:findMorph(o,["jawOpen","mouthOpen"]),
            blinkLeft:findMorph(o,["eyeBlinkLeft"]),
            blinkRight:findMorph(o,["eyeBlinkRight"]),
            brow:findMorph(o,["browInnerUp"])
          });
        });
        scene.add(model);
        onCapabilities?.({
          hasModel:true,
          clips:(gltf.animations||[]).map(x=>x.name).filter(Boolean),
          morphs:Object.fromEntries(morphMeshes.map((x,i)=>[x.mesh.name||("mesh"+i),Object.keys(x.mesh.morphTargetDictionary||{})])),
          wardrobe:{},diagnostic:"glb-animation-controller-orbit-environment-face-zoom-test",
          bones:boneCount,meshes:meshCount,morphCount
        });
        status.textContent="AnimationController OK • clips: "+(gltf.animations||[]).length;
      },undefined,error=>{
        console.error("GLB load failed:",error);
        showError("GLB model failed","The Ready Player Me model could not be loaded or parsed.");
      });

      const clock=new THREE.Clock();
      const animate=()=>{
        if(disposed)return;
        const delta=clock.getDelta();
        const t=clock.elapsedTime;
        animationController?.update(delta);
        controls?.update();
        const phase=t%15;
        let label="NEUTRAL",smile=0,jaw=0,brow=0,blink=0;
        if(phase>=2&&phase<5){label="SMILE";smile=.9;}
        else if(phase>=5&&phase<8){label="JAW OPEN";jaw=.9;}
        else if(phase>=8&&phase<11){label="BROW UP";brow=.9;}
        else if(phase>=11&&phase<11.5){label="BLINK";blink=1;}
        status.textContent=label;
        for(const item of morphMeshes){
          const a=item.mesh.morphTargetInfluences;if(!a)continue;
          if(item.smile!==null)a[item.smile]=smile;
          if(item.jawOpen!==null)a[item.jawOpen]=jaw;
          if(item.brow!==null)a[item.brow]=brow;
          if(item.blinkLeft!==null)a[item.blinkLeft]=blink;
          if(item.blinkRight!==null)a[item.blinkRight]=blink;
        }
        renderer.render(scene,camera);
        raf=requestAnimationFrame(animate);
      };
      animate();
    }catch(error){
      console.error("GLB expression diagnostic failed:",error);
      showError("GLB expression diagnostic failed",String(error?.message||error));
    }
    return()=>{
      disposed=true;cancelAnimationFrame(raf);
      animationController?.stop();
      mount.removeEventListener("pointerup",handleDoubleTap);
      controls?.dispose();
      if(environment)environment.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose();});
      if(model)model.traverse(o=>{o.geometry?.dispose();if(o.material)Array.isArray(o.material)?o.material.forEach(m=>m.dispose()):o.material.dispose()});
      renderer?.dispose();
      if(renderer?.domElement.parentNode===mount)mount.removeChild(renderer.domElement);
    };
  },[onCapabilities]);
  return <div ref={mountRef} className={className} style={{width:"100%",height:"100%",minHeight:260}}/>;
});
export default Character3D;
