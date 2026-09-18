export function getSpeechVoices(){if(typeof window==="undefined"||!window.speechSynthesis)return[];return window.speechSynthesis.getVoices();}
export function speakText(text,{lang="en-US",rate=.98,pitch=1.02,onStart,onBoundary,onEnd,onError}={}){
  if(typeof window==="undefined"||!window.speechSynthesis||!text){onError?.(new Error("SpeechSynthesis no está disponible en este navegador."));return false;}
  window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang=lang;utterance.rate=rate;utterance.pitch=pitch;
  const voices=getSpeechVoices(),exact=voices.find(v=>v.lang?.toLowerCase()===lang.toLowerCase()),prefix=voices.find(v=>v.lang?.toLowerCase().startsWith(lang.slice(0,2).toLowerCase()));
  if(exact||prefix)utterance.voice=exact||prefix;utterance.onstart=()=>onStart?.();utterance.onboundary=e=>onBoundary?.(e);utterance.onend=()=>onEnd?.();utterance.onerror=e=>onError?.(e);window.speechSynthesis.speak(utterance);return true;
}
export function stopSpeaking(){if(typeof window!=="undefined"&&window.speechSynthesis)window.speechSynthesis.cancel();}
