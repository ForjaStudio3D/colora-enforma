const c=(id,name,hex,finish='solid')=>({id,name,hex,finish});
const white=c('white','Branco','#F6F6F2');
const black=c('black','Preto','#16191D');
export const GROUPS=[
 {id:'pla-azuis-violeta',name:'Azuis & violeta',material:'PLA',photo:1,description:'Violeta, azul céu e azul vivo.',base:['violet','sky','blue'],colors:[c('violet','Violeta','#4E42D3'),c('sky','Azul céu','#12A2DC'),c('blue','Azul vivo','#287BF1'),white,black]},
 {id:'pla-roxo-silk',name:'Roxo silk & azuis',material:'PLA',photo:2,description:'Roxo silk, azul médio e azul profundo.',base:['purple','azure','royal'],colors:[c('purple','Roxo silk','#7625AA','silk'),c('azure','Azul médio','#3D8CE9'),c('royal','Azul profundo','#243DA9'),white,black]},
 {id:'petg-rosas',name:'Rosas',material:'PETG',photo:3,description:'Rosa pink, rosa vivo e rosa translúcido.',base:['pink','hotpink','rose'],colors:[c('pink','Rosa pink','#ED4BA5'),c('hotpink','Rosa vivo','#FB5980'),c('rose','Rosa translúcido','#E89EAD','translucent'),white,black],reference:'https://www.mercadolivre.com.br/filamento-bambu-lab-petg-translucido-rosa-1kg-175mm-refil/up/MLBU2959111289'},
 {id:'pla-tropical',name:'Vermelho, verde & amarelo',material:'PLA',photo:4,description:'Vermelho, verde menta e amarelo ouro.',base:['red','mint','gold'],colors:[c('red','Vermelho','#E53645'),c('mint','Verde menta','#35BFAF'),c('gold','Amarelo ouro','#FFBC12'),white,black]},
 {id:'petg-azul-amarelo',name:'Azul & amarelo',material:'PETG',photo:5,description:'Azul e amarelo, com branco e preto PETG.',base:['deepblue','yellow'],colors:[c('deepblue','Azul','#1C48BC'),c('yellow','Amarelo','#E5DD08'),white,black]},
 {id:'pla-boneca',name:'Cores da boneca',material:'PLA',photo:6,description:'Lavanda, pele, amarelo, azul, vermelho, branco e preto.',base:['lavender','skin','yellow','indigo','red'],colors:[c('lavender','Lavanda','#BBA5DC'),c('skin','Pele','#E5CB8A'),c('yellow','Amarelo','#F0CE13'),c('indigo','Azul violeta','#403B9C'),c('red','Vermelho','#CE4457'),white,black]},
];
export const VARIANTS=[{id:'com-fundo',name:'Com fundo',detail:'Oceano, ondas e pedras'},{id:'sem-fundo',name:'Sem fundo',detail:'Animais e plantas'}];
export const FINISH_LABELS={solid:'Sólido',silk:'Silk',translucent:'Translúcido'};
export const REGION_NAMES=['Corpo e tampa','Sombras da arte','Oceano e tons médios','Animais e tons claros','Olhos e detalhes'];
export const SLOT_NAMES={3:['Corpo e sombras','Oceano e animais','Olhos e detalhes'],4:['Corpo e sombras','Tons médios','Tons claros','Olhos e detalhes'],5:REGION_NAMES};
export function groupById(id){const g=GROUPS.find(g=>g.id===id);if(!g)throw new Error('Grupo de filamentos não encontrado.');return g;}
