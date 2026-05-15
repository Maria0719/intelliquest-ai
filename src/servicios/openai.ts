import type { PreguntaQuiz } from "./almacenamiento";

const API_KEY = "COLOCA_TU_API_KEY_AQUI";

function construirPrompt(n: number, tema: string, dificultad: string): string {
  return `Genera ${n} preguntas de opción múltiple sobre: "${tema}". Dificultad: ${dificultad}.
Responde SOLO con un JSON array sin texto extra ni backticks:
[{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"answer":0,"explanation":"..."}]
donde "answer" es el índice (0-3) de la opción correcta.`;
}

export async function generarQuiz(
  tema: string,
  cantidad: number,
  dificultad: string
): Promise<PreguntaQuiz[]> {
  const respuesta = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: construirPrompt(cantidad, tema, dificultad) }],
      temperature: 0.7,
    }),
  });

  if (!respuesta.ok) {
    const err = await respuesta.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } }).error?.message;
    if (respuesta.status === 401) throw new Error("API Key inválida. Verifica la key en el código.");
    if (respuesta.status === 429) throw new Error("Límite de solicitudes alcanzado. Espera un momento.");
    throw new Error(msg ?? `Error ${respuesta.status} al contactar OpenAI.`);
  }

  const datos = (await respuesta.json()) as {
    choices: { message: { content: string } }[];
  };

  const texto = datos.choices[0]?.message?.content ?? "";
  const jsonStr = texto.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

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
