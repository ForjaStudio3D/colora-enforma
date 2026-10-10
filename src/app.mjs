import {GROUPS,VARIANTS,SLOT_NAMES,FINISH_LABELS,groupById} from './catalog.mjs';
import {createRecipePager,PAGE_SIZE,availablePool,makeRecipe,recipeKey,recipeText,loadFavorites,saveFavorites,validateBackup} from './core.mjs';
import {KeychainViewer} from './viewer.mjs';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lockIcon=locked=>`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="${locked?'M8 10V6a4 4 0 0 1 8 0v4':'M8 10V6a4 4 0 0 1 7.5-2'}"/><path d="M12 14v3"/></svg>`;
const swatch=c=>`<span class="color-disc ${c.finish}" style="--swatch:${c.hex}"></span>`;
const state={groupId:GROUPS[0].id,variant:'com-fundo',count:4,neutral:'white',locks:Array(5).fill(false),current:null,batch:[],pager:null,loadingPage:false,favorites:[],view:'studio',ready:false,generation:0,thumbnails:new Map()};
let storage;
try{storage=localStorage;state.favorites=loadFavorites(storage);}catch{storage=null;}
let viewer=null,toastTimer;
const thumbnailJobs=new Map();let renderingThumbnails=false;
const thumbnailObserver=new IntersectionObserver(entries=>{
 for(const entry of entries){
  const target=entry.target;
  if(!entry.isIntersecting){thumbnailJobs.delete(target);const holder=target.querySelector('.palette-image');if(holder?.querySelector('img'))holder.innerHTML='<span class="palette-placeholder">Prévia 3D</span>';continue;}
  if(!state.ready)continue;
  const recipes=state.view==='favorites'?state.favorites:state.batch,p=recipes[Number(target.dataset.open)];
  if(p)thumbnailJobs.set(target,{recipe:p,generation:state.generation});
 }
 renderThumbnails();
},{rootMargin:'250px'});
const pageObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))loadMore();},{rootMargin:'300px'});
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4300);}
function download(name,blob){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function persist(){if(!storage){toast('Neste navegador, as favoritas duram só nesta sessão. Baixe um backup.');return;}try{saveFavorites(storage,state.favorites);}catch{toast('Não foi possível gravar no navegador. Baixe um backup das favoritas.');}}
function isFavorite(p){return state.favorites.some(f=>recipeKey(f)===recipeKey(p));}
function updateSaveButton(){const saved=state.current&&isFavorite(state.current);$('#save-current').textContent=saved?'♥ Favorita salva':'♡ Salvar favorita';$('#save-current').classList.toggle('saved',!!saved);$('#fav-count').textContent=state.favorites.length;}
function renderGroup(){
 const g=groupById(state.groupId);$('#group-select').value=g.id;$('#stage-material').textContent=g.material;$('#group-material').textContent=g.material;
 $('#inventory').innerHTML=g.colors.map(c=>`<span class="inventory-swatch" title="${escape(c.name)} · ${g.material} · ${FINISH_LABELS[c.finish]}">${swatch(c)}<span>${escape(c.name)}</span></span>`).join('');
 $('#group-note').textContent=`Foto ${g.photo} · ${g.description}`;$('#available-count').textContent=`${g.colors.length} disponíveis`;
 $$('#count-switch button').forEach(b=>{const count=Number(b.dataset.count);b.classList.toggle('selected',count===state.count);b.setAttribute('aria-pressed',String(count===state.count));b.disabled=count>g.colors.length;b.title=count>g.colors.length?'Este grupo tem apenas quatro cores.':'';});
 $('#neutral-control').hidden=state.count!==4||g.base.length!==3;$$('input[name=neutral]').forEach(i=>i.checked=i.value===state.neutral);
 $('#pause-note').hidden=state.count!==5;
 $$('#variant-switch button').forEach(b=>{b.classList.toggle('selected',b.dataset.variant===state.variant);b.setAttribute('aria-pressed',String(b.dataset.variant===state.variant));});
}
function renderSlots(){
 if(!state.current)return;const pool=availablePool(state.groupId,state.count,state.neutral);
 $('#slots').innerHTML=state.current.colors.map((c,i)=>`<div class="slot">${swatch(c)}<label><span>${SLOT_NAMES[state.count][i]}</span><select data-slot="${i}" aria-label="Filamento de ${SLOT_NAMES[state.count][i]}">${pool.map(color=>`<option value="${color.id}" ${color.id===c.id?'selected':''}>${escape(color.name)}</option>`).join('')}</select></label><button class="lock-button" data-lock="${i}" aria-pressed="${!!state.locks[i]}" aria-label="${state.locks[i]?'Destravar':'Travar'} ${SLOT_NAMES[state.count][i]}" title="${state.locks[i]?'Destravar cor':'Manter esta cor ao gerar'}">${lockIcon(state.locks[i])}</button></div>`).join('');
 updateSaveButton();
}
function choose(recipe,{restore=false}={}){
 state.current={...recipe,colors:recipe.colors.map(c=>({...c}))};
 if(restore){state.groupId=recipe.groupId;state.variant=recipe.variant;state.count=recipe.count;state.neutral=recipe.colors.some(c=>c.id==='black')&&!recipe.colors.some(c=>c.id==='white')?'black':'white';state.locks.fill(false);
  resetFeed();
  renderGroup();
 }
 viewer?.apply(state.current);renderSlots();
 $$('.palette-card').forEach(card=>card.classList.toggle('selected',card.dataset.key===recipeKey(state.current)));
}
function switchView(view){state.view=view;$('#nav-studio').classList.toggle('active',view==='studio');$('#nav-favorites').classList.toggle('active',view==='favorites');renderGallery();if(view==='favorites')$('#combinations').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
function paletteCard(p,i){return `<article class="palette-card ${state.current&&recipeKey(p)===recipeKey(state.current)?'selected':''}" data-key="${escape(recipeKey(p))}"><button class="palette-open" data-open="${i}" aria-label="Ver ${escape(p.name)} em 3D"><div class="palette-image"><span class="palette-placeholder">Prévia 3D</span></div><div class="palette-copy"><strong>${escape(p.name)}</strong><small>${p.material} · ${p.count} cores · ${p.variant==='com-fundo'?'com fundo':'sem fundo'}</small><div class="mini-swatches" aria-label="Cores da combinação">${p.colors.map(c=>`<span style="--swatch:${c.hex}" title="${escape(c.name)}"></span>`).join('')}</div></div></button><button class="card-save" data-save="${i}" aria-label="${isFavorite(p)?'Remover dos favoritos':'Salvar favorita'} ${escape(p.name)}" aria-pressed="${isFavorite(p)}">${isFavorite(p)?'♥':'♡'}</button></article>`;}
function observeCards(cards){for(const card of cards){const target=card.querySelector('.palette-open');if(target)thumbnailObserver.observe(target);}}
async function renderThumbnails(){
 if(renderingThumbnails||!state.ready)return;renderingThumbnails=true;
 try{while(thumbnailJobs.size){
  await new Promise(resolve=>requestAnimationFrame(resolve));
  const item=thumbnailJobs.entries().next().value;if(!item)break;
  const [target,{recipe:p,generation}]=item;thumbnailJobs.delete(target);
  if(generation!==state.generation||!target.isConnected)continue;
  const key=recipeKey(p),holder=target.querySelector('.palette-image');
  try{
   const png=state.thumbnails.get(key)||viewer.snapshot(p);
   state.thumbnails.delete(key);state.thumbnails.set(key,png);
   while(state.thumbnails.size>140)state.thumbnails.delete(state.thumbnails.keys().next().value);
   const img=new Image();img.alt=`Chaveiro Enforma ${p.variant==='com-fundo'?'com':'sem'} fundo em ${p.count} cores ${p.material}`;img.src=png;img.decoding='async';holder.replaceChildren(img);
  }catch(error){console.error(error);holder.textContent='Prévia indisponível.';}
 }}finally{renderingThumbnails=false;}
}
function renderFeedStatus(){
 pageObserver.disconnect();$('#feed-footer').hidden=state.view==='favorites';
 $('#gallery').setAttribute('aria-busy',String(state.loadingPage));
 if(state.view==='favorites')return;
 const more=!!state.pager?.hasMore;
 $('#feed-status').textContent=state.loadingPage?'Carregando próximas combinações…':`${state.batch.length} de ${state.pager?.total??0} combinações${more?' · role para carregar mais':' · Todas as combinações desta seleção'}`;
 $('#load-more').hidden=!more;$('#load-more').disabled=state.loadingPage||!state.ready;
 if(more&&!state.loadingPage&&state.ready)pageObserver.observe($('#feed-sentinel'));
}
function renderGallery(){
 ++state.generation;thumbnailObserver.disconnect();thumbnailJobs.clear();
 const recipes=state.view==='favorites'?state.favorites:state.batch;
 $('#gallery-title').textContent=state.view==='favorites'?'Suas favoritas':'Mais jeitos de colorir';
 $('#gallery-description').textContent=state.view==='favorites'?'Escolhas salvas neste navegador. Clique para rever em 3D.':`Até ${PAGE_SIZE} combinações por lote. Continue rolando para descobrir mais.`;
 $('#regenerate').hidden=state.view==='favorites';
 if(!recipes.length)$('#gallery').innerHTML='<div class="empty-state"><strong>A sua seleção começa aqui.</strong>Use “Salvar favorita” na combinação que gostar. Depois você pode baixar um backup.</div>';
 else{$('#gallery').innerHTML=recipes.map(paletteCard).join('');observeCards($('#gallery').children);}
 renderFeedStatus();
}
function resetFeed(){
 state.pager=createRecipePager({groupId:state.groupId,variant:state.variant,count:state.count,neutral:state.neutral,current:state.current,locks:state.locks,seed:Date.now()});
 state.batch=state.pager.next();state.loadingPage=false;
}
async function loadMore(){
 if(state.view!=='studio'||!state.ready||state.loadingPage||!state.pager?.hasMore)return;
 const pager=state.pager;state.loadingPage=true;renderFeedStatus();
 await new Promise(resolve=>requestAnimationFrame(resolve));
 if(state.pager!==pager)return;
 state.loadingPage=false;if(state.view!=='studio'){renderFeedStatus();return;}
 const start=state.batch.length,recipes=pager.next();state.batch.push(...recipes);
 $('#gallery').insertAdjacentHTML('beforeend',recipes.map((p,i)=>paletteCard(p,start+i)).join(''));
 observeCards([...$('#gallery').children].slice(start));renderFeedStatus();
}
function generate(resetLocks=false,{keepCurrent=false}={}){
 try{
  if(resetLocks)state.locks.fill(false);
  resetFeed();
  state.view='studio';$('#nav-studio').classList.add('active');$('#nav-favorites').classList.remove('active');
  if(!keepCurrent)choose(state.batch[0]);else renderSlots();renderGroup();renderGallery();
 }catch(e){toast(e.message);}
}
function toggleFavorite(recipe){
 const index=state.favorites.findIndex(p=>recipeKey(p)===recipeKey(recipe));
 if(index>=0){state.favorites.splice(index,1);toast('Combinação removida das favoritas.');}
 else{if(state.favorites.length>=100){toast('Você já guardou 100 favoritas. Baixe um backup ou remova uma.');return;}state.favorites.push({...recipe,colors:recipe.colors.map(c=>({...c}))});toast('Combinação salva nas favoritas.');}
 persist();updateSaveButton();renderGallery();
}
function changeCount(n){if(n===state.count)return;state.count=n;generate(true);}

$('#group-select').innerHTML=['PLA','PETG'].map(material=>`<optgroup label="${material}">${GROUPS.filter(g=>g.material===material).map(g=>`<option value="${g.id}">${escape(g.name)} · ${material}</option>`).join('')}</optgroup>`).join('');
$('#group-select').addEventListener('change',e=>{state.groupId=e.target.value;if(state.count>groupById(state.groupId).colors.length)state.count=4;generate(true);});
$('#count-switch').addEventListener('click',e=>{const button=e.target.closest('button[data-count]');if(button&&!button.disabled)changeCount(Number(button.dataset.count));});
$('#variant-switch').addEventListener('click',e=>{const button=e.target.closest('[data-variant]');if(!button||button.dataset.variant===state.variant)return;state.variant=button.dataset.variant;choose({...state.current,variant:state.variant});resetFeed();renderGroup();renderGallery();});
$$('input[name=neutral]').forEach(input=>input.addEventListener('change',()=>{state.neutral=input.value;generate(true);}));
$('#generate').addEventListener('click',()=>generate());$('#regenerate').addEventListener('click',()=>generate());
$('#load-more').addEventListener('click',loadMore);
$('#slots').addEventListener('click',e=>{const b=e.target.closest('[data-lock]');if(b){const i=Number(b.dataset.lock);state.locks[i]=!state.locks[i];generate(false,{keepCurrent:true});}});
$('#slots').addEventListener('change',e=>{if(!e.target.matches('select[data-slot]'))return;const i=Number(e.target.dataset.slot),c=availablePool(state.groupId,state.count,state.neutral).find(c=>c.id===e.target.value);if(!c)return;const old=state.current.colors[i],colors=state.current.colors.map((previous,j)=>j===i?c:previous.id===c.id?old:previous);try{choose(makeRecipe(state.groupId,state.variant,colors));generate(false,{keepCurrent:true});}catch(err){toast(err.message);renderSlots();}});
$('#unlock').addEventListener('click',()=>{state.locks.fill(false);generate(false,{keepCurrent:true});});
$('#save-current').addEventListener('click',()=>{if(state.current)toggleFavorite(state.current);});
$('#gallery').addEventListener('click',e=>{
 const open=e.target.closest('[data-open]'),save=e.target.closest('[data-save]'),recipes=state.view==='favorites'?state.favorites:state.batch;
 if(open){const p=recipes[Number(open.dataset.open)];choose(p,{restore:state.view==='favorites'});$('#studio').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
 if(save)toggleFavorite(recipes[Number(save.dataset.save)]);
});
$('#nav-studio').addEventListener('click',()=>{switchView('studio');$('#studio').scrollIntoView({behavior:'smooth'});});$('#nav-favorites').addEventListener('click',()=>switchView('favorites'));
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>{viewer?.view(b.dataset.view);$$('[data-view]').forEach(v=>v.classList.toggle('selected',v===b));}));
$('#zoom-in').addEventListener('click',()=>viewer?.zoom(.86));$('#zoom-out').addEventListener('click',()=>viewer?.zoom(1.16));
$('#copy-recipe').addEventListener('click',async()=>{if(!state.current)return;try{await navigator.clipboard.writeText(recipeText(state.current));toast('Receita copiada.');}catch{download('colora-enforma-receita.txt',new Blob([recipeText(state.current)],{type:'text/plain;charset=utf-8'}));toast('Receita baixada como texto.');}});
$('#download-png').addEventListener('click',async()=>{
 if(!viewer||!state.current)return;const p=state.current;
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1640;const ctx=canvas.getContext('2d');ctx.fillStyle='#f3f6fb';ctx.fillRect(0,0,1200,1640);
 const image=new Image();image.src=viewer.snapshot(p,1200,1240);await image.decode();ctx.drawImage(image,0,0);
 ctx.fillStyle='#20334c';ctx.font='bold 42px sans-serif';ctx.fillText('Colora Enforma',65,1304);ctx.font='25px sans-serif';ctx.fillStyle='#66768c';ctx.fillText(`${groupById(p.groupId).name} · ${p.material} · ${p.count} cores · ${p.variant==='com-fundo'?'Com fundo':'Sem fundo'}`,65,1345);
 p.colors.forEach((c,i)=>{const y=1392+i*36;ctx.fillStyle=c.hex;ctx.beginPath();ctx.arc(79,y-8,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#20334c';ctx.font='20px sans-serif';ctx.fillText(`${SLOT_NAMES[p.count][i]}: ${c.name} ${c.hex.toUpperCase()}`,108,y);});
 ctx.fillStyle='#66768c';ctx.font='18px sans-serif';ctx.fillText(p.count===5?'Estudo visual com cinco cores. Troca por pausa não validada.':'Tons aproximados das fotos. Avaliação de cores.',65,1620);
 canvas.toBlob(blob=>download(`colora-enforma-${p.variant}-${p.material.toLowerCase()}-${p.count}cores.png`,blob),'image/png');toast('Imagem preparada para download.');
});
const dialog=$('#backup-dialog');$('#backup-menu').addEventListener('click',()=>dialog.showModal());$('#close-backup').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
$('#export-backup').addEventListener('click',()=>download(`colora-enforma-favoritas-${new Date().toISOString().slice(0,10)}.json`,new Blob([JSON.stringify({app:'colora-enforma',version:1,favorites:state.favorites},null,2)],{type:'application/json'})));
$('#import-backup').addEventListener('change',async e=>{
 const file=e.target.files[0];if(!file)return;
 try{if(file.size>2_000_000)throw new Error('O backup deve ter até 2 MB.');const imported=validateBackup(JSON.parse(await file.text()));const merged=new Map(state.favorites.map(p=>[recipeKey(p),p]));imported.forEach(p=>merged.set(recipeKey(p),p));if(merged.size>100)throw new Error('A soma ultrapassa 100 favoritas.');state.favorites=[...merged.values()];persist();updateSaveButton();renderGallery();$('#backup-status').textContent=`${imported.length} favoritas importadas. Nenhum grupo foi misturado.`;toast('Favoritas importadas.');}catch(err){$('#backup-status').textContent=err.message;}finally{e.target.value='';}
});

renderGroup();generate();
try{
 viewer=new KeychainViewer($('#model-canvas'));await viewer.load();state.ready=true;viewer.apply(state.current);$('#model-loading').hidden=true;$('#generate').disabled=false;$('#save-current').disabled=false;$('#download-png').disabled=false;renderGallery();
 // Small read-only diagnostics used by browser verification.
 window.coloraStatus=()=>({ready:state.ready,variant:state.variant,material:groupById(state.groupId).material,groupId:state.groupId,count:state.count,used:state.current.colors.map(c=>c.id),favorites:state.favorites.length,triangles:viewer.renderer.info.render.triangles,loaded:state.batch.length,total:state.pager?.total,hasMore:state.pager?.hasMore,loadingPage:state.loadingPage,thumbnailCache:state.thumbnails.size});
}catch(err){console.error(err);$('#model-loading').replaceChildren(document.createTextNode('Não foi possível abrir o 3D. Atualize a página em um navegador com WebGL.'));toast('Falha ao carregar o modelo 3D. Atualize para tentar novamente.');}
window.addEventListener('pagehide',()=>viewer?.dispose(),{once:true});
