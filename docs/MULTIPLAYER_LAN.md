# Catoons TD — Multiplayer cooperativo (LAN/VPN)

Este é um recurso experimental da versão beta. Ele não usa servidor externo: os jogadores se conectam diretamente por LAN ou VPN.

## O que já funciona

- De dois a quatro jogadores conectados diretamente por LAN ou VPN.
- Todos entram na mesma fase e veem o mesmo campo.
- Cada jogador começa com sua própria carteira de salmões e paga somente pelos próprios gatinhos e upgrades.
- Vidas, rodadas, inimigos e o campo são compartilhados.
- No cooperativo, cada rodada traz duas vezes mais balões que no modo solo.
- Cada participante pode posicionar, melhorar, reposicionar e vender seus próprios gatinhos.
- Todos podem pedir o início da rodada e mudar a velocidade.
- O anfitrião mantém a simulação oficial e envia o estado da partida aos demais jogadores.
- **Evento diário de boss** separado das fases, exclusivo do cooperativo, com 60 rodadas.
- O **Almirante Espinha** invade nas rodadas 20, 40 e 60, ficando mais resistente a cada aparição. A vida também escala com a equipe: 2 jogadores ×1,00; 3 jogadores ×1,34; 4 jogadores ×1,68.
- Para compensar equipes menores, cada jogador começa o evento com 🐟 500 em dupla, 🐟 425 em trio ou 🐟 350 com quatro jogadores.
- A vida do Almirante é dividida em quatro etapas. No começo e ao perder cada etapa, ele recria um escudo e fica extremamente lento até a proteção ser rompida:
  1. escudo antiblindagem — só recebe dano de quem quebra blindados;
  2. escudo camuflado — só recebe dano de quem detecta camuflados;
  3. escudo térmico — só recebe dano de fogo ou laser;
  4. escudo final — todos podem causar dano.
- Barra de boss própria, com vida segmentada, escudo, etapa e requisito de dano visíveis durante a invasão.
- Nova unidade de suporte **Caixinha de Areia**, com limite global de uma por equipe e três caminhos: ataques universais, velocidade/alcance ou mais salmões por estouros e fazendas.
- O segundo boss aparece no lobby como **Em breve** e ainda não participa da rotação.

## Como conectar

1. Extraia o mesmo ZIP nos dois computadores.
2. Abra `index.html` no Edge ou Chrome nos dois computadores.
3. Nos dois jogos, abra a aba **Evento** para jogar o boss diário, ou entre em **Play** para a campanha cooperativa.
4. No primeiro computador, clique em **Criar sala** e envie o código exibido ao próximo jogador.
5. No computador convidado, clique em **Entrar em sala**, cole o código e clique em **Gerar resposta**.
6. Envie a resposta gerada de volta ao anfitrião.
7. O anfitrião cola a resposta e clica em **Conectar jogador**.
8. Para adicionar o terceiro e o quarto participantes, o anfitrião clica em **Convidar outro jogador** e repete os passos 5 a 7 com um novo código para cada pessoa.
9. Quando todos estiverem conectados, o anfitrião inicia o evento ou escolhe mapa/dificuldade da campanha. Os convidados entram automaticamente.

## Observações desta primeira versão

- Os dois computadores precisam estar na mesma rede ou conectados por uma VPN que permita comunicação direta entre os participantes.
- Os dois devem usar exatamente o mesmo pacote do jogo.
- Se a conexão cair, volte ao lobby e crie uma sala novamente; a reconexão automática ainda não foi adicionada.
- Nesta primeira versão, a recompensa/progressão permanente da vitória é registrada apenas no computador anfitrião.
- Não publique os códigos da sala: eles contêm informações técnicas temporárias da conexão local.

