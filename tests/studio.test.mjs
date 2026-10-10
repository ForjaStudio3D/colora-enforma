import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GROUPS} from '../src/catalog.mjs';
import {listRecommendations,roleSlots} from '../src/core.mjs';
import {materialPalette,makeStudioRecipe,studioFromRecipe,defaultStudioRecipe,replaceStudioColor,randomStudioRecipe,validateStudioRecipe,renderRecipe,loadStudioDrafts,saveStudioDrafts} from '../src/studio.mjs';
import {recipeHash,recipeFromHash,catalogFavorites,catalogKey} from '../src/catalog-feed.mjs';
import {loadFavoriteCollection,saveFavoriteCollection,validateFavoriteBackup,favoriteBackup} from '../src/favorites.mjs';
import {orderMessage,whatsappUrl,WHATSAPP_NUMBER,recipeRows} from '../src/order.mjs';

const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};};
const physical=c=>`${c.hex}:${c.finish}`;
test('Studio palettes contain the real filaments of one material, including distinct red/yellow spools and deduplicated neutrals',()=>{
 for(const material of ['PLA','PETG']){
  const palette=materialPalette(material),known=GROUPS.filter(g=>g.material===material).flatMap(g=>g.colors);
  assert.deepEqual(new Set(palette.map(physical)),new Set(known.map(physical)));assert.equal(new Set(palette.map(physical)).size,palette.length);
  assert.equal(palette.filter(c=>c.name==='Branco').length,1);assert.equal(palette.filter(c=>c.name==='Preto').length,1);
 }
 assert.equal(materialPalette('PLA').filter(c=>c.name==='Vermelho').length,2);
 const pla=defaultStudioRecipe('PLA'),pink=materialPalette('PETG')[0];assert.throws(()=>replaceStudioColor(pla,2,pink.id));assert.throws(()=>materialPalette('ABS'));
});
test('no-color regions inherit the body without removing geometry, support 1 to 4 physical colors, and require a principal color',()=>{
 const initial=defaultStudioRecipe('PLA');let p=initial;
 for(const [region,count]of [[3,3],[2,2],[1,1]]){p=replaceStudioColor(p,region,null);assert.equal(p.count,count);assert.equal(p.colors[region].hex,p.colors[0].hex);assert.deepEqual(renderRecipe(p).map,[0,0,1,2,3]);}
 assert.deepEqual(p.slots,[initial.slots[0],null,null,null]);assert.throws(()=>replaceStudioColor(p,0,null));
 const white=materialPalette('PLA').find(c=>c.name==='Branco');p=replaceStudioColor(p,0,white.id);assert.ok(p.colors.every(c=>c.id===white.id));assert.equal(p.count,1);
 assert.equal(validateStudioRecipe(p).count,1);assert.throws(()=>validateStudioRecipe({...p,count:4}));assert.throws(()=>validateStudioRecipe({...p,colors:[...p.colors.slice(0,3),{...p.colors[3],hex:'#123456'}]}));
 assert.equal(initial.count,4);
});
test('editing legacy 3/4-color recipes preserves their region colors; a 5-color study converts only in the new editing copy',()=>{
 for(const legacy of listRecommendations('sem-fundo')){
  const before=JSON.stringify(legacy),p=studioFromRecipe(legacy),oldRegions=roleSlots(legacy.count).map(i=>physical(legacy.colors[i]));
  const newRegions=renderRecipe(p).map.map(i=>physical(p.colors[i]));
  if(legacy.count<5)assert.deepEqual(newRegions,oldRegions);else{assert.equal(p.count,4);assert.equal(newRegions[0],oldRegions[0]);assert.deepEqual(newRegions.slice(2),oldRegions.slice(2));}
  assert.equal(JSON.stringify(legacy),before);assert.equal(p.material,legacy.material);
 }
});
test('Random fixes any principal color, preserves inactive regions and selects distinct eligible accent spools',()=>{
 for(const material of ['PLA','PETG']){
  const pool=materialPalette(material);
  for(const name of ['Branco','Preto',material==='PLA'?'Vermelho':'Rosa pink']){
   const base=pool.find(c=>c.name===name),source=replaceStudioColor(defaultStudioRecipe(material),0,base.id);
   for(const inactive of [[],[3],[1,3],[1,2,3]]){
    let p=source;for(const i of inactive)p=replaceStudioColor(p,i,null);const before=JSON.stringify(p);
    for(const seed of [1,2,3]){const next=randomStudioRecipe(p,seed);assert.equal(next.slots[0],base.id);assert.deepEqual(next.slots.map((c,i)=>c===null?i:null),p.slots.map((c,i)=>c===null?i:null));assert.equal(next.count,4-inactive.length);assert.ok(next.colors.every(c=>pool.some(x=>x.id===c.id)));assert.equal(validateStudioRecipe(next).material,material);}
    assert.equal(JSON.stringify(p),before);
   }
  }
 }
});
test('Studio links restore independent of cache, including inactive/repeated colors, and reject cross-material links',()=>{
 const base=defaultStudioRecipe('PETG'),p=replaceStudioColor(replaceStudioColor(base,3,null),1,base.slots[0]);
 assert.equal(catalogKey(recipeFromHash(recipeHash(p))),catalogKey(p));
 assert.deepEqual(recipeFromHash(recipeHash(p)).slots,p.slots);
 const pla=materialPalette('PLA')[0].id;assert.throws(()=>recipeFromHash(`#/peca/estudio/PETG/${pla},_,_,_`));assert.throws(()=>recipeFromHash('#/peca/estudio/PLA/_,_,_,_'));
});
test('each material draft survives reload and changing one leaves the other intact, even with a partially invalid cache',()=>{
 const storage=memory(),drafts=loadStudioDrafts(storage),petg=JSON.stringify(drafts.PETG);
 drafts.PLA=replaceStudioColor(drafts.PLA,2,null);saveStudioDrafts(storage,drafts);
 const restored=loadStudioDrafts(storage);assert.deepEqual(restored.PLA.slots,drafts.PLA.slots);assert.equal(JSON.stringify(restored.PETG),petg);
 storage.setItem('colora-enforma:studio:v1',JSON.stringify({PLA:{...drafts.PLA,material:'PETG'},PETG:drafts.PETG}));assert.deepEqual(loadStudioDrafts(storage).PETG,drafts.PETG);
 assert.equal(loadStudioDrafts({getItem(){throw new Error();}}).PLA.material,'PLA');
});
test('favorites migrate legacy snapshots without losing background data and back up manual 1/2-color recipes atomically',()=>{
 const storage=memory(),legacy=listRecommendations()[0],old=JSON.stringify({app:'colora-enforma',version:1,favorites:[legacy]});storage.setItem('colora-enforma:favorites:v1',old);
 assert.equal(loadFavoriteCollection(storage)[0].variant,'com-fundo');
 let single=defaultStudioRecipe('PETG');for(const i of [1,2,3])single=replaceStudioColor(single,i,null);
 const favorites=[legacy,single];saveFavoriteCollection(storage,favorites);assert.equal(storage.getItem('colora-enforma:favorites:v1'),old);
 const restored=loadFavoriteCollection(storage);assert.equal(restored.length,2);assert.deepEqual(restored[1].slots,single.slots);assert.equal(catalogFavorites(restored).length,2);
 assert.deepEqual(validateFavoriteBackup(favoriteBackup(restored)).map(catalogKey),restored.map(catalogKey));
 assert.throws(()=>validateFavoriteBackup(favoriteBackup([single,{...single,material:'PLA'}])));assert.equal(loadFavoriteCollection(storage).length,2);
});
test('orders carry all four effective HEX values, inactive-region meaning, material and a cache-independent link to the exact recipe',()=>{
 const p=replaceStudioColor(defaultStudioRecipe('PETG'),3,null),text=orderMessage(p,'https://forjastudio3d.github.io/colora-enforma/#/favoritas/todos');
 assert.equal(recipeRows(p).length,4);assert.equal((text.match(/#[A-F\d]{6}/g)||[]).length,4);assert.ok(text.includes('Material: PETG'));assert.ok(text.includes('sem cor própria; usa a principal'));
 const url=new URL(whatsappUrl(text));assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,`/${WHATSAPP_NUMBER}`);assert.equal(url.searchParams.get('text'),text);
 const detailUrl=text.match(/Ver combinação: (\S+)/)[1];assert.equal(catalogKey(recipeFromHash(new URL(detailUrl).hash)),catalogKey(p));
});
