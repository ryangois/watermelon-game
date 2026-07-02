# Music Pack Ideas

Use este arquivo como guia para gerar as trilhas no Suno/Sumo AI e depois substituir os placeholders da loja.

## Regras gerais

- Formato sugerido: MP3, 128 kbps ou 192 kbps.
- Duracao ideal: 45 a 75 segundos.
- Estrutura: intro curta, loop principal, sem final muito marcado.
- Evitar voz cantada. Se usar voz, prefira chops/onomatopeias sem letra.
- Volume percebido consistente entre faixas.
- Exportar com nomes em kebab-case, por exemplo `cosmic-bounce.mp3`.
- Depois de exportar, atualizar o `src` correspondente em `js/skins.js`.

## Faixas

### Fruit Groove
- Arquivo: `music-fruits.mp3`
- Uso: trilha gratis inicial.
- Prompt: upbeat cute fruit puzzle game music, playful marimba, soft bass, light percussion, cozy arcade loop, no vocals, seamless loop
- Visual sonoro: colorido, amigavel, tutorial/menu inicial.

### Calm Harvest
- Arquivo sugerido: `calm-harvest.mp3`
- Uso: partidas focadas e longas.
- Prompt: calm cozy puzzle game soundtrack, warm keys, soft plucks, gentle percussion, relaxing farming game mood, no vocals, seamless loop
- Visual sonoro: fim de tarde, colheita, calma.

### Arcade Pop
- Arquivo sugerido: `arcade-pop.mp3`
- Uso: partidas rapidas e combos.
- Prompt: cheerful arcade pop loop, chiptune sparkle, bouncy bass, claps, playful synth melody, no vocals, energetic but not aggressive
- Visual sonoro: fliperama fofo, energia limpa.

### Boss Fruit
- Arquivo sugerido: `boss-fruit.mp3`
- Uso: pontuacoes altas e tensao final.
- Prompt: intense cute boss battle puzzle music, punchy drums, funky bass, playful brass stabs, arcade tension, no vocals, seamless loop
- Visual sonoro: desafio, quase perdendo, mas divertido.

### Halloween Hop
- Arquivo sugerido: `halloween-hop.mp3`
- Uso: tema Halloween.
- Prompt: spooky cute halloween game loop, toy piano, theremin, muted trap beat, playful ghost vibe, funny not scary, no vocals
- Visual sonoro: aboboras, fantasmas, travessura.

### Snowy Sleigh
- Arquivo sugerido: `snowy-sleigh.mp3`
- Uso: tema Natal.
- Prompt: cheerful christmas puzzle game loop, sleigh bells, soft celesta, warm bass, cozy winter arcade, no vocals, seamless loop
- Visual sonoro: neve, luzinhas, presente.

### Cosmic Bounce
- Arquivo sugerido: `cosmic-bounce.mp3`
- Uso: tema Sideral.
- Prompt: cosmic synth puzzle game loop, dreamy arpeggios, space pads, bouncy electronic drums, cute sci fi arcade, no vocals
- Visual sonoro: estrelas, planetas, gravidade leve.

### Olympus Pop
- Arquivo sugerido: `olympus-pop.mp3`
- Uso: tema Mitologia.
- Prompt: playful mythological arcade loop, lyre plucks, heroic percussion, bright brass, modern pop groove, no vocals, seamless loop
- Visual sonoro: Olimpo fofo, deuses em miniatura.

### Tidal Combo
- Arquivo sugerido: `tidal-combo.mp3`
- Uso: tema Oceano.
- Prompt: ocean themed puzzle game music, steel drums, bubbly synths, relaxed tropical groove, water percussion, no vocals, seamless loop
- Visual sonoro: bolhas, ondas, praia arcade.

### Neon Circuit
- Arquivo sugerido: `neon-circuit.mp3`
- Uso: tema Robos.
- Prompt: cute robot arcade loop, electro funk bass, digital blips, tight drums, neon synth lead, no vocals, seamless loop
- Visual sonoro: circuitos, robozinhos, neon.

### Candy Rush
- Arquivo sugerido: `candy-rush.mp3`
- Uso: tema Doceria.
- Prompt: sweet candy puzzle game loop, kawaii pop synths, bubblegum bass, hand claps, playful bells, no vocals, upbeat
- Visual sonoro: balas, chantilly, corrida doce.

### Golden Fever
- Arquivo sugerido: `golden-fever.mp3`
- Uso: tema Luxo.
- Prompt: luxurious funky arcade loop, slap bass, disco strings, gold sparkle synths, confident groove, no vocals, seamless loop
- Visual sonoro: moedas, brilho, premio raro.

## Como ligar no jogo

1. Gere a faixa e exporte em MP3.
2. Salve em `assets/music/`.
3. Abra `js/skins.js`.
4. Troque o `src` da faixa, por exemplo:

```js
{ id: 'cosmic-bounce', name: 'Cosmic Bounce', icon: '✦', description: 'Synth espacial para skins siderais', price: 380, src: 'assets/music/cosmic-bounce.mp3' }
```

Enquanto o arquivo nao existir, deixe `src: 'assets/music/music-fruits.mp3'` para usar a musica atual como placeholder.
