import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GROUPS,PALETTE_SELECTIONS} from '../src/catalog.mjs';
import {generateBatch,createRecipePager,PAGE_SIZE,roleSlots,availablePool,recipeKey,validateBackup,validateRecipe,saveFavorites,loadFavorites,makeRecipe,recommendationFor,listFavorites,listRecommendations} from '../src/core.mjs';
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
test('scroll pages contain 50 unique combinations, never repeat and stop at exhaustion',()=>{
 const pager=createRecipePager({groupId:'petg-rosas',count:5,seed:17});
 assert.equal(PAGE_SIZE,50);assert.equal(pager.total,120);
 const pages=[pager.next(),pager.next(),pager.next()];assert.deepEqual(pages.map(p=>p.length),[50,50,20]);
 assert.equal(new Set(pages.flat().map(recipeKey)).size,120);assert.equal(pager.hasMore,false);assert.deepEqual(pager.next(),[]);
 assert.ok(pages.flat().every(p=>p.material==='PETG'&&p.groupId==='petg-rosas'&&new Set(p.colors.map(c=>c.id)).size===5));
});
test('small teams and locked colors finish without duplicate padding or infinite loading',()=>{
 const small=createRecipePager({groupId:'pla-tropical',count:4});assert.equal(small.next().length,24);assert.equal(small.hasMore,false);
 const three=createRecipePager({groupId:'petg-azul-amarelo',count:3});assert.equal(three.next().length,6);assert.equal(three.hasMore,false);
 const current=generateBatch({groupId:'pla-boneca',count:5,seed:4})[0];
 const locked=createRecipePager({groupId:'pla-boneca',count:5,current,locks:[true,false,false,false,false],seed:2});
 const recipes=[];while(locked.hasMore)recipes.push(...locked.next());
 assert.equal(recipes.length,360);assert.equal(new Set(recipes.map(recipeKey)).size,360);assert.ok(recipes.every(p=>p.colors[0].id===current.colors[0].id));
 const all=createRecipePager({groupId:current.groupId,count:5,current,locks:[true,true,true,true,true]});assert.equal(all.next().length,1);assert.equal(all.hasMore,false);
});
test('authored recommendations use canonical filaments and keep dark art and bright highlights in their actual regions',()=>{
 for(const group of GROUPS)for(const pick of PALETTE_SELECTIONS[group.id]){
  const colors=pick.ids.map(id=>group.colors.find(c=>c.id===id));
  for(const variant of ['com-fundo','sem-fundo']){
   const recipe=makeRecipe(group.id,variant,colors,pick.name),before=JSON.stringify(recipe);
   const design=recommendationFor(recipe),regions=roleSlots(recipe.count).map(i=>recipe.colors[i]);
   assert.equal(design.recommended,true);assert.equal(design.title,pick.name);assert.equal(JSON.stringify(recipe),before);
   assert.notEqual(regions[4].id,'black');
   if(recipe.count===5){assert.equal(regions[1].id,'black');assert.equal(regions[4].id,'white');}
   assert.equal(recipeKey(validateRecipe(recipe)),recipeKey(recipe));
  }
 }
 const group=GROUPS[0],good=makeRecipe(group.id,'com-fundo',['violet','blue','sky','white'].map(id=>group.colors.find(c=>c.id===id)));
 const inverted=makeRecipe(group.id,'com-fundo',[...good.colors].reverse());
 assert.ok(recommendationFor(good).score>recommendationFor(inverted).score);assert.equal(recommendationFor(inverted).recommended,false);
});
test('recommended filters preserve all combinations, page size and locks without inventing a selection',()=>{
 for(const group of GROUPS)for(const count of [3,4,5])for(const neutral of ['white','black']){
  if(count>group.colors.length)continue;
  const all=createRecipePager({groupId:group.id,count,neutral,size:5000}),recipes=all.next();
  const selected=createRecipePager({groupId:group.id,count,neutral,selection:'recommended'}),picks=selected.next();
  assert.ok(picks.length>0);assert.equal(selected.availableTotal,recipes.length);assert.equal(selected.recommendedTotal,picks.length);
  assert.deepEqual(new Set(picks.map(recipeKey)),new Set(recipes.filter(p=>recommendationFor(p).recommended).map(recipeKey)));
  const scores=recipes.map(p=>recommendationFor(p).score);assert.deepEqual(scores,[...scores].sort((a,b)=>b-a));
 }
 const all=createRecipePager({groupId:'pla-boneca',count:5,size:5000}).next(),custom=all.find(p=>!recommendationFor(p).recommended);
 const locked=createRecipePager({groupId:custom.groupId,count:5,current:custom,locks:Array(5).fill(true),selection:'recommended'});
 assert.equal(locked.availableTotal,1);assert.equal(locked.total,0);assert.deepEqual(locked.next(),[]);assert.equal(locked.hasMore,false);
 const free=createRecipePager({groupId:custom.groupId,count:5,current:custom,locks:Array(5).fill(true)});assert.equal(recipeKey(free.next()[0]),recipeKey(custom));
});
test('favorites list recommended first and filter copies without changing or losing saved recipes',()=>{
 const recipes=createRecipePager({groupId:'pla-boneca',count:5,size:5000}).next(),picks=recipes.filter(p=>recommendationFor(p).recommended),custom=recipes.find(p=>!recommendationFor(p).recommended);
 const saved=[custom,picks[1],picks[0]],before=JSON.stringify(saved),all=listFavorites(saved),selected=listFavorites(saved,'recommended');
 assert.equal(all.length,saved.length);assert.equal(selected.length,2);assert.ok(recommendationFor(all[0]).recommended);
 assert.deepEqual(new Set(all.map(recipeKey)),new Set(saved.map(recipeKey)));assert.equal(JSON.stringify(saved),before);
 assert.deepEqual(new Set(validateBackup({app:'colora-enforma',version:1,favorites:saved}).map(recipeKey)),new Set(saved.map(recipeKey)));
});
test('public recommendations are complete on a fresh browser, independent of favorites, with both piece variants',()=>{
 const emptyStorage={getItem:()=>null},picks=listRecommendations(),withoutBackground=listRecommendations('sem-fundo');
 assert.deepEqual(loadFavorites(emptyStorage),[]);assert.equal(picks.length,28);assert.equal(withoutBackground.length,28);
 assert.deepEqual(new Set(picks.map(p=>p.groupId)),new Set(GROUPS.map(g=>g.id)));
 assert.deepEqual(new Set(picks.map(p=>p.count)),new Set([3,4,5]));
 assert.equal(new Set([...picks,...withoutBackground].map(recipeKey)).size,56);
 for(const recipe of [...picks,...withoutBackground]){assert.ok(recommendationFor(recipe).recommended);assert.equal(recipeKey(validateRecipe(recipe)),recipeKey(recipe));}
 assert.ok(picks.some(p=>p.count===4&&p.colors.some(c=>c.id==='black')));assert.ok(picks.some(p=>p.count===4&&p.colors.some(c=>c.id==='white')));
 assert.ok(picks.filter(p=>p.groupId==='petg-azul-amarelo').every(p=>p.count<=4));
 const saved=[picks[0]],before=JSON.stringify(saved),fresh=listRecommendations();fresh[0].colors[0].hex='#000000';
 assert.equal(JSON.stringify(saved),before);assert.notEqual(listRecommendations()[0].colors[0].hex,'#000000');assert.equal(listRecommendations().length,28);
});
test('each material has a four-color recommendation with a white body and contrasting logo using its own filaments',()=>{
 for(const variant of ['com-fundo','sem-fundo'])for(const material of ['PLA','PETG']){
  const picks=listRecommendations(variant).filter(p=>p.material===material),whiteBases=picks.filter(p=>p.colors[0].id==='white');
  assert.ok(whiteBases.length>=1);assert.ok(picks.every(p=>GROUPS.find(g=>g.id===p.groupId).material===material));
  for(const p of whiteBases){const regions=roleSlots(p.count).map(i=>p.colors[i]);assert.equal(p.count,4);assert.equal(regions[0].id,'white');assert.notEqual(regions[3].id,'white');assert.notEqual(regions[4].id,'white');assert.equal(recipeKey(validateRecipe(p)),recipeKey(p));}
 }
});
