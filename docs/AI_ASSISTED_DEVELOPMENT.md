# Desenvolvimento assistido por IA

## Como a IA foi usada

Catoons TD foi desenvolvido com uma abordagem de **engenharia assistida por IA**. A IA atuou principalmente como copiloto para transformar requisitos em implementação, revisar alternativas, encontrar causas de bugs, gerar refatorações e acelerar documentação.

O fluxo de trabalho usado ao longo do projeto foi:

1. **Ideação e requisitos** — definição humana das mecânicas, regras de balanceamento, experiência desejada e prioridades.
2. **Especificação incremental** — cada mudança era reduzida a uma versão com escopo claro.
3. **Implementação assistida** — IA utilizada para propor/editar trechos de HTML, CSS, JavaScript e Go.
4. **Teste de execução** — o resultado era aberto e jogado; bugs visuais e de lógica eram reportados com contexto real.
5. **Depuração** — inspeção do código e correções orientadas pelo comportamento observado.
6. **Validação** — sintaxe, empacotamento, regressões importantes e continuidade do save eram verificados antes do próximo checkpoint.

## Responsabilidade humana

O projeto não trata a saída da IA como correta por padrão. Decisões importantes passam por validação do autor, incluindo:

- conceito e identidade do jogo;
- regras de dificuldade e economia;
- definição de personagens e habilidades;
- critérios de desbloqueio;
- seleção do que entra ou não em cada versão;
- avaliação visual durante playtests;
- identificação de regressões e bugs;
- decisão de lançamento e prioridades do roadmap.

## Por que isso é relevante no portfólio

O objetivo desta documentação é mostrar uma competência cada vez mais importante em desenvolvimento de software: **saber dirigir ferramentas de IA com requisitos claros, verificar o resultado, depurar e assumir responsabilidade pelo produto final**.

O projeto demonstra:

- decomposição de problemas;
- raciocínio sobre estado e regras de negócio;
- versionamento incremental;
- debugging baseado em evidência;
- preocupação com UX e performance;
- documentação e preparação de release;
- avaliação crítica de código gerado por IA.

## Como explicar em uma entrevista

Uma resposta curta e transparente:

> “Usei IA como copiloto durante o desenvolvimento do Catoons TD. Eu definia as regras e o comportamento esperado, usava a IA para acelerar implementação e refatoração, depois testava o jogo e voltava com bugs concretos. Isso me fez trabalhar bastante com requisitos, debugging, versionamento e validação, em vez de simplesmente aceitar código gerado.”

Se perguntarem sobre o código, o ideal é explicar os principais fluxos — estado da partida, targeting, persistência, progressão e launcher — e mostrar no repositório onde cada parte está implementada.
