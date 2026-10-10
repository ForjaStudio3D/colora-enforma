import {FINISH_LABELS,groupById} from './catalog.mjs';
import {recommendationFor} from './core.mjs';
import {createCatalogPager,catalogFavorites,catalogRecipe,catalogKey,recipeHash,recipeFromHash} from './catalog-feed.mjs';
import {isStudio,materialPalette,STUDIO_REGIONS,studioFromRecipe,replaceStudioColor,randomStudioRecipe,loadStudioDrafts,saveStudioDrafts} from './studio.mjs';
import {loadFavoriteCollection,saveFavoriteCollection,validateFavoriteBackup,favoriteBackup,favoriteKey} from './favorites.mjs';
import {recipeRows,orderMessage,whatsappUrl} from './order.mjs';
import {KeychainViewer} from './viewer.mjs';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const swatch=c=>`<span class="color-disc ${c.finish}" style="--swatch:${c.hex}" aria-hidden="true"></span>`;
const noneSwatch='<span class="color-disc no-color" aria-hidden="true"></span>';
const regionLabels=['Principal','Arte média','Arte clara / Kids','Brilhos / Enforma'];
const state={view:'catalog',material:'todos',current:null,favorites:[],galleryRecipes:[],feeds:new Map(),positions:new Map(),route:'',returnRoute:'#/recomendados/todos',returnKey:null,ready:false,generation:0,thumbnails:new Map(),studioMaterial:'PLA',selectedRegion:0,drafts:null};
let storage,viewer=null,toastTimer,renderingThumbnails=false,storageNotified=false,order=null;
try{storage=localStorage;state.favorites=loadFavoriteCollection(storage);}catch{storage=null;}
state.drafts=loadStudioDrafts(storage);
const thumbnailJobs=new Map();
const thumbnailObserver=new IntersectionObserver(entries=>{
 for(const {target,isIntersecting} of entries){
  if(!isIntersecting){thumbnailJobs.delete(target);const holder=target.querySelector('.palette-image');if(holder?.querySelector('img'))holder.innerHTML='<span class="palette-placeholder">Prévia 3D</span>';continue;}
  const recipe=state.galleryRecipes[Number(target.dataset.open)];
  if(recipe&&state.ready)thumbnailJobs.set(target,{recipe,generation:state.generation});
 }
 renderThumbnails();
},{rootMargin:'250px'});
const pageObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))loadMore();},{rootMargin:'300px'});
const catalogHref=(view=state.view,material=state.material)=>`#/${view==='favorites'?'favoritas':'recomendados'}/${material}`;
const nextFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
const visibleFavorites=()=>catalogFavorites(state.favorites);
const isFavorite=p=>state.favorites.some(f=>catalogKey(f)===catalogKey(p));
const colorCount=p=>`${p.count} ${p.count===1?'cor':'cores'}`;
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4300);}
function download(name,blob){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function storageWarning(){if(!storageNotified){toast('Sem acesso ao armazenamento. Suas escolhas duram nesta sessão; baixe um backup.');storageNotified=true;}}
function persist(){try{if(!storage)throw new Error();saveFavoriteCollection(storage,state.favorites);}catch{storageWarning();}}
function persistDrafts(){try{if(!storage)throw new Error();saveStudioDrafts(storage,state.drafts);}catch{storageWarning();}}
function updateSaveButtons(){
 const saved=state.current&&isFavorite(state.current);$('#save-current').textContent=saved?'♥ Favorita salva':'♡ Salvar favorita';$('#save-current').classList.toggle('saved',!!saved);$('#save-current').disabled=!state.current;
 $('#save-studio').textContent=saved?'♥ Salva':'♡ Salvar';$('#save-studio').classList.toggle('saved',!!saved);$('#save-studio').disabled=!!saved;
 $('#fav-count').textContent=visibleFavorites().length;
 $$('.card-save').forEach(button=>{const p=state.galleryRecipes[Number(button.dataset.save)];if(!p)return;const saved=isFavorite(p);button.textContent=saved?'♥':'♡';button.setAttribute('aria-pressed',String(saved));button.setAttribute('aria-label',`${saved?'Remover das favoritas':'Salvar favorita'} ${p.name}`);});
 $$('.card-order').forEach(button=>button.disabled=!state.ready);
}
function getFeed(material=state.material){
 if(!state.feeds.has(material)){const pager=createCatalogPager({material});state.feeds.set(material,{pager,items:pager.next(),loading:false});}
 return state.feeds.get(material);
}
function paletteCard(p,i){
 return `<article class="palette-card" data-key="${escape(catalogKey(p))}" data-material="${p.material}" data-base="${p.colors[0].id}"><a class="palette-open" href="${escape(recipeHash(p))}" data-open="${i}" aria-label="Ver detalhes de ${escape(p.name)}"><div class="palette-image"><span class="palette-placeholder">Prévia 3D</span></div><div class="palette-copy"><strong>${escape(p.name)}</strong><small>${p.material} · ${colorCount(p)}</small></div></a><button class="card-save" data-save="${i}" aria-label="${isFavorite(p)?'Remover das favoritas':'Salvar favorita'} ${escape(p.name)}" aria-pressed="${isFavorite(p)}">${isFavorite(p)?'♥':'♡'}</button>${state.view==='favorites'?`<button class="card-order" data-order="${i}" ${state.ready?'':'disabled'} aria-label="Pedir ${escape(p.name)}">Pedir</button>`:''}</article>`;
}
function observeCards(cards){for(const card of cards){const target=card.querySelector('.palette-open');if(target)thumbnailObserver.observe(target);}}
async function renderThumbnails(){
 if(renderingThumbnails||!state.ready)return;renderingThumbnails=true;
 try{while(thumbnailJobs.size){
  await nextFrame();const item=thumbnailJobs.entries().next().value;if(!item)break;
  const [target,{recipe,generation}]=item;thumbnailJobs.delete(target);
  if(generation!==state.generation||!target.isConnected)continue;
  try{
   const key=catalogKey(recipe),png=state.thumbnails.get(key)||viewer.snapshot(recipe);state.thumbnails.delete(key);state.thumbnails.set(key,png);
   while(state.thumbnails.size>140)state.thumbnails.delete(state.thumbnails.keys().next().value);
   const img=new Image();img.alt=`Enforma ${recipe.material}, ${colorCount(recipe)}, sem fundo`;img.src=png;img.decoding='async';target.querySelector('.palette-image').replaceChildren(img);
  }catch(error){console.error(error);target.querySelector('.palette-image').textContent='Prévia indisponível.';}
 }}finally{renderingThumbnails=false;}
}
function renderFeedStatus(){
 pageObserver.disconnect();const catalog=state.view==='catalog';$('#feed-footer').hidden=!catalog;
 if(!catalog){$('#gallery').setAttribute('aria-busy','false');return;}
 const feed=getFeed();$('#gallery').setAttribute('aria-busy',String(feed.loading));
 $('#feed-status').textContent=feed.loading?'Carregando mais combinações…':`${feed.items.length} de ${feed.pager.total} combinações${feed.pager.hasMore?'':' · Você viu todas as combinações deste material'}`;
 $('#load-more').hidden=!feed.pager.hasMore;$('#load-more').disabled=feed.loading;
 if(feed.pager.hasMore&&!feed.loading)pageObserver.observe($('#feed-sentinel'));
}
function renderGallery(){
 ++state.generation;thumbnailObserver.disconnect();thumbnailJobs.clear();
 const favorites=state.view==='favorites',recipes=state.galleryRecipes=favorites?catalogFavorites(state.favorites,state.material):getFeed().items;
 $('#catalog-heading').textContent=favorites?'Suas favoritas':'Recomendados';
 $$('#material-tabs a').forEach(tab=>{const selected=tab.dataset.material===state.material;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;tab.href=catalogHref(state.view,tab.dataset.material);});
 $('#gallery').setAttribute('aria-labelledby',`material-${state.material.toLowerCase()}`);
 if(recipes.length){$('#gallery').innerHTML=recipes.map(paletteCard).join('');observeCards($('#gallery').children);}
 else{$('#gallery').innerHTML=`<div class="empty-state"><strong>${state.favorites.length?'Nenhuma favorita neste material.':'Suas favoritas aparecem aqui.'}</strong><p>Toque no coração das combinações que gostar.</p><a class="quiet-button" href="#/recomendados/${state.material}">Ver recomendados</a></div>`;}
 updateSaveButtons();renderFeedStatus();
}
async function loadMore(){
 if(state.view!=='catalog')return;const feed=getFeed();if(feed.loading||!feed.pager.hasMore)return;
 const material=state.material;feed.loading=true;renderFeedStatus();await nextFrame();
 if(state.view!=='catalog'||state.material!==material){feed.loading=false;return;}
 const start=feed.items.length,recipes=feed.pager.next();feed.items.push(...recipes);feed.loading=false;
 $('#gallery').insertAdjacentHTML('beforeend',recipes.map((p,i)=>paletteCard(p,start+i)).join(''));observeCards([...$('#gallery').children].slice(start));renderFeedStatus();
}
function colorRows(p){return recipeRows(p).map(({label,color,inherited})=>`<div class="detail-color">${inherited?noneSwatch:swatch(color)}<div><span>${escape(label)}</span><strong>${inherited?'Sem cor própria':escape(color.name)}</strong><small>${color.hex.toUpperCase()} · ${inherited?'Usa a principal':FINISH_LABELS[color.finish]}</small></div></div>`).join('');}
function renderDetail(){
 const p=state.current;if(!p)return;
 $('#detail-title').textContent=p.name;$('#detail-meta').textContent=`${p.material} · ${colorCount(p)}${isStudio(p)?'':` · ${groupById(p.groupId).name}`}`;
 $('#stage-material').textContent=p.material;$('#detail-colors').innerHTML=colorRows(p);
 $('#pause-note').hidden=p.count!==5;
 $('#palette-explanation').textContent=isStudio(p)?'Sua combinação criada no Estúdio.':recommendationFor(p).reason;
 $('#edit-studio').textContent=p.count===5?'Editar com 4 cores no Estúdio':'Editar no Estúdio';$('#download-png').disabled=!state.ready;updateSaveButtons();
}
function mountPreview(studio){$(studio?'#studio-preview':'#detail-preview').append($('#preview-panel'));}
function renderStudio(){
 const p=state.current=state.drafts[state.studioMaterial],region=state.selectedRegion,palette=materialPalette(p.material);
 $('#studio-count').textContent=colorCount(p);$('#stage-material').textContent=p.material;
 $$('#studio-tabs a').forEach(tab=>{const selected=tab.dataset.studioMaterial===p.material;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
 $('#studio-workspace').setAttribute('aria-labelledby',`studio-${p.material.toLowerCase()}`);
 $('#studio-regions').innerHTML=p.colors.map((c,i)=>`<button class="region-button" data-region="${i}" aria-pressed="${i===region}" aria-label="Editar ${STUDIO_REGIONS[i]}: ${p.slots[i]===null?'sem cor própria':escape(c.name)}">${p.slots[i]===null?noneSwatch:swatch(c)}<span>${regionLabels[i]}</span><small>${p.slots[i]===null?'Sem cor':c.hex.toUpperCase()}</small></button>`).join('');
 $('#active-region-label').textContent=region===0?'Cor principal':STUDIO_REGIONS[region];
 $('#studio-hint').textContent=region===0?'Random mantém esta cor.':'Sem cor usa a cor principal.';
 $('#studio-palette').innerHTML=`<button class="palette-color" data-color="" aria-label="Sem cor própria, usar a principal" title="${region===0?'A peça precisa de uma cor principal':'Sem cor própria: usa a principal'}" aria-pressed="${p.slots[region]===null}" ${region===0?'disabled':''}>${noneSwatch}<span>Sem cor</span></button>`+palette.map(c=>`<button class="palette-color" data-color="${c.id}" title="${escape(c.name)} · ${c.hex} · ${p.material} · ${FINISH_LABELS[c.finish]}" aria-label="${escape(c.name)}, ${c.hex}, ${FINISH_LABELS[c.finish]}" aria-pressed="${p.slots[region]===c.id}">${swatch(c)}<span>${escape(c.name)}</span></button>`).join('');
 $('#random-studio').disabled=p.slots.slice(1).every(x=>x===null);$('#download-png').disabled=!state.ready;
 viewer?.apply(p);updateSaveButtons();document.title=`Estúdio ${p.material} · Colora Enforma`;
}
function updateDraft(p){state.drafts[p.material]=catalogRecipe(p);persistDrafts();renderStudio();}
function openStudioFromCurrent(){
 if(!state.current)return;state.studioMaterial=state.current.material;state.drafts[state.studioMaterial]=studioFromRecipe(state.current);state.selectedRegion=0;persistDrafts();location.hash=`#/estudio/${state.studioMaterial}`;
}
function rememberPosition(){if(state.view==='catalog'||state.view==='favorites')state.positions.set(state.route,scrollY);}
async function renderRoute(){
 rememberPosition();const hash=location.hash||'#/recomendados/todos',fromStudio=state.view==='studio',fromPiece=['detail','studio'].includes(state.view);state.route=hash;
 for(const id of ['#catalog-screen','#detail-screen','#studio-screen','#route-error'])$(id).hidden=true;
 document.body.classList.remove('studio-mode');
 try{
  if(hash.startsWith('#/peca/')||hash.startsWith('#/estudio/')){
   if(!fromPiece)state.returnRoute=catalogHref();
   ++state.generation;thumbnailObserver.disconnect();thumbnailJobs.clear();pageObserver.disconnect();
   if(hash.startsWith('#/estudio/')){
    const m=hash.match(/^#\/estudio\/(PLA|PETG)$/);if(!m)throw new Error('Material não encontrado.');
    state.view='studio';state.studioMaterial=m[1];state.selectedRegion=0;document.body.classList.add('studio-mode');$('#studio-screen').hidden=false;mountPreview(true);renderStudio();
   }else{
    const p=recipeFromHash(hash),saved=state.favorites.find(f=>catalogKey(f)===catalogKey(p));state.current=catalogRecipe(saved||p);
    state.view='detail';$('#detail-screen').hidden=false;mountPreview(false);$('#back-to-catalog').href=state.returnRoute;viewer?.apply(state.current);renderDetail();document.title=`${state.current.name} · Colora Enforma`;
   }
   await nextFrame();if(state.route!==hash)return;viewer?.resize();scrollTo(0,0);$(state.view==='studio'?fromStudio?`#studio-${state.studioMaterial.toLowerCase()}`:'#studio-heading':'#detail-title').focus({preventScroll:true});
  }else{
   const match=hash.match(/^#\/(recomendados|favoritas)(?:\/(todos|PLA|PETG))?$/);if(!match)throw new Error('Página não encontrada.');
   state.view=match[1]==='favoritas'?'favorites':'catalog';state.material=match[2]||'todos';
   $('#catalog-screen').hidden=false;renderGallery();document.title=`${state.view==='favorites'?'Favoritas':'Recomendados'} · Colora Enforma`;
   await nextFrame();if(state.route!==hash)return;scrollTo(0,state.positions.get(hash)||0);
   if(fromPiece&&state.returnKey){const card=$$('.palette-card').find(c=>c.dataset.key===state.returnKey);card?.querySelector('.palette-open').focus({preventScroll:true});}
  }
 }catch(error){console.error(error.message);state.view='error';document.body.classList.remove('studio-mode');$('#route-error').hidden=false;pageObserver.disconnect();thumbnailObserver.disconnect();scrollTo(0,0);}
 $('#nav-recommendations').href=fromPiece?state.returnRoute.startsWith('#/recomendados')?state.returnRoute:'#/recomendados/todos':catalogHref('catalog');
 $('#nav-studio').href=`#/estudio/${state.view==='detail'?state.current.material:state.studioMaterial}`;
 for(const [id,view]of [['#nav-recommendations','catalog'],['#nav-favorites','favorites'],['#nav-studio','studio']]){const active=state.view===view;$(id).classList.toggle('active',active);if(active)$(id).setAttribute('aria-current','page');else $(id).removeAttribute('aria-current');}
}
function toggleFavorite(recipe){
 const key=catalogKey(recipe);
 if(isFavorite(recipe)){state.favorites=state.favorites.filter(p=>catalogKey(p)!==key);toast('Combinação removida das favoritas.');}
 else{if(state.favorites.length>=100){toast('Você já guardou 100 favoritas. Baixe um backup ou remova uma.');return;}state.favorites.push(catalogRecipe(recipe));toast('Combinação salva nas favoritas.');}
 persist();if(state.view==='favorites')renderGallery();else updateSaveButtons();
}
async function recipeImage(p){
 if(!state.ready)throw new Error('Aguarde a prévia 3D carregar.');
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1640;const ctx=canvas.getContext('2d');ctx.fillStyle='#f3f6fb';ctx.fillRect(0,0,1200,1640);
 const img=new Image();img.src=viewer.snapshot(p,1200,1240);await img.decode();ctx.drawImage(img,0,0);
 ctx.fillStyle='#20334c';ctx.font='bold 42px sans-serif';ctx.fillText('Colora Enforma',65,1304);ctx.font='25px sans-serif';ctx.fillStyle='#526784';ctx.fillText(`${p.material} · ${colorCount(p)} · Oceano sem fundo`,65,1345);
 recipeRows(p).forEach(({label,color,inherited},i)=>{const y=1392+i*36;ctx.fillStyle=color.hex;ctx.beginPath();ctx.arc(79,y-8,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#20334c';ctx.font='20px sans-serif';ctx.fillText(`${label}: ${color.hex.toUpperCase()} · ${inherited?'Sem cor própria':color.name}`,108,y);});
 ctx.fillStyle='#526784';ctx.font='18px sans-serif';ctx.fillText(p.count===5?'Estudo visual com cinco cores. Troca por pausa não validada.':'Tons aproximados dos filamentos. Avaliação de cores.',65,1620);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Não foi possível preparar a imagem.')),'image/png'));
}
function fileName(p){return `colora-enforma-${p.material.toLowerCase()}-${p.count}cores.png`;}
async function openOrder(recipe){
 const p=catalogRecipe(recipe),message=orderMessage(p,location.href),pending={recipe:p,message,file:null};order=pending;
 $('#order-preview').replaceChildren();$('#order-status').textContent='Preparando a imagem…';$('#share-order').hidden=true;$('#download-order').disabled=true;$('#open-whatsapp').href=whatsappUrl(message);$('#order-dialog').showModal();
 try{
  const blob=await recipeImage(p);if(order!==pending)return;
  pending.file=new File([blob],fileName(p),{type:'image/png'});const url=URL.createObjectURL(blob),img=new Image();img.alt=`Sua combinação ${p.material}, ${colorCount(p)}, com os códigos das regiões`;img.src=url;pending.url=url;$('#order-preview').append(img);
  const canShare=!!navigator.share&&!!navigator.canShare?.({files:[pending.file]});$('#share-order').hidden=!canShare;
  $('#order-status').textContent=canShare?'Escolha WhatsApp ao compartilhar e envie para a Forja. A imagem já inclui as cores.':'Baixe a imagem, abra o WhatsApp e anexe o PNG à mensagem pronta.';$('#download-order').disabled=false;
 }catch(error){$('#order-status').textContent=`${error.message} Você pode abrir o WhatsApp com as cores e o link.`;}
}
function closeOrder(){if(order?.url)URL.revokeObjectURL(order.url);order=null;}

$('#edit-studio').addEventListener('click',openStudioFromCurrent);
$('#nav-studio').addEventListener('click',e=>{if(state.view==='detail'){e.preventDefault();openStudioFromCurrent();}});
$('#studio-regions').addEventListener('click',e=>{const b=e.target.closest('[data-region]');if(!b)return;state.selectedRegion=Number(b.dataset.region);renderStudio();$(`#studio-regions [data-region="${state.selectedRegion}"]`).focus({preventScroll:true});});
$('#studio-palette').addEventListener('click',e=>{const b=e.target.closest('[data-color]');if(!b||b.disabled)return;const id=b.dataset.color||null;try{updateDraft(replaceStudioColor(state.current,state.selectedRegion,id));$(`#studio-palette [data-color="${id||''}"]`).focus({preventScroll:true});}catch(error){toast(error.message);}});
$('#random-studio').addEventListener('click',()=>{try{updateDraft(randomStudioRecipe(state.current,crypto.getRandomValues(new Uint32Array(1))[0]));}catch(error){toast(error.message);}});
$('#save-studio').addEventListener('click',()=>{persistDrafts();if(!isFavorite(state.current))toggleFavorite(state.current);});
$('#save-current').addEventListener('click',()=>{if(state.current)toggleFavorite(state.current);});
$('.skip-link').addEventListener('click',e=>{e.preventDefault();const target=$(state.view==='detail'?'#detail-title':state.view==='studio'?'#studio-heading':'#catalog-heading');target.focus({preventScroll:state.view==='studio'});if(state.view!=='studio')target.scrollIntoView({block:'start'});});
$('#load-more').addEventListener('click',loadMore);
$('#gallery').addEventListener('click',e=>{const save=e.target.closest('[data-save]'),open=e.target.closest('[data-open]'),orderButton=e.target.closest('[data-order]');if(save)toggleFavorite(state.galleryRecipes[Number(save.dataset.save)]);if(open)state.returnKey=open.closest('.palette-card').dataset.key;if(orderButton)openOrder(state.galleryRecipes[Number(orderButton.dataset.order)]);});
for(const id of ['#material-tabs','#studio-tabs'])$(id).addEventListener('keydown',e=>{const tabs=$$(`${id} a`),i=tabs.indexOf(e.target);if(i<0)return;const next=e.key==='ArrowRight'?(i+1)%tabs.length:e.key==='ArrowLeft'?(i+tabs.length-1)%tabs.length:e.key==='Home'?0:e.key==='End'?tabs.length-1:null;if(next===null)return;e.preventDefault();tabs[next].focus();tabs[next].click();});
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>{viewer?.view(b.dataset.view);$$('[data-view]').forEach(v=>v.classList.toggle('selected',v===b));}));
$('#zoom-in').addEventListener('click',()=>viewer?.zoom(.86));$('#zoom-out').addEventListener('click',()=>viewer?.zoom(1.16));
$('#copy-recipe').addEventListener('click',async()=>{if(!state.current)return;const text=orderMessage(state.current,location.href);try{await navigator.clipboard.writeText(text);toast('Receita copiada.');}catch{download('colora-enforma-receita.txt',new Blob([text],{type:'text/plain;charset=utf-8'}));toast('Receita baixada como texto.');}});
$('#download-png').addEventListener('click',async()=>{try{const p=catalogRecipe(state.current);download(fileName(p),await recipeImage(p));}catch(error){toast(error.message);}});
$('#download-order').addEventListener('click',()=>{if(order?.file)download(order.file.name,order.file);});
$('#share-order').addEventListener('click',async()=>{
 if(!order?.file)return;const p=order;$('#share-order').disabled=true;
 try{await navigator.share({title:'Colora Enforma',text:p.message,files:[p.file]});$('#order-status').textContent='Compartilhamento aberto. Confirme o envio no WhatsApp.';}catch(error){$('#order-status').textContent=error.name==='AbortError'?'Compartilhamento cancelado. Você pode tentar de novo.':'Não foi possível compartilhar aqui. Baixe a imagem e anexe no WhatsApp.';}finally{$('#share-order').disabled=false;}
});
for(const [dialogId,trigger,close]of [['#backup-dialog','#backup-menu','#close-backup'],['#order-dialog',null,'#close-order']]){const dialog=$(dialogId);if(trigger)$(trigger).addEventListener('click',()=>dialog.showModal());$(close).addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});}
$('#order-dialog').addEventListener('close',closeOrder);
$('#export-backup').addEventListener('click',()=>download(`colora-enforma-favoritas-${new Date().toISOString().slice(0,10)}.json`,new Blob([JSON.stringify(favoriteBackup(state.favorites),null,2)],{type:'application/json'})));
$('#import-backup').addEventListener('change',async e=>{
 const file=e.target.files[0];if(!file)return;
 try{if(file.size>2_000_000)throw new Error('O backup deve ter até 2 MB.');const imported=validateFavoriteBackup(JSON.parse(await file.text())),merged=new Map(state.favorites.map(p=>[favoriteKey(p),p]));imported.forEach(p=>merged.set(favoriteKey(p),p));if(merged.size>100)throw new Error('A soma ultrapassa 100 favoritas.');state.favorites=[...merged.values()];persist();if(state.view==='favorites')renderGallery();else updateSaveButtons();$('#backup-status').textContent=`${imported.length} favoritas importadas.`;toast('Favoritas importadas.');}catch(error){$('#backup-status').textContent=error.message;}finally{e.target.value='';}
});

history.scrollRestoration='manual';
if(!location.hash)history.replaceState(null,'','#/recomendados/todos');
window.addEventListener('hashchange',renderRoute);await renderRoute();
window.coloraStatus=()=>({ready:state.ready,view:state.view,material:['detail','studio'].includes(state.view)?state.current?.material:state.material,groupId:state.current?.groupId,count:state.current?.count,variant:state.current?.variant||'sem-fundo',used:state.current?.colors.map(c=>c.id)||[],slots:isStudio(state.current)?[...state.current.slots]:null,selectedRegion:state.selectedRegion,favorites:visibleFavorites().length,visible:state.galleryRecipes.length,loaded:state.view==='catalog'?getFeed().items.length:state.galleryRecipes.length,total:state.view==='catalog'?getFeed().pager.total:state.galleryRecipes.length,hasMore:state.view==='catalog'&&getFeed().pager.hasMore,loadingPage:state.view==='catalog'&&getFeed().loading,thumbnailCache:state.thumbnails.size,route:state.route});
try{
 viewer=new KeychainViewer($('#model-canvas'));await viewer.load();state.ready=true;$('#model-loading').hidden=true;
 if(state.view==='detail'){viewer.apply(state.current);viewer.resize();renderDetail();}else if(state.view==='studio'){renderStudio();viewer.resize();}else if(state.view==='catalog'||state.view==='favorites'){thumbnailObserver.disconnect();observeCards($('#gallery').children);}updateSaveButtons();
}catch(error){console.error(error);$('#model-loading').replaceChildren(document.createTextNode('Não foi possível abrir o 3D. Atualize a página para tentar novamente.'));toast('Não foi possível carregar as prévias 3D.');}
window.addEventListener('pagehide',()=>viewer?.dispose(),{once:true});
