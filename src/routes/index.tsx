import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Flame, BookOpen, Target, CheckCircle2, Sparkles, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({ component: Dashboard });

const stats = [
  { label: "Racha", value: "12", unit: "días", icon: Flame, tint: "from-orange-400 to-pink-500" },
  { label: "Temas estudiados", value: "24", icon: BookOpen, tint: "from-blue-400 to-indigo-500" },
  { label: "Promedio", value: "87", unit: "%", icon: Target, tint: "from-violet-400 to-purple-500" },
  { label: "Respondidas", value: "342", icon: CheckCircle2, tint: "from-emerald-400 to-teal-500" },
];

const recent = [
  { topic: "Revolución Francesa", score: 92, qs: 10, time: "Hace 2h", difficulty: "Media" },
  { topic: "Hooks de React", score: 80, qs: 8, time: "Ayer", difficulty: "Difícil" },
  { topic: "Sistema solar", score: 100, qs: 5, time: "Ayer", difficulty: "Fácil" },
  { topic: "Machine Learning básico", score: 65, qs: 12, time: "Hace 3 días", difficulty: "Difícil" },
];

function scoreColor(s: number) {
  if (s >= 85) return "text-success";
  if (s >= 60) return "text-warning";
  return "text-destructive";
}

function Dashboard() {
  return (
    <AppShell>
      <div className="px-4 md:px-10 py-6 md:py-10 max-w-6xl mx-auto">
        <div className="flex flex-col gap-1 mb-8">
          <p className="text-sm text-muted-foreground">¡Hola de nuevo, Alex! 👋</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Listo para <span className="text-gradient">aprender algo nuevo</span> hoy.
          </h1>
        </div>

        {/* Hero CTA */}
        <Link
          to="/create"
          className="group block relative overflow-hidden rounded-2xl bg-gradient-hero p-6 md:p-8 mb-8 shadow-elevated"
        >
          <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-10 bottom-4 size-40 rounded-full bg-accent/30 blur-2xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-medium text-white mb-3">
                <Sparkles className="size-3.5" /> Generado por IA
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Generar nuevo quiz</h2>
              <p className="text-white/80 text-sm md:text-base max-w-md">
                Elige un tema, ajusta dificultad y la IA creará un quiz personalizado en segundos.
              </p>
            </div>
            <div className="hidden sm:grid place-items-center size-16 rounded-2xl bg-white/15 backdrop-blur group-hover:scale-110 transition-transform">
              <ChevronRight className="size-7 text-white" />
            </div>
          </div>
        </Link>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-gradient-card border border-border p-4 md:p-5">
              <div className={`size-10 rounded-xl bg-gradient-to-br ${s.tint} grid place-items-center mb-3 shadow-lg`}>
                <s.icon className="size-5 text-white" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-3xl font-bold">{s.value}</span>
                {s.unit && <span className="text-sm text-muted-foreground">{s.unit}</span>}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent quizzes */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-semibold">Quizzes recientes</h3>
          <Link to="/stats" className="text-sm text-primary hover:underline">Ver todo</Link>
        </div>
        <div className="space-y-2">
          {recent.map((q) => (
            <Link
              to="/result"
              key={q.topic}
              className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all group"
            >
              <div className="size-11 rounded-xl bg-gradient-primary/10 border border-primary/20 grid place-items-center text-lg font-bold text-primary shrink-0">
                {q.topic.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{q.topic}</div>
                <div className="text-xs text-muted-foreground flex gap-2 mt-0.5">
                  <span>{q.qs} preguntas</span> · <span>{q.difficulty}</span> · <span>{q.time}</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold ${scoreColor(q.score)}`}>{q.score}%</div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
