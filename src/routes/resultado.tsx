import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Navegacion } from "@/componentes/Navegacion";
import { useEffect, useState } from "react";
import { Check, X, Plus, Trophy, ChevronDown, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { obtenerUltimoResultado } from "@/servicios/almacenamiento";
import type { ResultadoQuiz } from "@/servicios/almacenamiento";

export const Route = createFileRoute("/resultado")({ component: Resultado });

function Resultado() {
  const navigate = useNavigate();
  const [resultado, setResultado] = useState<ResultadoQuiz | null>(null);
  const [expandida, setExpandida] = useState<number | null>(null);

  useEffect(() => {
    const r = obtenerUltimoResultado();
    if (!r) {
      navigate({ to: "/" });
      return;
    }
    setResultado(r);
  }, [navigate]);

  if (!resultado) return null;

  const { correctAnswers, totalQuestions, percentage, topic, difficulty, questionResults } = resultado;

  const emoji = percentage >= 90 ? "🏆" : percentage >= 70 ? "⭐" : percentage >= 50 ? "💪" : "📚";

  return (
    <Navegacion>
      <div className="px-4 md:px-10 py-6 md:py-10 max-w-3xl mx-auto">
        {/* Tarjeta de puntaje */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 md:p-12 text-center mb-8 shadow-elevated">
          <div className="absolute -top-20 -left-20 size-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 size-64 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative">
            <div className="inline-grid place-items-center size-16 rounded-2xl bg-white/20 backdrop-blur mb-4">
              <Trophy className="size-8 text-white" />
            </div>
            <p className="text-white/80 text-sm uppercase tracking-wider mb-1">¡Quiz completado! {emoji}</p>
            <p className="text-white/60 text-xs mb-3">{topic} · {difficulty}</p>
            <div className="text-7xl md:text-8xl font-black text-white tabular-nums leading-none">
              {percentage}
              <span className="text-4xl md:text-5xl text-white/70">%</span>
            </div>
            <p className="text-white/80 mt-3">
              Acertaste {correctAnswers} de {totalQuestions} preguntas
            </p>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
          <div className="rounded-2xl bg-gradient-card border border-border p-5">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-success/20 grid place-items-center">
                <Check className="size-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{correctAnswers}</div>
                <div className="text-xs text-muted-foreground">Correctas</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-card border border-border p-5">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-destructive/20 grid place-items-center">
                <X className="size-5 text-destructive" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalQuestions - correctAnswers}</div>
                <div className="text-xs text-muted-foreground">Incorrectas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Revisión de preguntas */}
        <div className="rounded-2xl bg-gradient-card border border-border p-5 md:p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="size-5 text-primary" />
            <h3 className="font-semibold">Revisión de preguntas</h3>
          </div>
          <div className="space-y-2">
            {questionResults.map((qr, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-xl border overflow-hidden",
                  qr.isCorrect ? "border-success/30" : "border-destructive/30"
                )}
              >
                <button
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/3 transition"
                  onClick={() => setExpandida(expandida === i ? null : i)}
                >
                  <div className={cn(
                    "size-7 rounded-lg grid place-items-center shrink-0",
                    qr.isCorrect ? "bg-success/20" : "bg-destructive/20"
                  )}>
                    {qr.isCorrect ? (
                      <Check className="size-4 text-success" />
                    ) : (
                      <X className="size-4 text-destructive" />
                    )}
                  </div>
                  <span className="flex-1 text-sm font-medium leading-snug">{qr.question}</span>
                  <ChevronDown className={cn(
                    "size-4 text-muted-foreground transition-transform shrink-0",
                    expandida === i && "rotate-180"
                  )} />
                </button>

                {expandida === i && (
                  <div className="px-4 pb-4 space-y-2">
                    {qr.options.map((opt, j) => (
                      <div
                        key={j}
                        className={cn(
                          "text-sm px-3 py-2 rounded-lg",
                          j === qr.correctAnswer && "bg-success/15 text-success font-medium",
                          j === qr.userAnswer && !qr.isCorrect && j !== qr.correctAnswer &&
                            "bg-destructive/15 text-destructive"
                        )}
                      >
                        <span className="font-bold mr-2">{String.fromCharCode(65 + j)}.</span>
                        {opt}
                        {j === qr.correctAnswer && <span className="ml-2 text-xs">✓ correcta</span>}
                        {j === qr.userAnswer && !qr.isCorrect && j !== qr.correctAnswer && (
                          <span className="ml-2 text-xs">(tu respuesta)</span>
                        )}
                      </div>
                    ))}
                    {qr.explanation && (
                      <div className="mt-3 p-3 rounded-lg bg-primary/8 border border-primary/20 text-xs text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-primary">Explicación: </span>
                        {qr.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/crear"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-border bg-card hover:border-primary hover:shadow-glow font-semibold transition-all"
          >
            Repetir tema
          </Link>
          <Link
            to="/crear"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-glow hover:scale-[1.02] transition-transform"
          >
            <Plus className="size-4" /> Nuevo tema
          </Link>
        </div>
      </div>
    </Navegacion>
  );
}
