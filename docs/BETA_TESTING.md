# Checklist de Beta / Playtest

## Objetivo — v0.29.3

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
- [ ] Perder uma fase sem colocar gatinho/herói e confirmar o desbloqueio do Gatinho Mister.
- [ ] Confirmar que o Gatinho Mister custa 🐟 999 em todos os tiers, tem limite de 1 e não aceita upgrades.
- [ ] Confirmar que o Gatinho Mister para de atacar após 30 segundos e volta temporariamente com a habilidade de Maestria.
- [ ] Confirmar que a revelação do secreto aparece acima da tela de resultado.

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
- [ ] Em celular 390×844 (retrato), confirmar que HUD, mapa, gatinhos e botão de rodada ficam acessíveis sem zoom manual.
- [ ] Em celular 844×390 (paisagem), confirmar que o mapa ganha área e os controles continuam acessíveis.
- [ ] Girar o aparelho durante uma partida e confirmar que o mapa se recalibra sem perder a partida.
- [ ] Arrastar horizontalmente a barra de gatinhos/poderes e confirmar que o gesto não posiciona unidades por acidente.
- [ ] Abrir upgrades no celular e confirmar rolagem, fechamento, compra, venda e reposicionamento.
- [ ] Na coleção, abrir a ficha de um gatinho com 3 caminhos e confirmar nomes, T1–T5, efeitos e preços.
- [ ] Abrir a ficha do Pescador e confirmar a progressão linear; fechar pelo botão, fundo e tecla Esc.

## 11. Conteúdo v0.28.x

- [ ] Jogar Festa na Igreja e colocar gatinhos sobre todos os bancos elevados.
- [ ] Confirmar desbloqueio e limite de 1 Rei Demônio por partida.
- [ ] Testar os três caminhos do Gato Celestial até T5.
- [ ] Confirmar o giro gratuito, a recarga de 24 horas e a garantia no 50º giro.
- [ ] Confirmar que o Pix abre, copia o código e não concede recompensa de gameplay.
- [ ] Abrir o formulário de feedback pelas Configurações.

## 12. Idiomas (v0.29.3)

- [ ] Abrir com save limpo num navegador em inglês e confirmar que o jogo inicia em inglês.
- [ ] Trocar o idioma pelo botão 🌐 do lobby e pelo seletor em Configurações.
- [ ] Jogar uma partida inteira em inglês procurando textos que ficaram em português.
- [ ] Confirmar que o seletor de idioma fica bloqueado no menu de pausa durante a partida.

## 13. Limitações conhecidas do beta

- O progresso é local ao navegador; exportar o save é recomendado.
- A recarga diária usa o relógio do dispositivo durante este beta.
- Login Google e sincronização em nuvem ainda não fazem parte desta versão.

## Modelo para reportar bug

### Atualização: lobby, perfil e Insano

Validações automatizadas executadas em 23/10/2026:

- Regras: migração do save, compras, equipamento persistente, recibos únicos, conquistas por dificuldade, quatro escudos e 5× exato de vida/escudo para 1–4 participantes.
- Interface no Edge: cinco telas em 1366×768, 844×390 e 390×844, sem corte horizontal; criação/fechamento de sala, solo offline e compra/salvamento de cosméticos.
- Sala com quatro instâncias locais: rejeição do quinto, carteiras individuais, colocação de gatinhos, balões dobrados, queda/reconexão preservando a vaga e retorno ao lobby.
- Integração com duas instâncias: invasões 20/40/60 eliminadas por ações de teste, 48 latas do Insano recebidas em ambos os saves, broche final, compra e reenvio sem duplicação.
- Relógio simulado: expiração de vaga após tentativa de reconexão falha, limite de 60 segundos e fechamento explícito.

Ainda exige playtest humano: balanceamento de uma partida completa sem atalhos de teste, desempenho em celulares físicos e reconexão entre computadores distintos por LAN/VPN. A integração automatizada não demonstra que uma composição real vence o Insano.

```text
Versão: v0.29.3
Idioma:
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
