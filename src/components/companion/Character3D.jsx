import {forwardRef,useEffect,useImperativeHandle,useRef} from "react";
import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {AnimationController} from "../../lib/companion/AnimationController.js";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {buildSceneEnvironment} from "../../lib/companion/sceneEnvironments.js";

const findMorph=(mesh,names)=>{
  const dict=mesh?.morphTargetDictionary;
  if(!dict)return null;
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
  const cameraRef=useRef(null);
  const controlsRef=useRef(null);

  useImperativeHandle(ref,()=>({
    zoomToFace(){
      const camera=cameraRef.current;
      const controls=controlsRef.current;
      if(!camera||!controls)return;
      controls.target.set(0,1.58,0);
      camera.position.set(0,1.58,1.15);
      controls.update();
    },
    resetCamera(){
      const camera=cameraRef.current;
      const controls=controlsRef.current;
      if(!camera||!controls)return;
      controls.target.set(0,1.18,0);
      camera.position.set(0,1.42,3.05);
      controls.update();
    },
    exportModel(){}
  }),[]);

  useEffect(()=>{
    const mount=mountRef.current;
    if(!mount)return;

    let renderer=null;
    let model=null;
    let animationController=null;
    let controls=null;
    let environment=null;
    let raf=0;
    let disposed=false;

    const morphMeshes=[];
    const bones={};
    const rest={};
    let restHipsY=0;

    const showError=(title,detail)=>{
      mount.innerHTML="";
      const box=document.createElement("div");
      box.style.cssText="height:100%;min-height:260px;display:grid;place-items:center;padding:24px;text-align:center;font-family:system-ui,sans-serif;color:#475569;background:#f8fafc";
      box.innerHTML="<div><strong style='display:block;color:#0f172a;font-size:18px'>"+title+"</strong><span style='display:block;margin-top:8px;font-size:13px'>"+detail+"</span></div>";
      mount.appendChild(box);
    };

    try{
      const width=mount.clientWidth||640;
      const height=mount.clientHeight||480;

      const scene=new THREE.Scene();
      scene.background=new THREE.Color(0xf8fafc);

      const camera=new THREE.PerspectiveCamera(28,width/height,.1,100);
      camera.position.set(0,1.42,3.05);
      camera.lookAt(0,1.18,0);
      cameraRef.current=camera;

      renderer=new THREE.WebGLRenderer({
        antialias:true,
        alpha:false,
        powerPreference:"high-performance"
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
      renderer.setSize(width,height);
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=1.08;
      renderer.shadowMap.enabled=true;
      renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      mount.appendChild(renderer.domElement);

      controls=new OrbitControls(camera,renderer.domElement);
      controls.enableDamping=true;
      controls.dampingFactor=.055;
      controls.enablePan=false;
      controls.enableZoom=true;
      controls.zoomSpeed=1.15;
      controls.minDistance=.65;
      controls.maxDistance=5.5;
      controls.maxPolarAngle=Math.PI*.62;
      controls.target.set(0,1.18,0);
      controls.update();
      controlsRef.current=controls;

      let faceZoomed=false;
      let lastTap=0;

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
      if(environment){
        environment.position.z=-.35;
        scene.add(environment);
      }

      scene.add(new THREE.HemisphereLight(0xfff8f0,0x46515f,1.55));

      const key=new THREE.DirectionalLight(0xfff3e6,2.4);
      key.position.set(2.5,3.8,3.5);
      key.castShadow=true;
      key.shadow.mapSize.set(1024,1024);
      key.shadow.camera.near=.5;
      key.shadow.camera.far=12;
      scene.add(key);

      const fill=new THREE.DirectionalLight(0xdce9ff,1.15);
      fill.position.set(-3,2.4,2);
      scene.add(fill);

      const rim=new THREE.DirectionalLight(0xffe4c4,.9);
      rim.position.set(0,3,-3);
      scene.add(rim);

      const status=document.createElement("div");
      status.style.cssText="position:absolute;left:12px;top:12px;padding:7px 10px;border-radius:999px;background:rgba(15,23,42,.68);color:white;font:500 12px system-ui,sans-serif;z-index:2;pointer-events:none;backdrop-filter:blur(8px)";
      status.textContent="3D companion";
      mount.style.position="relative";
      mount.appendChild(status);

      new GLTFLoader().load("/models/companion.glb",gltf=>{
        if(disposed)return;

        model=gltf.scene;
        animationController=new AnimationController(model,gltf.animations||[]);

        const bounds=new THREE.Box3().setFromObject(model);
        const size=bounds.getSize(new THREE.Vector3());

        if(size.y>.01){
          model.scale.multiplyScalar(1.85/size.y);
          const nb=new THREE.Box3().setFromObject(model);
          const center=nb.getCenter(new THREE.Vector3());
          model.position.x-=center.x;
          model.position.z-=center.z;
          model.position.y-=nb.min.y;
        }

        model.traverse(o=>{
          if(o.isBone){
            bones[o.name]=o;
            return;
          }
          if(!o.isMesh)return;

          o.castShadow=true;
          o.receiveShadow=true;

          const materials=Array.isArray(o.material)?o.material:[o.material];
          for(const material of materials){
            if(!material)continue;
            material.needsUpdate=true;
            const n=(material.name||"").toLowerCase();

            if(n.includes("skin")||n.includes("body")||n.includes("face")||n.includes("head")){
              if("roughness" in material)material.roughness=.54;
              if("metalness" in material)material.metalness=0;
            }else if("roughness" in material){
              material.roughness=Math.max(.32,Math.min(material.roughness||.7,.82));
            }
          }

          if(o.morphTargetDictionary){
            morphMeshes.push({
              mesh:o,
              smile:findMorph(o,["mouthSmile"]),
              jawOpen:findMorph(o,["jawOpen","mouthOpen"]),
              brow:findMorph(o,["browInnerUp"]),
              blinkLeft:findMorph(o,["eyeBlinkLeft"]),
              blinkRight:findMorph(o,["eyeBlinkRight"]),
              squintLeft:findMorph(o,["eyeSquintLeft"]),
              squintRight:findMorph(o,["eyeSquintRight"])
            });
          }
        });

        [
          "Hips","Spine","Spine1","Spine2","Neck","Head",
          "LeftShoulder","LeftArm","LeftForeArm",
          "RightShoulder","RightArm","RightForeArm"
        ].forEach(name=>{
          if(bones[name])rest[name]={
            rotation:bones[name].rotation.clone(),
            position:bones[name].position.clone()
          };
        });

        if(bones.Hips)restHipsY=bones.Hips.position.y;

        // Natural relaxed pose: reduce the rigid default stance without
        // changing the model's skeleton structure.
        if(rest.LeftArm)rest.LeftArm.rotation.z-=.18;
        if(rest.RightArm)rest.RightArm.rotation.z+=.18;
        if(rest.LeftForeArm)rest.LeftForeArm.rotation.z-=.08;
        if(rest.RightForeArm)rest.RightForeArm.rotation.z+=.08;

        scene.add(model);

        let boneCount=0;
        let meshCount=0;
        let morphCount=0;
        model.traverse(o=>{
          if(o.isBone)boneCount++;
          if(o.isMesh){
            meshCount++;
            morphCount+=Object.keys(o.morphTargetDictionary||{}).length;
          }
        });

        onCapabilities?.({
          hasModel:true,
          clips:(gltf.animations||[]).map(x=>x.name).filter(Boolean),
          morphs:Object.fromEntries(
            morphMeshes.map((x,i)=>[
              x.mesh.name||("mesh"+i),
              Object.keys(x.mesh.morphTargetDictionary||{})
            ])
          ),
          wardrobe:{},
          diagnostic:"humanized-companion",
          bones:boneCount,
          meshes:meshCount,
          morphCount
        });
      },undefined,error=>{
        console.error("GLB load failed:",error);
        showError("GLB model failed","The Ready Player Me model could not be loaded or parsed.");
      });

      const clock=new THREE.Clock();
      let blinkStart=-1;
      let nextBlink=3.8;
      let blinkPhase=0;

      const animate=()=>{
        if(disposed)return;

        const delta=Math.min(clock.getDelta(),.05);
        const t=clock.elapsedTime;

        animationController?.update(delta);

        if(model){
          // Breathing: chest expands and relaxes naturally.
          if(bones.Spine2&&rest.Spine2.rotation){
            bones.Spine2.rotation.x=rest.Spine2.rotation.x+Math.sin(t*1.45)*.025;
          }

          // Gentle weight shifting.
          if(bones.Spine1&&rest.Spine1.rotation){
            bones.Spine1.rotation.y=rest.Spine1.rotation.y+Math.sin(t*.58)*.028;
            bones.Spine1.rotation.z=rest.Spine1.rotation.z+Math.sin(t*.72+.8)*.012;
          }

          if(bones.Hips&&rest.Hips.rotation){
            bones.Hips.position.y=restHipsY+Math.sin(t*1.45)*.006;
            bones.Hips.rotation.y=rest.Hips.rotation.y+Math.sin(t*.42)*.022;
            bones.Hips.rotation.z=rest.Hips.rotation.z+Math.sin(t*.55+.4)*.012;
          }

          // Small arm movement follows the breathing rhythm.
          if(bones.LeftArm&&rest.LeftArm.rotation){
            bones.LeftArm.rotation.x=rest.LeftArm.rotation.x+Math.sin(t*1.45+.25)*.012;
            bones.LeftArm.rotation.y=rest.LeftArm.rotation.y+Math.sin(t*.7)*.014;
          }
          if(bones.RightArm&&rest.RightArm.rotation){
            bones.RightArm.rotation.x=rest.RightArm.rotation.x+Math.sin(t*1.45+.55)*.012;
            bones.RightArm.rotation.y=rest.RightArm.rotation.y+Math.sin(t*.7+.6)*.014;
          }

          // Subtle independent head/neck micro-movements.
          if(bones.Neck&&rest.Neck.rotation){
            bones.Neck.rotation.y=rest.Neck.rotation.y+Math.sin(t*.43)*.035;
            bones.Neck.rotation.z=rest.Neck.rotation.z+Math.sin(t*.31+.5)*.012;
          }
          if(bones.Head&&rest.Head.rotation){
            bones.Head.rotation.y=rest.Head.rotation.y+Math.sin(t*.47+.7)*.065;
            bones.Head.rotation.x=rest.Head.rotation.x+Math.sin(t*.34)*.022;
            bones.Head.rotation.z=rest.Head.rotation.z+Math.sin(t*.29+1.2)*.014;
          }

          // Automatic natural blink every few seconds, with a soft close/open.
          if(blinkStart<0 && t>=nextBlink){
            blinkStart=t;
            nextBlink=t+3.5+Math.random()*2.8;
          }
          if(blinkStart>=0){
            const bt=t-blinkStart;
            if(bt<.11)blinkPhase=bt/.11;
            else if(bt<.22)blinkPhase=1;
            else if(bt<.34)blinkPhase=1-(bt-.22)/.12;
            else{
              blinkPhase=0;
              blinkStart=-1;
            }
          }

          const idleSmile=.035+Math.max(0,Math.sin(t*.17))*0.018;
          const idleBrow=Math.max(0,Math.sin(t*.23+.9))*.025;
          const idleJaw=Math.max(0,Math.sin(t*.13+1.8))*.018;

          for(const item of morphMeshes){
            const a=item.mesh.morphTargetInfluences;
            if(!a)continue;

            if(item.smile!==null)a[item.smile]=idleSmile;
            if(item.jawOpen!==null)a[item.jawOpen]=idleJaw;
            if(item.brow!==null)a[item.brow]=idleBrow;
            if(item.blinkLeft!==null)a[item.blinkLeft]=blinkPhase;
            if(item.blinkRight!==null)a[item.blinkRight]=blinkPhase;

            // Slight eye squint during the relaxed smile.
            if(item.squintLeft!==null)a[item.squintLeft]=idleSmile*.35;
            if(item.squintRight!==null)a[item.squintRight]=idleSmile*.35;
          }
        }

        controls?.update();
        renderer.render(scene,camera);
        raf=requestAnimationFrame(animate);
      };

      animate();

      const handleResize=()=>{
        if(!mount||!renderer)return;
        const w=mount.clientWidth||640;
        const h=mount.clientHeight||480;
        camera.aspect=w/h;
        camera.updateProjectionMatrix();
        renderer.setSize(w,h,false);
      };

      window.addEventListener("resize",handleResize);
      window.visualViewport?.addEventListener("resize",handleResize);

      const cleanupResize=()=>{
        window.removeEventListener("resize",handleResize);
        window.visualViewport?.removeEventListener("resize",handleResize);
      };

      mount._cleanupHumanizedResize=cleanupResize;

    }catch(error){
      console.error("Humanized 3D companion failed:",error);
      showError("3D companion failed",String(error?.message||error));
    }

    return()=>{
      disposed=true;
      cancelAnimationFrame(raf);
      animationController?.stop();
      mount.removeEventListener("pointerup",handleDoubleTap);
      mount._cleanupHumanizedResize?.();
      delete mount._cleanupHumanizedResize;
      controls?.dispose();

      if(environment){
        environment.traverse(o=>{
          o.geometry?.dispose();
          if(o.material){
            if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());
            else o.material.dispose();
          }
        });
      }

      if(model){
        model.traverse(o=>{
          o.geometry?.dispose();
          if(o.material){
            if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());
            else o.material.dispose();
          }
        });
      }

      renderer?.dispose();
      if(renderer?.domElement.parentNode===mount)mount.removeChild(renderer.domElement);

      cameraRef.current=null;
      controlsRef.current=null;
    };
  },[onCapabilities]);

  return <div ref={mountRef} className={className} style={{width:"100%",height:"100%",minHeight:260}}/>;
});

export default Character3D;
