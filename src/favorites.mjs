import {validateRecipe,recipeKey} from './core.mjs';
import {isStudio,validateStudioRecipe,studioKey} from './studio.mjs';
export const favoriteKey=p=>isStudio(p)?studioKey(p):recipeKey(p);
export const favoriteBackup=favorites=>({app:'colora-enforma',version:2,favorites});
export function validateFavoriteBackup(data){
 if(!data||data.app!=='colora-enforma'||![1,2].includes(data.version)||!Array.isArray(data.favorites)||data.favorites.length>100)throw new Error('Selecione um backup do Colora Enforma com até 100 favoritas.');
 const seen=new Set();return data.favorites.map(p=>isStudio(p)&&data.version===2?validateStudioRecipe(p):validateRecipe(p)).filter(p=>{const key=favoriteKey(p);if(seen.has(key))return false;seen.add(key);return true;});
}
export function loadFavoriteCollection(storage){
 for(const key of ['colora-enforma:favorites:v2','colora-enforma:favorites:v1'])try{const data=storage?.getItem(key);if(data)return validateFavoriteBackup(JSON.parse(data));}catch{ /* Read a legacy backup if the new cache is invalid. */ }
 return [];
}
export function saveFavoriteCollection(storage,favorites){const backup=favoriteBackup(favorites);backup.favorites=validateFavoriteBackup(backup);storage.setItem('colora-enforma:favorites:v2',JSON.stringify(backup));}
