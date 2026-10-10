import {GROUPS,groupById} from './catalog.mjs';
import {PAGE_SIZE,createRecipePager,makeRecipe,recipeKey,recommendationFor,listFavorites} from './core.mjs';
import {isStudio,studioKey,studioHash,studioFromHash} from './studio.mjs';

export const MATERIAL_FILTERS=['todos','PLA','PETG'];
export const catalogRecipe=p=>({...p,variant:'sem-fundo',...(isStudio(p)?{slots:[...p.slots]}:{}),colors:p.colors.map(c=>({...c}))});
export const catalogKey=p=>isStudio(p)?studioKey(p):recipeKey({...p,variant:'sem-fundo'});

// The feed reuses the existing physical-color rules and composition ranking.
// Its finite universe is paged without repeating recipes or inventing filaments.
export function createCatalogPager({material='todos',size=PAGE_SIZE}={}){
 if(!MATERIAL_FILTERS.includes(material))throw new Error('Material inválido.');
 if(!Number.isSafeInteger(size)||size<1)throw new Error('Quantidade por lote inválida.');
 const ranked=[];
 for(const group of GROUPS.filter(g=>material==='todos'||g.material===material)){
  for(const count of [3,4,5].filter(n=>n<=group.colors.length)){
   const neutrals=count===4&&group.base.length===3?['white','black']:['white'];
   for(const neutral of neutrals){
    const recipes=createRecipePager({groupId:group.id,variant:'sem-fundo',count,neutral,size:5000,seed:1}).next();
    for(const recipe of recipes){const design=recommendationFor(recipe);if(!design.recommended)recipe.name=`${group.name} · ${count} cores`;ranked.push({recipe,design,key:recipeKey(recipe)});}
   }
  }
 }
 ranked.sort((a,b)=>Number(b.design.recommended)-Number(a.design.recommended)||b.design.score-a.design.score||a.key.localeCompare(b.key));
 let offset=0;
 return {total:ranked.length,get hasMore(){return offset<ranked.length;},next(){const start=offset;offset=Math.min(offset+size,ranked.length);return ranked.slice(start,offset).map(p=>catalogRecipe(p.recipe));}};
}

export function catalogFavorites(favorites,material='todos'){
 const unique=new Map();
 const ordered=[...favorites.filter(isStudio).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)),...listFavorites(favorites.filter(p=>!isStudio(p)))];
 for(const p of ordered)if(material==='todos'||p.material===material){const key=catalogKey(p);if(!unique.has(key))unique.set(key,catalogRecipe(p));}
 return [...unique.values()];
}

export function recipeHash(recipe){return isStudio(recipe)?studioHash(recipe):`#/peca/${encodeURIComponent(recipe.groupId)}/${recipe.colors.map(c=>encodeURIComponent(c.id)).join(',')}`;}
export function recipeFromHash(hash){
 if(hash.startsWith('#/peca/estudio/'))return studioFromHash(hash);
 const match=hash.match(/^#\/peca\/([^/]+)\/([^/?#]+)$/);
 if(!match)throw new Error('Esta combinação não foi encontrada.');
 const group=groupById(decodeURIComponent(match[1])),ids=match[2].split(',').map(decodeURIComponent);
 const colors=ids.map(id=>{const color=group.colors.find(c=>c.id===id);if(!color)throw new Error('Filamento não encontrado neste grupo.');return color;});
 const recipe=makeRecipe(group.id,'sem-fundo',colors,`${group.name} · ${colors.length} cores`),design=recommendationFor(recipe);
 if(design.recommended)recipe.name=design.title;
 return recipe;
}
