import {GROUPS,SLOT_NAMES} from './catalog.mjs';
import {contrast,luminance,listRecommendations,rngSeed,roleSlots} from './core.mjs';

export const STUDIO_REGIONS=SLOT_NAMES[4];
export const isStudio=p=>p?.version===2&&p.kind==='studio';
const clone=c=>({...c});
const physicalKey=c=>`${c.hex.toUpperCase()}:${c.finish}`;
export function materialPalette(material){
 if(!['PLA','PETG'].includes(material))throw new Error('Escolha PLA ou PETG.');
 const colors=new Map();
 for(const group of GROUPS.filter(g=>g.material===material))for(const c of group.colors){
  const key=physicalKey(c);if(!colors.has(key))colors.set(key,{...c,id:`${group.id}--${c.id}`});
 }
 return [...colors.values()].map(clone);
}
export function makeStudioRecipe(material,slots,name=`Sua combinação ${material}`){
 const pool=materialPalette(material);
 if(!Array.isArray(slots)||slots.length!==4||!slots[0])throw new Error('Escolha uma cor principal e quatro regiões.');
 const selected=slots.map(id=>{if(id===null)return null;const c=pool.find(c=>c.id===id);if(!c)throw new Error('Esta cor não pertence ao material selecionado.');return c;});
 const colors=selected.map(c=>clone(c||selected[0]));
 return {version:2,kind:'studio',material,variant:'sem-fundo',count:new Set(colors.map(physicalKey)).size,name,slots:[...slots],colors,createdAt:new Date().toISOString()};
}
export function validateStudioRecipe(p){
 if(!isStudio(p)||p.variant!=='sem-fundo'||typeof p.name!=='string'||p.name.length>90)throw new Error('Combinação do Estúdio inválida.');
 const valid=makeStudioRecipe(p.material,p.slots,p.name);
 if(valid.count!==p.count||!Array.isArray(p.colors)||p.colors.length!==4||!p.colors.every((c,i)=>c?.id===valid.colors[i].id&&c.hex===valid.colors[i].hex&&c.finish===valid.colors[i].finish))throw new Error('As cores não correspondem às regiões salvas.');
 return {...valid,createdAt:typeof p.createdAt==='string'?p.createdAt.slice(0,40):valid.createdAt};
}
export const studioKey=p=>`studio|${p.material}|${p.slots.join(',')}`;
export function studioFromRecipe(p){
 if(isStudio(p))return validateStudioRecipe(p);
 const palette=materialPalette(p.material),colorIds=p.colors.map(c=>palette.find(x=>physicalKey(x)===physicalKey(c))?.id);
 // Three-color recipes share r2/r3. Editing a legacy five-color study
 // merges its separate dark contour into the body's fixed Studio group.
 const slots=p.count===3?[colorIds[0],colorIds[1],colorIds[1],colorIds[2]]:p.count===5?[colorIds[0],colorIds[2],colorIds[3],colorIds[4]]:colorIds;
 return makeStudioRecipe(p.material,slots,p.name);
}
export function defaultStudioRecipe(material){return studioFromRecipe(listRecommendations('sem-fundo').find(p=>p.material===material&&p.count===4));}
export function replaceStudioColor(p,index,id){
 if(!Number.isInteger(index)||index<0||index>3)throw new Error('Região inválida.');
 const slots=[...p.slots];slots[index]=id;return makeStudioRecipe(p.material,slots);
}
export const renderRecipe=p=>isStudio(p)?{colors:p.colors,map:[0,0,1,2,3]}:{colors:p.colors,map:roleSlots(p.count)};
export function studioHash(p){return `#/peca/estudio/${p.material}/${p.slots.map(id=>id===null?'_':encodeURIComponent(id)).join(',')}`;}
export function studioFromHash(hash){
 const m=hash.match(/^#\/peca\/estudio\/(PLA|PETG)\/([^/?#]+)$/);if(!m)throw new Error('Combinação do Estúdio não encontrada.');
 return makeStudioRecipe(m[1],m[2].split(',').map(id=>id==='_'?null:decodeURIComponent(id)));
}
const hue=c=>{const [r,g,b]=[1,3,5].map(i=>parseInt(c.hex.slice(i,i+2),16)/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;return {h:d===0?0:(((max===r?(g-b)/d:max===g?(b-r)/d+2:(r-g)/d+4)*60)+360)%360,s:max===0?0:d/max};};
function harmony(colors){
 const base=colors[0],light=colors.map(c=>luminance(c.hex)),direction=light[0]>.55?-1:1;
 let score=Math.min(contrast(base.hex,colors[3].hex),8)*12+Math.min(contrast(base.hex,colors[2].hex),6)*7;
 for(let i=1;i<3;i++)if(physicalKey(colors[i])!==physicalKey(colors[i+1]))score+=(light[i+1]-light[i])*direction>=0?9:-12;
 const hues=colors.map(hue);
 for(const [a,b]of [[0,1],[0,2],[1,2]])if(hues[a].s>.3&&hues[b].s>.3){const distance=Math.min(Math.abs(hues[a].h-hues[b].h),360-Math.abs(hues[a].h-hues[b].h));score+=distance<65?10:distance>145?1:-8;}
 if(hues[3].s<.15)score+=10;
 return score;
}
export function randomStudioRecipe(p,seed=Date.now()){
 const pool=materialPalette(p.material).filter(c=>c.id!==p.slots[0]),active=[1,2,3].filter(i=>p.slots[i]!==null);
 if(!active.length)return makeStudioRecipe(p.material,p.slots,p.name);
 const ranked=[],slots=[...p.slots],used=new Set();
 function visit(n){
  if(n===active.length){const recipe=makeStudioRecipe(p.material,slots);if(studioKey(recipe)!==studioKey(p))ranked.push({recipe,score:harmony(recipe.colors)});return;}
  for(const c of pool)if(!used.has(c.id)){slots[active[n]]=c.id;used.add(c.id);visit(n+1);used.delete(c.id);}
 }
 visit(0);ranked.sort((a,b)=>b.score-a.score);
 const best=ranked.filter(x=>x.score>=ranked[0].score-12).slice(0,24),pick=best[Math.floor(rngSeed(seed)()*best.length)];
 return pick.recipe;
}
export function loadStudioDrafts(storage){
 const defaults={PLA:defaultStudioRecipe('PLA'),PETG:defaultStudioRecipe('PETG')};
 try{const stored=JSON.parse(storage?.getItem('colora-enforma:studio:v1')||'{}');for(const material of ['PLA','PETG'])try{const p=validateStudioRecipe(stored[material]);if(p.material===material)defaults[material]=p;}catch{ /* Keep the other material's valid draft. */ }}catch{ /* Storage may be unavailable. */ }
 return defaults;
}
export function saveStudioDrafts(storage,drafts){storage.setItem('colora-enforma:studio:v1',JSON.stringify({PLA:validateStudioRecipe(drafts.PLA),PETG:validateStudioRecipe(drafts.PETG)}));}
