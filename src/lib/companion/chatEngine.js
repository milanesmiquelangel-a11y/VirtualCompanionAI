import { buildSystemContext, DEFAULT_PERSONALITY } from "./personality";
const FALLBACKS={en:"I'm here with you. Tell me what you'd like to talk about.",es:"Estoy aquí contigo. Cuéntame de qué te gustaría hablar.",ru:"Я рядом. Расскажи, о чём ты хочешь поговорить.",kk:"Мен осындамын. Не туралы сөйлескің келетінін айт."};
function normalizeResponse(data){if(!data)return{reply:"",emotion:null};if(typeof data==="string")return{reply:data.trim(),emotion:null};return{reply:(data.reply||data.message||data.text||data.output_text||data.output?.[0]?.content?.[0]?.text||data.choices?.[0]?.message?.content||data.choices?.[0]?.text||"").trim(),emotion:typeof data.emotion==="string"?data.emotion:null};}
export async function getCompanionReply(message,{language="en",history=[],memories=[],personality=DEFAULT_PERSONALITY,signal}={}){
  const endpoint=import.meta.env?.VITE_AI_CHAT_URL,system=buildSystemContext({language,personality,memories});
  if(endpoint){const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({message,language,history,memories,personality,system}),signal});if(!response.ok)throw new Error(`AI chat HTTP ${response.status}`);const result=normalizeResponse(await response.json());if(!result.reply)throw new Error("AI service returned an empty response");return result;}
  const text=message.toLowerCase();
  if(/(hello|hi|hey|hola|привет|сәлем)/i.test(text))return{reply:language==="es"?"Hola. Me alegra hablar contigo.":language==="ru"?"Привет. Рада поговорить с тобой.":language==="kk"?"Сәлем. Сенімен сөйлескеніме қуаныштымын.":"Hello. I'm happy to talk with you.",emotion:"HAPPY"};
  return{reply:FALLBACKS[language]||FALLBACKS.en,emotion:"CALM"};
}
