import {
  AlertTriangle,
  CheckCircle2,
  CircleCheck,
  CircleAlert,
  LayoutList,
  Zap,
  Target,
  Layers,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { AtsAnalysis, ComplianceCheck } from "@/utils/atsAlgorithm";
import { cn } from "@/lib/utils";

const CHECK_ICONS: Record<ComplianceCheck["id"], typeof Zap> = {
  formatting: LayoutList,
  actionVerbs: Zap,
  titleAlignment: Target,
  skillDensity: Layers,
};

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-40 shrink-0">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={r} className="fill-none stroke-secondary" strokeWidth="11" />
        <circle
          cx="60"
          cy="60"
          r={r}
          className="fill-none stroke-score transition-[stroke-dashoffset] duration-1000 ease-out"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (score / 100) * c}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-display text-5xl font-extrabold leading-none text-foreground">
            {score}
            <span className="text-2xl">%</span>
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Match Score
          </p>
        </div>
      </div>
    </div>
  );
}

interface AtsScoreCardProps {
  analysis: AtsAnalysis;
  optimizedScore: number;
}

export function AtsScoreCard({ analysis, optimizedScore }: AtsScoreCardProps) {
  const levelStyle = {
    strong: "bg-accent text-accent-foreground",
    medium: "bg-highlight text-highlight-foreground",
    low: "bg-highlight text-highlight-foreground ring-2 ring-score",
  }[analysis.level];

  return (
    <section id="diagnostico" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10 sm:px-6 print:hidden">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Diagnóstico ATS</p>
          <h2 className="mt-1 text-3xl font-extrabold text-foreground">Seu índice de compatibilidade</h2>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Score */}
        <Card className="shadow-soft">
          <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row lg:flex-col xl:flex-row">
            <ScoreRing score={analysis.score} />
            <div className="w-full space-y-4">
              <span className={cn("inline-flex rounded-full px-3 py-1 text-sm font-bold", levelStyle)}>
                {analysis.score}% - {analysis.verdict}
              </span>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Para a vaga <strong className="text-foreground">{analysis.jobTitle || "informada"}</strong>,
                seu currículo cobre {analysis.matched.length} de{" "}
                {analysis.matched.length + analysis.missing.length} palavras-chave identificadas.
              </p>
              <div className="rounded-lg border border-primary-glow/40 bg-accent p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 font-semibold text-accent-foreground">
                    <TrendingUp className="size-4" />
                    Versão otimizada (estimativa)
                  </span>
                  <span className="font-display text-lg font-extrabold text-foreground">{optimizedScore}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
                  <div
                    className="h-full rounded-full bg-score transition-all duration-1000"
                    style={{ width: `${optimizedScore}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Keywords */}
        <Card className="shadow-soft">
          <CardContent className="space-y-6 p-6">
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-foreground">
                <CheckCircle2 className="size-5 text-primary" />
                Palavras-Chave Correspondentes
                <span className="font-mono text-xs font-medium text-muted-foreground">
                  ({analysis.matched.length})
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.matched.length ? (
                  analysis.matched.map((k) => (
                    <Badge key={k.key} variant="match">
                      <CircleCheck className="size-3.5" />
                      {k.label}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma correspondência direta encontrada.</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="mb-1 flex items-center gap-2 text-base font-bold text-foreground">
                <AlertTriangle className="size-5 text-highlight-foreground" />
                Palavras-Chave Críticas Faltantes
                <span className="font-mono text-xs font-medium text-muted-foreground">
                  ({analysis.missing.length})
                </span>
              </h3>
              <p className="mb-3 text-xs text-muted-foreground">
                Adicionadas e destacadas na nova versão. Mantenha apenas as que você realmente domina.
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.missing.length ? (
                  analysis.missing.map((k) => (
                    <Badge key={k.key} variant="missing">
                      <CircleAlert className="size-3.5" />
                      {k.label}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma lacuna crítica. Excelente!</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance checklist */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {analysis.checks.map((check) => {
          const Icon = CHECK_ICONS[check.id];
          return (
            <Card
              key={check.id}
              className={cn(
                "shadow-soft",
                check.passed ? "border-primary-glow/40" : "border-score/60 bg-highlight/25",
              )}
            >
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-lg",
                      check.passed ? "bg-accent text-primary" : "bg-highlight text-highlight-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
                      check.passed ? "bg-accent text-accent-foreground" : "bg-highlight text-highlight-foreground",
                    )}
                  >
                    {check.passed ? "Aprovado" : "Atenção"}
                  </span>
                </div>
                <h4 className="text-sm font-bold leading-snug text-foreground">{check.label}</h4>
                <p className="text-xs leading-relaxed text-muted-foreground">{check.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
