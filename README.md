# Colora Enforma

Estúdio estático de cores para o chaveiro Enforma, com modelos 3D reais e variantes com/sem fundo. Desenvolvido para avaliar combinações antes de aplicar a receita ao Keychain Maker.

[Abrir Colora Enforma](https://forjastudio3d.github.io/colora-enforma/)

## Recursos

- Seis grupos fechados de filamentos, separados em PLA e PETG.
- Seleção inicial de combinações recomendadas para 3, 4 ou 5 cores, com progressão tonal e filamentos reais.
- Aba “Recomendados” com 28 seleções públicas já carregadas, em abas PLA/PETG e separadas pelos seis grupos, nas versões com/sem fundo. Funciona também no primeiro acesso ou com armazenamento local bloqueado.
- Em “Todas”, rolagem contínua em lotes de até 50 combinações únicas, ordenadas por composição, sem interpolar novos filamentos.
- Miniaturas 3D carregadas perto da área visível; contador e fim explícito quando as possibilidades da seleção se esgotam.
- Branco/preto como quarta cor dos grupos de três; ambos podem entrar no estudo com cinco cores.
- O grupo PETG azul/amarelo permite três cores (azul, amarelo, branco) ou quatro (mais preto).
- Órbita, frente, verso, perspectiva, zoom e duas versões da peça.
- Troca manual de cores com permuta automática, travas e favoritos locais com snapshots completos. As favoritas recomendadas aparecem primeiro; um filtro permite revê-las sem excluir as demais.
- Todas as galerias usam duas colunas, inclusive no celular. Cada material tem uma opção recomendada de base branca com quatro cores.
- Qualquer visitante pode favoritar diretamente do catálogo de recomendados. As favoritas são pessoais por navegador; o catálogo não depende delas nem as preenche automaticamente.
- PNG com receita, texto, backup e importação JSON validada.

Cinco cores são estudo visual. As cinco regiões possuem intervalos sobrepostos em Z na orientação de impressão; o site não promete uma troca por pausa nem gera 3MF/G-code. A configuração de impressão deve ser feita no Keychain Maker/Orca.

## Executar

```sh
npm ci
npm test
npm run build
```

`dist/` é inteiramente estático e não depende de CDN ou API. As fontes ficam em `main`; GitHub Pages publica somente `dist/` através da branch `deploy`.

## Geometria e filamentos

Os GLBs derivam das malhas V2 reais, com a base v25b-released. Corpo, tampa e logotipo usam a geometria original; as malhas da arte têm nível de detalhe reduzido para exibição. Os arquivos de produção não são modificados. O manifesto em `public/models/manifest.json` registra hashes, cotas e regiões. O script `scripts/prepare_models.py --source <pasta-V2>` reproduz essa exportação local.

Os HEX aproximam as seis fotos fornecidas. A identificação dos materiais vem da indicação do proprietário, não da aparência das bobinas. Foto 1: PLA azuis/violeta; foto 2: PLA roxo silk/azuis; foto 3: PETG rosas; foto 4: PLA vermelho/verde/amarelo; foto 5: PETG azul/amarelo; foto 6: todas as cores da boneca são PLA. Branco/preto são neutros do material selecionado.

A curadoria de Taste/Impeccable contém 28 receitas entre os grupos e as quantidades de cores. Os nomes reais das malhas definem a composição: r1 são tons escuros da arte, r2 médios, r3 claros e “Kids”, r4 brilhos brancos e “Enforma”. As recomendações usam bases escuras ou brancas, com cores no logotipo para distingui-lo da base. Preto ocupa principalmente os contornos; branco ocupa os brilhos. Os mapas originais de 3/4/5 cores e as favoritas existentes são preservados. As skills orientaram a curadoria durante o desenvolvimento; o site não depende de chamadas de IA para recomendar.

Referência pesquisada para PETG rosa translúcido: [Mercado Livre — Bambu Lab PETG Translúcido Rosa](https://www.mercadolivre.com.br/filamento-bambu-lab-petg-translucido-rosa-1kg-175mm-refil/up/MLBU2959111289). A busca localizou o anúncio; a página completa exigiu login. Não se presume que a bobina fotografada seja dessa marca. A translucidez do visualizador é uma aproximação.

Referência funcional consultada: [Cyber Octopus Color Lab](https://github.com/ForjaStudio3D/cyber-octopus-lab), main `23824bd8d55eac1627dab3dee98ab04c788976c3`.
