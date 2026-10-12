/* ============ changelog.js — novedades del juego ============
 * Lo que ve la gente en el botón "Novedades" de la barra de arriba: cambios
 * de juego y fallos arreglados (nada de servidores ni bases de datos).
 * La más nueva, arriba. Cada línea en español y en inglés.
 */
G.CHANGELOG = [
  { d: '2026-10-12', items: [
    ['Arreglado: en las partidas de más de 84 minutos la pantalla se quedaba en negro, el juego se paraba o empezabas a subir de nivel sin fin. Ya puedes jugar todo lo que aguantes.',
     'Fixed: in runs longer than 84 minutes the screen went black, the game froze or you kept levelling up forever. Now you can play for as long as you survive.'],
    ['Si el juego fallara, la partida se cierra sola y se guarda (tiempo, derrotados, récords y ranking) en vez de perderse.',
     'If the game ever crashes, the run ends by itself and is saved (time, defeated, records and leaderboard) instead of being lost.'],
    ['Las partidas muy largas ya cuentan para el ranking (a veces se tomaban por trampas sin serlo).',
     'Very long runs now count for the leaderboard (they were sometimes wrongly flagged as cheating).'],
    ['Grietas con menos azar: cada vez que no sale una, la siguiente es más probable (como mucho 2,5 minutos sin grieta), y los legendarios que aún no has vencido salen más a menudo.',
     'Less random rifts: every time one does not show up, the next one is more likely (at most 2.5 minutes without a rift), and legendaries you have not beaten yet show up more often.'],
    ['Los curanderos curan más cuanto más fuerte pegas, pero cada vez menos y con un tope.',
     'Healers heal more the harder you hit, but with diminishing returns and a cap.'],
    ['Cooperativo: si el anfitrión cambia de pestaña o se le para el juego, la partida se pausa para todos (antes los enemigos se quedaban quietos).',
     'Co-op: if the host switches tabs or their game stalls, the run pauses for everyone (enemies used to just stand still).'],
    ['iPhone: mantener el dedo en el joystick ya no saca "Copiar / Seleccionar todo", y la opción de pantalla completa explica cómo tenerla (Añadir a pantalla de inicio).',
     'iPhone: holding your finger on the joystick no longer brings up "Copy / Select all", and the fullscreen option explains how to get it (Add to Home Screen).'],
    ['Elige la versión normal o shiny de tu compañero desde el menú principal, debajo de él.',
     'Pick the normal or shiny version of your partner right from the main menu, under it.'],
    ['Las runs de menos de 1 minuto ya no cuentan para el ranking.',
     'Runs shorter than 1 minute no longer count for the leaderboard.'],
    ['Nuevo botón de Novedades con todos los cambios del juego.',
     'New "What\'s new" button with every change to the game.'],
    ['Ataques cuerpo a cuerpo más fuertes: mientras llevas uno activo recibes un 25 % menos de daño, llegan un 25 % más lejos y hacen un 20 % más de daño.',
     'Stronger melee attacks: while one is active you take 25% less damage, and they reach 25% further and deal 20% more damage.'],
    ['Cooperativo: mientras alguien elige una fusión, la partida se para para todos.',
     'Co-op: while someone is choosing a fusion, the run pauses for everyone.']
  ] },
  { d: '2026-10-11', items: [
    ['Vínculos: al vencer a un legendario fusionas movimientos que se lanzan a la vez desde un solo hueco (hasta 4). Además, más grietas.',
     'Bonds: defeating a legendary lets you fuse moves that fire at the same time from a single slot (up to 4). Also, more rifts.'],
    ['Botón para cambiar las cartas de subir de nivel, y los movimientos psíquicos, más flojos.',
     'A button to reroll the level-up cards, and weaker psychic moves.'],
    ['Las mejoras de las cartas de nivel (velocidad, recarga, experiencia, imán, coraza y potencia) tienen un tope de veces.',
     'Level-up card upgrades (speed, cooldown, experience, magnet, armor and power) can only be taken a limited number of times.'],
    ['Arreglado: pantalla negra en partidas de más de una hora por llenarse la memoria de imágenes.',
     'Fixed: black screen in runs longer than an hour because image memory filled up.'],
    ['Arreglado: los tickets se guardan en cuanto los coges (antes se perdían si se cerraba la pestaña) y las mejoras compradas ya no se pierden.',
     'Fixed: tickets are saved as soon as you pick them up (they were lost if the tab closed) and bought upgrades are no longer lost.'],
    ['En el móvil, la ficha del Pokémon sale al lado; curanderos más flojos, y el juego ya no se congela si algo falla.',
     'On mobile, the Pokémon details show alongside; weaker healers, and the game no longer freezes if something goes wrong.'],
    ['Entrar es más rápido y el gacha ×10 se puede cerrar en el móvil.',
     'Logging in is faster and the ×10 gacha can be closed on mobile.']
  ] },
  { d: '2026-10-10', items: [
    ['Más reto: jefes y legendarios con 4 ataques avisados que se enfurecen a media vida, 12 movimientos nuevos y 8 formas de atacar nuevas.',
     'More challenge: bosses and legendaries with 4 telegraphed attacks that get enraged at half health, 12 new moves and 8 new ways to attack.'],
    ['Eventos a mitad de partida (hordas de un tipo, hora dorada, Pokémon perdidos) y Meowth y Gholdengo que huyen cargados de monedas.',
     'Mid-run events (single-type hordes, golden hour, lost Pokémon) and Meowth and Gholdengo running away loaded with coins.'],
    ['Subir de nivel es más lento, los tickets son más raros y los jefes dan ticket ×10 una de cada tres veces.',
     'Levelling up is slower, tickets are rarer and bosses drop a ×10 ticket one time in three.'],
    ['Estatuas para los Pokémon grandes, carga más rápida y los enemigos rezagados sólo desaparecen fuera de la vista.',
     'Statues for big Pokémon, faster loading, and straggling enemies only vanish off-screen.']
  ] },
  { d: '2026-10-09', items: [
    ['Se puede jugar en móvil y tablet con joystick táctil, en español y en inglés, e instalar como app.',
     'Play on phones and tablets with a touch joystick, in English and Spanish, and install it as an app.'],
    ['Pantalla de ajustes con calidad gráfica automática, y menos enemigos en pantalla pero más fuertes.',
     'Settings screen with automatic graphics quality, and fewer but stronger enemies on screen.'],
    ['Gigadrenado pasa a ser Hierba Lazo (ya no cura).',
     'Giga Drain becomes Grass Knot (no more healing).']
  ] },
  { d: '2026-10-08', items: [
    ['Misiones diarias y semanales, logros con medallas y títulos, perfil, objetos equipables, evoluciones de movimientos y enemigos que curan, protegen, invocan o explotan.',
     'Daily and weekly missions, achievements with medals and titles, a profile, held items, move evolutions and enemies that heal, shield, summon or explode.'],
    ['Grietas que llevan a 18 arenas legendarias, una por tipo; clima que cambia la batalla; tabla de tipos y gacha tragaperras.',
     'Rifts leading to 18 legendary arenas, one per type; weather that changes the fight; a type chart and a slot-machine gacha.'],
    ['Cooperativo con tu lista de amigos y ranking; mejoras para cada Pokémon y gacha con tickets.',
     'Co-op with your friends list and leaderboards; upgrades for each Pokémon and a ticket gacha.'],
    ['Cámara más lejos y enemigos que rodean los obstáculos.',
     'Camera further out and enemies that walk around obstacles.']
  ] },
  { d: '2026-10-07', items: [
    ['Primera versión pública de PokéSurvivor.', 'First public version of PokéSurvivor.']
  ] }
];
