# ⚽ Subasta Futbolera

Puja a ciegas por jugadores reales con 1000M y monta tu 4-3-3. Cada silueta puede ser una leyenda, un troll, un normalito, un crack o un héroe en su prime. Al final, los equipos se enfrentan en un partido simulado.

## Cómo jugar

1. Abre el enlace del juego (GitHub Pages).
2. Uno crea la sala y pasa el enlace o el código de 5 dígitos.
3. Los demás (hasta 4 mánagers) entran con ese enlace o código.

El navegador de quien crea la sala hace de servidor (los mensajes viajan por un servidor MQTT público, así funciona en cualquier red), así que **el anfitrión no debe cerrar su pestaña** durante la partida.

## Archivos

- `index.html`: la web del juego.
- `engine.js`: reglas de la subasta y simulador de partidos.
- `players.js`: 550 jugadores reales (50 por posición).
