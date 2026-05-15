import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stats")({ component: Stats });

const progress = [
  { d: "L", score: 60 },
  { d: "M", score: 72 },
  { d: "X", score: 68 },
  { d: "J", score: 85 },
  { d: "V", score: 78 },
  { d: "S", score: 92 },
  { d: "D", score: 88 },
];

const topStudied = [
  { topic: "React", count: 18, pct: 90 },
  { topic: "Historia universal", count: 12, pct: 70 },
  { topic: "Biología", count: 9, pct: 55 },
  { topic: "Algoritmos", count: 7, pct: 45 },
];

const weakTopics = [
  { topic: "Cálculo integral", pct: 42 },
  { topic: "Química orgánica", pct: 51 },
  { topic: "Ecuaciones diferenciales", pct: 58 },
];

// 7 cols x 12 weeks contribution-style grid
const weeks = Array.from({ length: 12 }, (_, w) =>
  Array.from({ length: 7 }, (_, d) => Math.floor(Math.random() * 5))
);

function levelClass(n: number) {
  return [
    "bg-secondary/60",
    "bg-primary/20",
    "bg-primary/40",
    "bg-primary/70",
    "bg-primary shadow-glow",
  ][n];
}

function Stats() {
  return (
    <AppShell>
      <div className="px-4 md:px-10 py-6 md:py-10 max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Mis estadísticas</h1>
        <p className="text-muted-foreground mb-8">Tu progreso de aprendizaje a lo largo del tiempo.</p>

        {/* Progress chart */}
        <div className="rounded-2xl bg-gradient-card border border-border p-5 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Progreso semanal</h3>
              <p className="text-xs text-muted-foreground">Promedio de puntaje por día</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gradient">87%</div>
              <div className="text-xs text-success flex items-center gap-1 justify-end">
                <TrendingUp className="size-3" /> +12% vs semana pasada
              </div>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progress}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.65 0.22 275)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.65 0.22 275)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="d" stroke="oklch(0.72 0.03 270)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.72 0.03 270)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.22 0.035 270)", border: "1px solid oklch(0.30 0.03 270)", borderRadius: 12 }}
                />
                <Area type="monotone" dataKey="score" stroke="oklch(0.70 0.22 295)" strokeWidth={3} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Top studied */}
          <div className="rounded-2xl bg-gradient-card border border-border p-5 md:p-6">
            <h3 className="font-semibold mb-4">Temas más estudiados</h3>
            <div className="space-y-4">
              {topStudied.map((t) => (
                <div key={t.topic}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{t.topic}</span>
                    <span className="text-muted-foreground">{t.count} quizzes</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${t.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weak topics */}
          <div className="rounded-2xl bg-gradient-card border border-border p-5 md:p-6">
            <h3 className="font-semibold mb-1">A reforzar</h3>
            <p className="text-xs text-muted-foreground mb-4">Temas donde tu puntaje promedio es bajo</p>
            <div className="space-y-3">
              {weakTopics.map((t) => (
                <div key={t.topic} className="flex items-center justify-between p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-destructive/20 grid place-items-center">
                      <TrendingDown className="size-4 text-destructive" />
                    </div>
                    <span className="font-medium text-sm">{t.topic}</span>
                  </div>
                  <span className="text-destructive font-bold">{t.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Streak grid */}
        <div className="rounded-2xl bg-gradient-card border border-border p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Racha de actividad</h3>
              <p className="text-xs text-muted-foreground">Últimas 12 semanas</p>
            </div>
            <div className="text-sm text-muted-foreground">🔥 <span className="font-bold text-foreground">12 días</span> seguidos</div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((lvl, di) => (
                  <div
                    key={di}
                    className={cn("size-3.5 md:size-4 rounded-sm transition", levelClass(lvl))}
                    title={`Nivel ${lvl}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            Menos
            {[0, 1, 2, 3, 4].map((n) => (
              <div key={n} className={cn("size-3 rounded-sm", levelClass(n))} />
            ))}
            Más
          </div>
        </div>
      </div>
    </AppShell>
  );
}
