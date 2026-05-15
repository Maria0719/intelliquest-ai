import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quiz")({ component: QuizInProgress });

const questions = [
  {
    q: "¿En qué año comenzó la Revolución Francesa?",
    options: ["1776", "1789", "1804", "1799"],
    correct: 1,
  },
  {
    q: "¿Quién era el rey de Francia al inicio de la revolución?",
    options: ["Luis XIV", "Napoleón Bonaparte", "Luis XVI", "Carlos X"],
    correct: 2,
  },
  {
    q: "¿Cuál fue la fecha de la toma de la Bastilla?",
    options: ["14 de julio", "4 de julio", "1 de mayo", "26 de agosto"],
    correct: 0,
  },
];

function QuizInProgress() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [time, setTime] = useState(30);

  useEffect(() => {
    if (picked !== null) return;
    const t = setInterval(() => setTime((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [picked, idx]);

  const cur = questions[idx];
  const progress = ((idx + (picked !== null ? 1 : 0)) / questions.length) * 100;

  const next = () => {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
      setPicked(null);
      setTime(30);
    } else {
      navigate({ to: "/result" });
    }
  };

  return (
    <AppShell>
      <div className="px-4 md:px-10 py-6 md:py-10 max-w-2xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate({ to: "/" })}
            className="size-9 rounded-lg bg-secondary hover:bg-accent/30 grid place-items-center transition"
            aria-label="Salir"
          >
            <X className="size-4" />
          </button>
          <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-gradient-primary rounded-full transition-all duration-500 shadow-glow"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={cn(
            "flex items-center gap-1.5 text-sm font-medium tabular-nums px-2.5 py-1 rounded-lg",
            time <= 10 ? "text-destructive bg-destructive/15" : "text-muted-foreground bg-secondary"
          )}>
            <Clock className="size-4" /> {time}s
          </div>
        </div>

        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Pregunta {idx + 1} <span className="text-foreground/50">/ {questions.length}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-8">{cur.q}</h2>

        <div className="space-y-3">
          {cur.options.map((opt, i) => {
            const isPicked = picked === i;
            const isCorrect = picked !== null && i === cur.correct;
            const isWrong = isPicked && i !== cur.correct;
            return (
              <button
                key={i}
                disabled={picked !== null}
                onClick={() => setPicked(i)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 md:p-5 rounded-xl border-2 text-left font-medium transition-all",
                  picked === null && "border-border bg-card hover:border-primary hover:bg-primary/5",
                  isCorrect && "border-success bg-success/15 text-success",
                  isWrong && "border-destructive bg-destructive/15 text-destructive",
                  picked !== null && !isCorrect && !isWrong && "border-border bg-card opacity-50"
                )}
              >
                <span className={cn(
                  "size-9 rounded-lg grid place-items-center text-sm font-bold shrink-0 border",
                  picked === null && "border-border bg-secondary",
                  isCorrect && "border-success bg-success/20",
                  isWrong && "border-destructive bg-destructive/20",
                  picked !== null && !isCorrect && !isWrong && "border-border bg-secondary"
                )}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <button
            onClick={next}
            className="mt-8 w-full py-4 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-glow hover:scale-[1.02] transition-transform"
          >
            {idx + 1 < questions.length ? "Siguiente pregunta" : "Ver resultados"}
          </button>
        )}
      </div>
    </AppShell>
  );
}
