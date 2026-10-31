import { resumeToPlainText, type OptimizedResume } from "./atsAlgorithm";

function fileSafe(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_|_$/g, "") || "Curriculo"
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/** Generates a real, editable .docx (Office Open XML) — opens in Word and Google Docs. */
export async function downloadDocx(resume: OptimizedResume): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } = await import("docx");
  const FONT = "Calibri";
  const ACCENT = "0284C7";

  const heading = (text: string) =>
    new Paragraph({
      spacing: { before: 240, after: 80 },
      border: { bottom: { color: ACCENT, size: 6, style: BorderStyle.SINGLE, space: 2 } },
      children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, font: FONT, color: "0F172A" })],
    });
  const body = (text: string, opts: { bold?: boolean; italics?: boolean } = {}) =>
    new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text, size: 20, font: FONT, color: "1E293B", ...opts })],
    });

  const children: InstanceType<typeof Paragraph>[] = [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text: resume.name.toUpperCase(), bold: true, size: 36, font: FONT, color: "0F172A" })],
    }),
  ];
  if (resume.headline)
    children.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: resume.headline, size: 24, font: FONT, color: ACCENT, bold: true })],
      }),
    );
  if (resume.contacts.length) children.push(body(resume.contacts.join("  |  ")));

  children.push(heading("Resumo Profissional"), body(resume.summary));

  if (resume.experiences.length) {
    children.push(heading("Experiência Profissional"));
    resume.experiences.forEach((exp) => {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 20 },
          children: [new TextRun({ text: exp.title, bold: true, size: 21, font: FONT, color: "0F172A" })],
        }),
      );
      exp.meta.forEach((m) => children.push(body(m, { italics: true })));
      exp.bullets.forEach((b) =>
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [new TextRun({ text: b, size: 20, font: FONT, color: "1E293B" })],
          }),
        ),
      );
    });
  }

  if (resume.skills.length) {
    children.push(heading("Habilidades Técnicas"), body(resume.skills.map((s) => s.label).join(" • ")));
  }

  resume.sections.forEach((s) => {
    children.push(heading(s.title));
    s.lines.forEach((l) => children.push(body(l)));
  });

  const doc = new Document({
    creator: "MatchCV",
    title: `Currículo — ${resume.name}`,
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4 in twips
            margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const typed = new Blob([blob], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8",
  });
  triggerDownload(typed, `Curriculo_${fileSafe(resume.name)}_MatchCV.docx`);
}

/** Opens the print dialog; @media print rules isolate the A4 sheet so users can "Save as PDF". */
export function printResumePdf(resume: OptimizedResume): void {
  const previous = document.title;
  document.title = `Curriculo_${fileSafe(resume.name)}_MatchCV`;
  const restore = () => {
    document.title = previous;
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);
  window.print();
}

export async function copyResumeText(resume: OptimizedResume): Promise<void> {
  await navigator.clipboard.writeText(resumeToPlainText(resume));
}
