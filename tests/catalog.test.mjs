import {test} from 'node:test';
import assert from 'node:assert/strict';
import {listRecommendations,recipeKey,recommendationFor,validateRecipe} from '../src/core.mjs';
import {createCatalogPager,catalogFavorites,catalogKey,recipeHash,recipeFromHash} from '../src/catalog-feed.mjs';

test('catalog pages cover every legal combination without background, with curated picks first and unique batches of 50',()=>{
 const pager=createCatalogPager(),first=pager.next(),second=pager.next();
 assert.equal(pager.total,4296);assert.equal(first.length,50);assert.equal(second.length,50);
 assert.deepEqual(new Set(first.filter(p=>recommendationFor(p).recommended).map(recipeKey)),new Set(listRecommendations('sem-fundo').map(recipeKey)));
 assert.deepEqual(new Set(first.map(p=>p.material)),new Set(['PLA','PETG']));
 for(const material of ['PLA','PETG'])assert.ok(first.some(p=>p.material===material&&p.colors[0].id==='white'));
 const all=[...first,...second];while(pager.hasMore)all.push(...pager.next());
 assert.equal(all.length,4296);assert.equal(new Set(all.map(recipeKey)).size,4296);assert.deepEqual(pager.next(),[]);
 for(const p of all){assert.equal(p.variant,'sem-fundo');assert.equal(recipeKey(validateRecipe(p)),recipeKey(p));}
 assert.deepEqual(createCatalogPager().next().map(recipeKey),first.map(recipeKey));
});
test('PLA and PETG feeds partition Todos, retain independent paging and reject unsupported filters',()=>{
 const totals={PLA:4092,PETG:204};
 for(const [material,total]of Object.entries(totals)){
  const pager=createCatalogPager({material}),all=[];while(pager.hasMore)all.push(...pager.next());
  assert.equal(pager.total,total);assert.equal(all.length,total);assert.ok(all.every(p=>p.material===material));assert.equal(new Set(all.map(recipeKey)).size,total);
 }
 assert.throws(()=>createCatalogPager({material:'ABS'}));assert.throws(()=>createCatalogPager({size:0}));
});
test('detail URLs restore exact filaments on a fresh browser and reject invalid or mixed recipes',()=>{
 for(const p of createCatalogPager().next())assert.equal(recipeKey(recipeFromHash(recipeHash(p))),recipeKey(p));
 for(const hash of ['#/peca/unknown/white,black,red','#/peca/petg-rosas/white,red,pink,hotpink','#/peca/petg-azul-amarelo/deepblue,yellow,black','#/peca/pla-roxo-silk/white,white,royal,azure','#/peca/pla-roxo-silk/%','#/peca/pla-roxo-silk'])assert.throws(()=>recipeFromHash(hash));
});
test('legacy favorites display without background and deduplicate visually without mutating saved backups',()=>{
 const p=listRecommendations()[0],q=listRecommendations('sem-fundo')[0],rose=listRecommendations().find(p=>p.material==='PETG');
 const saved=[p,q,rose],before=JSON.stringify(saved),visible=catalogFavorites(saved);
 assert.equal(visible.length,2);assert.ok(visible.every(p=>p.variant==='sem-fundo'));assert.equal(catalogFavorites(saved,'PETG').length,1);
 assert.equal(catalogKey(p),catalogKey(q));assert.equal(JSON.stringify(saved),before);visible[0].colors[0].hex='#000000';assert.equal(JSON.stringify(saved),before);
});
