-- ============================================
-- SCRIPT DE DATOS INICIALES (SEED)
-- Top 30 Mejores Pokémon
-- ============================================

\c pokemon_db;

-- Limpiar datos existentes
TRUNCATE TABLE pokemon RESTART IDENTITY CASCADE;

-- ============================================
-- INSERTAR TOP 30 POKÉMON
-- ============================================

INSERT INTO pokemon (numero_pokedex, nombre, tipo_primario, tipo_secundario, descripcion, stats_hp, stats_ataque, stats_defensa, stats_velocidad, imagen_url, es_legendario, generacion) VALUES
-- Generación 1 - Los Clásicos
(6, 'Charizard', 'Fuego', 'Volador', 'Escupe fuego que es tan caliente que puede derretir rocas. Puede causar incendios forestales al soplar llamas.', 78, 84, 78, 100, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png', false, 1),

(25, 'Pikachu', 'Eléctrico', NULL, 'Cuando varios de estos Pokémon se juntan, su electricidad puede causar tormentas de relámpagos.', 35, 55, 40, 90, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png', false, 1),

(150, 'Mewtwo', 'Psíquico', NULL, 'Fue creado por un científico tras años de experimentos de ingeniería genética. Sus habilidades de combate son incomparables.', 106, 110, 90, 130, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png', true, 1),

(94, 'Gengar', 'Fantasma', 'Veneno', 'Para robar la vida de su objetivo, se desliza en la sombra de su presa y espera silenciosamente una oportunidad.', 60, 65, 60, 110, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png', false, 1),

(131, 'Lapras', 'Agua', 'Hielo', 'Un Pokémon que ha sido sobre cazado hasta casi extinguirse. Puede entender el lenguaje humano.', 130, 85, 80, 60, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png', false, 1),

(143, 'Snorlax', 'Normal', NULL, 'No está satisfecho a menos que coma 400 kg de comida cada día. Cuando termina de comer, se va directo a dormir.', 160, 110, 65, 30, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png', false, 1),

(3, 'Venusaur', 'Planta', 'Veneno', 'La planta florece cuando absorbe energía solar. Se mantiene en movimiento para buscar luz solar.', 80, 82, 83, 80, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png', false, 1),

(9, 'Blastoise', 'Agua', NULL, 'Aplasta a su rival con su peso corporal y se aferra con sus garras. Su caparazón contiene cañones de agua.', 79, 83, 100, 78, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png', false, 1),

-- Generación 2
(248, 'Tyranitar', 'Roca', 'Siniestro', 'Su cuerpo no puede ser lastimado por ningún tipo de ataque. Es muy propenso a buscar batalla.', 100, 134, 110, 61, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/248.png', false, 2),

(249, 'Lugia', 'Psíquico', 'Volador', 'Se dice que vive en el fondo del mar. Con un batir de sus alas, puede causar tormentas que duran 40 días.', 106, 90, 130, 110, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/249.png', true, 2),

(250, 'Ho-Oh', 'Fuego', 'Volador', 'Sus plumas resplandecen en siete colores. Se dice que quienes lo vean recibirán felicidad eterna.', 106, 130, 90, 90, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/250.png', true, 2),

-- Generación 3
(384, 'Rayquaza', 'Dragón', 'Volador', 'Vive en la capa de ozono. Desciende cuando Kyogre y Groudon pelean.', 105, 150, 90, 95, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/384.png', true, 3),

(382, 'Kyogre', 'Agua', NULL, 'Aparece en la mitología como el Pokémon que expandió el mar luchando con Groudon.', 100, 100, 90, 90, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/382.png', true, 3),

(383, 'Groudon', 'Tierra', NULL, 'Aparece en la mitología como el Pokémon que creó la tierra. Puede evaporar el agua con luz y calor.', 100, 150, 140, 90, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/383.png', true, 3),

(376, 'Metagross', 'Acero', 'Psíquico', 'Tiene cuatro cerebros. Combina la inteligencia de cuatro cerebros de Metang. Es más inteligente que una supercomputadora.', 80, 135, 130, 70, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/376.png', false, 3),

(306, 'Aggron', 'Acero', 'Roca', 'Reclama toda una montaña como su territorio. Sin piedad, azota a cualquier intruso con sus cuernos de acero.', 70, 110, 180, 50, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/306.png', false, 3),

-- Generación 4
(445, 'Garchomp', 'Dragón', 'Tierra', 'Cuando dobla su cuerpo y extiende sus alas, parece un avión jet. Vuela a velocidad sónica.', 108, 130, 95, 102, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/445.png', false, 4),

(448, 'Lucario', 'Lucha', 'Acero', 'Un Pokémon bien entrenado puede detectar y comprender las emociones de los seres vivos a más de 1 km.', 70, 110, 70, 90, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png', false, 4),

(483, 'Dialga', 'Acero', 'Dragón', 'Tiene el poder de controlar el tiempo. Aparece en los mitos de Sinnoh como una deidad ancestral.', 100, 120, 120, 90, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/483.png', true, 4),

(484, 'Palkia', 'Agua', 'Dragón', 'Tiene la habilidad de distorsionar el espacio. Se le describe en los mitos de Sinnoh.', 90, 120, 100, 100, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/484.png', true, 4),

(487, 'Giratina', 'Fantasma', 'Dragón', 'Vive en un mundo diferente de donde vivimos. Aparece en cementerios.', 150, 100, 120, 90, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/487.png', true, 4),

-- Generación 5
(635, 'Hydreigon', 'Siniestro', 'Dragón', 'Cree que cualquier cosa que se mueva es un enemigo. Arrasará y destruirá todo en su camino.', 92, 105, 90, 98, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/635.png', false, 5),

(643, 'Reshiram', 'Dragón', 'Fuego', 'Cuando su cola arde, el calor generado por sus llamas afecta la atmósfera terrestre.', 100, 120, 100, 90, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/643.png', true, 5),

(644, 'Zekrom', 'Dragón', 'Eléctrico', 'Oculta su cuerpo en nubes de truenos. Genera relámpagos con su cola.', 100, 150, 120, 90, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/644.png', true, 5),

-- Generación 6
(658, 'Greninja', 'Agua', 'Siniestro', 'Crea estrellas ninja de agua comprimido. Cuando gira sus estrellas ninja, pueden partir metal.', 72, 95, 67, 122, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/658.png', false, 6),

(700, 'Sylveon', 'Hada', NULL, 'Emite una aura tranquilizadora desde sus apéndices parecidos a cintas para calmar las peleas.', 95, 65, 65, 60, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/700.png', false, 6),

-- Generación 7
(785, 'Tapu Koko', 'Eléctrico', 'Hada', 'El espíritu guardián de Melemele. Aparece ante quienes le caen bien pero es bastante caprichoso.', 70, 115, 85, 130, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/785.png', true, 7),

(800, 'Necrozma', 'Psíquico', NULL, 'Está obsesionado con la luz y ataca para absorberla. Dispara láseres potentes desde cada parte de su cuerpo.', 97, 107, 101, 79, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/800.png', true, 7),

-- Generación 8
(890, 'Eternatus', 'Veneno', 'Dragón', 'Absorbe la energía de Galar para mantenerse activo. Se dice que llegó a bordo de un meteorito hace 20,000 años.', 140, 85, 95, 130, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/890.png', true, 8),

(812, 'Rillaboom', 'Planta', NULL, 'Golpea su tambor especial para cambiar las raíces de su tocón a vigorosas plantas.', 100, 125, 90, 85, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/812.png', false, 8);

-- ============================================
-- VERIFICACIÓN DE DATOS
-- ============================================
\echo '✅ Se insertaron 30 Pokémon exitosamente'
\echo ''
\echo '📊 Resumen:'
SELECT 
    COUNT(*) as total_pokemon,
    COUNT(*) FILTER (WHERE es_legendario = true) as legendarios,
    COUNT(*) FILTER (WHERE es_legendario = false) as no_legendarios
FROM pokemon;

\echo ''
\echo '📈 Pokémon por generación:'
SELECT generacion, COUNT(*) as cantidad
FROM pokemon
GROUP BY generacion
ORDER BY generacion;
