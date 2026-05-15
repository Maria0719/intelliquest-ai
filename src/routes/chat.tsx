import { createFileRoute } from "@tanstack/react-router";
import { Navegacion } from "@/componentes/Navegacion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Brain, Loader2, Trash2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { enviarMensajeChat } from "@/servicios/openai";
import type { MensajeChat, ContextoAprendizaje } from "@/servicios/openai";
import { obtenerHistorial, calcularEstadisticas } from "@/servicios/almacenamiento";

export const Route = createFileRoute("/chat")({ component: Chat });

const SUGERENCIAS_GENERALES = [
  "¿Cómo funciona la fotosíntesis?",
  "Explícame la Segunda Guerra Mundial",
  "¿Qué es el aprendizaje automático?",
  "¿Cómo funcionan los agujeros negros?",
  "Explica la oferta y la demanda",
];

const SUGERENCIAS_PROGRESO = [
  "¿Cómo va mi aprendizaje?",
  "¿En qué temas debo mejorar?",
  "¿Cuáles son mis puntos fuertes?",
];

function BurbujaMensaje({ mensaje }: { mensaje: MensajeChat }) {
  const esUsuario = mensaje.rol === "usuario";
  return (
    <div className={cn("flex gap-3 max-w-[85%]", esUsuario ? "ml-auto flex-row-reverse" : "mr-auto")}>
      {!esUsuario && (
        <div className="size-8 rounded-xl bg-gradient-primary grid place-items-center shrink-0 shadow-glow mt-1">
          <Brain className="size-4 text-primary-foreground" />
        </div>
      )}
      <div
        className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          esUsuario
            ? "bg-gradient-primary text-primary-foreground rounded-tr-sm"
            : "bg-card border border-border rounded-tl-sm",
        )}
      >
        {mensaje.contenido.split("\n").map((linea, i) => (
          <p key={i} className={linea === "" ? "mt-2" : ""}>
            {linea}
          </p>
        ))}
      </div>
    </div>
  );
}

function PuntosTipeando() {
  return (
    <div className="flex gap-3 max-w-[85%] mr-auto">
      <div className="size-8 rounded-xl bg-gradient-primary grid place-items-center shrink-0 shadow-glow mt-1">
        <Brain className="size-4 text-primary-foreground" />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
        <span className="size-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
        <span className="size-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function Chat() {
  const [historial, setHistorial] = useState<MensajeChat[]>([]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const contextoAprendizaje = useMemo((): ContextoAprendizaje | undefined => {
    const historialQuizzes = obtenerHistorial();
    if (historialQuizzes.length === 0) return undefined;
    const stats = calcularEstadisticas(historialQuizzes);
    return {
      totalQuizzes: stats.totalQuizzes,
      promedioGeneral: stats.promedioGeneral,
      racha: stats.racha,
      temasEstudiados: stats.temasEstudiados,
      quizzesRecientes: historialQuizzes.slice(0, 10).map((r) => ({
        topic: r.topic,
        difficulty: r.difficulty,
        percentage: r.percentage,
        date: r.date,
      })),
    };
  }, []);

  useEffect(() => {
    finalRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [historial, cargando]);

  const enviar = async () => {
    const texto = input.trim();
    if (!texto || cargando) return;

    const nuevoHistorial: MensajeChat[] = [
      ...historial,
      { rol: "usuario", contenido: texto },
    ];
    setHistorial(nuevoHistorial);
    setInput("");
    setError(null);
    setCargando(true);

    try {
      const respuesta = await enviarMensajeChat(nuevoHistorial, contextoAprendizaje);
      setHistorial((h) => [...h, { rol: "asistente", contenido: respuesta }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al conectar con la IA.");
    } finally {
      setCargando(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const limpiarChat = () => {
    setHistorial([]);
    setError(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  return (
    <Navegacion>
      <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen max-w-3xl mx-auto w-full">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
              <Brain className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-none">Tutor IA</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {contextoAprendizaje ? "Conozco tu historial de quizzes" : "Pregúntame cualquier cosa"}
              </p>
            </div>
          </div>
          {historial.length > 0 && (
            <button
              onClick={limpiarChat}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition px-3 py-1.5 rounded-lg hover:bg-destructive/10"
            >
              <Trash2 className="size-3.5" /> Limpiar
            </button>
          )}
        </div>

        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
          {historial.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6 pb-10">
              <div className="size-16 rounded-2xl bg-primary/10 grid place-items-center">
                <BookOpen className="size-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">¿Qué quieres aprender hoy?</h2>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Hazme cualquier pregunta sobre el tema que quieras y te lo explico paso a paso.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-sm">
                {contextoAprendizaje && (
                  <>
                    <p className="text-xs text-muted-foreground text-left font-medium px-1">Tu progreso</p>
                    {SUGERENCIAS_PROGRESO.map((s) => (
                      <button
                        key={s}
                        onClick={() => { setInput(s); inputRef.current?.focus(); }}
                        className="text-sm text-left px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition"
                      >
                        {s}
                      </button>
                    ))}
                    <p className="text-xs text-muted-foreground text-left font-medium px-1 mt-2">Explorar temas</p>
                  </>
                )}
                {SUGERENCIAS_GENERALES.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    className="text-sm text-left px-4 py-2.5 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {historial.map((msg, i) => (
            <BurbujaMensaje key={i} mensaje={msg} />
          ))}

          {cargando && <PuntosTipeando />}

          {error && (
            <div className="text-center text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div ref={finalRef} />
        </div>

        {/* Input */}
        <div className="px-4 md:px-8 py-4 border-t border-border shrink-0">
          <div className="flex items-end gap-3 bg-card border border-border rounded-2xl px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta... (Enter para enviar)"
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed max-h-32 placeholder:text-muted-foreground"
              style={{ height: "auto" }}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = `${t.scrollHeight}px`;
              }}
            />
            <button
              onClick={enviar}
              disabled={!input.trim() || cargando}
              className={cn(
                "size-9 rounded-xl grid place-items-center shrink-0 transition-all",
                input.trim() && !cargando
                  ? "bg-gradient-primary text-primary-foreground shadow-glow hover:scale-105"
                  : "bg-secondary text-muted-foreground cursor-not-allowed",
              )}
            >
              {cargando ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Enter para enviar · Shift+Enter para nueva línea
          </p>
        </div>
      </div>
    </Navegacion>
  );
}
