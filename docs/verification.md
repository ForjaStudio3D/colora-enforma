# Verificação · 2026-10-09

Os sete testes Node passaram: grupos e contagem, branco no PETG azul/amarelo, quarta cor neutra, travas, favoritos, backup atômico e rejeição de cores inventadas/importações incompatíveis.

O build estático passou. Chromium isolado com WebGL carregou as duas malhas, gerou miniaturas 3D, alternou as variantes, aplicou cinco cores no PETG rosa e impediu cinco no PETG azul/amarelo. Foram conferidos permuta manual de cores, travas, favorito após recarregar, reabertura da receita, exportação PNG e backup/importação JSON. Nenhum erro de JavaScript foi observado. O viewport de 390 × 844 px não apresentou overflow horizontal; também houve inspeção visual em 1440 × 1100 px. Isso é uma verificação de navegador, sem alegação de teste em iPhone físico.

Os modelos de exibição usam as malhas existentes. Corpo, tampa e logotipo mantêm seus vértices; somente a arte recebe redução de detalhe, limitada aos extremos de cada parte original. Não foram alterados arquivos de produção, dimensões da base, projetos no Keychain Maker ou configurações de impressora. As receitas de cinco cores não foram fatiadas nem validadas com troca de filamento por pausa.

A publicação em https://forjastudio3d.github.io/colora-enforma/ foi concluída na branch `deploy`, commit `fc80aa822a9498b58e6d1293457f1f17d2de4731`. HTML, JavaScript, manifesto e ambos os GLBs retornaram HTTP 200 com SHA-256 idêntico ao build local. O mesmo roteiro de navegador passou no endereço público, incluindo persistência, variantes, PNG, backup e viewport mobile, sem erros de JavaScript.
