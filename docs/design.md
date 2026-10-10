# Colora Enforma

A ferramenta permite avaliar o chaveiro Enforma real, escolher combinações e preparar um pedido para a Forja. Tudo funciona no navegador, sem backend. A identidade existente é preservada: azul gelo, Avenir Next/Trebuchet MS, acentos azul profundo e turquesa. A peça e seus filamentos são o foco. Taste orienta composição e hierarquia, Impeccable verifica layout/acessibilidade, e os princípios de Kowalski limitam o feedback de seleção a transições curtas com redução de movimento.

## Catálogo

A entrada mostra somente cartões em duas colunas. As abas Todos/PLA/PETG incluem a união ou um material isolado, sem misturar filamentos em uma receita. O feed reaproveita as regras físicas dos seis grupos, combinações de três/quatro/cinco cores e a ordenação existente, com 28 escolhas autorais primeiro. Acrescenta 50 itens ao chegar ao fim, até esgotar as 4.296 receitas únicas. Miniaturas próximas da área visível usam geometria compartilhada e cache de 140 PNGs.

Um cartão abre detalhes em rota própria. O link codifica os filamentos canônicos e funciona em acesso novo. Detalhes mostram prévia, receita e acesso ao Estúdio; não contêm gerador. O retorno restaura lista, rolagem e foco. Favoritas exibem as mesmas duas colunas com ação Pedir. O catálogo público não depende do cache pessoal.

## Estúdio

O editor se ajusta ao viewport com a peça em evidência, quatro seletores de região na esquerda e a paleta completa abaixo. As duas abas PLA/PETG carregam rascunhos independentes. A paleta permite qualquer filamento real daquele material; as regras de times originais continuam restritas ao catálogo. A identidade do filamento usa HEX e acabamento, evitando confundir dois vermelhos/amarelos diferentes ou duplicar branco/preto.

As regiões são corpo/tampa e escuros; arte média; claros e Kids; brilhos e Enforma. O mapa original de quatro posições `[0,0,1,2,3]` permanece fixo para as cinco regiões do GLB. “Sem cor” é nulo na receita e assume a cor do corpo ao renderizar; não apaga malhas ou aplica transparência. A principal não pode ser nula. O contador considera filamentos físicos distintos, de um a quatro, permitindo repetições.

Random mantém principal e posições nulas e escolhe outras cores elegíveis com contraste do logotipo, progressão tonal adequada à luminosidade da base e proximidade de matiz. Sorteia entre as distribuições mais bem pontuadas, sem expor nota de beleza ou fazer chamada de IA. Edições atualizam apenas o rascunho do material ativo. Salvar cria snapshot nas favoritas. Abrir uma receita de três/quatro cores preserva sua distribuição; editar um estudo legado de cinco cores cria uma cópia de quatro, com ação explicitamente rotulada, sem alterar o original.

## Armazenamento e pedido

Receitas manuais usam schema 2, slots canônicos/nulos e quatro cores efetivas; schema 1 continua válido para receitas antigas. Backup versão 2 aceita ambos, valida material/filamentos/mapa e preserva a variante original dos dados legados. A projeção visual sem fundo não regrava os originais. Rascunhos ficam em chave própria com validação por material.

Pedir abre uma revisão breve do compartilhamento e prepara um PNG local com a peça e os HEX. A mensagem inclui material, regiões, heranças e link independente de cache. Web Share é chamado somente num segundo toque, com arquivo pronto; o destino é escolhido no aparelho. Sem suporte, a pessoa baixa a imagem e abre a mensagem `wa.me` para o contato comercial já usado no Fabrinquei. Não há upload, envio automático ou confirmação de pedido. O PNG contém as cores mesmo quando o aplicativo de destino não transportar o texto junto.

## Modelo

Apenas o GLB existente sem fundo é carregado. As malhas e dimensões da v25b-released não são modificadas. Corpo, tampa e logo já preservam vértices; a arte tem a redução de detalhe original para visualização. Cores e acabamentos aproximam as fotos. Cinco cores continuam sendo estudo visual; o site não fatia nem altera o Keychain Maker.
