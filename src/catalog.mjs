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
export const REGION_NAMES=['Corpo e tampa','Tons escuros da arte','Tons médios da arte','Tons claros e Kids','Brilhos e Enforma'];
export const SLOT_NAMES={3:['Corpo e tons escuros','Tons médios e claros','Brilhos e Enforma'],4:['Corpo e tons escuros','Tons médios da arte','Tons claros e Kids','Brilhos e Enforma'],5:REGION_NAMES};

// Authored selections follow the original model's dark / medium / light / white
// regions. These are physical filament IDs, not newly generated paint colors.
const pick=(name,ids,reason)=>({name,ids:ids.split(' '),reason});
export const PALETTE_SELECTIONS={
 'pla-azuis-violeta':[
  pick('Oceano suave','violet blue sky white','Escala azul com base violeta e brilhos brancos.'),
  pick('Oceano profundo','violet black blue sky white','Preto nos contornos, azuis na água e branco nos brilhos.'),
  pick('Azuis na noite','black violet blue sky','Base preta com a arte em três tons de azul.'),
  pick('Três azuis','violet blue sky','Escala tonal azul, do violeta escuro ao azul céu.'),
 ],
 'pla-roxo-silk':[
  pick('Azul com silk','royal purple azure white','Base azul profunda, roxo silk na arte e brilhos brancos.'),
  pick('Roxo com luz','purple royal azure white','Corpo roxo silk com azuis na arte e branco no logotipo.'),
  pick('Silk no oceano','royal black purple azure white','Contornos pretos separam roxo, azul e brilhos brancos.'),
  pick('Roxo profundo','purple black royal azure white','Corpo silk com contornos pretos e a arte em azul.'),
  pick('Silk na noite','black royal purple azure','Base preta, azul profundo e roxo com detalhes azul claro.'),
  pick('Três tons silk','royal purple azure','Azul profundo, roxo silk e azul médio em uma escala suave.'),
 ],
 'petg-rosas':[
  pick('Rosa suave','pink hotpink rose white','Rosas na arte, translúcido nos tons claros e branco nos brilhos.'),
  pick('Rosa com contorno','pink black hotpink rose white','Contornos pretos destacam a arte rosa e os brilhos brancos.'),
  pick('Rosas na noite','black pink hotpink rose','Fundo preto com três rosas e detalhes translúcidos.'),
  pick('Três rosas','pink hotpink rose','Três rosas próximos para uma composição tonal suave.'),
 ],
 'pla-tropical':[
  pick('Tropical claro','red mint gold white','Base vermelha com menta, amarelo e brilhos brancos.'),
  pick('Tropical com contorno','red black mint gold white','Preto nos contornos equilibra menta e amarelo na arte.'),
  pick('Tropical na noite','black red mint gold','Base preta com vermelho, menta e detalhes em amarelo.'),
  pick('Três tropicais','red mint gold','Vermelho na base, menta na arte e amarelo nos brilhos.'),
 ],
 'petg-azul-amarelo':[
  pick('Azul e sol','deepblue yellow white','Base azul, animais amarelos e brilhos brancos.'),
  pick('Sol na noite','black deepblue yellow white','Base preta, água azul e amarelo com brilhos brancos.'),
 ],
 'pla-boneca':[
  pick('Lavanda e areia','indigo lavender skin white','Azul violeta na base, lavanda e um único acento quente.'),
  pick('Lavanda e sol','indigo lavender yellow white','Lavanda e amarelo com base azul e brilhos brancos.'),
  pick('Areia com contorno','indigo black lavender skin white','Contornos pretos separam lavanda, areia e brilhos brancos.'),
  pick('Sol com contorno','indigo black lavender yellow white','Base azul, contornos pretos e um acento amarelo.'),
  pick('Lavanda suave','indigo lavender white','Três cores com base escura, lavanda e brilhos brancos.'),
  pick('Areia suave','indigo skin white','Azul violeta e areia com brilhos brancos.'),
 ],
};
export function groupById(id){const g=GROUPS.find(g=>g.id===id);if(!g)throw new Error('Grupo de filamentos não encontrado.');return g;}
