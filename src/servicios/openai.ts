import type { PreguntaQuiz } from "./almacenamiento";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string;

// ─── Quiz ─────────────────────────────────────────────────────────────────────

function construirPrompt(n: number, tema: string, dificultad: string): string {
  return `Genera ${n} preguntas de opción múltiple sobre: "${tema}". Dificultad: ${dificultad}.
Responde SOLO con un JSON array sin texto extra ni backticks:
[{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"answer":0,"explanation":"..."}]
donde "answer" es el índice (0-3) de la opción correcta.`;
}

function manejarErrorHttp(status: number, msg: string | undefined, contexto = ""): never {
  if (status === 401) throw new Error("API Key inválida. Verifica la key en el código.");
  if (status === 429) throw new Error("Límite de solicitudes alcanzado. Espera un momento.");
  throw new Error(msg ?? `Error ${status}${contexto ? ` en ${contexto}` : ""}.`);
}

export async function generarQuiz(
  tema: string,
  cantidad: number,
  dificultad: string,
): Promise<PreguntaQuiz[]> {
  const respuesta = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: construirPrompt(cantidad, tema, dificultad) }],
      temperature: 0.7,
    }),
  });

  if (!respuesta.ok) {
    const err = await respuesta.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } }).error?.message;
    manejarErrorHttp(respuesta.status, msg, "quiz");
  }

  const datos = (await respuesta.json()) as { choices: { message: { content: string } }[] };
  const texto = datos.choices[0]?.message?.content ?? "";
  const jsonStr = texto
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  let preguntas: PreguntaQuiz[];
  try {
    preguntas = JSON.parse(jsonStr);
  } catch {
    throw new Error("La IA devolvió una respuesta en formato inesperado. Intenta de nuevo.");
  }

  if (!Array.isArray(preguntas) || preguntas.length === 0) {
    throw new Error("No se generaron preguntas. Intenta con un tema diferente.");
  }

  return preguntas;
}

export const generateQuiz = generarQuiz;

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface MensajeChat {
  rol: "usuario" | "asistente";
  contenido: string;
}

export interface ContextoAprendizaje {
  totalQuizzes: number;
  promedioGeneral: number;
  racha: number;
  temasEstudiados: string[];
  quizzesRecientes: Array<{
    topic: string;
    difficulty: string;
    percentage: number;
    date: string;
  }>;
}

const SISTEMA_BASE = [
  "Eres AprendeIA, un tutor educativo inteligente y amigable.",
  "Tu misión es explicar cualquier tema de forma clara, didáctica y con ejemplos concretos.",
  "- Usa un tono cercano y motivador.",
  "- Estructura tus respuestas con párrafos cortos.",
  "- Usa listas o pasos numerados cuando sea útil.",
  "- Si la pregunta es ambigua, pide una aclaración breve.",
  "- Responde siempre en español.",
  "- Sé conciso pero completo.",
].join("\n");

function construirSistemaChat(contexto?: ContextoAprendizaje): string {
  if (!contexto || contexto.totalQuizzes === 0) return SISTEMA_BASE;

  const recientes = contexto.quizzesRecientes
    .map((q) => {
      const fecha = new Date(q.date).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return `  · ${q.topic} (${q.difficulty}) — ${q.percentage}% — ${fecha}`;
    })
    .join("\n");

  const seccionProgreso = [
    "",
    "DATOS DE APRENDIZAJE DEL USUARIO:",
    `- Quizzes completados: ${contexto.totalQuizzes}`,
    `- Promedio general: ${contexto.promedioGeneral}%`,
    `- Racha actual: ${contexto.racha} día${contexto.racha !== 1 ? "s" : ""}`,
    `- Temas estudiados: ${contexto.temasEstudiados.join(", ")}`,
    `- Últimos quizzes:\n${recientes}`,
    "",
    "Cuando el usuario pregunte por su progreso, desempeño o aprendizaje, usa estos datos para dar una respuesta personalizada y motivadora.",
    "Identifica fortalezas (porcentajes altos) y áreas a reforzar (porcentajes bajos) basándote en el historial.",
  ].join("\n");

  return SISTEMA_BASE + seccionProgreso;
}

export async function enviarMensajeChat(
  historial: MensajeChat[],
  contexto?: ContextoAprendizaje,
): Promise<string> {
  const mensajes = [
    { role: "system", content: construirSistemaChat(contexto) },
    ...historial.map((m) => ({
      role: m.rol === "usuario" ? ("user" as const) : ("assistant" as const),
      content: m.contenido,
    })),
  ];

  const respuesta = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: "gpt-4o-mini", messages: mensajes, temperature: 0.7 }),
  });

  if (!respuesta.ok) {
    const err = await respuesta.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } }).error?.message;
    manejarErrorHttp(respuesta.status, msg, "chat");
  }

  const datos = (await respuesta.json()) as { choices: { message: { content: string } }[] };
  return datos.choices[0]?.message?.content ?? "Sin respuesta.";
}
