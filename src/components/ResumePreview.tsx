import { useState } from "react";
import { Copy, FileDown, FileType2, Loader2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { OptimizedResume } from "@/utils/atsAlgorithm";
import { copyResumeText, downloadDocx, printResumePdf } from "@/utils/exportHelpers";

interface ResumePreviewProps {
  resume: OptimizedResume;
  onNewAnalysis: () => void;
}

function SheetHeading({ children }: { children: string }) {
  return (
    <h3 className="mb-2 mt-5 border-b-2 border-primary pb-1 font-sans text-[12px] font-bold uppercase tracking-[0.14em] text-foreground">
      {children}
    </h3>
  );
}

export function ResumePreview({ resume, onNewAnalysis }: ResumePreviewProps) {
  const [docxLoading, setDocxLoading] = useState(false);
  const hasAdded = resume.skills.some((s) => s.added);

  const handleDocx = async () => {
    setDocxLoading(true);
    try {
      await downloadDocx(resume);
      toast.success("Arquivo DOCX gerado", { description: "Abra no Word ou Google Docs para editar." });
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível gerar o DOCX. Tente novamente.");
    } finally {
      setDocxLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await copyResumeText(resume);
      toast.success("Texto copiado!", { description: "Cole direto no formulário da Gupy ou similar." });
    } catch {
      toast.error("Seu navegador bloqueou a cópia. Selecione o texto manualmente.");
    }
  };

  return (
    <section id="curriculo" className="scroll-mt-20 bg-secondary py-12 print:bg-transparent print:py-0 print-plain">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 print:max-w-none print:p-0">
        <div className="mb-6 print:hidden">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Currículo otimizado</p>
          <h2 className="mt-1 text-3xl font-extrabold text-foreground">Sua nova versão, pronta para a vaga</h2>
          {hasAdded && (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Termos em <mark className="rounded bg-highlight px-1 text-highlight-foreground">amarelo</mark>{" "}
              foram adicionados a partir da vaga. O destaque some na exportação.
            </p>
          )}
        </div>

        {/* Export bar */}
        <div className="sticky top-16 z-20 mb-6 flex flex-wrap gap-2 rounded-xl border border-border bg-background/95 p-3 shadow-soft backdrop-blur print:hidden">
          <Button onClick={handleDocx} disabled={docxLoading}>
            {docxLoading ? <Loader2 className="animate-spin" /> : <FileType2 />}
            Baixar em DOCX (.docx)
          </Button>
          <Button onClick={() => printResumePdf(resume)} variant="subtle">
            <FileDown />
            Baixar em PDF (.pdf)
          </Button>
          <Button onClick={handleCopy} variant="subtle">
            <Copy />
            Copiar Texto Formatado
          </Button>
          <Button onClick={onNewAnalysis} variant="ghost" className="sm:ml-auto">
            <RefreshCcw />
            Fazer Nova Análise
          </Button>
        </div>

        {/* A4 sheet */}
        <div className="overflow-x-auto print:overflow-visible">
          <article id="resume-sheet" className="paper-a4 font-sans text-[12.5px] leading-[1.55]">
            <header>
              <h1 className="font-sans text-[26px] font-bold uppercase tracking-tight text-foreground">
                {resume.name}
              </h1>
              {resume.headline && (
                <p className="mt-0.5 text-[14px] font-semibold text-primary">{resume.headline}</p>
              )}
              {resume.contacts.length > 0 && (
                <p className="mt-1.5 text-[11.5px] text-muted-foreground">{resume.contacts.join("  |  ")}</p>
              )}
            </header>

            <SheetHeading>Resumo Profissional</SheetHeading>
            <p className="text-foreground/90">{resume.summary}</p>

            {resume.experiences.length > 0 && (
              <>
                <SheetHeading>Experiência Profissional</SheetHeading>
                <div className="space-y-3">
                  {resume.experiences.map((exp, i) => (
                    <div key={i} className="break-inside-avoid">
                      <p className="font-bold text-foreground">{exp.title}</p>
                      {exp.meta.map((m, j) => (
                        <p key={j} className="text-[11.5px] italic text-muted-foreground">
                          {m}
                        </p>
                      ))}
                      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-foreground/90 marker:text-primary">
                        {exp.bullets.map((b, j) => (
                          <li key={j}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}

            {resume.skills.length > 0 && (
              <>
                <SheetHeading>Habilidades Técnicas</SheetHeading>
                <p className="text-foreground/90">
                  {resume.skills.map((s, i) => (
                    <span key={s.label}>
                      <span
                        className={
                          s.added
                            ? "rounded-sm bg-highlight px-0.5 print:bg-transparent print:px-0"
                            : undefined
                        }
                      >
                        {s.label}
                      </span>
                      {i < resume.skills.length - 1 && <span className="text-muted-foreground"> • </span>}
                    </span>
                  ))}
                </p>
              </>
            )}

            {resume.sections.map((s) => (
              <div key={s.title} className="break-inside-avoid">
                <SheetHeading>{s.title}</SheetHeading>
                {s.lines.map((l, i) => (
                  <p key={i} className="text-foreground/90">
                    {l}
                  </p>
                ))}
              </div>
            ))}
          </article>
        </div>
      </div>
    </section>
  );
}
