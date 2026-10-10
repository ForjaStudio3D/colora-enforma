import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GROUPS} from '../src/catalog.mjs';
import {generateBatch,roleSlots,availablePool,recipeKey,validateBackup,validateRecipe,saveFavorites,loadFavorites} from '../src/core.mjs';
test('all generated recipes stay in the selected group and have exactly the requested physical colors',()=>{
 for(const group of GROUPS)for(const count of [3,4,5]){
  if(group.colors.length<count){assert.throws(()=>generateBatch({groupId:group.id,count}));continue;}
  for(const seed of [1,2,19,388])for(const variant of ['com-fundo','sem-fundo']){
   const recipes=generateBatch({groupId:group.id,count,variant,seed});assert.equal(recipes.length,6);
   for(const p of recipes){assert.equal(p.material,group.material);assert.equal(new Set(p.colors.map(c=>c.id)).size,count);assert.ok(p.colors.every(c=>group.colors.some(x=>x.id===c.id)));assert.equal(new Set(roleSlots(count).map(i=>p.colors[i].id)).size,count);}
  }
 }
});
test('three-color yellow/blue PETG always includes white and cannot invent a fifth',()=>{
 assert.deepEqual(availablePool('petg-azul-amarelo',3).map(c=>c.id),['deepblue','yellow','white']);
 assert.throws(()=>availablePool('petg-azul-amarelo',5),/4 cores/);
});
test('white or black is the fourth filament for teams of three',()=>{
 for(const neutral of ['white','black'])for(const p of generateBatch({groupId:'pla-tropical',count:4,neutral})){
  assert.ok(p.colors.some(c=>c.id===neutral));assert.ok(!p.colors.some(c=>c.id===(neutral==='white'?'black':'white')));
 }
});
test('locks survive generation and do not let colors cross group boundaries',()=>{
 const p=generateBatch({groupId:'pla-roxo-silk',count:4,seed:3})[0];
 const next=generateBatch({groupId:p.groupId,count:4,current:p,locks:[true,false,true,false],seed:10});
 assert.ok(next.every(x=>x.colors[0].id===p.colors[0].id&&x.colors[2].id===p.colors[2].id));
 const all=generateBatch({groupId:p.groupId,count:4,current:p,locks:[true,true,true,true]});assert.equal(all.length,1);
});
test('favorites snapshot finishes and reject mixed material, duplicate or foreign colors',()=>{
 const p=generateBatch({groupId:'petg-rosas',count:5})[0];
 assert.throws(()=>validateRecipe({...p,material:'PLA'}));
 assert.throws(()=>validateRecipe({...p,colors:p.colors.map((c,i)=>i===0?{...c,id:'violet'}:c)}));
 assert.throws(()=>validateRecipe({...p,colors:p.colors.map((c,i)=>i===0?p.colors[1]:c)}));
 const valid=validateRecipe(p);assert.equal(recipeKey(valid),recipeKey(p));assert.notEqual(valid.colors,p.colors);
});
test('backup restores group, material, count and variant; invalid backups are atomic failures',()=>{
 const a=generateBatch({groupId:'petg-rosas',count:3})[0],b=generateBatch({groupId:'pla-boneca',count:5,variant:'sem-fundo'})[0];
 const backup={app:'colora-enforma',version:1,favorites:[a,b,a]};assert.equal(validateBackup(backup).length,2);
 assert.throws(()=>validateBackup({...backup,favorites:[a,{...b,material:'PETG'}]}));
 const memory=new Map(),storage={setItem:(k,v)=>memory.set(k,v),getItem:k=>memory.get(k)};saveFavorites(storage,[a,b]);assert.deepEqual(loadFavorites(storage).map(recipeKey),[a,b].map(recipeKey));
});
test('backup cannot bypass team membership rules or invent a filament color or finish',()=>{
 const p=generateBatch({groupId:'petg-azul-amarelo',count:3})[0];
 const black=GROUPS.find(g=>g.id===p.groupId).colors.find(c=>c.id==='black');
 assert.throws(()=>validateRecipe({...p,colors:p.colors.map(c=>c.id==='white'?black:c)}),/permitidas/);
 const tropical=generateBatch({groupId:'pla-tropical',count:4})[0];
 const tropicalBlack=GROUPS.find(g=>g.id===tropical.groupId).colors.find(c=>c.id==='black');
 assert.throws(()=>validateRecipe({...tropical,colors:tropical.colors.map(c=>c.id==='gold'?tropicalBlack:c)}),/permitidas/);
 assert.throws(()=>validateRecipe({...p,colors:p.colors.map(c=>({...c,hex:'#123456'}))}),/cadastrado/);
 assert.throws(()=>validateRecipe({...p,colors:p.colors.map((c,i)=>i===0?{...c,finish:'silk'}:c)}),/cadastrado/);
});
