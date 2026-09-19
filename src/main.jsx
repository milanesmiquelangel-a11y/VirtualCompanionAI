import React from "react";
import { createRoot } from "react-dom/client";
import Home from "./pages/Home";
import "./styles.css";

class AppErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={error:null};}
  static getDerivedStateFromError(error){return {error};}
  render(){
    if(this.state.error){
      return <div style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,fontFamily:"system-ui",background:"#f8fafc",color:"#0f172a"}}>
        <div style={{maxWidth:520,textAlign:"center"}}>
          <h1 style={{fontSize:22,marginBottom:8}}>Virtual Companion AI</h1>
          <p style={{color:"#64748b"}}>The 3D viewer encountered an error. The application itself is still running.</p>
          <button onClick={()=>location.reload()} style={{marginTop:16,padding:"10px 16px",borderRadius:10,border:0,background:"#0f172a",color:"#fff"}}>Reload</button>
        </div>
      </div>;
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <AppErrorBoundary><Home /></AppErrorBoundary>
);
