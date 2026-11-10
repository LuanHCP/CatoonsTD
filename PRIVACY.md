# Privacidade — Catoons TD

**Última atualização:** 10 de novembro de 2026

O cadastro no Catoons TD é opcional. O modo visitante guarda o progresso no navegador.

## Dados salvos

- O progresso e as configurações ficam no armazenamento local (`localStorage`) do navegador.
- Ao usar o login opcional, o Firebase Authentication identifica a conta Google. O jogo usa o identificador da conta para carregar e guardar o perfil no Cloud Firestore. As regras do banco permitem que cada conta acesse o próprio save.
- O save da conta inclui o nome de jogador, desbloqueios, XP, moedas, inventário, cosméticos, broches e progresso de mapas e missões. Configurações do aparelho e checkpoints de partidas solo ficam no armazenamento local.
- O jogador pode exportar e importar manualmente um arquivo de save em **Configurações**.
- Limpar os dados do navegador ou jogar em outro dispositivo pode apagar ou não apresentar o progresso local.

## Serviços externos

- O botão de feedback abre o GitHub em uma nova aba.
- O botão de apoio ao criador exibe informações de Pix, mas o jogo não processa pagamentos e não concede vantagens de gameplay.
- Ao jogar pela página do itch.io ou GitHub Pages, essas plataformas podem aplicar suas próprias políticas e registros técnicos.
- Ao criar ou entrar em uma sala cooperativa, o jogo conecta ao PeerServer público do PeerJS para trocar IDs e dados técnicos de conexão WebRTC. Esse serviço pode receber o endereço IP e metadados de conexão; ele não recebe o save local. O estado da partida circula diretamente entre os participantes.
- Os demais jogadores da sala podem receber informações técnicas de rede necessárias à conexão direta. Compartilhe o ID da sala somente com pessoas que deseja convidar.
- A reconexão utiliza um token temporário de sessão transmitido diretamente ao convidado para recuperar sua vaga por até 60 segundos. Fechar a página não preserva uma partida do anfitrião.

## Contato

Questões sobre privacidade podem ser enviadas pelas [Issues do projeto](https://github.com/LuanHCP/CatoonsTD/issues).
