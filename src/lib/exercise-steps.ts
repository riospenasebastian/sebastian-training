export interface ExerciseVisualStep {
  step: number;
  title: string;
  instruction: string;
}

export const EXERCISE_VISUAL_STEPS: Record<string, ExerciseVisualStep[]> = {
  press_inclinado_mancuernas: [
    { step: 1, title: 'Posición Inicial', instruction: 'Banco a 30° (~2ª o 3ª muesca). Patéate las mancuernas al pecho con las rodillas y retrae escápulas firmes contra el respaldo.' },
    { step: 2, title: 'Descenso Excéntrico', instruction: 'Baja en 2-3 segundos con codos en ángulo de 45-60° respecto al torso (evita abrirlos en T a 90°).' },
    { step: 3, title: 'Pausa en Estiramiento', instruction: 'Haz una micro-pausa controlada de 0.5s sintiendo el estiramiento profundo debajo de la clavícula sin rebotar.' },
    { step: 4, title: 'Empuje Concéntrico', instruction: 'Empuja potente convergiendo ligeramente hacia arriba sobre el pecho medio sin chocar las mancuernas ni desarmar escápulas.' }
  ],
  remo_mancuerna_pecho_apoyado: [
    { step: 1, title: 'Posición Inicial', instruction: 'Banco a 30-45°. Pecho apoyado firmemente en la almohadilla, barbilla neutra y mancuernas colgando con brazos extendidos.' },
    { step: 2, title: 'Tracción con Codos', instruction: 'Lidera el tirón con los codos hacia atrás y arriba a 45° del torso, no con las muñecas ni bíceps.' },
    { step: 3, title: 'Pico de Contracción', instruction: 'Junta y aprieta las escápulas durante 1 segundo arriba como si sujetaras una moneda entre tus omóplatos.' },
    { step: 4, title: 'Descenso Controlado', instruction: 'Baja en 2-3 segundos extendiendo los brazos y permitiendo que la espalda alta se estire por completo.' }
  ],
  jalon_pecho_agarre_neutro: [
    { step: 1, title: 'Posición Inicial', instruction: 'Fija los muslos bajo el rodillo. Agarra el maneral neutro o estrecho, pecho erguido y hombros deprimidos.' },
    { step: 2, title: 'Tracción Vertical', instruction: 'Con una inclinación de torso mínima (10-15°), tira de los codos verticalmente hacia abajo en dirección a las costillas.' },
    { step: 3, title: 'Toque y Contracción', instruction: 'Lleva el agarre hacia la parte alta del esternón y contrae con fuerza los dorsales durante 0.5 segundos.' },
    { step: 4, title: 'Retorno en Estiramiento', instruction: 'Sube en 3 segundos resistiendo el peso hasta notar una elongación completa de la musculatura lateral de la espalda.' }
  ],
  elevaciones_laterales_polea: [
    { step: 1, title: 'Posición Inicial', instruction: 'Coloca la polea a la altura de la rodilla. Sujeta la manija cruzando el cable por delante del cuerpo con torso erguido.' },
    { step: 2, title: 'Elevación Escapular', instruction: 'Eleva el brazo unos 30° adelantado respecto al cuerpo (plano escapular), guiando el movimiento con el codo.' },
    { step: 3, title: 'Pico a la Altura del Hombro', instruction: 'Detente exactamente cuando el codo esté paralelo al suelo. No es necesario subir más alto.' },
    { step: 4, title: 'Descenso Excéntrico', instruction: 'Baja en 3 segundos resistiendo la tensión constante del cable, que mantiene el deltoides lateral trabajando en todo el rango.' }
  ],
  elevaciones_laterales_mancuernas: [
    { step: 1, title: 'Posición Inicial', instruction: 'De pie (o sentado en banco), mancuernas a los lados, torso inclinado 10-15° al frente y codos con microflexión fija.' },
    { step: 2, title: 'Elevación Escapular', instruction: 'Eleva los brazos en el plano escapular (30° adelantado respecto al torso) pensando en empujar las paredes laterales con los codos.' },
    { step: 3, title: 'Altura de Hombros', instruction: 'Detén el movimiento exactamente cuando los codos lleguen a la altura del hombro (paralelos al suelo), sin encoger trapecios.' },
    { step: 4, title: 'Descenso Resistido', instruction: 'Baja en 3 segundos resistiendo el peso con el hombro lateral hasta la vertical antes de la siguiente repetición.' }
  ],
  curl_biceps_inclinado: [
    { step: 1, title: 'Posición Inicial', instruction: 'Banco inclinado a unos 60°. Siéntate apoyando la espalda y deja que los brazos cuelguen verticalmente detrás del torso.' },
    { step: 2, title: 'Flexión con Supinación', instruction: 'Inicia la flexión de codo girando progresivamente las palmas hacia el techo sin adelantar los codos.' },
    { step: 3, title: 'Máxima Contracción', instruction: 'En la cima, gira el meñique ligeramente hacia arriba y aprieta el bíceps durante 1 segundo.' },
    { step: 4, title: 'Estiramiento Pasivo', instruction: 'Desciende en 3 segundos hasta la extensión completa de brazos detrás del cuerpo para estimular la hipertrofia por estiramiento.' }
  ],
  extension_triceps_overhead_polea: [
    { step: 1, title: 'Posición Inicial', instruction: 'De espaldas a la polea con cuerda. Codos flexionados junto a las orejas y torso inclinado hacia adelante 45° con paso adelantado.' },
    { step: 2, title: 'Extensión Dinámica', instruction: 'Extiende los codos hacia el frente manteniendo los brazos inmóviles en el espacio; sólo se mueven los antebrazos.' },
    { step: 3, title: 'Bloqueo y Apertura', instruction: 'Al bloquear los codos, separa los extremos de la cuerda hacia afuera para una contracción demoledora del tríceps.' },
    { step: 4, title: 'Retorno Profundo', instruction: 'Flexiona de nuevo llevando las manos detrás de la cabeza en 3 segundos sintiendo el estiramiento en la cabeza larga.' }
  ],
  prensa_piernas_45: [
    { step: 1, title: 'Posición Inicial', instruction: 'Pies a la anchura de hombros en el medio de la plataforma. Pega firmemente la zona lumbar y glúteos al respaldo sujetando las manijas.' },
    { step: 2, title: 'Descenso Controlado', instruction: 'Baja la plataforma en 3 segundos flexionando rodillas y caderas hasta un ángulo de 90° o más.' },
    { step: 3, title: 'Punto Crítico', instruction: 'Verifica que tu coxis no se despegue del asiento (retroversión pélvica). Pausa 0.5s sin rebotar.' },
    { step: 4, title: 'Empuje con Todo el Pie', instruction: 'Presiona con el talón y metatarso extendiendo las piernas. No bloquees las rodillas violentamente en la cima.' }
  ],
  peso_muerto_rumano_mancuernas: [
    { step: 1, title: 'Posición Inicial', instruction: 'De pie, pies al ancho de cadera, rodillas con una microflexión fija de 15°. Mancuernas pegadas al frente de los muslos.' },
    { step: 2, title: 'Bisagra de Cadera', instruction: 'Empuja la pelvis hacia atrás como si quisieras tocar una pared con los glúteos. No dobles más las rodillas.' },
    { step: 3, title: 'Estiramiento Isquiotibial', instruction: 'Desciende las mancuernas rozando las tibias hasta que tu espalda empiece a redondearse (justo debajo de rodillas).' },
    { step: 4, title: 'Extensión de Glúteo', instruction: 'Empuja las caderas hacia adelante con fuerza hasta quedar erguido, apretando los glúteos al final sin hiperextender la espalda.' }
  ],
  extension_piernas_maquina: [
    { step: 1, title: 'Posición Inicial', instruction: 'Ajusta el respaldo para alinear la rodilla con el eje de la máquina. El rodillo debe quedar sobre la parte inferior de las tibias.' },
    { step: 2, title: 'Extensión Concéntrica', instruction: 'Sujétate con fuerza a los manillares para no despegar la cadera y patea hacia arriba extendiendo las piernas.' },
    { step: 3, title: 'Bloqueo 1 Segundo', instruction: 'Mantén la posición horizontal apretando fuertemente el cuádriceps y el recto femoral durante 1 segundo completo.' },
    { step: 4, title: 'Bajada Lenta', instruction: 'Desciende en 2-3 segundos resistiendo la bajada hasta la flexión inicial sin dejar caer las placas.' }
  ],
  curl_femoral_tumbado: [
    { step: 1, title: 'Posición Inicial', instruction: 'Acuéstate boca abajo con el rodillo apoyado en el tendón de Aquiles (encima de los talones). Agarra las manijas frontales.' },
    { step: 2, title: 'Flexión de Rodillas', instruction: 'Flexiona las rodillas llevando los talones hacia los glúteos mientras empujas la pelvis activamente contra el banco.' },
    { step: 3, title: 'Pico Isométrico', instruction: 'Mantén los talones en máxima proximidad a los glúteos durante 1 segundo sintiendo el bíceps femoral quemar.' },
    { step: 4, title: 'Extensión Excéntrica', instruction: 'Desciende en 3 segundos con control total hasta estirar casi por completo las piernas antes de la siguiente repetición.' }
  ],
  elevacion_talones_gemelos: [
    { step: 1, title: 'Posición Inicial', instruction: 'Apoya el tercio anterior de los pies (metatarso) en el borde de un escalón o plataforma. Rodillas completamente rectas.' },
    { step: 2, title: 'Estiramiento Máximo', instruction: 'Deja caer los talones por debajo del nivel del borde hasta notar estiramiento profundo en el gastrocnemio.' },
    { step: 3, title: 'Pausa de 2 Segundos', instruction: 'Quédate inmóvil en el fondo 2 segundos para anular la energía elástica del tendón de Aquiles.' },
    { step: 4, title: 'Elevación Potente', instruction: 'Impúlsate verticalmente sobre la punta de los dedos gordos del pie y aprieta arriba 1 segundo antes de volver a bajar.' }
  ],
  plank_o_cable_woodchopper: [
    { step: 1, title: 'Posición Inicial', instruction: 'Apóyate sobre los antebrazos con codos bajo los hombros y pies al ancho de cadera sobre las puntas.' },
    { step: 2, title: 'Alineación Total', instruction: 'Cuerpo en línea recta desde coronilla hasta talones. No dejes caer la cadera ni subas los glúteos en triángulo.' },
    { step: 3, title: 'Tensión Activa', instruction: 'Mete el ombligo hacia la columna, aprieta los glúteos al máximo y tira de los codos hacia las puntas de los pies de forma isométrica.' },
    { step: 4, title: 'Respiración Diafragmática', instruction: 'Mantén la armadura abdominal compactada mientras tomas y botas aire corto y controlado.' }
  ],
  press_plano_mancuernas: [
    { step: 1, title: 'Posición Inicial', instruction: 'Acuéstate en banco plano, apoya pies firmes en el suelo, junta escápulas atrás y sostén las mancuernas sobre el pecho.' },
    { step: 2, title: 'Descenso en 45°', instruction: 'Baja las mancuernas en 2-3 segundos manteniendo los codos a 45° respecto al torso hasta rozar la línea media del pecho.' },
    { step: 3, title: 'Pausa de Tensión', instruction: 'Pausa breve de medio segundo abajo sin rebotar, sintiendo cómo se estiran las fibras del pectoral mayor.' },
    { step: 4, title: 'Prensa Concéntrica', instruction: 'Presiona hacia arriba y ligeramente hacia adentro como si quisieras juntar los bíceps en el medio.' }
  ],
  remo_polea_baja_neutro: [
    { step: 1, title: 'Posición Inicial', instruction: 'Siéntate con torso recto, pies apoyados y rodillas ligeramente flexionadas. Toma el maneral estrecho neutro.' },
    { step: 2, title: 'Estiramiento Inicial', instruction: 'Inicia inclinando levemente el torso hacia adelante para que los dorsales se estiren al máximo con el cable tenso.' },
    { step: 3, title: 'Tracción al Ombligo', instruction: 'Endereza el torso y tira con los codos pegados a las costillas hacia la boca del estómago o ombligo.' },
    { step: 4, title: 'Bloqueo Escapular', instruction: 'Junta los omóplatos 1 segundo atrás antes de retornar lentamente a la posición de estiramiento.' }
  ],
  pullover_polea_alta: [
    { step: 1, title: 'Posición Inicial', instruction: 'De pie frente a la polea alta con barra recta o cuerda. Brazos casi extendidos (ligera flexión fija en codos) y torso a 30-45°.' },
    { step: 2, title: 'Inicio del Arco', instruction: 'Brazos arriba a la altura de la frente sintiendo cómo el dorsal ancho se abre y estira bajo los brazos.' },
    { step: 3, title: 'Barrido Hacia Abajo', instruction: 'Empuja la barra hacia tus muslos en un arco semicircular continuo utilizando únicamente los dorsales, no tríceps.' },
    { step: 4, title: 'Toque y Retorno Lento', instruction: 'Toca los muslos contrayendo los costados de la espalda 1 segundo y sube en 3 segundos resistiendo el cable.' }
  ],
  triceps_pushdown_polea_cuerda: [
    { step: 1, title: 'Posición Inicial', instruction: 'Toma la cuerda en polea alta con agarre neutro. Fija los codos a los costados del torso e inclina el cuerpo 10° al frente.' },
    { step: 2, title: 'Extensión Hacia Abajo', instruction: 'Empuja los antebrazos hacia abajo manteniendo los codos como una bisagra clavada a las costillas.' },
    { step: 3, title: 'Apertura de Cuerda', instruction: 'En el punto inferior, abre las muñecas hacia afuera separando los nudos de la cuerda para máxima contracción.' },
    { step: 4, title: 'Subida Resistida', instruction: 'Deja subir las manos en 3 segundos hasta que el antebrazo forme un ángulo de 90° o un poco más sin mover los codos.' }
  ],
  curl_martillo_mancuernas: [
    { step: 1, title: 'Posición Inicial', instruction: 'De pie o sentado con mancuernas a los lados del cuerpo, palmas mirándose entre sí (agarre neutro) y hombros relajados.' },
    { step: 2, title: 'Flexión sin Rotación', instruction: 'Flexiona los antebrazos hacia arriba manteniendo las palmas enfrentadas en todo el recorrido.' },
    { step: 3, title: 'Contracción del Braquial', instruction: 'Aprieta al llegar arriba sintiendo el trabajo en el lateral externo del brazo y antebrazo durante 1 segundo.' },
    { step: 4, title: 'Bajada Estricta', instruction: 'Baja en 3 segundos controlados hasta que los brazos queden extendidos abajo sin balancear el torso.' }
  ],
  sentadilla_bulgara_mancuernas: [
    { step: 1, title: 'Posición Inicial', instruction: 'De espaldas a un banco a un paso de distancia. Apoya el empeine del pie trasero en el borde del banco. Mancuernas a los lados.' },
    { step: 2, title: 'Descenso en Tijera', instruction: 'Baja flexionando la pierna delantera en 3 segundos, llevando la rodilla trasera hacia el suelo e inclinando levemente el torso.' },
    { step: 3, title: 'Profundidad Paralela', instruction: 'Baja hasta que el muslo delantero quede paralelo al suelo con el talón firmemente apoyado.' },
    { step: 4, title: 'Empuje del Talón', instruction: 'Empuja con fuerza a través del talón de la pierna delantera para regresar a la posición erguida.' }
  ],
  elevacion_piernas_colgado_o_banco: [
    { step: 1, title: 'Posición Inicial', instruction: 'Colgado de la barra con agarre firme o recostado en banco sujetándote con las manos detrás de la cabeza.' },
    { step: 2, title: 'Elevación Pélvica', instruction: 'Flexiona las rodillas y eleva la pelvis hacia el pecho pensando en redondear la zona lumbar, no solo en mover los muslos.' },
    { step: 3, title: 'Pico Abdominal', instruction: 'Mantén las rodillas cerca del pecho durante 1 segundo contrayendo el abdomen inferior con intensidad.' },
    { step: 4, title: 'Descenso sin Inercia', instruction: 'Baja en 3 segundos controlados deteniéndote antes de arquear la columna lumbar para no perder la tensión.' }
  ]
};

export function getVisualStepsForExercise(exerciseId: string, fallback?: { setup?: string; execution?: string; cues?: string }): ExerciseVisualStep[] {
  if (EXERCISE_VISUAL_STEPS[exerciseId]) {
    return EXERCISE_VISUAL_STEPS[exerciseId];
  }

  // Smart fallback using exercise fields
  return [
    { step: 1, title: 'Posición Inicial', instruction: fallback?.setup || 'Posiciona el cuerpo y el peso de forma estable asegurando la postura correcta.' },
    { step: 2, title: 'Fase Excéntrica', instruction: 'Desciende o estira en 2 a 3 segundos manteniendo el control y la trayectoria correcta.' },
    { step: 3, title: 'Pausa y Tensión', instruction: fallback?.cues || 'Pausa controlada de 0.5s en el punto de estiramiento sintiendo el músculo objetivo.' },
    { step: 4, title: 'Fase Concéntrica', instruction: fallback?.execution || 'Empuja o tracciona de forma activa contrayendo con fuerza el músculo.' }
  ];
}
