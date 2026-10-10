# Colora Enforma

SPA estática para avaliar combinações no chaveiro Enforma oceano, com e sem fundo. Publicação solicitada no GitHub Pages da ForjaStudio3D. Referência funcional: Cyber Octopus Color Lab.

Um visualizador Three.js usa malhas reais da base v25b-released e da arte V2, em milímetros, com nível de detalhe reduzido somente para exibição. Os arquivos de produção ficam intactos. Cinco regiões são corpo/tampa, sombras da arte, tom médio, tom claro e detalhes. Em quatro cores, corpo e sombras compartilham filamento; em três, os tons médio e claro também compartilham. Cinco cores são estudo visual: as regiões se repetem nas mesmas alturas de impressão, logo não há promessa de resolver com uma pausa por camada.

Grupos fechados: PLA azuis/violeta, PLA azuis/roxo silk, PETG rosas, PLA vermelho/verde/amarelo, PETG azul/amarelo e PLA boneca. Cores não migram entre grupos. Branco/preto são opções neutras do material do grupo. PETG azul/amarelo tem somente quatro cores disponíveis e não permite inventar uma quinta.

Gerador com três, quatro ou cinco cores, rolagem contínua em lotes de até 50 combinações únicas, travas, edição das cores disponíveis, troca entre variantes, órbita e vistas, favoritos locais com snapshots, PNG, receita textual e backup/restauração JSON validado. O usuário escolhe quais receitas salvar; a geração não altera o Keychain Maker. As miniaturas são renderizadas perto da área visível, com cache limitado; a lista indica quando todas as possibilidades do grupo e das travas se esgotaram.

Visual: estúdio claro azul gelo, painel de peça amplo e controles compactos; tipografia Avenir Next/Trebuchet MS; acentos azul profundo e turquesa. As cores ficam na peça e nas amostras, sem fundos decorativos concorrentes. Mobile mantém a peça antes dos controles e sugestões.

Validação: regras de grupos/contagem/travas/backup em testes Node, build estático, navegador Chromium desktop e mobile com WebGL, persistência e exportação. Publicação somente depois de verificar o resultado. Fontes em main, artefatos estáticos em deploy.
