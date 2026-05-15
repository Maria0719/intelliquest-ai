import { createFileRoute, Link } from "@tanstack/react-router";
import { Navegacion } from "@/componentes/Navegacion";
import { Flame, BookOpen, Target, CheckCircle2, Sparkles, ChevronRight } from "lucide-react";
import { obtenerHistorial, calcularEstadisticas } from "@/servicios/almacenamiento";

export const Route = createFileRoute("/")({ component: Inicio });

function colorPuntaje(s: number) {
  if (s >= 85) return "text-success";
  if (s >= 60) return "text-warning";
  return "text-destructive";
}

function tiempoTranscurrido(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutos = Math.floor(diff / 60000);
  if (minutos < 2) return "Ahora";
  if (minutos < 60) return `Hace ${minutos}m`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas}h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return "Ayer";
  return `Hace ${dias} días`;
}

function Inicio() {
  const historial = obtenerHistorial();
  const { totalPreguntas, promedioGeneral, racha, temasEstudiados, totalQuizzes } = calcularEstadisticas(historial);
  const recientes = historial.slice(0, 5);

  const tarjetasEstadisticas = [
    {
      etiqueta: "Racha",
      valor: racha.toString(),
      unidad: "días",
      icon: Flame,
      color: "from-orange-400 to-pink-500",
    },
    {
      etiqueta: "Temas estudiados",
      valor: temasEstudiados.length.toString(),
      icon: BookOpen,
      color: "from-blue-400 to-indigo-500",
    },
    {
      etiqueta: "Promedio",
      valor: totalQuizzes > 0 ? promedioGeneral.toString() : "—",
      unidad: totalQuizzes > 0 ? "%" : "",
      icon: Target,
      color: "from-violet-400 to-purple-500",
    },
    {
      etiqueta: "Respondidas",
      valor: totalPreguntas.toString(),
      icon: CheckCircle2,
      color: "from-emerald-400 to-teal-500",
    },
  ];

  return (
    <Navegacion>
      <div className="px-4 md:px-10 py-6 md:py-10 max-w-6xl mx-auto">
        <div className="flex flex-col gap-1 mb-8">
          <p className="text-sm text-muted-foreground">¡Hola! 👋</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Listo para <span className="text-gradient">aprender algo nuevo</span> hoy.
          </h1>
        </div>

        {/* CTA principal */}
        <Link
          to="/crear"
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

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-10">
          {tarjetasEstadisticas.map((s) => (
            <div key={s.etiqueta} className="rounded-2xl bg-gradient-card border border-border p-4 md:p-5">
              <div className={`size-10 rounded-xl bg-gradient-to-br ${s.color} grid place-items-center mb-3 shadow-lg`}>
                <s.icon className="size-5 text-white" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-3xl font-bold">{s.valor}</span>
                {s.unidad && <span className="text-sm text-muted-foreground">{s.unidad}</span>}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.etiqueta}</div>
            </div>
          ))}
        </div>

        {/* Quizzes recientes */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-semibold">Quizzes recientes</h3>
          <Link to="/estadisticas" className="text-sm text-primary hover:underline">
            Ver todo
          </Link>
        </div>

        {recientes.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <div className="size-14 rounded-2xl bg-primary/10 grid place-items-center mx-auto mb-4">
              <Sparkles className="size-7 text-primary" />
            </div>
            <p className="font-semibold mb-1">Sin quizzes todavía</p>
            <p className="text-sm text-muted-foreground mb-4">
              Crea tu primer quiz con IA y empieza a aprender.
            </p>
            <Link
              to="/crear"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-glow"
            >
              Crear primer quiz
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recientes.map((q) => (
              <div key={q.id} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
                <div className="size-11 rounded-xl bg-gradient-primary/10 border border-primary/20 grid place-items-center text-lg font-bold text-primary shrink-0">
                  {q.topic.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{q.topic}</div>
                  <div className="text-xs text-muted-foreground flex gap-2 mt-0.5">
                    <span>{q.totalQuestions} preguntas</span> · <span>{q.difficulty}</span> ·{" "}
                    <span>{tiempoTranscurrido(q.date)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-xl font-bold ${colorPuntaje(q.percentage)}`}>{q.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Navegacion>
  );
}
