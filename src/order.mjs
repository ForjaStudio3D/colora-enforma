import {SLOT_NAMES} from './catalog.mjs';
import {isStudio,STUDIO_REGIONS} from './studio.mjs';
import {recipeHash} from './catalog-feed.mjs';
// Same commercial destination as Fabrinquei's webshop_diy/src/config.ts.
export const WHATSAPP_NUMBER='5518998265902';
export function recipeRows(p){return p.colors.map((c,i)=>({label:isStudio(p)?STUDIO_REGIONS[i]:SLOT_NAMES[p.count][i],color:c,inherited:isStudio(p)&&p.slots[i]===null}));}
export function orderMessage(p,pageUrl){
 const url=new URL(pageUrl);url.hash=recipeHash(p);
 return `Olá! Quero pedir este chaveiro Colora Enforma.\n\n${p.name}\nMaterial: ${p.material}\n${p.count} ${p.count===1?'cor':'cores'} · oceano sem fundo\n\n${recipeRows(p).map(({label,color,inherited},i)=>`${i+1}. ${label}: ${color.hex.toUpperCase()} · ${color.name}${inherited?' (sem cor própria; usa a principal)':''}`).join('\n')}\n\nVer combinação: ${url.href}${p.count===5?'\nEstudo com 5 cores: impressão a confirmar.':''}`;
}
export const whatsappUrl=message=>`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
