export interface PreguntaQuiz {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface SesionQuiz {
  topic: string;
  difficulty: string;
  questions: PreguntaQuiz[];
}

export interface ResultadoPregunta {
  question: string;
  options: string[];
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
}

export interface ResultadoQuiz {
  id: string;
  topic: string;
  difficulty: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  questionResults: ResultadoPregunta[];
}

// Re-export with English names for backward compatibility
export type QuizQuestion = PreguntaQuiz;
export type QuizSession = SesionQuiz;
export type QuestionResult = ResultadoPregunta;
export type QuizResult = ResultadoQuiz;

const CLAVES = {
  API_KEY: "iq_api_key",
  HISTORIAL: "iq_history",
  QUIZ_ACTIVO: "iq_active_quiz",
  ULTIMO_RESULTADO: "iq_last_result",
};

export function obtenerApiKey(): string {
  return localStorage.getItem(CLAVES.API_KEY) ?? "";
}

export function guardarApiKey(key: string): void {
  localStorage.setItem(CLAVES.API_KEY, key);
}

export function obtenerHistorial(): ResultadoQuiz[] {
  try {
    return JSON.parse(localStorage.getItem(CLAVES.HISTORIAL) ?? "[]");
  } catch {
    return [];
  }
}

export function agregarResultado(resultado: ResultadoQuiz): void {
  const historial = obtenerHistorial();
  historial.unshift(resultado);
  localStorage.setItem(CLAVES.HISTORIAL, JSON.stringify(historial));
}

export function guardarQuizActivo(sesion: SesionQuiz): void {
  sessionStorage.setItem(CLAVES.QUIZ_ACTIVO, JSON.stringify(sesion));
}

export function obtenerQuizActivo(): SesionQuiz | null {
  try {
    const raw = sessionStorage.getItem(CLAVES.QUIZ_ACTIVO);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function limpiarQuizActivo(): void {
  sessionStorage.removeItem(CLAVES.QUIZ_ACTIVO);
}

export function guardarUltimoResultado(resultado: ResultadoQuiz): void {
  sessionStorage.setItem(CLAVES.ULTIMO_RESULTADO, JSON.stringify(resultado));
}

export function obtenerUltimoResultado(): ResultadoQuiz | null {
  try {
    const raw = sessionStorage.getItem(CLAVES.ULTIMO_RESULTADO);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export interface Estadisticas {
  totalQuizzes: number;
  totalPreguntas: number;
  totalCorrectas: number;
  promedioGeneral: number;
  racha: number;
  temasEstudiados: string[];
}

export function calcularEstadisticas(historial: ResultadoQuiz[]): Estadisticas {
  if (!historial.length) {
    return {
      totalQuizzes: 0,
      totalPreguntas: 0,
      totalCorrectas: 0,
      promedioGeneral: 0,
      racha: 0,
      temasEstudiados: [],
    };
  }

  const totalPreguntas = historial.reduce((s, r) => s + r.totalQuestions, 0);
  const totalCorrectas = historial.reduce((s, r) => s + r.correctAnswers, 0);
  const promedioGeneral = Math.round(historial.reduce((s, r) => s + r.percentage, 0) / historial.length);
  const temasEstudiados = [...new Set(historial.map((r) => r.topic))];

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diasConActividad = new Set(
    historial.map((r) => {
      const d = new Date(r.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  let racha = 0;
  const actual = new Date(hoy);
  if (!diasConActividad.has(actual.getTime())) {
    actual.setDate(actual.getDate() - 1);
  }
  while (diasConActividad.has(actual.getTime())) {
    racha++;
    actual.setDate(actual.getDate() - 1);
  }

  return { totalQuizzes: historial.length, totalPreguntas, totalCorrectas, promedioGeneral, racha, temasEstudiados };
}

// Aliases in English for files that use the old API
export const getApiKey = obtenerApiKey;
export const saveApiKey = guardarApiKey;
export const getQuizHistory = obtenerHistorial;
export const addQuizResult = agregarResultado;
export const setActiveQuiz = guardarQuizActivo;
export const getActiveQuiz = obtenerQuizActivo;
export const clearActiveQuiz = limpiarQuizActivo;
export const setLastResult = guardarUltimoResultado;
export const getLastResult = obtenerUltimoResultado;
export const computeStats = (historial: ResultadoQuiz[]) => {
  const e = calcularEstadisticas(historial);
  return {
    totalQuizzes: e.totalQuizzes,
    totalQuestions: e.totalPreguntas,
    totalCorrect: e.totalCorrectas,
    averageScore: e.promedioGeneral,
    streak: e.racha,
    studiedTopics: e.temasEstudiados,
  };
};
