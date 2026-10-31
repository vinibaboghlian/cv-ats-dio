import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Workspace } from "@/components/Workspace";
import { AtsScoreCard } from "@/components/AtsScoreCard";
import { ResumePreview } from "@/components/ResumePreview";
import { runFullAnalysis, validateInputs, type AnalysisResult, type ValidationErrors } from "@/utils/atsAlgorithm";
import { SAMPLE_JOB, SAMPLE_RESUME } from "@/utils/sampleData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MatchCV — Vença os robôs de RH com um currículo sob medida" },
      {
        name: "description",
        content:
          "Cole seu currículo e a vaga: o MatchCV calcula seu Match Score ATS, aponta palavras-chave faltantes e gera um currículo otimizado em DOCX e PDF.",
      },
      { property: "og:title", content: "MatchCV — ATS Matcher & Resume Tailor" },
      {
        property: "og:description",
        content: "Descubra seu índice de compatibilidade ATS e gere um currículo otimizado para a vaga, grátis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const DRAFT_KEY = "matchcv:draft:v1";
const STEPS = [
  "Identificando hard skills...",
  "Auditando pontuação ATS...",
  "Reestruturando tópicos de impacto...",
];
const STEP_MS = 850;

function Index() {
  const [resume, setResume] = useState("");
  const [job, setJob] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore local draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as { resume?: string; job?: string };
        setResume(draft.resume ?? "");
        setJob(draft.job ?? "");
      }
    } catch {
      /* ignore corrupted draft */
    }
    setHydrated(true);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  // Persist local draft
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ resume, job }));
  }, [resume, job, hydrated]);

  const updateResume = (v: string) => {
    setResume(v);
    if (errors.resume) setErrors((e) => ({ ...e, resume: undefined }));
  };
  const updateJob = (v: string) => {
    setJob(v);
    if (errors.job) setErrors((e) => ({ ...e, job: undefined }));
  };

  const analyze = () => {
    const validation = validateInputs(resume, job);
    if (validation) {
      setErrors(validation);
      toast.error("Faltam informações para a análise", {
        description: validation.resume ?? validation.job,
      });
      return;
    }
    setErrors({});
    setResult(null);
    setLoading(true);
    setProgress(4);
    setStepIndex(0);

    const total = STEPS.length * STEP_MS;
    const start = Date.now();
    timer.current = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(100, 4 + (elapsed / total) * 96));
      setStepIndex(Math.min(STEPS.length - 1, Math.floor(elapsed / STEP_MS)));
      if (elapsed >= total) {
        if (timer.current) clearInterval(timer.current);
        const computed = runFullAnalysis(resume, job);
        setResult(computed);
        setLoading(false);
        requestAnimationFrame(() =>
          document.getElementById("diagnostico")?.scrollIntoView({ behavior: "smooth" }),
        );
      }
    }, 60);
  };

  const resetAll = () => {
    if (timer.current) clearInterval(timer.current);
    setLoading(false);
    setResume("");
    setJob("");
    setErrors({});
    setResult(null);
    localStorage.removeItem(DRAFT_KEY);
    toast.success("Workspace limpo");
  };

  const newAnalysis = () => {
    setResult(null);
    document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" });
    toast("Textos mantidos para uma nova análise", {
      action: { label: "Limpar campos", onClick: resetAll },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onReset={resetAll} />
      <main>
        <Hero />
        <Workspace
          resume={resume}
          job={job}
          onResumeChange={updateResume}
          onJobChange={updateJob}
          onLoadSampleResume={() => updateResume(SAMPLE_RESUME)}
          onLoadSampleJob={() => updateJob(SAMPLE_JOB)}
          onAnalyze={analyze}
          errors={errors}
          loading={loading}
          progress={progress}
          stepLabel={STEPS[stepIndex]}
        />
        {result && (
          <>
            <AtsScoreCard analysis={result.analysis} optimizedScore={result.optimizedScore} />
            <ResumePreview resume={result.optimized} onNewAnalysis={newAnalysis} />
          </>
        )}
      </main>
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground print:hidden">
        MatchCV · Todo o processamento acontece no seu navegador. Nenhum dado é enviado a servidores.
      </footer>
    </div>
  );
}
