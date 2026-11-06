// =====================================================
// DATOS DEL QUIZ
// =====================================================

// -----------------------------
// QUIZ HISTÓRICO
// Respuestas contrastadas con los registros enlazados de la ONU.
// -----------------------------
const questions = [
  {
    context: "Ucrania · 15 de marzo de 2014 · Proyecto S/2014/189",
    question: "El proyecto defendía la integridad territorial de Ucrania y rechazaba la validez del referéndum celebrado en Crimea. ¿Qué ocurrió en el Consejo?",
    answer: "vetoed",
    explanation: "No fue aprobado. Rusia, miembro permanente, votó en contra. El resultado fue de 13 votos a favor, 1 en contra y 1 abstención.",
    fact: "El proyecto quedó bloqueado por el voto negativo de un miembro permanente, aunque obtuvo 13 votos favorables.",
    source: "https://digitallibrary.un.org/record/767020",
    sourceLabel: "Biblioteca Digital de la ONU · S/2014/189"
  },
  {
    context: "Jerusalén · 18 de diciembre de 2017 · Proyecto S/2017/1060",
    question: "El proyecto afirmaba que las medidas para modificar el carácter y el estatus de Jerusalén no tenían validez jurídica. ¿Fue aprobado?",
    answer: "vetoed",
    explanation: "No fue aprobado. Estados Unidos votó en contra y ejerció su veto. Los otros 14 miembros votaron a favor.",
    fact: "Fue una votación de 14 votos favorables y 1 voto negativo: el de un miembro permanente bastó para bloquear el proyecto.",
    source: "https://www.un.org/unispal/document/draft-security-council-resolution-vetoed-jerusalem/",
    sourceLabel: "Naciones Unidas · Proyecto sobre Jerusalén"
  },
  {
    context: "Siria · 18 de diciembre de 2015 · Resolución 2254 (2015)",
    question: "El texto respaldaba una hoja de ruta para un proceso político en Siria. ¿Qué resultado tuvo la votación?",
    answer: "approved",
    explanation: "Fue aprobada por unanimidad: los 15 miembros del Consejo votaron a favor.",
    fact: "La resolución 2254 estableció un marco de referencia para un proceso político liderado por los propios sirios.",
    source: "https://digitallibrary.un.org/record/814715",
    sourceLabel: "Biblioteca Digital de la ONU · Resolución 2254"
  },
  {
    context: "Libia · 17 de marzo de 2011 · Resolución 1973 (2011)",
    question: "El proyecto establecía una zona de prohibición de vuelos y medidas para proteger a la población civil en Libia. ¿Fue aprobado?",
    answer: "approved",
    explanation: "Sí. Fue aprobada con 10 votos a favor, ninguno en contra y 5 abstenciones.",
    fact: "Se abstuvieron China, Rusia, Alemania, Brasil e India. La abstención de un miembro permanente no bloquea por sí misma una resolución.",
    source: "https://digitallibrary.un.org/record/699784",
    sourceLabel: "Biblioteca Digital de la ONU · Resolución 1973"
  },
  {
    context: "Territorio palestino ocupado · 23 de diciembre de 2016 · Resolución 2334 (2016)",
    question: "El texto pedía el cese de las actividades de asentamiento israelíes en el territorio palestino ocupado, incluida Jerusalén Oriental. ¿Qué pasó?",
    answer: "approved",
    explanation: "Fue aprobada con 14 votos a favor, ninguno en contra y una abstención: la de Estados Unidos.",
    fact: "La abstención estadounidense permitió que la resolución fuera adoptada; no fue un veto.",
    source: "https://digitallibrary.un.org/record/853446",
    sourceLabel: "Biblioteca Digital de la ONU · Resolución 2334"
  },
  {
    context: "Myanmar · 21 de diciembre de 2022 · Resolución 2669 (2022)",
    question: "El Consejo pidió el fin de la violencia en Myanmar y reclamó medidas para atender la crisis. ¿Fue aprobada?",
    answer: "approved",
    explanation: "Sí. Fue aprobada con 12 votos a favor, ninguno en contra y 3 abstenciones.",
    fact: "China, India y Rusia se abstuvieron. La resolución fue adoptada porque ningún miembro permanente votó en contra.",
    source: "https://digitallibrary.un.org/record/3998419",
    sourceLabel: "Biblioteca Digital de la ONU · Resolución 2669"
  },
  {
    context: "Palestina · 18 de abril de 2024 · Proyecto S/2024/312",
    question: "El proyecto recomendaba a la Asamblea General admitir al Estado de Palestina como miembro de pleno derecho de la ONU. ¿Fue aprobado?",
    answer: "vetoed",
    explanation: "No fue aprobado. Estados Unidos votó en contra. El resultado fue de 12 votos a favor, 1 en contra y 2 abstenciones.",
    fact: "El proyecto obtuvo más de los nueve votos necesarios, pero el voto negativo de un miembro permanente impidió su aprobación.",
    source: "https://www.un.org/unispal/document/use-of-the-veto-palestine-admission-letter-sc-president-23apr24/",
    sourceLabel: "Naciones Unidas · Registro del veto sobre la admisión de Palestina"
  },
  {
    context: "Gaza · 10 de junio de 2024 · Resolución 2735 (2024)",
    question: "El Consejo respaldó una propuesta de alto el fuego en tres fases, con liberación de rehenes y aumento de la ayuda humanitaria. ¿Fue aprobada?",
    answer: "approved",
    explanation: "Sí. Fue aprobada con 14 votos a favor, ninguno en contra y una abstención: la de Rusia.",
    fact: "La resolución pidió la aplicación plena de la propuesta de alto el fuego y sus distintas fases.",
    source: "https://www.un.org/unispal/document/sc-adopting-resolution-2735-2024-10jun24/",
    sourceLabel: "Naciones Unidas · Resolución 2735"
  }
  ,
  {
    context: "Ucrania · 25 de febrero de 2022 · Proyecto S/2022/155",
    question: "El proyecto condenaba la agresión de Rusia contra Ucrania. ¿Fue aprobado por el Consejo de Seguridad?",
    answer: "vetoed",
    explanation: "No fue aprobado. Rusia votó en contra. El resultado fue de 11 votos a favor, 1 en contra y 3 abstenciones (China, India y Emiratos Árabes Unidos).",
    fact: "Dos días después, el Consejo convocó un periodo extraordinario de sesiones de la Asamblea General (resolución 2623) con 11 votos a favor, 1 en contra y 3 abstenciones. Era una votación de procedimiento y no admite veto.",
    source: "https://undocs.org/en/S/PV.8979",
    sourceLabel: "Naciones Unidas · Acta de la sesión S/PV.8979"
  },
  {
    context: "Corea del Norte · 26 de mayo de 2022 · Proyecto S/2022/431",
    question: "Tras varios lanzamientos de misiles balísticos, Estados Unidos propuso endurecer las sanciones contra Corea del Norte, con un recorte del suministro de petróleo y la prohibición de importar tabaco. ¿Fue aprobado?",
    answer: "vetoed",
    explanation: "No fue aprobado. China y Rusia votaron en contra. El resultado fue de 13 votos a favor, 2 en contra y ninguna abstención.",
    fact: "Fue la primera vez desde 2006 que China y Rusia bloqueaban nuevas sanciones contra Corea del Norte. Los dos países votaron en contra a la vez.",
    source: "https://press.un.org/en/2022/sc14911.doc.htm",
    sourceLabel: "Naciones Unidas · Comunicado SC/14911"
  },
  {
    context: "Malí · 30 de agosto de 2023 · Proyecto S/2023/638",
    question: "El proyecto de Francia y Emiratos Árabes Unidos proponía renovar las sanciones contra quienes obstruían el acuerdo de paz en Malí (prohibición de viajar y congelación de activos). ¿Fue aprobado?",
    answer: "vetoed",
    explanation: "No fue aprobado. Rusia votó en contra. El resultado fue de 13 votos a favor, 1 en contra y 1 abstención (China).",
    fact: "Un texto alternativo presentado por Rusia tampoco prosperó: obtuvo 1 voto a favor, 1 en contra (Japón) y 13 abstenciones.",
    source: "https://press.un.org/en/2023/sc15399.doc.htm",
    sourceLabel: "Naciones Unidas · Comunicado SC/15399"
  },
  {
    context: "Gaza · 18 de octubre de 2023 · Proyecto S/2023/773",
    question: "El proyecto presentado por Brasil pedía pausas humanitarias en Gaza para permitir la entrada de ayuda. ¿Fue aprobado?",
    answer: "vetoed",
    explanation: "No fue aprobado. Estados Unidos votó en contra. El resultado fue de 12 votos a favor, 1 en contra y 2 abstenciones (Rusia y Reino Unido).",
    fact: "Brasil ocupaba la presidencia del Consejo ese mes. El proyecto superó los 9 votos necesarios, pero el voto negativo de un miembro permanente bastó para bloquearlo.",
    source: "https://dam.media.un.org/archive/-2AM9LOAMAG0A.html",
    sourceLabel: "Naciones Unidas · Votación del 18 de octubre de 2023"
  },
  {
    context: "Kosovo · 10 de junio de 1999 · Resolución 1244 (1999)",
    question: "El Consejo autorizó el despliegue de una presencia internacional civil y de seguridad en Kosovo. ¿Fue aprobada la resolución?",
    answer: "approved",
    explanation: "Sí. Fue aprobada con 14 votos a favor, ninguno en contra y 1 abstención: la de China.",
    fact: "China, miembro permanente, se abstuvo pese a criticar la intervención de la OTAN. Abstenerse no bloquea una resolución.",
    source: "https://press.un.org/en/1999/19990610.sc6686.html",
    sourceLabel: "Naciones Unidas · Comunicado SC/6686"
  },
  {
    context: "Siria · 27 de septiembre de 2013 · Resolución 2118 (2013)",
    question: "El texto exigía la verificación y destrucción del arsenal de armas químicas de Siria. ¿Qué resultado tuvo la votación?",
    answer: "approved",
    explanation: "Fue aprobada por unanimidad, con los 15 votos a favor.",
    fact: "La resolución llegó tras el acuerdo entre Rusia y Estados Unidos alcanzado en Ginebra el 14 de septiembre de 2013.",
    source: "https://digitallibrary.un.org/record/757830",
    sourceLabel: "Biblioteca Digital de la ONU · Resolución 2118"
  },
  {
    context: "Gaza · 25 de marzo de 2024 · Resolución 2728 (2024)",
    question: "El Consejo exigió un alto el fuego inmediato durante el mes de Ramadán y la liberación de todos los rehenes. ¿Fue aprobada?",
    answer: "approved",
    explanation: "Sí. Fue aprobada con 14 votos a favor, ninguno en contra y 1 abstención: la de Estados Unidos.",
    fact: "Tres días antes, un proyecto estadounidense sobre Gaza había sido vetado por China y Rusia. En esta votación, Estados Unidos se abstuvo en lugar de vetar.",
    source: "https://press.un.org/en/2024/sc15641.doc.htm",
    sourceLabel: "Naciones Unidas · Comunicado SC/15641"
  }
];
