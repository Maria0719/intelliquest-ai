import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Home, Plus, BarChart3, Brain } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { obtenerHistorial, calcularEstadisticas } from "@/servicios/almacenamiento";

const elementosNav = [
  { to: "/", etiqueta: "Inicio", icon: Home },
  { to: "/crear", etiqueta: "Crear", icon: Plus },
  { to: "/estadisticas", etiqueta: "Estadísticas", icon: BarChart3 },
];

export function Navegacion({ children }: { children?: ReactNode }) {
  const { pathname } = useLocation();
  const { racha } = calcularEstadisticas(obtenerHistorial());

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Barra lateral (escritorio) */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar border-r border-sidebar-border p-6 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2 mb-10">
          <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <Brain className="size-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">AprendeIA</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {elementosNav.map(({ to, etiqueta, icon: Icon }) => {
            const activo = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  activo
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-glow"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="size-4" /> {etiqueta}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-4">
          <div className="text-xs text-sidebar-foreground/60 mb-1">Racha actual</div>
          <div className="text-2xl font-bold text-gradient">🔥 {racha} día{racha !== 1 ? "s" : ""}</div>
        </div>
      </aside>

      {/* Barra superior (móvil) */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-sidebar sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-gradient-primary grid place-items-center">
            <Brain className="size-4 text-primary-foreground" />
          </div>
          <span className="font-bold">AprendeIA</span>
        </Link>
        <div className="text-sm font-medium text-gradient">🔥 {racha}</div>
      </header>

      <main className="flex-1 min-w-0 pb-24 md:pb-8">
        {children ?? <Outlet />}
      </main>

      {/* Navegación inferior (móvil) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-sidebar border-t border-sidebar-border">
        <div className="grid grid-cols-3">
          {elementosNav.map(({ to, etiqueta, icon: Icon }) => {
            const activo = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center justify-center py-3 text-xs gap-1 transition-colors",
                  activo ? "text-primary" : "text-sidebar-foreground/60"
                )}
              >
                <Icon className="size-5" />
                {etiqueta}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
