# Catoons TD — Multiplayer cooperativo (LAN/VPN)

Este é um recurso experimental da versão beta. As salas usam um ID numérico de 8 dígitos: o anfitrião cria, compartilha o ID e os amigos digitam para conectar automaticamente.

Criar e encontrar salas exige internet, pois o serviço público PeerServer do PeerJS apresenta os jogadores. O estado da partida é transmitido diretamente entre os computadores por WebRTC, na mesma rede ou VPN. A biblioteca PeerJS 1.5.5 está incluída no jogo, com licença MIT em `src/vendor/PEERJS_LICENSE`.

## O que já funciona

- De dois a quatro jogadores conectados diretamente por LAN ou VPN.
- Todos entram na mesma fase e veem o mesmo campo.
- Cada jogador começa com sua própria carteira de salmões e paga somente pelos próprios gatinhos e upgrades.
- Vidas, rodadas, inimigos e o campo são compartilhados.
- No cooperativo, cada rodada traz duas vezes mais balões que no modo solo.
- Cada participante pode posicionar, melhorar, reposicionar e vender seus próprios gatinhos.
- Todos podem pedir o início da rodada e mudar a velocidade.
- O anfitrião mantém a simulação oficial e envia o estado da partida aos demais jogadores.
- **Evento diário de boss** separado das fases, disponível solo ou em equipe de até 4 jogadores, com 60 rodadas. O botão **Jogar solo** inicia diretamente, sem criar sala e sem internet.
- O **Almirante Espinha** invade nas rodadas 20, 40 e 60, ficando mais resistente a cada aparição. A vida também escala com a equipe: solo ×0,66; 2 jogadores ×1,00; 3 jogadores ×1,34; 4 jogadores ×1,68.
- Para compensar equipes menores, cada jogador começa o evento com 🐟 650 solo, 🐟 500 em dupla, 🐟 425 em trio ou 🐟 350 com quatro jogadores. Solo recebe a quantidade normal de balões; em equipe vêm 2× mais.
- A vida do Almirante é dividida em quatro etapas. No começo e ao perder cada etapa, ele recria um escudo e fica extremamente lento até a proteção ser rompida:
  1. escudo antiblindagem — só recebe dano de quem quebra blindados;
  2. escudo camuflado — só recebe dano de quem detecta camuflados;
  3. escudo térmico — só recebe dano de fogo ou laser;
  4. escudo final — todos podem causar dano.
- Barra de boss própria, com vida segmentada, escudo, etapa e requisito de dano visíveis durante a invasão.
- O anfitrião escolhe **Normal** ou **Insano** antes de iniciar. O Insano multiplica vida e escudos por cinco, além da escala de equipe. Nas rodadas 18/19, 38/39 e 58/59, um aviso mostra a cobertura antiblindagem, camuflada e térmica da defesa.
- O Gato Cipó não prende bosses ou mini-bosses de nenhum modo, nem com sua habilidade de maestria. Veneno não conta como fogo no escudo térmico.
- Cada invasão derrotada concede a todos os participantes 🥫 3/5/8 latas no Normal ou 🥫 9/15/24 no Insano. O boss final da campanha concede uma lata; mini-bosses não concedem latas. Os recibos da partida impedem duplicação ao reenviar snapshots ou reconectar.
- Derrotar uma invasão libera o broche **Caçador de Almirantes** e a compra do banner **Maré Conquistada**. Concluir as três invasões libera o broche da variante; o Insano também libera cosméticos exclusivos para compra.
- Nova unidade de suporte **Caixinha de Areia**, com limite global de uma por equipe e três caminhos: ataques universais, velocidade/alcance ou mais salmões por estouros e fazendas.
- O segundo boss aparece no lobby como **Em breve** e ainda não participa da rotação.

## Como conectar

1. Extraia o mesmo ZIP nos dois computadores.
2. Abra `index.html` no Edge ou Chrome nos dois computadores.
3. Nos dois jogos, abra a aba **Evento** para jogar o boss diário, ou entre em **Play** para a campanha cooperativa.
4. No primeiro computador, clique em **Criar sala** e em **Copiar ID**.
5. Envie o mesmo ID de 8 números para todos os amigos.
6. Cada convidado digita o ID no campo **Já tem um ID?** e clica em **Conectar**.
7. As quatro vagas mostram quem já está conectado. O anfitrião inicia a partida quando a equipe estiver pronta; os convidados entram automaticamente.
8. Para sair, um convidado usa **Sair da sala**. O anfitrião usa **Fechar sala** para encerrar a sala inteira. As vagas liberadas podem ser preenchidas com o mesmo ID enquanto estiverem no lobby.
9. Ao voltar da partida pelo menu, o anfitrião traz todos de volta ao lobby e mantém a sala aberta. Entradas durante uma partida em andamento são bloqueadas.

## Quedas temporárias e limites

- Os dois computadores precisam estar na mesma rede ou conectados por uma VPN que permita comunicação direta entre os participantes.
- Os dois devem usar exatamente o mesmo pacote do jogo.
- Se um convidado perder temporariamente o canal, a equipe pausa por até **60 segundos**. Ele tenta reconectar automaticamente à mesma vaga, mantendo salmões, gatinhos e recompensas. Ao voltar, recebe o estado atual e a equipe continua.
- Sair ou fechar a sala é uma ação explícita e não inicia recuperação. Encerrado o prazo, o anfitrião libera a vaga; não há migração de anfitrião nem recuperação após fechar/recarregar sua página.
- Latas, broches e conclusões de mapas são registrados no save de cada participante conectado. As moedas e o XP regulares da tela de vitória continuam sendo registrados apenas no anfitrião nesta versão.
- A quantidade inicial de participantes é mantida para a escala do boss e das ondas durante a partida, mesmo se alguém sair.
- Compartilhe o ID apenas com quem você quer convidar. Ele dá acesso à sala enquanto ela estiver aberta.
- Se o serviço público de salas estiver indisponível, o jogo informa o erro; o modo solo continua disponível.

