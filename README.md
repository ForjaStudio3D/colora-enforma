# Colora Enforma

Catálogo e Estúdio de cores para avaliar o chaveiro Enforma em 3D. Aplicativo inteiramente estático, publicado no GitHub Pages.

[Abrir Colora Enforma](https://forjastudio3d.github.io/colora-enforma/)

## Catálogo e detalhes

A entrada exibe somente o catálogo **sem fundo**, com abas **Todos, PLA e PETG** e duas colunas em qualquer largura. As 28 seleções autorais aparecem primeiro, incluindo uma peça branca em cada material. A rolagem acrescenta até 50 combinações por lote, sem repetir: 4.296 possibilidades ao todo, 4.092 PLA e 204 PETG. As regras dos seis grupos originais continuam válidas no catálogo; não há mistura de materiais. A lista indica quando chega ao fim.

Cada cartão abre uma rota de detalhes própria, com a peça em 3D, cores, imagem para baixar e acesso ao Estúdio. O link reproduz a combinação em outro navegador sem depender de favoritas ou cookies. Voltar ao catálogo conserva lote, posição e foco. Miniaturas são renderizadas perto da área visível, com cache limitado a 140 imagens.

## Estúdio manual

O Estúdio ocupa o viewport: quatro regiões à esquerda, peça em evidência e paleta abaixo, sem o formulário do gerador. PLA e PETG têm paletas e rascunhos independentes. A paleta reúne os filamentos reais disponíveis daquele material, com neutros deduplicados e bobinas de HEX/acabamento distintos preservadas.

Clique numa região e depois numa cor. “Sem cor” nas três regiões secundárias faz a região herdar a principal; nenhuma geometria desaparece. Isso permite uma a quatro cores físicas, inclusive repetindo um filamento em regiões diferentes. A principal é obrigatória. **Random** conserva a principal e as regiões desativadas, sugerindo os outros filamentos por contraste e proximidade tonal. Não usa API de IA.

Edições ficam em rascunhos locais separados por material; **Salvar** guarda uma favorita imutável. Favoritas antigas de três/quatro cores mantêm a distribuição ao editar. Estudos antigos de cinco cores continuam completos nos detalhes e no backup; “Editar com 4 cores” cria uma cópia que reúne corpo e contorno escuro no mesmo grupo. O original não é sobrescrito.

## Favoritas e pedidos

Favoritas ficam neste navegador, com abas de material e botão **Pedir** por peça. O pedido prepara localmente um PNG com a peça e os códigos HEX das regiões, além da mensagem com material e link da combinação. No Estúdio, as quatro regiões sempre são informadas, incluindo o HEX herdado quando estiverem sem cor própria.

Quando o aparelho oferece compartilhamento de arquivos, a pessoa pode escolher WhatsApp e enviar imagem e cores à Forja. A imagem é preparada antes do clique que abre o compartilhamento, preservando a ativação exigida pelo navegador. Em aparelhos sem suporte, há download do PNG e mensagem pronta no WhatsApp; a pessoa anexa a imagem. Links `wa.me` não anexam arquivos automaticamente. O site não confirma envio nem cria pedido em servidor.

O destino é o mesmo `WHATSAPP_NUMBER` do Fabrinquei (`webshop_diy/src/config.ts`). Backup JSON versão 2 inclui receitas antigas e manuais; importação aceita versões 1/2 com validação atômica. O cache antigo é preservado na migração. Sem armazenamento, a avaliação funciona durante a sessão e o backup continua disponível.

## Executar e publicar

```sh
npm ci
npm test
npm run build
```

`dist/` não depende de CDN nem de backend. As fontes ficam em `main`; GitHub Pages publica o conteúdo de `dist/` pela branch `deploy`.

## Geometria e filamentos

O visualizador usa o GLB existente `sem-fundo`, derivado da base **v25b-released** e da arte V2. Corpo, tampa e logotipo mantêm seus vértices originais; a arte já tem redução de detalhe para exibição. Esta atualização não altera as malhas, dimensões ou arquivos de produção. O manifesto em `public/models/manifest.json` registra hashes, cotas e regiões; `scripts/prepare_models.py --source <pasta-V2>` reproduz a exportação original.

Os HEX aproximam as seis fotos fornecidas. Foto 1: PLA azuis/violeta; foto 2: PLA roxo silk/azuis; foto 3: PETG rosas; foto 4: PLA vermelho/verde/amarelo; foto 5: PETG azul/amarelo; foto 6: cores da boneca em PLA. Branco e preto pertencem ao material selecionado. A aparência silk/translúcida é uma aproximação.

Taste/Impeccable orientaram a curadoria e a hierarquia visual; o site calcula sugestões no navegador. Cinco cores no catálogo legado são estudo visual: a troca por pausa não está validada. Esta aplicação avalia cores, sem gerar 3MF, G-code ou configurar impressão.

Referências: [Cyber Octopus Color Lab](https://github.com/ForjaStudio3D/cyber-octopus-lab), [Fabrinquei DIY](https://forjastudio3d.github.io/forja_webshop_diy/), [PETG rosa translúcido no Mercado Livre](https://www.mercadolivre.com.br/filamento-bambu-lab-petg-translucido-rosa-1kg-175mm-refil/up/MLBU2959111289) e [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share).
