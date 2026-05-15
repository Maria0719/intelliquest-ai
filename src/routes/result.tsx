import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Check, X, RotateCw, Plus, Trophy } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, Cell, Tooltip } from "recharts";

export const Route = createFileRoute("/result")({ component: Result });

const perQuestion = [
  { q: "P1", time: 12, correct: true },
  { q: "P2", time: 18, correct: true },
  { q: "P3", time: 25, correct: false },
  { q: "P4", time: 8, correct: true },
  { q: "P5", time: 22, correct: true },
  { q: "P6", time: 30, correct: false },
  { q: "P7", time: 15, correct: true },
  { q: "P8", time: 10, correct: true },
];

function Result() {
  const correct = perQuestion.filter((p) => p.correct).length;
  const total = perQuestion.length;
  const pct = Math.round((correct / total) * 100);

  return (
    <AppShell>
      <div className="px-4 md:px-10 py-6 md:py-10 max-w-3xl mx-auto">
        {/* Score card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 md:p-12 text-center mb-8 shadow-elevated">
          <div className="absolute -top-20 -left-20 size-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 size-64 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative">
            <div className="inline-grid place-items-center size-16 rounded-2xl bg-white/20 backdrop-blur mb-4">
              <Trophy className="size-8 text-white" />
            </div>
            <p className="text-white/80 text-sm uppercase tracking-wider mb-2">¡Quiz completado!</p>
            <div className="text-7xl md:text-8xl font-black text-white tabular-nums leading-none">
              {pct}<span className="text-4xl md:text-5xl text-white/70">%</span>
            </div>
            <p className="text-white/80 mt-3">Acertaste {correct} de {total} preguntas</p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
          <div className="rounded-2xl bg-gradient-card border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-xl bg-success/20 grid place-items-center">
                <Check className="size-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{correct}</div>
                <div className="text-xs text-muted-foreground">Correctas</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-card border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-xl bg-destructive/20 grid place-items-center">
                <X className="size-5 text-destructive" />
              </div>
              <div>
                <div className="text-2xl font-bold">{total - correct}</div>
                <div className="text-xs text-muted-foreground">Incorrectas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Per-question chart */}
        <div className="rounded-2xl bg-gradient-card border border-border p-5 md:p-6 mb-8">
          <h3 className="font-semibold mb-1">Rendimiento por pregunta</h3>
          <p className="text-xs text-muted-foreground mb-4">Tiempo de respuesta · verde = correcta</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perQuestion}>
                <XAxis dataKey="q" stroke="oklch(0.72 0.03 270)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "oklch(0.65 0.22 275 / 0.1)" }}
                  contentStyle={{ background: "oklch(0.22 0.035 270)", border: "1px solid oklch(0.30 0.03 270)", borderRadius: 12 }}
                  labelStyle={{ color: "oklch(0.97 0.01 270)" }}
                />
                <Bar dataKey="time" radius={[8, 8, 0, 0]}>
                  {perQuestion.map((p, i) => (
                    <Cell key={i} fill={p.correct ? "oklch(0.72 0.18 155)" : "oklch(0.65 0.24 25)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/quiz"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-border bg-card hover:border-primary hover:shadow-glow font-semibold transition-all"
          >
            <RotateCw className="size-4" /> Repetir
          </Link>
          <Link
            to="/create"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-glow hover:scale-[1.02] transition-transform"
          >
            <Plus className="size-4" /> Nuevo tema
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
