import React from "react";
export function Switch({ checked=false, disabled=false, onCheckedChange }) {
  return <button type="button" role="switch" aria-checked={checked} aria-disabled={disabled} disabled={disabled} onClick={()=>onCheckedChange?.(!checked)}
    className={`vca-switch ${checked?"is-on":""}`}><span className="vca-switch-thumb"/></button>;
}
export default Switch;
