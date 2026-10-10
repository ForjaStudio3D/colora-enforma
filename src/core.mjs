import {GROUPS,VARIANTS,groupById,SLOT_NAMES} from './catalog.mjs';
export const roleSlots=n=>n===3?[0,0,1,1,2]:n===4?[0,0,1,2,3]:n===5?[0,1,2,3,4]:(()=>{throw new Error('Escolha 3, 4 ou 5 cores.');})();
export const luminance=hex=>{const v=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;};
export const contrast=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
export function rngSeed(seed){let a=seed>>>0;return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
const shuffle=(list,rng)=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
export function availablePool(groupId,n,neutral='white'){
 const g=groupById(groupId);roleSlots(n);
 if(g.colors.length<n)throw new Error(`Este grupo tem ${g.colors.length} cores. Escolha até ${g.colors.length}.`);
 if(g.id==='pla-boneca')return g.colors;
 if(n===3&&g.base.length===2)return [...g.colors.filter(c=>g.base.includes(c.id)),g.colors.find(c=>c.id==='white')];
 if(n===3)return g.colors.filter(c=>g.base.includes(c.id));
 if(n===4&&g.base.length===3)return [...g.colors.filter(c=>g.base.includes(c.id)),g.colors.find(c=>c.id===neutral)];
 return g.colors;
}
export const recipeKey=p=>[p.groupId,p.variant,p.count,...p.colors.map(c=>`${c.id}:${c.hex}:${c.finish}`)].join('|');
export function makeRecipe(groupId,variant,colors,name='Sua combinação'){
 const group=groupById(groupId),count=colors.length;roleSlots(count);
 if(!VARIANTS.some(v=>v.id===variant))throw new Error('Variante inválida.');
 if(new Set(colors.map(c=>c.id)).size!==count)throw new Error('Cada posição deve usar um filamento diferente.');
 if(!colors.every(c=>group.colors.some(gc=>gc.id===c.id)))throw new Error('Uma cor pertence a outro grupo.');
 const pool=availablePool(groupId,count,colors.some(c=>c.id==='black')?'black':'white');
 if(!colors.every(c=>pool.some(gc=>gc.id===c.id)))throw new Error('Esta combinação não corresponde às cores permitidas para a quantidade selecionada.');
 if(!colors.every(c=>{const known=group.colors.find(gc=>gc.id===c.id);return typeof c.hex==='string'&&c.hex.toLowerCase()===known.hex.toLowerCase()&&c.finish===known.finish;}))throw new Error('A cor ou o acabamento não corresponde ao filamento cadastrado.');
 return {version:1,groupId,material:group.material,variant,count,name,colors:colors.map(c=>({...c})),createdAt:new Date().toISOString()};
}
export const PAGE_SIZE=50;
export function createRecipePager({groupId,variant='com-fundo',count=4,neutral='white',seed=Date.now(),size=PAGE_SIZE,current=null,locks=[]}={}){
 if(!Number.isSafeInteger(size)||size<1)throw new Error('Quantidade por lote inválida.');
 const pool=availablePool(groupId,count,neutral),fixed=Array(count).fill(null),permutations=[];
 for(let i=0;i<count;i++)if(locks[i]&&current?.groupId===groupId&&current.count===count){
  fixed[i]=pool.find(c=>c.id===current.colors[i].id);
  if(!fixed[i])throw new Error('Destrave a cor que não está nesta seleção.');
 }
 const reserved=new Set(fixed.filter(Boolean).map(c=>c.id)),used=new Set(),colors=[];
 if(reserved.size!==fixed.filter(Boolean).length)throw new Error('Cada posição deve usar um filamento diferente.');
 function visit(i){
  if(i===count){permutations.push([...colors]);return;}
  if(fixed[i]){colors[i]=fixed[i];visit(i+1);return;}
  for(const c of pool)if(!reserved.has(c.id)&&!used.has(c.id)){colors[i]=c;used.add(c.id);visit(i+1);used.delete(c.id);}
 }
 visit(0);
 const ordered=shuffle(permutations,rngSeed(seed));
 ordered.sort((a,b)=>contrast(b[0].hex,b.at(-1).hex)-contrast(a[0].hex,a.at(-1).hex));
 let offset=0;
 return {total:ordered.length,get hasMore(){return offset<ordered.length;},next(){
  const start=offset;offset=Math.min(offset+size,ordered.length);
  return ordered.slice(start,offset).map((colors,i)=>makeRecipe(groupId,variant,colors,`${groupById(groupId).name} ${start+i+1}`));
 }};
}
export function generateBatch(options={}){return createRecipePager({...options,size:options.size??6}).next();}
export function validateRecipe(p){
 if(!p||p.version!==1||!Array.isArray(p.colors)||p.colors.length!==p.count||typeof p.name!=='string'||p.name.length>90)throw new Error('Combinação inválida.');
 const group=groupById(p.groupId);
 if(p.material!==group.material)throw new Error('O material não corresponde ao grupo.');
 const colors=p.colors.map(c=>{
  const known=group.colors.find(x=>x.id===c?.id);
  if(!known||!/^#[a-f\d]{6}$/i.test(c.hex)||!['solid','silk','translucent'].includes(c.finish)||typeof c.name!=='string'||c.name.length>60)throw new Error('Filamento inválido.');
  return {id:c.id,name:c.name,hex:c.hex,finish:c.finish};
 });
 return {...makeRecipe(p.groupId,p.variant,colors,p.name),createdAt:typeof p.createdAt==='string'?p.createdAt.slice(0,40):new Date().toISOString()};
}
export function validateBackup(data){
 if(!data||data.app!=='colora-enforma'||data.version!==1||!Array.isArray(data.favorites)||data.favorites.length>100)throw new Error('Selecione um backup do Colora Enforma com até 100 favoritas.');
 const seen=new Set();return data.favorites.map(validateRecipe).filter(p=>{const k=recipeKey(p);if(seen.has(k))return false;seen.add(k);return true;});
}
export function recipeText(p){return `COLORA ENFORMA\n${p.name}\n${groupById(p.groupId).name} · ${p.material}\n${VARIANTS.find(v=>v.id===p.variant).name} · ${p.count} cores\n\n${p.colors.map((c,i)=>`${SLOT_NAMES[p.count][i]}: ${c.name} (${c.hex}) · ${c.finish}`).join('\n')}\n\n${p.count===5?'Cinco cores: estudo visual; a troca por uma pausa em altura não foi validada.\n':''}Tons aproximados das fotos. Receita de avaliação; não é um arquivo de impressão.`;}
export function loadFavorites(storage){try{return validateBackup(JSON.parse(storage.getItem('colora-enforma:favorites:v1')||'{"app":"colora-enforma","version":1,"favorites":[]}'));}catch{return [];}}
export function saveFavorites(storage,favorites){storage.setItem('colora-enforma:favorites:v1',JSON.stringify({app:'colora-enforma',version:1,favorites:favorites.map(validateRecipe)}));}
