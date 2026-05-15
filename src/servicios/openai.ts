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

const SISTEMA_CHAT = [
  "Eres AprendeIA, un tutor educativo inteligente y amigable.",
  "Tu misión es explicar cualquier tema de forma clara, didáctica y con ejemplos concretos.",
  "- Usa un tono cercano y motivador.",
  "- Estructura tus respuestas con párrafos cortos.",
  "- Usa listas o pasos numerados cuando sea útil.",
  "- Si la pregunta es ambigua, pide una aclaración breve.",
  "- Responde siempre en español.",
  "- Sé conciso pero completo.",
].join("\n");

export async function enviarMensajeChat(historial: MensajeChat[]): Promise<string> {
  const mensajes = [
    { role: "system", content: SISTEMA_CHAT },
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
