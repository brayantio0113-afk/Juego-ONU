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
];
