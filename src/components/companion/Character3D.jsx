import {forwardRef,useEffect,useImperativeHandle,useRef} from "react";
import * as THREE from "three";

const Character3D=forwardRef(function Character3D({className="",onCapabilities},ref){
  const mountRef=useRef(null);

  useImperativeHandle(ref,()=>({
    zoomToFace(){},
    resetCamera(){},
    exportModel(){}
  }),[]);

  useEffect(()=>{
    const mount=mountRef.current;
    if(!mount)return;
    let renderer;
    let raf=0;
    let disposed=false;

    try{
      const width=mount.clientWidth||640;
      const height=mount.clientHeight||480;
      const scene=new THREE.Scene();
      scene.background=new THREE.Color(0xf8fafc);
      const camera=new THREE.PerspectiveCamera(40,width/height,0.1,100);
      camera.position.set(0,0,4);

      renderer=new THREE.WebGLRenderer({
        antialias:false,
        alpha:false,
        powerPreference:"low-power"
      });
      renderer.setPixelRatio(1);
      renderer.setSize(width,height);
      mount.appendChild(renderer.domElement);

      scene.add(new THREE.HemisphereLight(0xffffff,0x64748b,2));
      const cube=new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        new THREE.MeshBasicMaterial({color:0x334155})
      );
      scene.add(cube);

      const clock=new THREE.Clock();
      const animate=()=>{
        if(disposed)return;
        cube.rotation.y=clock.getElapsedTime()*0.6;
        renderer.render(scene,camera);
        raf=requestAnimationFrame(animate);
      };
      animate();

      onCapabilities?.({
        hasModel:false,
        clips:[],
        morphs:{},
        wardrobe:{},
        diagnostic:"webgl-basic-test-running"
      });
    }catch(error){
      console.error("Virtual Companion WebGL diagnostic failed:",error);
      mount.innerHTML="";
      const box=document.createElement("div");
      box.style.cssText="height:100%;min-height:260px;display:grid;place-items:center;padding:24px;text-align:center;font-family:system-ui,sans-serif;color:#475569;background:#f8fafc";
      box.innerHTML="<div><strong style='display:block;color:#0f172a;font-size:18px'>WebGL diagnostic failed</strong><span style='display:block;margin-top:8px;font-size:13px'>The browser could not create the Three.js WebGL renderer.</span></div>";
      mount.appendChild(box);
      onCapabilities?.({
        hasModel:false,
        clips:[],
        morphs:{},
        wardrobe:{},
        diagnostic:"webgl-basic-test-failed",
        error:String(error?.message||error)
      });
    }

    return()=>{
      disposed=true;
      cancelAnimationFrame(raf);
      if(renderer){
        renderer.dispose();
        if(renderer.domElement.parentNode===mount)mount.removeChild(renderer.domElement);
      }
    };
  },[onCapabilities]);

  return <div ref={mountRef} className={className} style={{width:"100%",height:"100%",minHeight:260}}/>;
});

export default Character3D;
