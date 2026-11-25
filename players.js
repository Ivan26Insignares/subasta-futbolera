(function (root) {
// Base de datos de jugadores REALES. 5 por posición: troll, leyenda, normal, bueno, prime.
// tier: troll | legend | normal | good | prime
const POSITIONS = [
  { key: 'POR', name: 'Portero' },
  { key: 'LD',  name: 'Lateral derecho' },
  { key: 'DFD', name: 'Central derecho' },
  { key: 'DFI', name: 'Central izquierdo' },
  { key: 'LI',  name: 'Lateral izquierdo' },
  { key: 'MCD', name: 'Pivote' },
  { key: 'MC',  name: 'Mediocentro' },
  { key: 'MCO', name: 'Mediapunta' },
  { key: 'EI',  name: 'Extremo izquierdo' },
  { key: 'ED',  name: 'Extremo derecho' },
  { key: 'DC',  name: 'Delantero centro' },
];

const P = (name, tier, ovr, nat, clue, bio, q) => ({ name, tier, ovr, nat, clue, bio, q: q || `${name} footballer` });

const PLAYERS = {
  POR: [
    P('Loris Karius', 'troll', 62, 'Alemania', 'Jugó una final de Champions que nunca olvidará... por desgracia.', 'Kiev 2018. Benzema y Bale aún le mandan flores.'),
    P('Iker Casillas', 'legend', 95, 'España', 'Le llamaban "el Santo". Levantó la copa más importante del planeta como capitán.', 'San Iker: un Mundial, dos Eurocopas y tres Champions.'),
    P('Sergio Asenjo', 'normal', 75, 'España', 'Portero sólido de LaLiga, larga etapa en un submarino amarillo.', 'Fiable, sin hacer ruido. Un portero de los de toda la vida.'),
    P('Keylor Navas', 'good', 87, 'Costa Rica', 'Tres Champions seguidas bajo palos. Centroamericano.', 'El muro tico de las tres Champions seguidas.'),
    P('Jerzy Dudek', 'prime', 83, 'Polonia', 'Bailó sobre la línea en una tanda de penaltis en Estambul.', 'Las "piernas de espagueti" de Estambul 2005.'),
  ],
  LD: [
    P('Douglas Pereira', 'troll', 58, 'Brasil', 'Brasileño. Un gigante europeo pagó por él... y aún se preguntan por qué.', 'El fichaje más misterioso de la historia del Barça.', 'Douglas Pereira dos Santos footballer Barcelona'),
    P('Cafu', 'legend', 94, 'Brasil', 'Único en jugar tres finales de Mundial seguidas. Capitán pentacampeón.', 'Il Pendolino. Dos Mundiales y una banda infinita.', 'Cafu Brazilian footballer'),
    P('Kiko Femenía', 'normal', 74, 'España', 'Lateral valenciano de largo recorrido, pasó por Inglaterra y por un submarino.', 'Corre, centra y vuelve. Cumplidor.'),
    P('Dani Carvajal', 'good', 87, 'España', 'Canterano blanco con más Champions que dedos en una mano.', 'Seis Champions y una Eurocopa. Un perro de presa.'),
    P('Benjamin Pavard', 'prime', 83, 'Francia', 'Marcó una volea imposible con el exterior en un Mundial... y luego lo ganó.', 'Kazán 2018: el gol del torneo y campeón del mundo.'),
  ],
  DFD: [
    P('Phil Jones', 'troll', 61, 'Inglaterra', 'Sus caras en el campo son patrimonio de internet. Inglés.', 'Fergie dijo que podía ser el mejor de la historia del club. Spoiler: no.'),
    P('Carles Puyol', 'legend', 94, 'España', 'Melena al viento y cabezazo histórico en una semifinal mundialista.', 'El capitán. Durban 2010 y corazón azulgrana.'),
    P('Iñigo Martínez', 'normal', 77, 'España', 'Central zurdo vasco que ha cruzado la frontera Real Sociedad–Athletic.', 'Buena salida de balón y carácter.'),
    P('Rúben Dias', 'good', 88, 'Portugal', 'Pilar de un triplete inglés. Portugués.', 'El jefe de la zaga del City del triplete.'),
    P('Marco Materazzi', 'prime', 84, 'Italia', 'Marcó en una final mundialista y provocó el cabezazo más famoso de la historia.', 'Berlín 2006: gol, provocación y campeón del mundo.'),
  ],
  DFI: [
    P('Harry Maguire', 'troll', 63, 'Inglaterra', 'Una cabeza que pesa como un balón medicinal. Récord de traspaso para un defensa en su día.', '80 millones de libras de memes.'),
    P('Paolo Maldini', 'legend', 96, 'Italia', '25 años en el mismo club rossonero. Elegancia pura.', 'Il Capitano. Cinco Copas de Europa con el Milan.'),
    P('Mario Hermoso', 'normal', 76, 'España', 'Central zurdo madrileño, pasó por Espanyol y Atlético.', 'Correcto y con buen golpeo de zurda.'),
    P('Virgil van Dijk', 'good', 89, 'Países Bajos', 'Gigante neerlandés que casi gana el Balón de Oro siendo defensa.', 'El muro de Anfield.'),
    P('Carlos Marchena', 'prime', 82, 'España', 'Estuvo 50 partidos seguidos con su selección sin perder. Mundial y Euro.', 'Amuleto de la mejor España de la historia.'),
  ],
  LI: [
    P('Junior Firpo', 'troll', 64, 'España', 'Llegó al Barça para ser el heredero de un lateral legendario... y no lo fue.', 'Heredero de Jordi Alba durante cinco minutos.'),
    P('Roberto Carlos', 'legend', 95, 'Brasil', 'Un tiro libre suyo desafió las leyes de la física.', 'El cohete de Garça. Campeón del mundo en 2002.'),
    P('José Luis Gayà', 'normal', 78, 'España', 'Capitán che, lateral de toda la vida en Mestalla.', 'Fiel al Valencia contra viento y marea.'),
    P('Jordi Alba', 'good', 86, 'España', 'Socio telepático de un argentino bajito. Velocidad pura.', 'La autopista izquierda del Barça.'),
    P('Joan Capdevila', 'prime', 82, 'España', 'Lateral catalán que ganó Euro y Mundial. Luego se fue a la India.', 'Titular indiscutible de la España campeona 2008-2010.'),
  ],
  MCD: [
    P('Alex Song', 'troll', 64, 'Camerún', 'Fichó por un gigante y salió en más fotos de banquillo que de partido.', 'Vino al Barça a hacer turismo de lujo.'),
    P('Sergio Busquets', 'legend', 93, 'España', 'Nunca parece correr, pero siempre está. El pulpo de Badía.', 'El pivote perfecto. Lo ganó absolutamente todo.'),
    P('Marc Roca', 'normal', 75, 'España', 'Pivote catalán de manual, ha jugado en Alemania e Inglaterra.', 'Orden y pase corto.'),
    P("N'Golo Kanté", 'good', 89, 'Francia', 'Cubre el 70% del planeta. Sonrisa eterna.', 'Campeón del mundo y de Champions sin perder la humildad.', "N'Golo Kanté footballer"),
    P('Marcos Senna', 'prime', 84, 'España', 'Brasileño de nacimiento, ancla de la Euro 2008.', 'El submarino amarillo hecho pulmón de la España campeona.'),
  ],
  MC: [
    P('Arthur Melo', 'troll', 65, 'Brasil', 'Prometía ser el nuevo Xavi... y acabó más famoso por la Play.', 'Del "nuevo Xavi" al "nuevo misterio".'),
    P('Xavi Hernández', 'legend', 95, 'España', 'Cerebro de Terrassa. Nunca perdía un pase.', 'El metrónomo del tiki-taka.'),
    P('Óliver Torres', 'normal', 76, 'España', 'Centrocampista talentoso que brilló en Oporto y Sevilla.', 'Toque fino, siempre a la sombra.'),
    P('İlkay Gündoğan', 'good', 87, 'Alemania', 'Alemán capitán de un triplete celeste.', 'Llegador, elegante y decisivo en las finales.', 'Ilkay Gündogan footballer'),
    P('Mikel Merino', 'prime', 82, 'España', 'Su cabezazo en el minuto 119 tumbó al anfitrión de una Eurocopa.', 'Stuttgart 2024: el gol que eliminó a Alemania.'),
  ],
  MCO: [
    P('Kerlon', 'troll', 57, 'Brasil', 'Inventó un regate de foca. Nadie sabe qué pasó después.', 'El regate de la foca. Y poco más.', 'Kerlon Brazilian footballer seal dribble'),
    P('Zinedine Zidane', 'legend', 97, 'Francia', 'Volea en Glasgow y dos cabezazos en una final mundialista.', 'Zizou. Arte en movimiento.'),
    P('Brais Méndez', 'normal', 77, 'España', 'Gallego de zurda fina, pasó por Vigo y San Sebastián.', 'Buen golpeo, buen chaval.'),
    P('Isco', 'good', 86, 'España', 'Malagueño de toque mágico con cinco Champions.', 'La magia de Arroyo de la Miel.', 'Isco Alarcón footballer'),
    P('Mario Götze', 'prime', 83, 'Alemania', 'Salió del banquillo y decidió una final mundialista en Brasil.', 'Maracaná 2014: control con el pecho y volea.'),
  ],
  EI: [
    P('Bebé', 'troll', 58, 'Portugal', 'Un gigante inglés lo fichó sin haberlo visto jugar.', 'Ferguson no lo había visto nunca. Se notó.', 'Bebé Portuguese footballer Manchester United'),
    P('Ronaldinho', 'legend', 96, 'Brasil', 'Sonrisa eterna. Hasta el Bernabéu le aplaudió.', 'El jogo bonito hecho persona.'),
    P('Iker Muniain', 'normal', 78, 'España', 'Fiel a los leones durante más de una década.', 'El eterno "niño" de Lezama.'),
    P('Sadio Mané', 'good', 87, 'Senegal', 'Africano campeón de Champions y de su continente.', 'Velocidad y gol en el Liverpool de Klopp.'),
    P('Divock Origi', 'prime', 81, 'Bélgica', 'Suplente eterno que marcó en una remontada histórica y en una final en Madrid.', 'Anfield 4-0 y el Metropolitano 2019. Leyenda de culto.'),
  ],
  ED: [
    P('Jesé Rodríguez', 'troll', 63, 'España', 'Canario que iba a comerse el mundo... y acabó cantando.', 'Iba a ser el nuevo Cristiano. Fue el nuevo Jey M.'),
    P('Lionel Messi', 'legend', 99, 'Argentina', 'Ocho Balones de Oro. ¿Hace falta más pista?', 'El mejor de todos los tiempos. Fin.'),
    P('Yeremy Pino', 'normal', 77, 'España', 'Extremo canario rápido que debutó con su selección siendo un crío.', 'Desborde y descaro.'),
    P('Mohamed Salah', 'good', 89, 'Egipto', 'El Faraón. Rey goleador en Anfield.', 'Una máquina de hacer goles desde la derecha.'),
    P('Ricardo Quaresma', 'prime', 82, 'Portugal', 'Rey de la trivela, campeón de Europa en 2016.', 'La trivela más famosa del mundo.'),
  ],
  DC: [
    P('Nicklas Bendtner', 'troll', 62, 'Dinamarca', 'Se autoproclamó uno de los mejores delanteros del mundo. Un Lord.', 'Lord Bendtner. Su confianza no tenía techo, su puntería sí.'),
    P('Ronaldo Nazário', 'legend', 98, 'Brasil', 'El Fenómeno. Dos Mundiales y dos Balones de Oro.', 'R9. El delantero más devastador que se ha visto.'),
    P('Borja Iglesias', 'normal', 77, 'España', 'El Panda. Gallego y goleador en el Betis.', 'Gol, uñas pintadas y buen rollo.'),
    P('Antoine Griezmann', 'good', 89, 'Francia', 'Francés que celebraba con bailes de videojuego. Campeón del mundo.', 'El Principito del Atleti.'),
    P('Éder', 'prime', 81, 'Portugal', 'Patito feo que marcó el gol de la final de la Euro 2016.', 'Saint-Denis 2016: el zapatazo que hizo campeón a Portugal.', 'Éder Portuguese footballer Euro 2016'),
  ],
};

// Rangos de precio de salida (en millones). Ojo: ¡los trolls salen caros para engañar!
// ---------- AMPLIACIÓN: 9 jugadores más por tipo y posición (10 por tipo = 50 por posición) ----------
// Formato: 'Nombre|media|país|frase al revelar|búsqueda wikipedia (opcional)'
const DEFAULT_BIO = {
  troll: 'Fichaje de los que dan para memes eternos.',
  legend: 'Leyenda absoluta de la historia del fútbol.',
  normal: 'Cumplidor. De los que no salen en los resúmenes.',
  good: 'Jugadorazo de élite mundial.',
  prime: 'Jugador normalito que tocó la gloria en su momento cumbre.',
};

const EXTRA = {
  POR: {
    troll: ['Kepa Arrizabalaga|66|España|El portero más caro de la historia... y se negó a ser cambiado en una final.', 'Massimo Taibi|56|Italia|Fergie lo fichó y le metieron un gol entre las piernas a cámara lenta.', 'Robert Green|60|Inglaterra|Mundial 2010: un disparo flojito de EE. UU. se le coló.', 'Scott Carson|61|Inglaterra|Su error ante Croacia dejó a Inglaterra sin Euro 2008.', 'Paul Robinson|62|Inglaterra|Fue a despejar y el balón botó en un bache. Gol.', 'Heurelho Gomes|63|Brasil|Capaz de parar lo imposible y comerse lo fácil.', 'René Higuita|64|Colombia|Inventó el escorpión... y regateó fuera del área en un Mundial.', 'Jorge Campos|65|México|Equipaciones fosforito y salía hasta el medio campo.', 'Antonio Adán|64|España|Seguridad bajo palos: no incluida.'],
    legend: ['Gianluigi Buffon|96|Italia|Gigi. Más de 25 años en la élite y campeón del mundo.', 'Manuel Neuer|94|Alemania|Inventó al portero-líbero. Campeón del mundo 2014.', 'Lev Yashin|96|Unión Soviética|La Araña Negra. Único portero con Balón de Oro.', 'Peter Schmeichel|93|Dinamarca|Estrella de mar gigante. Euro 92 y triplete del United.', 'Oliver Kahn|93|Alemania|El Titán. Balón de Oro del Mundial 2002 siendo portero.', 'Edwin van der Sar|92|Países Bajos|Elegancia neerlandesa. Dos Champions con dos clubes.', 'Petr Čech|92|República Checa|El casco más famoso del fútbol.', 'Dino Zoff|93|Italia|Campeón del mundo con 40 años.', 'Gordon Banks|93|Inglaterra|Autor de "la parada del siglo" a Pelé.'],
    normal: ['Rui Silva|76|Portugal', 'Fernando Pacheco|74|España', 'David Soria|76|España', 'Sergio Herrera|75|España', 'Diego López|78|España', 'Pau López|75|España', 'Joel Robles|72|España', 'Vicente Guaita|75|España', 'Rubén Blanco|74|España'],
    good: ['Jan Oblak|89|Eslovenia|Un muro esloveno con guantes.', 'Thibaut Courtois|90|Bélgica|Paró una final de Champions él solito.', 'Marc-André ter Stegen|88|Alemania|Pies de mediocentro y reflejos de gato.', 'Alisson Becker|89|Brasil|El portero que también marca goles de cabeza.', 'Ederson|87|Brasil|Saques en largo que son asistencias.', 'Hugo Lloris|86|Francia|Capitán de Francia campeona del mundo.', 'David de Gea|87|España|Paradas con el pie que desafían la lógica.', 'Mike Maignan|87|Francia|El heredero de Donnarumma en el Milan.', 'Yann Sommer|85|Suiza|Pequeño, ágil y fiable.'],
    prime: ['Unai Simón|82|España|Campeón de la Euro 2024 bajo palos.', 'Emiliano Martínez|85|Argentina|El Dibu: paradón en el 123 de la final de Qatar.', 'Rui Patrício|81|Portugal|Campeón de Europa 2016 contra todo pronóstico.', 'Víctor Valdés|84|España|Tres Champions con el Barça de Guardiola.', 'Antonios Nikopolidis|79|Grecia|Portero de la Grecia campeona de Europa 2004.', 'Cláudio Taffarel|81|Brasil|Mundial de 1994 ganado en los penaltis.', 'Marcos|80|Brasil|Portero de la Brasil campeona del mundo 2002.|Marcos Roberto Silveira Reis', 'Bodo Illgner|80|Alemania|Campeón del mundo en Italia 90.', 'Fabien Barthez|84|Francia|Blanc le besaba la calva. Mundial 98 y Euro 2000.'],
  },
  LD: {
    troll: ['Aleix Vidal|64|España|Fichó en verano y no pudo jugar hasta enero. Y luego tampoco.', 'Aaron Wan-Bissaka|67|Inglaterra|Defiende como un pulpo, ataca como un pulpo fuera del agua.', 'Mathieu Debuchy|62|Francia', 'Martín Montoya|63|España', 'Matteo Darmian|66|Italia', 'Emerson Royal|64|Brasil|Los memes de Tottenham le adoran.', 'Sergiño Dest|65|Estados Unidos', 'Glen Johnson|63|Inglaterra', 'Micah Richards|62|Inglaterra|Ahora ríe en la tele más de lo que defendía.'],
    legend: ['Philipp Lahm|94|Alemania|Capitán del Mundial 2014. Perfección táctica.', 'Dani Alves|93|Brasil|El jugador con más títulos de la historia.', 'Javier Zanetti|93|Argentina|Il Capitano del triplete del Inter.', 'Lilian Thuram|93|Francia|Dos goles en una semifinal del Mundial 98.', 'Gianluca Zambrotta|91|Italia|Campeón del mundo 2006.', 'Carlos Alberto Torres|94|Brasil|Capitán de Brasil 70 y autor de un gol mítico.', 'Gary Neville|91|Inglaterra|Lateral de toda la vida del United de Fergie.', 'Míchel Salgado|91|España|Lateral de los Galácticos.', 'Djalma Santos|92|Brasil|Bicampeón del mundo en 1958 y 1962.'],
    normal: ['Mario Gaspar|74|España', 'Iván Balliu|73|Albania', 'Óscar de Marcos|76|España', 'Hugo Mallo|75|España', 'Rubén Peña|74|España', 'Antonio Barragán|73|España', 'Aitor Ruibal|74|España', 'Jonny Otto|76|España', 'Sergi Roberto|77|España'],
    good: ['Kyle Walker|87|Inglaterra|Un velocista olímpico de lateral.', 'Trent Alexander-Arnold|88|Inglaterra|Centra como un mediocentro desde la banda.', 'Achraf Hakimi|88|Marruecos|Un cohete por la derecha.', 'João Cancelo|86|Portugal', 'Joshua Kimmich|88|Alemania', 'Reece James|85|Inglaterra', 'Kieran Trippier|84|Inglaterra', 'Jules Koundé|86|Francia', 'Juanfran Torres|84|España|Su penalti en Milán aún duele.'],
    prime: ['Álvaro Arbeloa|80|España|Campeón del mundo 2010 y rey de los memes.', 'Paulo Ferreira|79|Portugal|Campeón de Champions con Mourinho y con el Chelsea.', 'José Bosingwa|80|Portugal|Champions 2012 en Múnich.', 'Gonzalo Montiel|80|Argentina|Marcó el penalti que hizo campeona a Argentina en 2022.', 'Nahuel Molina|81|Argentina|Gol en cuartos y campeón del mundo 2022.', 'Cédric Soares|79|Portugal|Titular en la final de la Euro 2016.', 'Giourkas Seitaridis|79|Grecia|Lateral de la Grecia milagrosa de 2004.', 'Benedikt Höwedes|81|Alemania|Jugó todos los minutos del Mundial 2014.', 'Jesús Navas|82|España|Campeón del mundo 2010 y de Europa 2012 y 2024.'],
  },
  DFD: {
    troll: ['Shkodran Mustafi|62|Alemania|Errores tan icónicos que tienen recopilatorio propio.', 'Eliaquim Mangala|61|Francia|Más de 50 millones por... esto.', 'David Luiz|68|Brasil|El 7-1. Los rizos. La defensa en modo PlayStation.', 'Dejan Lovren|65|Croacia|Se autoproclamó uno de los mejores centrales del mundo.', 'Kurt Zouma|64|Francia', 'Chris Smalling|66|Inglaterra', 'Davinson Sánchez|65|Colombia', 'Samuel Umtiti|64|Francia', 'Yerry Mina|63|Colombia|Baila mejor de lo que defiende.'],
    legend: ['Franco Baresi|96|Italia|El líbero total del Milan de Sacchi.', 'Fabio Cannavaro|94|Italia|Balón de Oro 2006 siendo defensa.', 'Franz Beckenbauer|97|Alemania|Der Kaiser. Campeón como jugador y como seleccionador.', 'Bobby Moore|94|Inglaterra|Capitán de Inglaterra campeona en 1966.', 'Fernando Hierro|92|España|Central goleador y capitán blanco.', 'Alessandro Nesta|94|Italia|Defendía con esmoquin.', 'Rio Ferdinand|91|Inglaterra', 'John Terry|91|Inglaterra|Capitán, líder, leyenda... y resbalón en Moscú.', 'Daniel Passarella|92|Argentina|El Kaiser argentino. Campeón del mundo 78.'],
    normal: ['Diego Llorente|76|España', 'Jorge Meré|74|España', 'Unai Núñez|75|España', 'Óscar Mingueza|74|España', 'Aritz Elustondo|74|España', 'David García|76|España', 'Dani Vivian|77|España', 'Omar Alderete|74|Paraguay', 'Yeray Álvarez|76|España'],
    good: ['Marquinhos|87|Brasil', 'Antonio Rüdiger|87|Alemania', 'Éder Militão|86|Brasil', 'Ronald Araújo|86|Uruguay', 'Mats Hummels|87|Alemania', 'Matthijs de Ligt|85|Países Bajos', 'Kalidou Koulibaly|86|Senegal', 'Thiago Silva|88|Brasil', 'Diego Godín|87|Uruguay|Cabezazo que dio una Liga en el Camp Nou.'],
    prime: ['Raúl Albiol|80|España|Campeón del mundo 2010 y de Europa 2008 y 2012.', 'Traianos Dellas|79|Grecia|El Coloso. Gol de plata para Grecia en 2004.', 'Robin Le Normand|81|España|Titular de la España campeona de la Euro 2024.', 'Nicolás Otamendi|82|Argentina|Campeón del mundo 2022.', 'Cristian Romero|83|Argentina|El Cuti. Campeón del mundo 2022.', 'José Fonte|79|Portugal|Titular en la final de la Euro 2016.', 'Branislav Ivanović|82|Serbia|Champions 2012 con el Chelsea.', 'Per Mertesacker|81|Alemania|Campeón del mundo 2014.', 'Jérôme Boateng|84|Alemania|Campeón del mundo 2014 y dos tripletes.'],
  },
  DFI: {
    troll: ['Marcos Rojo|62|Argentina', 'Dante|63|Brasil|Estuvo en el 7-1. Ya está.|Dante Bonfim Costa footballer', 'Mamadou Sakho|64|Francia', 'Jérémy Mathieu|65|Francia', 'Thomas Vermaelen|66|Bélgica|Fichó por el Barça y lo vimos más en la enfermería.', 'Eric Bailly|63|Costa de Marfil', 'Clément Lenglet|65|Francia', 'Diego Carlos|65|Brasil', 'Steven Caulker|60|Sierra Leona'],
    legend: ['Sergio Ramos|94|España|Minuto 92:48 en Lisboa.', 'Gerard Piqué|91|España|Mundial, Euro y tres Champions.', 'Giorgio Chiellini|91|Italia|Campeón de Europa 2020 agarrando a Saka del cuello.', 'Ronald Koeman|91|Países Bajos|Gol en Wembley 1992.', 'Gaetano Scirea|93|Italia|El caballero del fútbol. Campeón del mundo 82.', 'Marcel Desailly|92|Francia|La Roca. Mundial 98 y Euro 2000.', 'Elías Figueroa|92|Chile|El mejor defensa de la historia de Sudamérica para muchos.', 'Laurent Blanc|91|Francia|Gol de oro en el Mundial 98.', 'Nemanja Vidić|91|Serbia'],
    normal: ['Alejandro Catena|75|España', 'Jorge Cuenca|73|España', 'Germán Pezzella|76|Argentina', 'Unai Bustinza|73|España', 'Sergi Gómez|73|España', 'Iván Marcano|74|España', 'Domingos Duarte|73|Portugal', 'Jon Pacheco|74|España', 'Gabriel Paulista|76|Brasil'],
    good: ['Raphaël Varane|87|Francia', 'Aymeric Laporte|86|España', 'Alessandro Bastoni|87|Italia', 'Joško Gvardiol|87|Croacia', 'William Saliba|88|Francia', 'Milan Škriniar|85|Eslovaquia', 'Leonardo Bonucci|86|Italia', 'Gabriel Magalhães|86|Brasil', 'David Alaba|87|Austria'],
    prime: ['Andrea Barzagli|81|Italia|Campeón del mundo 2006.', 'Michalis Kapsis|78|Grecia|Central de la Grecia campeona de 2004.', 'Lisandro Martínez|82|Argentina|El Carnicero. Campeón del mundo 2022.', 'Joël Matip|81|Camerún|Champions 2019 con el Liverpool.', 'Nacho Fernández|82|España|Seis Champions y la Euro 2024.', 'Presnel Kimpembe|80|Francia|Campeón del mundo 2018.', 'Ricardo Carvalho|83|Portugal|Champions con el Oporto de Mourinho.', 'Rafael Márquez|83|México|Champions 2006 con el Barça.', 'Edmílson|80|Brasil|Campeón del mundo 2002.|Edmílson José Gomes de Moraes'],
  },
  LI: {
    troll: ['Alberto Moreno|62|España', 'Fábio Coentrão|64|Portugal|30 millones en el banquillo.', 'Sead Kolašinac|63|Bosnia y Herzegovina', 'Ashley Young|65|Inglaterra', 'Emerson Palmieri|64|Italia', 'Layvin Kurzawa|62|Francia', 'José Enrique|63|España', 'Marcos Alonso|66|España', 'Tyrell Malacia|62|Países Bajos'],
    legend: ['Marcelo|93|Brasil|Cinco Champions y la mejor cola de vaca en un lateral.|Marcelo Vieira footballer', 'Ashley Cole|91|Inglaterra|El lateral que paraba a Cristiano.', 'Nílton Santos|92|Brasil|La Enciclopedia del fútbol.', 'Giacinto Facchetti|93|Italia|Inventó al lateral goleador.', 'Bixente Lizarazu|91|Francia|Mundial 98, Euro 2000 y Champions.', 'Andreas Brehme|92|Alemania|Penalti decisivo en la final de Italia 90.', 'Paul Breitner|92|Alemania', 'Ruud Krol|91|Países Bajos', 'José Antonio Camacho|90|España'],
    normal: ['Sergio Escudero|74|España', 'Javi Galán|75|España', 'Yuri Berchiche|76|España', 'Juan Miranda|75|España', 'Álex Moreno|76|España', 'Jaume Costa|74|España', 'Carlos Clerc|72|España', 'Fran García|76|España', 'Miguel Gutiérrez|77|España'],
    good: ['Andrew Robertson|87|Escocia', 'Theo Hernández|87|Francia', 'Alphonso Davies|86|Canadá', 'Filipe Luís|85|Brasil', 'Patrice Evra|85|Francia|"I love this game".', 'Alex Sandro|84|Brasil', 'Nuno Mendes|86|Portugal', 'Luke Shaw|84|Inglaterra', 'Federico Dimarco|85|Italia'],
    prime: ['Fabio Grosso|81|Italia|Gol en semis y penalti decisivo en la final de 2006.', 'Raphaël Guerreiro|81|Portugal|Campeón de Europa 2016.', 'Lucas Hernández|83|Francia|Campeón del mundo 2018.', 'Marc Cucurella|82|España|Asistencia en la final de la Euro 2024.', 'Takis Fyssas|78|Grecia|Lateral de la Grecia campeona 2004.', 'Marcos Acuña|80|Argentina|Campeón del mundo 2022.', 'Nicolás Tagliafico|80|Argentina|Campeón del mundo 2022.', 'Sylvinho|79|Brasil|Champions 2006 con el Barça.', 'Ferland Mendy|82|Francia|Dos Champions con el Madrid.'],
  },
  MCD: {
    troll: ['Fred|66|Brasil|Fred y McTominay: los "McFred".|Fred Brazilian footballer Manchester United', 'Geoffrey Kondogbia|65|República Centroafricana', 'Tiémoué Bakayoko|62|Francia', 'Danny Drinkwater|60|Inglaterra|35 millones de libras y casi no jugó.', 'Joey Barton|63|Inglaterra|Más famoso por sus polémicas que por sus pases.', 'Morgan Schneiderlin|63|Francia', 'Gary Medel|67|Chile|El Pitbull. Nadie quiere cruzarse con él.', 'Victor Wanyama|64|Kenia', 'Marouane Fellaini|66|Bélgica|El pelo como arma táctica.'],
    legend: ['Claude Makélélé|93|Francia|Tiene una posición con su nombre.', 'Patrick Vieira|93|Francia|Capitán de los Invencibles.', 'Lothar Matthäus|95|Alemania|Capitán campeón del mundo 1990 y Balón de Oro.', 'Frank Rijkaard|93|Países Bajos', 'Roy Keane|92|Irlanda|Capitán con mala leche del United.', 'Dunga|91|Brasil|Capitán de Brasil campeona en 1994.', 'Fernando Redondo|93|Argentina|El taconazo de Old Trafford.', 'Edgar Davids|91|Países Bajos|El Pitbull de las gafas.', 'Didier Deschamps|91|Francia|Capitán campeón del mundo y seleccionador campeón.'],
    normal: ['Dani García|75|España', 'Mikel Vesga|74|España', 'Javi Fuego|73|España', 'Óscar Valentín|75|España', 'Nemanja Maksimović|75|Serbia', 'Guido Rodríguez|77|Argentina', 'Nemanja Gudelj|76|Serbia', 'Javi García|75|España', 'Iddrisu Baba|73|Ghana'],
    good: ['Casemiro|88|Brasil', 'Rodri|91|España|Balón de Oro 2024.|Rodri Spanish footballer Manchester City', 'Declan Rice|87|Inglaterra', 'Fabinho|86|Brasil', 'Javier Mascherano|87|Argentina|El Jefecito.', 'Xabi Alonso|89|España|Pases de 60 metros al pie.', 'Martín Zubimendi|86|España', 'Aurélien Tchouaméni|86|Francia', 'Marco Verratti|87|Italia'],
    prime: ['Jorginho|83|Italia|Euro 2020 y Champions el mismo año.', 'Gennaro Gattuso|84|Italia|Campeón del mundo 2006 a base de mordiscos.', 'Angelos Basinas|79|Grecia|Medio de la Grecia campeona 2004.', 'Javi Martínez|83|España|Mundial 2010 y Champions 2013.', 'Sami Khedira|84|Alemania|Campeón del mundo 2014.', 'Gilberto Silva|82|Brasil|Campeón del mundo 2002.', 'Mauro Silva|81|Brasil|Campeón del mundo 1994.', 'William Carvalho|80|Portugal|Campeón de Europa 2016.', 'Enzo Fernández|83|Argentina|Mejor joven del Mundial 2022.'],
  },
  MC: {
    troll: ['Denis Suárez|64|España', 'Ross Barkley|65|Inglaterra', 'Tom Cleverley|62|Inglaterra', 'Anderson|61|Brasil|Fichado como estrella... y acabó siendo más conocido por su peso.|Anderson Luís de Abreu Oliveira', 'André Gomes|65|Portugal', 'Kléberson|61|Brasil', 'Arda Turan|66|Turquía', 'Kevin-Prince Boateng|64|Ghana|Fichó por el Barça. Sí, el Barça.', 'Jack Rodwell|60|Inglaterra'],
    legend: ['Andrés Iniesta|96|España|Minuto 116 en Johannesburgo.', 'Luka Modrić|94|Croacia|Balón de Oro 2018 y seis Champions.', 'Toni Kroos|93|Alemania|Nunca falló un pase. Literal.', 'Andrea Pirlo|94|Italia|Il Maestro. Penalti a lo Panenka en la Euro.', 'Steven Gerrard|93|Inglaterra|Estambul 2005.', 'Frank Lampard|92|Inglaterra|Centrocampista con más de 200 goles.', 'Paul Scholes|92|Inglaterra|Xavi decía que era el mejor.', 'Bobby Charlton|95|Inglaterra|Campeón del mundo 1966 y Balón de Oro.', 'Johan Neeskens|91|Países Bajos'],
    normal: ['Carles Aleñá|74|España', 'Manu Trigueros|77|España', 'Sergi Darder|77|España', 'Rubén Pardo|73|España', 'Óscar Trejo|76|Argentina', 'Unai López|75|España', 'Asier Illarramendi|76|España', 'Vicente Iborra|75|España', 'Mikel Rico|73|España'],
    good: ['Frenkie de Jong|87|Países Bajos', 'Pedri|88|España|Golden Boy y heredero de Iniesta.|Pedri footballer', 'Federico Valverde|88|Uruguay', 'Dani Parejo|85|España', 'Koke|85|España|Capitán del Atlético.|Koke footballer', 'Ivan Rakitić|86|Croacia', 'Thiago Alcântara|87|España', 'Nicolò Barella|87|Italia', 'Saúl Ñíguez|84|España'],
    prime: ['Fabián Ruiz|82|España|Campeón de Europa 2024 y gol ante Croacia.', 'Rodrigo De Paul|82|Argentina|El guardaespaldas de Messi en Qatar.', 'Alexis Mac Allister|84|Argentina|Gol en Qatar y campeón del mundo.', 'Blaise Matuidi|82|Francia|Campeón del mundo 2018.', 'Theodoros Zagorakis|80|Grecia|Mejor jugador de la Euro 2004.', 'João Moutinho|81|Portugal|Campeón de Europa 2016.', 'Simone Perrotta|79|Italia|Campeón del mundo 2006.', 'Christoph Kramer|76|Alemania|Jugó la final del Mundial 2014 y no recuerda nada.', 'Adrien Silva|78|Portugal|Campeón de Europa 2016.'],
  },
  MCO: {
    troll: ['Philippe Coutinho|68|Brasil|160 millones... y marcó al Barça con el Bayern.', 'Freddy Adu|56|Estados Unidos|Iba a ser el nuevo Pelé con 14 años.', 'Ravel Morrison|58|Jamaica|Fergie lo veía mejor que Pogba.', 'Alen Halilović|60|Croacia|"El nuevo Modrić". Spoiler: no.', 'Marko Marin|62|Alemania', 'Andreas Pereira|64|Brasil', 'Bojan Krkić|65|España|"El nuevo Messi".', 'Giovani dos Santos|63|México', 'Hachim Mastour|55|Marruecos|Un crack de los toques en YouTube.'],
    legend: ['Diego Maradona|99|Argentina|La Mano de Dios y el Gol del Siglo.', 'Pelé|99|Brasil|Tres Mundiales. O Rei.|Pelé', 'Johan Cruyff|98|Países Bajos|Inventó el fútbol moderno. Y un giro.', 'Michel Platini|95|Francia|Tres Balones de Oro seguidos.', 'Kaká|94|Brasil|Último Balón de Oro antes de la era Messi-Cristiano.|Kaká footballer', 'Zico|94|Brasil|El Pelé blanco.|Zico footballer', 'Juan Román Riquelme|92|Argentina|El último 10 clásico.', 'Francesco Totti|93|Italia|Il Capitano de la Roma para siempre.', 'Roberto Baggio|94|Italia|Il Divin Codino.'],
    normal: ['Óscar Rodríguez|74|España', 'Pablo Fornals|77|España', 'Jonathan Viera|76|España', 'Rubén García|76|España', 'Borja Valero|78|España', 'Ager Aketxe|73|España', 'Joan Jordán|75|España', 'Takashi Inui|75|Japón', 'Antonio Puertas|74|España'],
    good: ['Kevin De Bruyne|91|Bélgica', 'Bruno Fernandes|87|Portugal', 'Martin Ødegaard|88|Noruega', 'Jamal Musiala|88|Alemania', 'Jude Bellingham|90|Inglaterra', 'Mesut Özil|87|Alemania|El rey de las asistencias.', 'David Silva|88|España|El Mago.', 'Thomas Müller|87|Alemania|Raumdeuter: el intérprete de espacios.', 'Christian Eriksen|86|Dinamarca'],
    prime: ['Dani Olmo|83|España|Campeón de Europa 2024 y salvó un gol en la línea.', 'Juan Mata|82|España|Champions 2012 y Mundial 2010.', 'Cesc Fàbregas|85|España|Asistió a Iniesta en Johannesburgo.', 'Renato Sanches|80|Portugal|Mejor joven de la Euro 2016.', 'Vassilis Tsiartas|78|Grecia|Medio de la Grecia campeona 2004.', 'Rui Costa|85|Portugal|Champions 2003 con el Milan.', 'Paulo Dybala|85|Argentina|Penalti en la final del Mundial 2022.', 'Mehmet Scholl|80|Alemania|Champions 2001 con el Bayern.', 'Lars Ricken|78|Alemania|Salió y marcó de vaselina en la final de 1997 con su primer toque.'],
  },
  EI: {
    troll: ['Denílson|62|Brasil|El fichaje más caro del mundo en 1998... para el Betis.|Denílson de Oliveira Araújo', 'Adnan Januzaj|64|Bélgica', 'Gerard Deulofeu|66|España', 'Ibrahim Afellay|63|Países Bajos', 'Royston Drenthe|61|Países Bajos', 'Gabriel Obertan|56|Francia', 'Malcom|63|Brasil|Fichado por el Barça en 2018 al robárselo a la Roma. Pfff.|Malcom Brazilian footballer', 'Cristian Tello|64|España', 'Jesse Lingard|65|Inglaterra|Más famoso por sus bailes que por sus goles.'],
    legend: ['Cristiano Ronaldo|98|Portugal|Cinco Balones de Oro. SIUUU.', 'Thierry Henry|95|Francia|Va va voom.', 'Neymar|93|Brasil|Regates, piscinazos y magia.', 'Rivaldo|94|Brasil|Chilena contra el Valencia para ir a Champions.', 'Ryan Giggs|92|Gales|El gol de la camiseta al aire en 1999.', 'Pavel Nedvěd|93|República Checa|Furia Ceca. Balón de Oro 2003.', 'Francisco Gento|93|España|Seis Copas de Europa.', 'Hristo Stoichkov|93|Bulgaria|Mala leche y gol a partes iguales.', 'George Best|95|Irlanda del Norte|Maradona good, Pelé better, George Best.'],
    normal: ['Nolito|77|España', 'Rubén Rochina|74|España', 'Álex Berenguer|76|España', 'Jony Rodríguez|73|España', 'Kike Barja|74|España', 'Pablo Sarabia|78|España', 'Abde Ezzalzouli|77|Marruecos', 'Álvaro García|76|España', 'Bryan Gil|74|España'],
    good: ['Vinícius Júnior|90|Brasil', 'Kylian Mbappé|91|Francia', 'Eden Hazard|88|Bélgica', 'Franck Ribéry|88|Francia', 'Raheem Sterling|86|Inglaterra', 'Son Heung-min|88|Corea del Sur', 'Rafael Leão|86|Portugal', 'Khvicha Kvaratskhelia|86|Georgia', 'Marcus Rashford|84|Inglaterra'],
    prime: ['Nico Williams|83|España|Gol en la final de la Euro 2024.', 'Mikel Oyarzabal|82|España|Gol que dio la Euro 2024 a España.', 'Ángel Di María|86|Argentina|Gol en la final de la Copa América, la Finalissima y el Mundial.', 'Pedro Rodríguez|83|España|Mundial, Euro y tres Champions.|Pedro Rodríguez Ledesma', 'Nani|81|Portugal|Campeón de Europa 2016.|Nani footballer', 'Luis García|80|España|El gol fantasma de 2005 y campeón en Estambul.', 'Vladimír Šmicer|79|República Checa|Gol en la remontada de Estambul 2005.', 'André Schürrle|81|Alemania|Asistencia a Götze en la final de 2014.', 'Kingsley Coman|83|Francia|Gol de la final de Champions 2020 contra su ex.'],
  },
  ED: {
    troll: ['Adama Traoré|66|España|Brazos aceitados para que no le agarren. Centros... otro día.', 'Antony|64|Brasil|El giro de 360º sin sentido.|Antony Brazilian footballer', 'Nicolas Pépé|63|Costa de Marfil|Récord del Arsenal para esto.', 'Daniel James|63|Gales', 'Ryan Babel|62|Países Bajos', 'Shaun Wright-Phillips|62|Inglaterra', 'Jadon Sancho|65|Inglaterra', 'Theo Walcott|64|Inglaterra|Fue al Mundial 2006 sin debutar en la Premier.', 'Andriy Yarmolenko|64|Ucrania'],
    legend: ['Luís Figo|94|Portugal|Le tiraron una cabeza de cochinillo.', 'Garrincha|95|Brasil|La alegría del pueblo.', 'Arjen Robben|92|Países Bajos|Todos saben lo que va a hacer. Nadie lo para.', 'David Beckham|91|Inglaterra|Centros con escuadra y cartabón.', 'Stanley Matthews|93|Inglaterra|Primer Balón de Oro de la historia.', 'Jairzinho|92|Brasil|Marcó en todos los partidos del Mundial 70.', 'Michael Laudrup|93|Dinamarca|El único que veía los pases que veía Laudrup.', 'Raymond Kopa|92|Francia', 'Bruno Conti|90|Italia|Campeón del mundo 1982.'],
    normal: ['José Callejón|78|España', 'Samu Castillejo|75|España', 'Ander Barrenetxea|77|España', 'Isi Palazón|76|España', 'Rodrigo Riquelme|74|España', 'Iñaki Williams|78|Ghana', 'Portu|74|España||Portu Spanish footballer', 'Óscar Plano|73|España', 'Brahim Díaz|79|Marruecos'],
    good: ['Bukayo Saka|88|Inglaterra', 'Ousmane Dembélé|89|Francia|Balón de Oro 2025.', 'Riyad Mahrez|86|Argelia', 'Bernardo Silva|88|Portugal', 'Lamine Yamal|90|España|Campeón de Europa con 17 años.', 'Raphinha|87|Brasil', 'Rodrygo|86|Brasil', 'Leroy Sané|85|Alemania', 'Hakim Ziyech|84|Marruecos'],
    prime: ['Mauro Camoranesi|81|Italia|Campeón del mundo 2006.', 'Ji-sung Park|80|Corea del Sur|Champions 2008 y pulmón infinito.', 'Marc Overmars|83|Países Bajos|Champions 1995 con el Ajax.', 'Ludovic Giuly|81|Francia|Champions 2006 con el Barça.', 'Stelios Giannakopoulos|78|Grecia|Extremo de la Grecia campeona 2004.', 'Steve McManaman|82|Inglaterra|Volea en la final de la Novena.', 'Lucas Vázquez|79|España|Normalito con cinco Champions.', 'Julian Draxler|80|Alemania|Campeón del mundo 2014.', 'Dirk Kuyt|79|Países Bajos|Trabajador incansable, finalista del Mundial y campeón de Liga.'],
  },
  DC: {
    troll: ['Emile Heskey|64|Inglaterra|Delantero centro con el gol como opcional.', 'Andy Carroll|63|Inglaterra|35 millones de libras.', 'Mario Balotelli|66|Italia|Why always me?', 'Álvaro Morata|68|España|Experto en fueras de juego milimétricos.', 'Peter Crouch|65|Inglaterra|El baile del robot.', 'Ali Dia|40|Senegal|Se hizo pasar por primo de Weah para jugar en la Premier.', 'Carlos Kaiser|35|Brasil|Futbolista profesional 20 años... casi sin jugar un partido.|Carlos Kaiser footballer', 'Afonso Alves|58|Brasil', 'Federico Macheda|58|Italia'],
    legend: ['Ferenc Puskás|96|Hungría|Tiene un premio con su nombre.', 'Gerd Müller|96|Alemania|Der Bomber.', 'Marco van Basten|96|Países Bajos|Volea imposible en la final de la Euro 88.', 'Alfredo Di Stéfano|98|Argentina|La Saeta Rubia. Cinco Copas de Europa.', 'Eusébio|95|Portugal|La Pantera Negra.', 'Romário|94|Brasil|Campeón del mundo 1994.|Romário footballer', 'Raúl González|93|España|El 7 del Madrid. Beso al anillo.', 'Gabriel Batistuta|93|Argentina|Batigol.', 'Hugo Sánchez|93|México|Goles de chilena y voltereta.'],
    normal: ['Rubén Castro|77|España', 'Jorge Molina|75|España', 'Kike García|74|España', 'Raúl de Tomás|76|España', 'Lucas Pérez|75|España', 'Chimy Ávila|75|Argentina', 'Sergi Guardiola|73|España', 'Cristhian Stuani|77|Uruguay', 'Enes Ünal|76|Turquía'],
    good: ['Karim Benzema|91|Francia|Balón de Oro 2022.', 'Robert Lewandowski|91|Polonia', 'Luis Suárez|90|Uruguay', 'Harry Kane|90|Inglaterra', 'Erling Haaland|91|Noruega', 'Sergio Agüero|89|Argentina|AGÜEROOOOO.', 'Zlatan Ibrahimović|89|Suecia', 'Edinson Cavani|87|Uruguay', 'Lautaro Martínez|87|Argentina'],
    prime: ['Fernando Torres|84|España|Gol de la final de la Euro 2008.', 'Angelos Charisteas|78|Grecia|Gol de la final de la Euro 2004.', 'Olivier Giroud|83|Francia|Campeón del mundo 2018 con cero goles.', 'Julián Álvarez|84|Argentina|Cuatro goles en el Mundial 2022.', 'Fernando Llorente|80|España|Mundial 2010 y Euro 2012.', 'Luca Toni|81|Italia|Campeón del mundo 2006.', 'Ole Gunnar Solskjær|80|Noruega|Gol en el descuento de la final de 1999.', 'Joselu|79|España|Doblete en dos minutos ante el Bayern y Euro 2024.|Joselu Spanish footballer', 'Miroslav Klose|85|Alemania|Máximo goleador de la historia de los Mundiales.'],
  },
};

for (const [pos, tiers] of Object.entries(EXTRA)) {
  for (const [tier, list] of Object.entries(tiers)) {
    for (const line of list) {
      const [name, ovr, nat, bio, q] = line.split('|');
      PLAYERS[pos].push(P(name, tier, Number(ovr), nat, '', bio || DEFAULT_BIO[tier], q));
    }
  }
}

// ---------- Característica principal (la única pista que se ve al pujar, junto a la nacionalidad) ----------
const ATTR_NAMES = { R: 'RITMO', T: 'TIRO', P: 'PASE', G: 'REGATE', D: 'DEFENSA', F: 'FÍSICO' };
const ATTR_BY_POS = { POR: 'D', LD: 'R', LI: 'R', DFD: 'D', DFI: 'D', MCD: 'D', MC: 'P', MCO: 'P', EI: 'G', ED: 'G', DC: 'T' };
const ATTR = {
  R: ['Jesús Navas', 'Kaká', 'Jairzinho', 'Francisco Gento', 'Cafu', 'Kylian Mbappé', 'Raheem Sterling', 'Rafael Leão', 'Marcus Rashford', 'Sadio Mané', 'Raphinha', 'Leroy Sané', 'Éder Militão', 'Raphaël Varane', 'Patrice Evra', 'Fabio Grosso', 'Nico Williams', 'Pedro Rodríguez', 'André Schürrle', 'Kingsley Coman', 'Marc Overmars', 'Ludovic Giuly', 'Lucas Vázquez', 'Fernando Torres', 'Bebé', 'Royston Drenthe', 'Gabriel Obertan', 'Cristian Tello', 'Jesé Rodríguez', 'Adama Traoré', 'Daniel James', 'Ryan Babel', 'Shaun Wright-Phillips', 'Theo Walcott', 'Ali Dia', 'Iñaki Williams', 'Thierry Henry', 'Óscar de Marcos'],
  T: ['Cristiano Ronaldo', 'Pelé', 'Zico', 'Hristo Stoichkov', 'Pavel Nedvěd', 'Rivaldo', 'Roberto Carlos', 'Ronald Koeman', 'Steven Gerrard', 'Frank Lampard', 'Bobby Charlton', 'Thomas Müller', 'Son Heung-min', 'Mohamed Salah', 'Marcos Senna', 'Vassilis Tsiartas', 'Paulo Dybala', 'Lars Ricken', 'Divock Origi', 'Mikel Oyarzabal', 'Luis García', 'Vladimír Šmicer', 'Ole Gunnar Solskjær', 'Miroslav Klose', 'David Luiz', 'Ross Barkley', 'Kevin-Prince Boateng', 'Philippe Coutinho', 'Andriy Yarmolenko', 'Nicklas Bendtner', 'Mario Balotelli', 'Álvaro Morata', 'Afonso Alves', 'Federico Macheda', 'Rubén Castro', 'Jorge Molina'],
  P: ['Manuel Neuer', 'Marc-André ter Stegen', 'Ederson', 'Alisson Becker', 'Víctor Valdés', 'Kepa Arrizabalaga', 'Dani Alves', 'Trent Alexander-Arnold', 'Joshua Kimmich', 'Kieran Trippier', 'Franz Beckenbauer', 'Mats Hummels', 'Aymeric Laporte', 'Alessandro Bastoni', 'Leonardo Bonucci', 'David Alaba', 'Federico Dimarco', 'Raphaël Guerreiro', 'Rafael Márquez', 'Sergio Busquets', 'Fernando Redondo', 'Rodri', 'Xabi Alonso', 'Martín Zubimendi', 'Marco Verratti', 'Jorginho', 'Enzo Fernández', 'Alex Song', 'Danny Drinkwater', 'Theodoros Zagorakis', 'Michel Platini', 'Juan Román Riquelme', 'Francesco Totti', 'David Beckham', 'Michael Laudrup', 'Hakim Ziyech', 'Andreas Pereira', 'Sergi Roberto'],
  G: ['Lionel Messi', 'Ronaldinho', 'Neymar', 'Diego Maradona', 'Johan Cruyff', 'Zinedine Zidane', 'Roberto Baggio', 'Ronaldo Nazário', 'Garrincha', 'Luís Figo', 'Arjen Robben', 'Stanley Matthews', 'Raymond Kopa', 'Bruno Conti', 'George Best', 'Ryan Giggs', 'Andrés Iniesta', 'Isco', 'Jamal Musiala', 'João Cancelo', 'Thiago Alcântara', 'Mario Götze', 'Dani Olmo', 'Ángel Di María', 'Nani', 'Ricardo Quaresma', 'Mauro Camoranesi', 'Stelios Giannakopoulos', 'Steve McManaman', 'Julian Draxler', 'René Higuita', 'Jorge Campos', 'Denis Suárez', 'Arda Turan', 'Kerlon', 'Freddy Adu', 'Ravel Morrison', 'Alen Halilović', 'Marko Marin', 'Bojan Krkić', 'Giovani dos Santos', 'Hachim Mastour', 'Antony', 'Nicolas Pépé', 'Jadon Sancho', 'Óscar Trejo', 'Brahim Díaz'],
  D: ['Philipp Lahm', 'Aaron Wan-Bissaka', 'Jules Koundé', 'Juanfran Torres', 'Dani Carvajal', 'Álvaro Arbeloa', 'Gonzalo Montiel', 'Benjamin Pavard', 'Filipe Luís', 'Lucas Hernández', 'Joan Capdevila', 'Morgan Schneiderlin'],
  F: ['Peter Schmeichel', 'Thibaut Courtois', 'Oliver Kahn', 'Javier Zanetti', 'Reece James', 'Phil Jones', 'Kurt Zouma', 'Chris Smalling', 'Yerry Mina', 'Harry Maguire', 'Mamadou Sakho', 'Eric Bailly', 'Antonio Rüdiger', 'Ronald Araújo', 'Matthijs de Ligt', 'Kalidou Koulibaly', 'Virgil van Dijk', 'Giorgio Chiellini', 'Marcel Desailly', 'Nemanja Vidić', 'Marco Materazzi', 'Marc Cucurella', "N'Golo Kanté", 'Aurélien Tchouaméni', 'Patrick Vieira', 'Lothar Matthäus', 'Frank Rijkaard', 'Roy Keane', 'Edgar Davids', 'Johan Neeskens', 'Gennaro Gattuso', 'Javi Martínez', 'Sami Khedira', 'Fred', 'Tiémoué Bakayoko', 'Joey Barton', 'Gary Medel', 'Victor Wanyama', 'Marouane Fellaini', 'Geoffrey Kondogbia', 'Anderson', 'Jack Rodwell', 'Federico Valverde', 'Nicolò Barella', 'Saúl Ñíguez', 'Mikel Merino', 'Rodrigo De Paul', 'Blaise Matuidi', 'Simone Perrotta', 'Christoph Kramer', 'Jude Bellingham', 'Renato Sanches', 'Ji-sung Park', 'Dirk Kuyt', 'Erling Haaland', 'Zlatan Ibrahimović', 'Éder', 'Angelos Charisteas', 'Olivier Giroud', 'Fernando Llorente', 'Luca Toni', 'Joselu', 'Emile Heskey', 'Andy Carroll', 'Peter Crouch', 'Carlos Kaiser', 'Cristhian Stuani', 'Borja Iglesias', 'Chimy Ávila', 'Kike García'],
};
const ATTR_OF = {};
for (const [k, names] of Object.entries(ATTR)) for (const n of names) ATTR_OF[n] = k;
for (const pos of Object.keys(PLAYERS)) for (const p of PLAYERS[pos]) p.attr = ATTR_NAMES[ATTR_OF[p.name] || ATTR_BY_POS[pos]];

const PRICE_RANGES = {
  troll: [35, 170],
  normal: [15, 95],
  prime: [25, 130],
  good: [55, 175],
  legend: [45, 230],
};

const DATA = { POSITIONS, PLAYERS, PRICE_RANGES, ATTR };
if (typeof module !== 'undefined' && module.exports) module.exports = DATA;
else root.SF_DATA = DATA;
})(typeof window !== 'undefined' ? window : globalThis);
