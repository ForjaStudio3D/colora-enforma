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
