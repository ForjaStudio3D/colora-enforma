# Verificação · 2026-10-09

Os sete testes Node passaram: grupos e contagem, branco no PETG azul/amarelo, quarta cor neutra, travas, favoritos, backup atômico e rejeição de cores inventadas/importações incompatíveis.

O build estático passou. Chromium isolado com WebGL carregou as duas malhas, gerou miniaturas 3D, alternou as variantes, aplicou cinco cores no PETG rosa e impediu cinco no PETG azul/amarelo. Foram conferidos permuta manual de cores, travas, favorito após recarregar, reabertura da receita, exportação PNG e backup/importação JSON. Nenhum erro de JavaScript foi observado. O viewport de 390 × 844 px não apresentou overflow horizontal; também houve inspeção visual em 1440 × 1100 px. Isso é uma verificação de navegador, sem alegação de teste em iPhone físico.

Os modelos de exibição usam as malhas existentes. Corpo, tampa e logotipo mantêm seus vértices; somente a arte recebe redução de detalhe, limitada aos extremos de cada parte original. Não foram alterados arquivos de produção, dimensões da base, projetos no Keychain Maker ou configurações de impressora. As receitas de cinco cores não foram fatiadas nem validadas com troca de filamento por pausa.

A publicação em https://forjastudio3d.github.io/colora-enforma/ foi concluída na branch `deploy`, commit `fc80aa822a9498b58e6d1293457f1f17d2de4731`. HTML, JavaScript, manifesto e ambos os GLBs retornaram HTTP 200 com SHA-256 idêntico ao build local. O mesmo roteiro de navegador passou no endereço público, incluindo persistência, variantes, PNG, backup e viewport mobile, sem erros de JavaScript.

# Rolagem contínua · 2026-10-10

Os nove testes Node e o build estático passaram. A paginação entrega até 50 combinações únicas por lote, respeita as travas e encerra ao esgotar as possibilidades, sem preencher com repetições. O grupo PETG rosa com cinco cores percorreu lotes de 50, 50 e 20; o grupo de cores da boneca oferece 2.520 distribuições de cinco cores.

Chromium isolado com WebGL confirmou o carregamento automático ao rolar, a seleção e o salvamento de um item do segundo lote, o encerramento da lista, as travas e a reinicialização ao trocar grupo ou variante. Favoritas restauraram grupo, material, variante e cores, inclusive após recarregar. As miniaturas são renderizadas perto da área visível, com cache limitado a 140 imagens. A inspeção visual passou em 1440 × 1000 px e 390 × 844 px, sem overflow horizontal ou erros de JavaScript. As malhas 3D não foram alteradas nesta atualização.

# Curadoria de cores · 2026-10-10

Taste/Impeccable orientaram 26 seleções entre os seis grupos e as contagens de 3/4/5 cores. A leitura da fonte e dos nomes das malhas confirmou r1 como tons escuros da arte e r4 como brancos/brilhos/Enforma. Os rótulos foram corrigidos; mapas de regiões, vértices, materiais cadastrados e formato das receitas permanecem iguais.

Os 12 testes Node passaram, incluindo validade de todas as seleções, ordenação determinística, não mutação, filtros, travas sem recomendação possível, universos completos e favoritos antigos. A revisão independente não encontrou regressões acionáveis.

Chromium isolado com WebGL confirmou a recomendação inicial e as prévias dos seis grupos. “Todas” percorreu 50/100/120 combinações PETG rosa sem repetição. Foram verificados seleção/salvamento no segundo lote, favoritas filtradas com abertura/remoção por índice correto, exportação de todas as favoritas com filtro ativo, restauração de nome/data/cores antigos, variantes, travas sem resultados e recuperação via Todas, três cores PETG azul/amarelo, navegação por teclado e persistência após recarregar. Nenhum erro de JavaScript.

Inspeção visual desktop e mobile confirmou a galeria recomendada e a listagem de favoritas. O enquadramento das miniaturas foi corrigido para conter a peça inteira, inclusive nos cartões maiores. O viewport de 390 × 844 px não apresentou overflow horizontal. O texto secundário foi ajustado para contraste mínimo de 5:1 nas superfícies usadas. O detector Impeccable apontou apenas a borda de 3 px preexistente no aviso de cinco cores; ela foi reduzida para 1 px. Não houve alteração do visualizador 3D ou das malhas de produção.

# Catálogo público de recomendados · 2026-10-10

Os 13 testes Node e o build passaram. O catálogo fornece 26 receitas canônicas por variante, reúne os seis grupos e as contagens disponíveis, mantém os materiais separados e não depende de favoritas. As duas variantes totalizam 52 receitas distintas; a leitura do catálogo não altera favoritas nem suas cores.

Chromium isolado com WebGL confirmou duas sessões independentes: a primeira conservou suas favoritas após recarregar; a segunda começou com zero favoritas e as mesmas 26 recomendações. Todas as 26 receitas foram abertas e restauraram grupo, material, quantidade, neutro, variante e cores corretos. Favoritar diretamente do catálogo manteve a aba aberta e marcou o coração; Favoritas abriu a receita salva. Também passaram o atalho da lista vazia, a troca com/sem fundo, o catálogo com armazenamento bloqueado, a navegação por teclado e a paginação de 50/100 combinações após usar o catálogo.

Os viewports de 320, 390, 768 e 800 px não apresentaram overflow horizontal; as três abas mantiveram alvos de pelo menos 44 px. Foram inspecionadas imagens do catálogo desktop, catálogo mobile e cabeçalho mobile. Nenhum erro de JavaScript foi observado. Esta é uma validação em navegador isolado, sem alegação de teste físico no celular. Não houve alteração das malhas 3D.

# Abas de material, duas colunas e bases brancas · 2026-10-10

Os 14 testes Node e o build passaram. Duas receitas de quatro cores foram acrescentadas: Branco com silk (PLA) e Branco e rosas (PETG). O catálogo soma 28 seleções por variante, sendo 21 PLA e 7 PETG. Cada material tem ao menos uma base branca, sem misturar filamentos de grupos diferentes ou mudar os mapas das regiões.

Chromium isolado confirmou que as abas de material exibem somente as receitas do respectivo material, em ambas as variantes. A abertura das bases brancas restaurou material, grupo, quatro cores e corpo branco. Foram verificados favorito direto, reabertura, persistência após recarregar, troca de variante e seleção de abas por setas/Home/End com semântica ARIA de tabs/painel. Estúdio, Recomendados e Favoritas mantiveram exatamente duas colunas em 320, 390, 768 e 1440 px, inclusive na lista com um só cartão, sem overflow horizontal. A paginação de 50/100 combinações permaneceu funcional e sem repetições.

Uma inspeção visual em lote conferiu as duas bases brancas, as abas no desktop e a grade dupla no celular. O detector de layout do Impeccable não retornou achados. Nenhum erro de JavaScript foi observado; as malhas 3D permaneceram intactas.

# Catálogo separado, Estúdio manual e pedidos · 2026-10-10

Os 26 testes Node e o build estático passaram. O catálogo inicial contém somente a peça sem fundo, com rotas próprias de detalhes e abas Todos/PLA/PETG. O feed percorre 4.296 combinações legais (4.092 PLA, 204 PETG), em lotes de 50 sem repetição, com as 28 seleções autorais primeiro. A avaliação em Chromium isolado confirmou carregamento 50/100, seleção do segundo lote, volta com rolagem/foco preservados e fim do feed PETG em 204 itens.

O Estúdio usa quatro grupos fixos de regiões, com seletores na esquerda e a paleta abaixo. Foram testados corpo vermelho, troca manual, Random preservando principal e região nula, paletas sem mistura de materiais, rascunhos independentes após trocar abas/recarregar, receitas de uma/duas/três/quatro cores e favoritas imutáveis. Links manuais abriram em contexto novo sem cache. A navegação de tabs por teclado conservou foco. Importação/exportação versão 2 preservou originais versão 1 com fundo e receitas manuais, sem regravar o cache legado. Edição e salvamento em memória funcionaram com localStorage bloqueado.

PLA e PETG passaram em 1440×1000, 1024×768, 768×844, 390×844, 320×568 e 844×390 px, sem overflow horizontal/vertical no Estúdio e com a paleta inteira acessível. Foram corrigidos o espaço dos seletores na tela baixa e o foco das abas. As galerias continuam em duas colunas. Inspeção visual em lote conferiu catálogo, detalhe, Estúdio, favoritas e pedido em desktop/mobile; o detector de layout Impeccable não retornou achados.

Pedir preparou PNG local com quatro HEX, material, regiões sem cor própria e link exato da combinação. O destino wa.me foi conferido com o contato comercial atual do Fabrinquei. Download do PNG e backup foram verificados. Web Share foi exercitado com mock de compartilhamento: arquivo image/png, texto completo e ativação de clique preservada; cancelamento permitiu nova tentativa. Não foi enviada mensagem real nem validado compartilhamento em aparelho físico. O fallback orienta baixar/anexar o PNG e abrir a mensagem pronta; o site não alega envio automático.

Nenhum erro de JavaScript foi observado. As requisições de modelo carregaram apenas sem-fundo.glb. SHA-256 dos dois GLBs e do manifesto permaneceram idênticos ao commit anterior: sem-fundo `ab923a081599a42c8d931d0d2014773754a71753ba31e292e323ea79744c8208`; com-fundo `ed029b64dec8ac0c9e13a843f9c835866912b48a0c48190ef51ffae07db8862c`; manifesto `8d803b2ec15a46facf47d3df1e192355e52f1040a9b1b7b5f55a142d86b24c03`. Não houve alteração de geometria ou impressão física.

# V6 aprovada e articulação da tampa · 2026-10-11

29 testes Node passaram, incluindo a identidade SHA-256 do GLB aprovado, os 39 grupos de cor e a articulação rígida da tampa com os 21 componentes do logo. Corpo e 16 partes do bloco permanecem imóveis; fechar restaura a pose original. O pivô vem da V25B: nativo (-8.49538, -17.58665, 0), convertido para (0, 8.49538, -5.49455); abertura no eixo +X, até 85°. O GLB já estava fechado, sem aplicar a pose de impressão de 25° na origem.

Chromium isolado com WebGL confirmou o carregamento da V6, botão Abrir/Fechar, slider por teclado, troca PLA/PETG com a tampa aberta, Random, salvar favorita, abrir detalhe e miniaturas do catálogo. Sem erros JavaScript. Estúdio sem overflow em 1440×1000, 390×844, 320×568 e 844×390. Verificação automatizada de viewport, não teste físico em celular. Os snapshots de catálogo/pedido permanecem fechados e não alteram a pose ativa. Build e diff-check passaram.

[Antes/depois](v6/comparacao.png): câmera frontal, canvas de 500 px, recorte idêntico, mesma combinação e luz. A V6 ocupa a área retangular aprovada, preserva pedras e gomos escuros no casco; a V2 antiga tinha composição menor. Dimensões da base e logo mantidas. A fidelidade custa um GLB de 41,6 MB em vez de 8,2 MB; a aplicação reutiliza a malha entre previews. Capturas reais: [fechada](v6/studio-closed.png), [aberta](v6/studio-open.png), [tela estreita](v6/mobile-320x568.png).

Usada a mesma montagem GLB aprovada, byte a byte, sem redução de triângulos. Normais/materiais são preparados apenas na memória do visualizador. Nenhum 3MF foi modificado ou fatiado; a animação não comprova folga física ou ausência de colisões em todo o arco. URLs das receitas, favoritos e rascunhos locais permanecem compatíveis. O bundle usa versão no URL para evitar reutilização do código antigo pelo cache.
