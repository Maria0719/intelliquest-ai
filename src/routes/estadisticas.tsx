import { createFileRoute, Link } from "@tanstack/react-router";
import { Navegacion } from "@/componentes/Navegacion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { obtenerHistorial, calcularEstadisticas } from "@/servicios/almacenamiento";

export const Route = createFileRoute("/estadisticas")({ component: Estadisticas });

const NOMBRES_DIA = ["D", "L", "M", "X", "J", "V", "S"];

function nivelClase(n: number) {
  return ["bg-secondary/60", "bg-primary/20", "bg-primary/40", "bg-primary/70", "bg-primary shadow-glow"][n];
}

function Estadisticas() {
  const historial = obtenerHistorial();
  const { promedioGeneral, racha, totalQuizzes } = calcularEstadisticas(historial);

  // Datos de los últimos 7 días
  const datosSemanales = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const siguiente = new Date(d);
    siguiente.setDate(siguiente.getDate() + 1);

    const quizzesDelDia = historial.filter((r) => {
      const rd = new Date(r.date);
      return rd >= d && rd < siguiente;
    });

    return {
      d: NOMBRES_DIA[d.getDay()],
      score: quizzesDelDia.length
        ? Math.round(quizzesDelDia.reduce((s, r) => s + r.percentage, 0) / quizzesDelDia.length)
        : null,
    };
  });

  // Estadísticas por tema
  const mapaTopics = new Map<string, { cantidad: number; puntajes: number[] }>();
  historial.forEach((r) => {
    if (!mapaTopics.has(r.topic)) mapaTopics.set(r.topic, { cantidad: 0, puntajes: [] });
    const entrada = mapaTopics.get(r.topic)!;
    entrada.cantidad++;
    entrada.puntajes.push(r.percentage);
  });

  const estadisticasTemas = [...mapaTopics.entries()].map(([tema, { cantidad, puntajes }]) => ({
    tema,
    cantidad,
    promedio: Math.round(puntajes.reduce((a, b) => a + b, 0) / puntajes.length),
  }));

  const temasTopEstudiados = [...estadisticasTemas].sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);
  const maxCantidad = temasTopEstudiados[0]?.cantidad ?? 1;
  const temasDebiles = [...estadisticasTemas].filter((t) => t.promedio < 80).sort((a, b) => a.promedio - b.promedio).slice(0, 3);

  // Cuadrícula de actividad (12 semanas)
  const ahora = new Date();
  ahora.setHours(0, 0, 0, 0);
  const mapaActividad = new Map<number, number>();
  historial.forEach((r) => {
    const d = new Date(r.date);
    d.setHours(0, 0, 0, 0);
    mapaActividad.set(d.getTime(), (mapaActividad.get(d.getTime()) ?? 0) + 1);
  });

  const semanas = Array.from({ length: 12 }, (_, s) =>
    Array.from({ length: 7 }, (_, d) => {
      const dia = new Date(ahora);
      dia.setDate(dia.getDate() - (83 - (s * 7 + d)));
      return Math.min(mapaActividad.get(dia.getTime()) ?? 0, 4);
    })
  );

  const puntajesAnteriores = datosSemanales.slice(0, 6).map((d) => d.score ?? 0).filter(Boolean);
  const puntajeHoy = datosSemanales[6].score;
  const promAnterior = puntajesAnteriores.length
    ? Math.round(puntajesAnteriores.reduce((a, b) => a + b, 0) / puntajesAnteriores.length)
    : 0;
  const tendencia = puntajeHoy !== null ? puntajeHoy - promAnterior : null;

  if (totalQuizzes === 0) {
    return (
      <Navegacion>
        <div className="px-4 md:px-10 py-6 md:py-10 max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Mis estadísticas</h1>
          <p className="text-muted-foreground mb-8">Tu progreso de aprendizaje a lo largo del tiempo.</p>
          <div className="rounded-2xl bg-gradient-card border border-border p-12 text-center">
            <div className="size-16 rounded-2xl bg-primary/10 grid place-items-center mx-auto mb-4">
              <Sparkles className="size-8 text-primary" />
            </div>
            <p className="text-lg font-semibold mb-2">Sin datos todavía</p>
            <p className="text-muted-foreground text-sm mb-6">
              Completa tu primer quiz para ver tus estadísticas aquí.
            </p>
            <Link
              to="/crear"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-glow"
            >
              Crear primer quiz
            </Link>
          </div>
        </div>
      </Navegacion>
    );
  }

  return (
    <Navegacion>
      <div className="px-4 md:px-10 py-6 md:py-10 max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Mis estadísticas</h1>
        <p className="text-muted-foreground mb-8">Tu progreso de aprendizaje a lo largo del tiempo.</p>

        {/* Gráfica de progreso semanal */}
        <div className="rounded-2xl bg-gradient-card border border-border p-5 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Progreso semanal</h3>
              <p className="text-xs text-muted-foreground">Promedio de puntaje por día</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gradient">{promedioGeneral}%</div>
              {tendencia !== null && tendencia !== 0 && (
                <div className={cn(
                  "text-xs flex items-center gap-1 justify-end",
                  tendencia > 0 ? "text-success" : "text-destructive"
                )}>
                  {tendencia > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {tendencia > 0 ? "+" : ""}{tendencia}% hoy vs antes
                </div>
              )}
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={datosSemanales}>
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
                  formatter={(v) => (v !== null ? [`${v}%`, "Puntaje"] : ["Sin datos", ""])}
                />
                <Area type="monotone" dataKey="score" stroke="oklch(0.70 0.22 295)" strokeWidth={3} fill="url(#g)" connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Temas más estudiados */}
          <div className="rounded-2xl bg-gradient-card border border-border p-5 md:p-6">
            <h3 className="font-semibold mb-4">Temas más estudiados</h3>
            <div className="space-y-4">
              {temasTopEstudiados.map((t) => (
                <div key={t.tema}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium truncate">{t.tema}</span>
                    <span className="text-muted-foreground ml-2 shrink-0">
                      {t.cantidad} quiz{t.cantidad !== 1 ? "zes" : ""}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${(t.cantidad / maxCantidad) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Temas a reforzar */}
          <div className="rounded-2xl bg-gradient-card border border-border p-5 md:p-6">
            <h3 className="font-semibold mb-1">A reforzar</h3>
            <p className="text-xs text-muted-foreground mb-4">Temas donde tu puntaje promedio es bajo</p>
            {temasDebiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <p className="font-medium text-sm">¡Sin puntos débiles!</p>
                <p className="text-xs text-muted-foreground mt-1">Todos tus temas tienen +80%</p>
              </div>
            ) : (
              <div className="space-y-3">
                {temasDebiles.map((t) => (
                  <div key={t.tema} className="flex items-center justify-between p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-9 rounded-lg bg-destructive/20 grid place-items-center shrink-0">
                        <TrendingDown className="size-4 text-destructive" />
                      </div>
                      <span className="font-medium text-sm truncate">{t.tema}</span>
                    </div>
                    <span className="text-destructive font-bold ml-2 shrink-0">{t.promedio}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cuadrícula de racha de actividad */}
        <div className="rounded-2xl bg-gradient-card border border-border p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Racha de actividad</h3>
              <p className="text-xs text-muted-foreground">Últimas 12 semanas</p>
            </div>
            <div className="text-sm text-muted-foreground">
              🔥 <span className="font-bold text-foreground">{racha} día{racha !== 1 ? "s" : ""}</span> seguidos
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {semanas.map((semana, si) => (
              <div key={si} className="flex flex-col gap-1">
                {semana.map((nivel, di) => (
                  <div key={di} className={cn("size-3.5 md:size-4 rounded-sm transition", nivelClase(nivel))} />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            Menos
            {[0, 1, 2, 3, 4].map((n) => (
              <div key={n} className={cn("size-3 rounded-sm", nivelClase(n))} />
            ))}
            Más
          </div>
        </div>
      </div>
    </Navegacion>
  );
}
