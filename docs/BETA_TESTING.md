# Checklist de Beta / Playtest

## Objetivo — v0.28.4

Validar se os sistemas atuais funcionam juntos antes de adicionar novas mecânicas grandes.

## 1. Primeira experiência

- [ ] Abrir o jogo com save limpo.
- [ ] Executar o tutorial até o fim.
- [ ] Concluir Bosque dos Gatinhos no Fácil.
- [ ] Confirmar que moedas, XP e estrela foram salvos.
- [ ] Fechar e abrir o jogo novamente e confirmar persistência.

## 2. Dificuldades e economia

- [ ] Jogar pelo menos um mapa de cada tier.
- [ ] Comparar Fácil, Normal e Difícil no mesmo mapa.
- [ ] Confirmar preço de colocação por tier: Iniciante -10%, Médio normal, Difícil +10%, Impossível +20%.
- [ ] Confirmar venda por 50% do investimento.
- [ ] Testar economia com Pescador e Dom Salmão.

## 3. Torres e upgrades

- [ ] Testar todos os gatinhos normais.
- [ ] Testar caminhos T1–T5 e crosspath quando aplicável.
- [ ] Confirmar targeting First/Last/Strong/Weak/Camo/Armored.
- [ ] Confirmar reposicionamento e limite por tipo.
- [ ] Verificar orientação visual dos personagens ao mirar para lados opostos.

## 4. Heróis

- [ ] Uma partida com cada herói.
- [ ] Confirmar evolução Nv.1 → Nv.10.
- [ ] Confirmar habilidade Nv.5 e Ultimate Nv.10.
- [ ] Verificar cooldowns individuais e buffs visuais.

## 5. Maestria e secretos

- [ ] Confirmar ganho de XP de Maestria.
- [ ] Testar habilidade de uma unidade no Nv.50.
- [ ] Confirmar skin dourada e recompensa máxima.
- [ ] Verificar que secretos não aparecem antes do desbloqueio.
- [ ] Confirmar reconhecimento retroativo para saves que já cumprem requisitos.

## 6. Inimigos especiais

- [ ] Curandeiro: cura 1 camada por segundo em raio pequeno.
- [ ] Atrapalhão: remove camada do aliado e stuna torres próximas.
- [ ] Bobo da Corte: perda por acerto nunca ultrapassa 🐟 500 salmões.
- [ ] Anjo: escudo bloqueia um ataque e reduz velocidade do protegido.
- [ ] Demônio: rouba camadas e aumenta HP máximo dentro do limite.

## 7. Sinergias

Testar individualmente:

- [ ] Gelinho + Volts.
- [ ] Sniper + Ninja.
- [ ] Dardo + Bombinha.
- [ ] Cipó + Mago.
- [ ] Pescador + Dom Salmão.
- [ ] Laser + Alquimista.
- [ ] Mago + Cronomante.
- [ ] Bumerangue + Gelinho.

## 8. Performance

Pressione **F8** durante a partida e observe:

- FPS;
- inimigos + fila de spawn;
- projéteis;
- efeitos;
- quantidade de torres;
- memória JS quando disponível;
- HP de boss;
- sinergias ativas.

Teste recomendado: modo Infinito em 3× com muitas torres e inimigos.

## 9. Save

- [ ] Exportar save.
- [ ] Alterar progresso.
- [ ] Importar o arquivo exportado.
- [ ] Confirmar restauração correta.
- [ ] Testar migração de um save antigo, quando disponível.

## 10. Interface e botões

- [ ] Clicar nas bordas, no ícone e no texto do botão de iniciar rodada.
- [ ] Confirmar o botão de rodada em 100%, 125% e 150% de escala do Windows.
- [ ] Confirmar que Play abre a fase e reposiciona a tela corretamente.
- [ ] Testar todos os botões do menu, pausa, velocidade, upgrades e configurações.
- [ ] Confirmar que preços e recompensas da partida usam salmões (🐟), não `$` ou “ouro”.

## 11. Conteúdo v0.28.x

- [ ] Jogar Festa na Igreja e colocar gatinhos sobre todos os bancos elevados.
- [ ] Confirmar desbloqueio e limite de 1 Rei Demônio por partida.
- [ ] Testar os três caminhos do Gato Celestial até T5.
- [ ] Confirmar o giro gratuito, a recarga de 24 horas e a garantia no 50º giro.
- [ ] Confirmar que o Pix abre, copia o código e não concede recompensa de gameplay.
- [ ] Abrir o formulário de feedback pelas Configurações.

## 12. Limitações conhecidas do beta

- O progresso é local ao navegador; exportar o save é recomendado.
- A recarga diária usa o relógio do dispositivo durante este beta.
- Login Google e sincronização em nuvem ainda não fazem parte desta versão.

## Modelo para reportar bug

```text
Versão: v0.28.4
Mapa:
Tier:
Dificuldade:
Modo:
Wave:
Herói:
Torres principais:
Sinergias:
FPS no F8:
Resolução / escala do Windows:
O que aconteceu:
O que era esperado:
Como reproduzir:
```
