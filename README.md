# Colora Enforma

Estúdio estático de cores para o chaveiro Enforma, com modelos 3D reais e variantes com/sem fundo. Desenvolvido para avaliar combinações antes de aplicar a receita ao Keychain Maker.

[Abrir Colora Enforma](https://forjastudio3d.github.io/colora-enforma/)

## Recursos

- Seis grupos fechados de filamentos, separados em PLA e PETG.
- Geração de seis sugestões com exatamente 3, 4 ou 5 cores, sem interpolar novos filamentos.
- Branco/preto como quarta cor dos grupos de três; ambos podem entrar no estudo com cinco cores.
- O grupo PETG azul/amarelo permite três cores (azul, amarelo, branco) ou quatro (mais preto).
- Órbita, frente, verso, perspectiva, zoom e duas versões da peça.
- Troca manual de cores com permuta automática, travas e favoritos locais com snapshots completos.
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

Referência pesquisada para PETG rosa translúcido: [Mercado Livre — Bambu Lab PETG Translúcido Rosa](https://www.mercadolivre.com.br/filamento-bambu-lab-petg-translucido-rosa-1kg-175mm-refil/up/MLBU2959111289). A busca localizou o anúncio; a página completa exigiu login. Não se presume que a bobina fotografada seja dessa marca. A translucidez do visualizador é uma aproximação.

Referência funcional consultada: [Cyber Octopus Color Lab](https://github.com/ForjaStudio3D/cyber-octopus-lab), main `23824bd8d55eac1627dab3dee98ab04c788976c3`.
