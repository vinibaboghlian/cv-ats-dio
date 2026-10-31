import { AlertCircle, Briefcase, FileText, Loader2, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { countWords, type ValidationErrors } from "@/utils/atsAlgorithm";
import { cn } from "@/lib/utils";

interface WorkspaceProps {
  resume: string;
  job: string;
  onResumeChange: (v: string) => void;
  onJobChange: (v: string) => void;
  onLoadSampleResume: () => void;
  onLoadSampleJob: () => void;
  onAnalyze: () => void;
  errors: ValidationErrors;
  loading: boolean;
  progress: number;
  stepLabel: string;
}

interface InputCardProps {
  icon: typeof FileText;
  step: string;
  title: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  sampleLabel: string;
  onSample: () => void;
  error?: string;
  showChars?: boolean;
  id: string;
}

function InputCard({
  icon: Icon,
  step,
  title,
  description,
  value,
  onChange,
  placeholder,
  sampleLabel,
  onSample,
  error,
  showChars,
  id,
}: InputCardProps) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col border-border shadow-soft transition-colors",
        error && "border-destructive/60",
      )}
    >
      <CardHeader className="gap-1 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-primary">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {step}
              </p>
              <CardTitle className="font-display text-lg">{title}</CardTitle>
            </div>
          </div>
          <Button variant="soft" size="sm" onClick={onSample} type="button">
            <Sparkles />
            {sampleLabel}
          </Button>
        </div>
        <CardDescription className="pt-1 text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        <label htmlFor={id} className="sr-only">
          {title}
        </label>
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={!!error}
          className="min-h-[340px] flex-1 resize-y bg-secondary text-sm leading-relaxed focus-visible:bg-background"
        />
        <div className="flex items-center justify-between gap-2 text-xs">
          {error ? (
            <span className="flex items-center gap-1.5 font-medium text-destructive">
              <AlertCircle className="size-3.5" />
              {error}
            </span>
          ) : (
            <span />
          )}
          <span className="shrink-0 font-mono text-muted-foreground">
            {countWords(value).toLocaleString("pt-BR")} palavras
            {showChars && ` · ${value.length.toLocaleString("pt-BR")} caracteres`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function Workspace(props: WorkspaceProps) {
  const resumeCard = (
    <InputCard
      id="resume-input"
      icon={FileText}
      step="Passo 01"
      title="Seu Currículo Atual"
      description="Texto completo, sem se preocupar com formatação."
      value={props.resume}
      onChange={props.onResumeChange}
      placeholder="Cole aqui todo o conteúdo do seu currículo atual (resumo, experiências, projetos, formação e habilidades)..."
      sampleLabel="Carregar Currículo de Exemplo"
      onSample={props.onLoadSampleResume}
      error={props.errors.resume}
      showChars
    />
  );
  const jobCard = (
    <InputCard
      id="job-input"
      icon={Briefcase}
      step="Passo 02"
      title="Descrição da Vaga Alvo"
      description="Requisitos, diferenciais e responsabilidades da vaga."
      value={props.job}
      onChange={props.onJobChange}
      placeholder="Cole aqui a descrição completa da oportunidade (requisitos técnicos, diferenciais e responsabilidades)..."
      sampleLabel="Carregar Vaga de Exemplo"
      onSample={props.onLoadSampleJob}
      error={props.errors.job}
    />
  );

  return (
    <section id="workspace" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10 sm:px-6 print:hidden">
      <div className="hidden gap-6 md:grid md:grid-cols-2">
        {resumeCard}
        {jobCard}
      </div>

      <Tabs defaultValue="resume" className="md:hidden">
        <TabsList className="mb-3 grid w-full grid-cols-2">
          <TabsTrigger value="resume">
            Currículo {props.errors.resume && <AlertCircle className="ml-1 size-3.5 text-destructive" />}
          </TabsTrigger>
          <TabsTrigger value="job">
            Vaga {props.errors.job && <AlertCircle className="ml-1 size-3.5 text-destructive" />}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="resume">{resumeCard}</TabsContent>
        <TabsContent value="job">{jobCard}</TabsContent>
      </Tabs>

      <div className="mt-8 flex flex-col items-center gap-4">
        <Button
          variant="hero"
          size="xl"
          onClick={props.onAnalyze}
          disabled={props.loading}
          className="w-full max-w-xl whitespace-normal"
        >
          {props.loading ? <Loader2 className="animate-spin" /> : <Wand2 />}
          Analisar Compatibilidade & Otimizar Currículo
        </Button>

        {props.loading && (
          <div
            className="w-full max-w-xl rounded-xl border border-border bg-secondary p-4"
            role="status"
            aria-live="polite"
          >
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{props.stepLabel}</span>
              <span className="font-mono text-muted-foreground">{Math.round(props.progress)}%</span>
            </div>
            <Progress value={props.progress} className="h-2 bg-accent" />
          </div>
        )}
      </div>
    </section>
  );
}
