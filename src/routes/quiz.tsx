import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navegacion } from "@/componentes/Navegacion";
import { useEffect, useRef, useState } from "react";
import { X, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  obtenerQuizActivo,
  limpiarQuizActivo,
  agregarResultado,
  guardarUltimoResultado,
} from "@/servicios/almacenamiento";
import type { PreguntaQuiz, ResultadoPregunta } from "@/servicios/almacenamiento";

export const Route = createFileRoute("/quiz")({ component: QuizEnCurso });

function QuizEnCurso() {
  const navigate = useNavigate();
  const sesion = useRef(obtenerQuizActivo());
  const [idx, setIdx] = useState(0);
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [resultados, setResultados] = useState<ResultadoPregunta[]>([]);

  useEffect(() => {
    if (!sesion.current) navigate({ to: "/crear" });
  }, [navigate]);

  if (!sesion.current) return null;

  const { questions, topic, difficulty } = sesion.current;
  const preguntaActual: PreguntaQuiz = questions[idx];
  const total = questions.length;
  const progreso = ((idx + (seleccionada !== null ? 1 : 0)) / total) * 100;
  const esCorrecta = seleccionada !== null && seleccionada === preguntaActual.answer;

  const irASiguiente = () => {
    if (seleccionada === null) return;

    const nuevosResultados: ResultadoPregunta[] = [
      ...resultados,
      {
        question: preguntaActual.question,
        options: preguntaActual.options,
        userAnswer: seleccionada,
        correctAnswer: preguntaActual.answer,
        isCorrect: seleccionada === preguntaActual.answer,
        explanation: preguntaActual.explanation,
      },
    ];
    setResultados(nuevosResultados);

    if (idx + 1 < total) {
      setIdx(idx + 1);
      setSeleccionada(null);
    } else {
      const correctas = nuevosResultados.filter((r) => r.isCorrect).length;
      const resultado = {
        id: crypto.randomUUID(),
        topic,
        difficulty,
        date: new Date().toISOString(),
        totalQuestions: total,
        correctAnswers: correctas,
        percentage: Math.round((correctas / total) * 100),
        questionResults: nuevosResultados,
      };
      agregarResultado(resultado);
      guardarUltimoResultado(resultado);
      limpiarQuizActivo();
      navigate({ to: "/resultado" });
    }
  };

  const salir = () => {
    limpiarQuizActivo();
    navigate({ to: "/" });
  };

  return (
    <Navegacion>
      <div className="px-4 md:px-10 py-6 md:py-10 max-w-2xl mx-auto">
        {/* Barra superior */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={salir}
            className="size-9 rounded-lg bg-secondary hover:bg-accent/30 grid place-items-center transition"
            aria-label="Salir"
          >
            <X className="size-4" />
          </button>
          <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-gradient-primary rounded-full transition-all duration-500 shadow-glow"
              style={{ width: `${progreso}%` }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">{idx + 1}/{total}</span>
        </div>

        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Pregunta {idx + 1} <span className="text-foreground/50">/ {total}</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold leading-tight mb-6">{preguntaActual.question}</h2>

        <div className="space-y-3">
          {preguntaActual.options.map((opcion, i) => {
            const estaSeleccionada = seleccionada === i;
            const esOpcionCorrecta = seleccionada !== null && i === preguntaActual.answer;
            const esIncorrecta = estaSeleccionada && i !== preguntaActual.answer;
            return (
              <button
                key={i}
                disabled={seleccionada !== null}
                onClick={() => setSeleccionada(i)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 md:p-5 rounded-xl border-2 text-left font-medium transition-all",
                  seleccionada === null && "border-border bg-card hover:border-primary hover:bg-primary/5",
                  esOpcionCorrecta && "border-success bg-success/15 text-success",
                  esIncorrecta && "border-destructive bg-destructive/15 text-destructive",
                  seleccionada !== null && !esOpcionCorrecta && !esIncorrecta && "border-border bg-card opacity-40"
                )}
              >
                <span className={cn(
                  "size-9 rounded-lg grid place-items-center text-sm font-bold shrink-0 border",
                  seleccionada === null && "border-border bg-secondary",
                  esOpcionCorrecta && "border-success bg-success/20",
                  esIncorrecta && "border-destructive bg-destructive/20",
                  seleccionada !== null && !esOpcionCorrecta && !esIncorrecta && "border-border bg-secondary"
                )}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opcion}</span>
              </button>
            );
          })}
        </div>

        {seleccionada !== null && (
          <div className="mt-6 space-y-4">
            {/* Retroalimentación */}
            <div className={cn(
              "flex items-start gap-3 p-4 rounded-xl border",
              esCorrecta ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30"
            )}>
              {esCorrecta ? (
                <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
              ) : (
                <XCircle className="size-5 text-destructive shrink-0 mt-0.5" />
              )}
              <div>
                <p className={cn("font-semibold text-sm mb-1", esCorrecta ? "text-success" : "text-destructive")}>
                  {esCorrecta ? "¡Correcto!" : "Incorrecto"}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">{preguntaActual.explanation}</p>
              </div>
            </div>

            <button
              onClick={irASiguiente}
              className="w-full py-4 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-glow hover:scale-[1.02] transition-transform"
            >
              {idx + 1 < total ? "Siguiente pregunta" : "Ver resultados"}
            </button>
          </div>
        )}
      </div>
    </Navegacion>
  );
}
