export const MODEL_URL="/models/companion-female.fbx";
export const FALLBACK_MODEL_URL="/models/companion-female.fbx";
export const CHARACTER_MODELS={female:{id:"female",label:"Compañera",description:"Humana digital realista CC0",urls:["https://raw.githubusercontent.com/ibrews/VitruvianGodot/main/godot_project/vitruvian_body.glb","https://raw.githubusercontent.com/ibrews/VitruvianGodot/main/godot_project/vitruvian_head.glb","https://raw.githubusercontent.com/ibrews/VitruvianGodot/main/godot_project/vitruvian_hair_rigged.glb"],format:"multi",fallbackUrl:"/models/companion-female.fbx",fallbackFormat:"fbx"},male:{id:"male",label:"Compañero",description:"Avatar masculino adulto",url:"/models/companion-male.glb",format:"glb"}};
export const DEFAULT_CHARACTER_ID="female";
export const CHARACTER_AGE=25;
export const MIN_AGE=18;
export const COLOR_PALETTES=[
 {key:"hairColor",label:"Pelo",options:[{label:"Natural",value:null,css:"linear-gradient(135deg,#3d2b1f,#6b4a33)"},{label:"Negro",value:"#1b1b1f"},{label:"Castaño",value:"#6b4226"},{label:"Rubio",value:"#d9a75f"},{label:"Cobrizo",value:"#a85a32"},{label:"Plata",value:"#e8e4de"}]},
 {key:"topColor",label:"Top",options:[{label:"Natural",value:null,css:"linear-gradient(135deg,#2d2d2d,#d4af37)"},{label:"Negro",value:"#16161c"},{label:"Blanco",value:"#f0f0f2"},{label:"Rojo",value:"#b3384a"},{label:"Azul",value:"#2f5a9e"},{label:"Verde",value:"#3f7a5c"},{label:"Morado",value:"#6b4a9e"}]},
 {key:"bottomColor",label:"Pantalón",options:[{label:"Natural",value:null,css:"linear-gradient(135deg,#7d2645,#4a4f57)"},{label:"Gris",value:"#4a4f57"},{label:"Negro",value:"#17181d"},{label:"Beige",value:"#cbb697"},{label:"Azul",value:"#33415e"},{label:"Granate",value:"#6d2f3f"}]}
];
export const EMOTIONS=[{id:"CALM",label:"Calma",icon:"😌"},{id:"HAPPY",label:"Feliz",icon:"😊"},{id:"EXCITED",label:"Emocionada",icon:"🤩"},{id:"SAD",label:"Triste",icon:"😢"},{id:"PLAYFUL",label:"Juguetona",icon:"😜"}];
export const ACTIVITIES=[{id:"idle",label:"Reposo"},{id:"cocinar",label:"Cocinar"},{id:"comer",label:"Comer"},{id:"caminar",label:"Caminar"},{id:"leer",label:"Leer"},{id:"descansar",label:"Descansar"},{id:"dormir",label:"Dormir"},{id:"bailar",label:"Bailar"},{id:"relajarse",label:"Relajarse"},{id:"saludar",label:"Saludar"}];
export const ACTIVITY_CLIP_KEYWORDS={cocinar:["cook","cocin"],comer:["eat","comer","food"],caminar:["walk","camin"],leer:["read","leer","book","libro"],descansar:["rest","descans","sit","idle"],dormir:["sleep","dorm","lie","lay"],bailar:["dance","bail"],relajarse:["relax","relaj","chill","idle"],saludar:["wave","greet","hello","salud","hola"]};
export const WARDROBE_SLOTS=[{id:"top",label:"Camiseta / Top"},{id:"pants",label:"Pantalón"},{id:"dress",label:"Vestido"},{id:"sport",label:"Ropa deportiva"},{id:"formal",label:"Ropa formal"},{id:"shoes",label:"Zapatos"},{id:"accessories",label:"Accesorios"}];
export const WARDROBE_COLORS=["#16161c","#f0f0f2","#b3384a","#2f5a9e","#3f7a5c","#cbb697"];
export const SCENES=[{id:"sala",label:"Sala"},{id:"cocina",label:"Cocina"},{id:"dormitorio",label:"Dormitorio"},{id:"vestidor",label:"Vestidor"},{id:"bano",label:"Baño"},{id:"exterior",label:"Exterior"}];