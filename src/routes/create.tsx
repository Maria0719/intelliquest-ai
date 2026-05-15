import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { Sparkles, Lightbulb, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/create")({ component: Create });

const difficulties = [
  { id: "easy", label: "Fácil", desc: "Conceptos básicos", color: "from-emerald-400 to-teal-500" },
  { id: "medium", label: "Media", desc: "Nivel intermedio", color: "from-blue-400 to-violet-500" },
  { id: "hard", label: "Difícil", desc: "Para expertos", color: "from-fuchsia-500 to-rose-500" },
];

const suggestions = ["Historia del arte", "Algoritmos", "Mitología griega", "Capitales del mundo", "Bioquímica"];

function Create() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(8);
  const [diff, setDiff] = useState("medium");

  return (
    <AppShell>
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
          {/* Topic */}
          <div>
            <label className="block text-sm font-medium mb-2">Tema del quiz</label>
            <div className="relative">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej. Imperio Romano, Python avanzado, Fotosíntesis..."
                className="w-full bg-input/50 border border-border rounded-xl px-4 py-3.5 pr-12 text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
              <Lightbulb className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTopic(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-accent/40 hover:text-accent-foreground border border-border transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Count slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Número de preguntas</label>
              <span className="text-2xl font-bold text-gradient">{count}</span>
            </div>
            <input
              type="range"
              min={3}
              max={15}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-secondary accent-[oklch(0.65_0.22_275)] cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>3 (rápido)</span>
              <span>15 (completo)</span>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium mb-3">Dificultad</label>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {difficulties.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDiff(d.id)}
                  className={cn(
                    "relative p-3 md:p-4 rounded-xl border text-left transition-all",
                    diff === d.id
                      ? "border-primary bg-primary/10 shadow-glow"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <div className={cn("size-8 rounded-lg bg-gradient-to-br mb-2", d.color)} />
                  <div className="font-semibold text-sm">{d.label}</div>
                  <div className="text-xs text-muted-foreground hidden md:block">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <Link
            to="/quiz"
            className={cn(
              "flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-glow transition-transform hover:scale-[1.02]",
              !topic && "opacity-50 pointer-events-none"
            )}
          >
            <Wand2 className="size-5" /> Generar con IA
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
