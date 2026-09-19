import {forwardRef,useEffect,useImperativeHandle} from "react";

const Character3D=forwardRef(function Character3D({className="",onCapabilities},ref){
  useImperativeHandle(ref,()=>({
    zoomToFace(){},
    resetCamera(){},
    applyTints(){},
    applyWardrobe(){},
    setEmotion(){},
    applyActivity(){},
    applyScene(){},
    exportModel(){}
  }),[]);

  useEffect(()=>{
    onCapabilities?.({
      hasModel:false,
      clips:[],
      morphs:{},
      wardrobe:{},
      diagnostic:"webgl-disabled"
    });
  },[onCapabilities]);

  return (
    <div className={className} style={{
      width:"100%",
      height:"100%",
      minHeight:260,
      display:"grid",
      placeItems:"center",
      background:"linear-gradient(180deg,#f8fafc,#eef2f7)",
      color:"#475569",
      fontFamily:"system-ui,sans-serif"
    }}>
      <div style={{textAlign:"center",padding:24,maxWidth:420}}>
        <div style={{fontSize:42,marginBottom:12}}>3D</div>
        <strong style={{display:"block",fontSize:18,color:"#0f172a"}}>
          Virtual Companion AI
        </strong>
        <span style={{display:"block",marginTop:8,fontSize:13}}>
          3D viewer temporarily disabled for diagnosis.
        </span>
        <span style={{display:"block",marginTop:8,fontSize:12,color:"#64748b"}}>
          Diagnostic test: Three.js/WebGL is not being created.
        </span>
      </div>
    </div>
  );
});

export default Character3D;
