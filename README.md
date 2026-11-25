# ⚽ Subasta Futbolera

Puja a ciegas por jugadores reales con 1000M y monta tu 4-3-3. Cada silueta puede ser una leyenda, un troll, un normalito, un crack o un héroe en su prime. Al final, cara a cara posición por posición: los propios jugadores votan quién tiene mejor jugador.

## Cómo jugar

1. Abre el enlace del juego (GitHub Pages).
2. Uno crea la sala y pasa el enlace o el código de 5 dígitos.
3. Los demás (hasta 4 mánagers) entran con ese enlace o código.

El navegador de quien crea la sala hace de servidor (los mensajes viajan por un servidor MQTT público, así funciona en cualquier red), así que **el anfitrión no debe cerrar su pestaña** durante la partida.

## Archivos

- `index.html`: la web del juego.
- `engine.js`: reglas de la subasta y de la votación final.
- `players.js`: 660 jugadores reales (60 por posición).
