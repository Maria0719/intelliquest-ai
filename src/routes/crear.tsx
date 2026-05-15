import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navegacion } from "@/componentes/Navegacion";
import { useState } from "react";
import { Sparkles, Lightbulb, Wand2, Key, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { obtenerApiKey, guardarApiKey, guardarQuizActivo } from "@/servicios/almacenamiento";
import { generarQuiz } from "@/servicios/openai";

export const Route = createFileRoute("/crear")({ component: Crear });

const dificultades = [
  { id: "Fácil", etiqueta: "Fácil", desc: "Conceptos básicos", color: "from-emerald-400 to-teal-500" },
  { id: "Media", etiqueta: "Media", desc: "Nivel intermedio", color: "from-blue-400 to-violet-500" },
  { id: "Difícil", etiqueta: "Difícil", desc: "Para expertos", color: "from-fuchsia-500 to-rose-500" },
];

const sugerencias = ["Historia del arte", "Algoritmos", "Mitología griega", "Capitales del mundo", "Bioquímica"];

function Crear() {
  const navigate = useNavigate();
  const [tema, setTema] = useState("");
  const [cantidad, setCantidad] = useState(8);
  const [dificultad, setDificultad] = useState("Media");
  const [apiKey, setApiKey] = useState(() => obtenerApiKey());
  const [mostrarKey, setMostrarKey] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const puedeGenerar = tema.trim().length > 0 && apiKey.trim().length > 0 && !cargando;

  const handleGenerar = async () => {
    if (!puedeGenerar) return;
    setCargando(true);
    setError(null);
    guardarApiKey(apiKey.trim());
    try {
      const preguntas = await generarQuiz(apiKey.trim(), tema.trim(), cantidad, dificultad);
      guardarQuizActivo({ topic: tema.trim(), difficulty: dificultad, questions: preguntas });
      navigate({ to: "/quiz" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al generar el quiz. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Navegacion>
      <div className="px-4 md:px-10 py-6 md:py-10 max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 text-primary px-3 py-1 text-xs font-medium mb-3">
            <Sparkles className="size-3.5" /> Crear quiz
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            ¿Sobre qué quieres <span className="text-gradient">aprender</span>?
          </h1>
          <p className="text-muted-foreground mt-2">La IA generará preguntas únicas adaptadas a tu nivel.</p>
        </div>

        <div className="space-y-6 rounded-2xl bg-gradient-card border border-border p-5 md:p-7">
          {/* API Key */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Key className="size-4 text-muted-foreground" /> OpenAI API Key
            </label>
            <div className="relative">
              <input
                type={mostrarKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-input/50 border border-border rounded-xl px-4 py-3.5 pr-12 text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setMostrarKey((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
              >
                {mostrarKey ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Se guarda en tu dispositivo. Nunca se envía a nuestros servidores.
            </p>
          </div>

          {/* Tema */}
          <div>
            <label className="block text-sm font-medium mb-2">Tema del quiz</label>
            <div className="relative">
              <input
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerar()}
                placeholder="Ej. Imperio Romano, Python avanzado, Fotosíntesis..."
                className="w-full bg-input/50 border border-border rounded-xl px-4 py-3.5 pr-12 text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
              <Lightbulb className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {sugerencias.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTema(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-accent/40 hover:text-accent-foreground border border-border transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Número de preguntas</label>
              <span className="text-2xl font-bold text-gradient">{cantidad}</span>
            </div>
            <input
              type="range"
              min={3}
              max={15}
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-secondary accent-[oklch(0.65_0.22_275)] cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>3 (rápido)</span>
              <span>15 (completo)</span>
            </div>
          </div>

          {/* Dificultad */}
          <div>
            <label className="block text-sm font-medium mb-3">Dificultad</label>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {dificultades.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDificultad(d.id)}
                  className={cn(
                    "relative p-3 md:p-4 rounded-xl border text-left transition-all",
                    dificultad === d.id
                      ? "border-primary bg-primary/10 shadow-glow"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <div className={cn("size-8 rounded-lg bg-gradient-to-br mb-2", d.color)} />
                  <div className="font-semibold text-sm">{d.etiqueta}</div>
                  <div className="text-xs text-muted-foreground hidden md:block">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
              <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <button
            onClick={handleGenerar}
            disabled={!puedeGenerar}
            className={cn(
              "flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-glow transition-all",
              puedeGenerar ? "hover:scale-[1.02]" : "opacity-50 cursor-not-allowed"
            )}
          >
            {cargando ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Generando quiz...
              </>
            ) : (
              <>
                <Wand2 className="size-5" /> Generar con IA
              </>
            )}
          </button>
        </div>
      </div>
    </Navegacion>
  );
}
