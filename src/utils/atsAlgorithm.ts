/**
 * MatchCV ATS engine — 100% client-side heuristics.
 * Extracts job keywords, scores the resume against ATS criteria and
 * rebuilds an optimized, linear (ATS-friendly) resume.
 */

export interface Keyword {
  label: string;
  key: string;
}

export interface ComplianceCheck {
  id: "formatting" | "actionVerbs" | "titleAlignment" | "skillDensity";
  label: string;
  passed: boolean;
  detail: string;
  /** 0..1 */
  value: number;
}

export type MatchLevel = "strong" | "medium" | "low";

export interface AtsAnalysis {
  score: number;
  level: MatchLevel;
  verdict: string;
  matched: Keyword[];
  missing: Keyword[];
  checks: ComplianceCheck[];
  jobTitle: string;
}

export interface ResumeExperience {
  title: string;
  meta: string[];
  bullets: string[];
}

export interface ResumeSkill {
  label: string;
  /** true when the term came from the job description and was not in the original resume */
  added: boolean;
}

export interface ResumeSection {
  title: string;
  lines: string[];
}

export interface OptimizedResume {
  name: string;
  headline: string;
  contacts: string[];
  summary: string;
  experiences: ResumeExperience[];
  skills: ResumeSkill[];
  sections: ResumeSection[];
}

export interface AnalysisResult {
  analysis: AtsAnalysis;
  optimized: OptimizedResume;
  optimizedScore: number;
}

export interface ValidationErrors {
  resume?: string | undefined;
  job?: string | undefined;
}

/* ------------------------------------------------------------------ */
/* Text helpers                                                        */
/* ------------------------------------------------------------------ */

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whole-term match on normalized text (handles terms like "c#", "node.js", "ci/cd"). */
export function containsTerm(normText: string, normTerm: string): boolean {
  const re = new RegExp(`(?:^|[^a-z0-9+#])${escapeRegex(normTerm)}(?=$|[^a-z0-9+#])`);
  return re.test(normText);
}

function formatList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`;
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/* ------------------------------------------------------------------ */
/* Dictionaries                                                        */
/* ------------------------------------------------------------------ */

/** [Label, ...extra normalized aliases]. The normalized label is always an alias. */
const SKILL_DICTIONARY: string[][] = [
  // Front-end / web
  ["React", "react.js", "reactjs"],
  ["TypeScript", "ts"],
  ["JavaScript", "js", "ecmascript", "es6"],
  ["Next.js", "nextjs", "next js"],
  ["Vue.js", "vue", "vuejs"],
  ["Angular", "angularjs"],
  ["Svelte"],
  ["HTML", "html5"],
  ["CSS", "css3"],
  ["Sass", "scss"],
  ["Tailwind CSS", "tailwind", "tailwindcss"],
  ["Redux"],
  ["jQuery"],
  ["Front-end", "frontend", "front end"],
  ["Back-end", "backend", "back end"],
  ["Full-stack", "fullstack", "full stack"],
  ["Design system", "design systems"],
  ["Storybook"],
  ["Acessibilidade", "accessibility", "a11y"],
  ["WCAG"],
  ["Performance web", "web performance", "otimizacao de performance"],
  ["Core Web Vitals"],
  ["SSR", "server side rendering", "renderizacao no servidor"],
  ["SEO"],
  ["PWA"],
  ["Webpack"],
  ["Vite"],
  // Back-end & data
  ["Node.js", "nodejs", "node"],
  ["Express"],
  ["NestJS", "nest.js"],
  ["Python"],
  ["Django"],
  ["Flask"],
  ["FastAPI"],
  ["Java"],
  ["Spring Boot", "spring"],
  ["Kotlin"],
  ["C#", "csharp"],
  [".NET", "dotnet", "asp.net"],
  ["PHP"],
  ["Laravel"],
  ["Ruby on Rails", "rails", "ruby"],
  ["Golang", "go lang"],
  ["Rust"],
  ["SQL"],
  ["PostgreSQL", "postgres"],
  ["MySQL"],
  ["MongoDB", "mongo"],
  ["Redis"],
  ["GraphQL"],
  ["APIs REST", "api rest", "apis rest", "rest api", "rest apis", "restful", "api restful"],
  ["Microsserviços", "microservicos", "microservices"],
  ["Mensageria", "kafka", "rabbitmq"],
  // Cloud / DevOps
  ["AWS", "amazon web services"],
  ["Azure"],
  ["GCP", "google cloud"],
  ["Docker"],
  ["Kubernetes", "k8s"],
  ["Terraform"],
  ["CI/CD", "ci cd", "integracao continua"],
  ["GitHub Actions"],
  ["Linux"],
  ["Git", "github", "gitlab"],
  // Quality
  ["Jest"],
  ["Testing Library", "react testing library"],
  ["Cypress"],
  ["Playwright"],
  ["Testes unitários", "testes unitarios", "teste unitario", "unit tests", "unit testing"],
  ["Testes de integração", "testes de integracao", "integration tests"],
  ["TDD"],
  ["Code review", "code reviews", "revisao de codigo"],
  ["Clean Code"],
  ["SOLID"],
  // Data / BI
  ["Power BI", "powerbi"],
  ["Excel", "excel avancado"],
  ["Tableau"],
  ["Looker"],
  ["Pandas"],
  ["Machine Learning", "aprendizado de maquina"],
  ["Data Analytics", "analise de dados"],
  ["ETL"],
  ["Google Analytics"],
  // Product / design / business
  ["Figma"],
  ["UX", "ux design", "experiencia do usuario"],
  ["UI", "ui design"],
  ["Metodologias ágeis", "metodologias ageis", "metodologia agil", "agile"],
  ["Scrum"],
  ["Kanban"],
  ["Jira"],
  ["OKRs", "okr"],
  ["KPIs", "kpi", "indicadores de desempenho"],
  ["Gestão de projetos", "gestao de projetos", "project management"],
  ["Gestão de stakeholders", "gestao de stakeholders", "stakeholders"],
  ["CRM"],
  ["Salesforce"],
  ["SAP"],
  ["Marketing digital"],
  ["SaaS"],
  ["B2B"],
  // Soft skills & languages
  ["Liderança", "lideranca", "leadership"],
  ["Comunicação", "comunicacao", "communication"],
  ["Trabalho em equipe", "teamwork"],
  ["Resolução de problemas", "resolucao de problemas", "problem solving"],
  ["Inglês", "ingles", "english"],
  ["Espanhol", "espanhol", "spanish"],
];

const ACTION_VERBS = [
  "desenvolvi", "implementei", "criei", "liderei", "conduzi", "gerenciei", "otimizei",
  "reduzi", "aumentei", "automatizei", "projetei", "entreguei", "coordenei", "estruturei",
  "migrei", "integrei", "construi", "lancei", "melhorei", "contribui", "executei",
  "analisei", "planejei", "negociei", "treinei", "mentorei", "arquitetei", "padronizei",
  "refatorei", "colaborei", "apoiei", "conquistei", "economizei", "escalei", "modernizei",
  "built", "developed", "led", "implemented", "created", "designed", "managed",
  "improved", "reduced", "increased", "delivered", "launched", "optimized", "automated",
];

const STOPWORDS = new Set(
  (
    "a o e de da do das dos em no na nos nas um uma com para por pelo pela que se ou ao aos as os " +
    "como mais sua seu suas seus nosso nossa nossos nossas voce ser ter sobre entre ate tambem " +
    "experiencia experiencias conhecimento conhecimentos requisitos requisito desejavel desejaveis " +
    "diferenciais diferencial responsabilidades atividades vaga vagas empresa empresas equipe time " +
    "trabalho area areas pessoa pessoas buscamos procuramos voce oportunidade beneficios solida " +
    "vivencia anos ano nivel forma bem novas novos nova novo todo toda todos todas parte junto " +
    "dia dias pleno senior junior remoto hibrido presencial cargo local salario contratacao " +
    "the and for with you our are will your from this that have has team work role about " +
    "plataforma produto produtos servicos clientes cliente usuarios processos desenvolvimento " +
    "manter criar desenvolver participar escrever integrar contribuir apoiar garantir " +
    "atuar atuacao possuir dominio boas pratica praticas moderno moderna modernos"
  ).split(/\s+/),
);

const SECTION_ALIASES: Record<string, string[]> = {
  summary: [
    "resumo", "resumo profissional", "perfil", "perfil profissional", "objetivo",
    "objetivo profissional", "sobre", "sobre mim", "summary", "profile", "about", "about me",
  ],
  experience: [
    "experiencia", "experiencias", "experiencia profissional", "experiencias profissionais",
    "historico profissional", "experience", "work experience", "professional experience",
  ],
  education: [
    "formacao", "formacao academica", "educacao", "escolaridade", "education",
  ],
  skills: [
    "habilidades", "habilidades tecnicas", "competencias", "competencias tecnicas",
    "skills", "technical skills", "tecnologias", "stack", "conhecimentos", "hard skills",
  ],
  languages: ["idiomas", "idioma", "languages"],
  certifications: [
    "certificacoes", "certificados", "cursos", "cursos e certificacoes",
    "certificacoes e cursos", "certifications", "cursos complementares",
  ],
  projects: ["projetos", "projetos relevantes", "projects"],
};

const SECTION_TITLES: Record<string, string> = {
  education: "Formação Acadêmica",
  certifications: "Certificações e Cursos",
  projects: "Projetos",
  languages: "Idiomas",
};

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export const MIN_RESUME_WORDS = 30;
export const MIN_JOB_WORDS = 15;

export function validateInputs(resume: string, job: string): ValidationErrors | null {
  const errors: ValidationErrors = {};
  if (!resume.trim()) errors.resume = "Cole o conteúdo do seu currículo para continuar.";
  else if (countWords(resume) < MIN_RESUME_WORDS)
    errors.resume = `Seu currículo parece incompleto (mínimo de ${MIN_RESUME_WORDS} palavras).`;

  if (!job.trim()) errors.job = "Cole a descrição da vaga para continuar.";
  else if (countWords(job) < MIN_JOB_WORDS)
    errors.job = `A descrição da vaga está muito curta (mínimo de ${MIN_JOB_WORDS} palavras).`;

  return errors.resume || errors.job ? errors : null;
}

/* ------------------------------------------------------------------ */
/* Keyword extraction                                                  */
/* ------------------------------------------------------------------ */

function dictionaryMatches(normText: string): Keyword[] {
  const found: Keyword[] = [];
  for (const [label, ...aliases] of SKILL_DICTIONARY) {
    const all = [normalize(label), ...aliases];
    if (all.some((a) => containsTerm(normText, a))) {
      found.push({ label, key: normalize(label) });
    }
  }
  return found;
}

function genericJobTerms(job: string, exclude: Set<string>): Keyword[] {
  const counts = new Map<string, { count: number; label: string }>();
  const tokens = job.toLowerCase().split(/[^\p{L}0-9+#-]+/u);
  for (const raw of tokens) {
    const token = raw.replace(/^-+|-+$/g, "");
    const key = normalize(token);
    if (key.length < 5 || STOPWORDS.has(key) || /^\d+$/.test(key)) continue;
    const entry = counts.get(key);
    if (entry) entry.count += 1;
    else counts.set(key, { count: 1, label: token });
  }
  const isCovered = (key: string) =>
    [...exclude].some((ex) => ex === key || ex.includes(key) || key.includes(ex));
  return [...counts.entries()]
    .filter(([key, v]) => v.count >= 3 && !isCovered(key))
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([key, v]) => ({ key, label: capitalize(v.label) }));
}

export function extractJobKeywords(job: string): Keyword[] {
  const normJob = normalize(job);
  const dict = dictionaryMatches(normJob);
  const exclude = new Set<string>();
  for (const [label, ...aliases] of SKILL_DICTIONARY) {
    if (dict.some((d) => d.label === label)) {
      exclude.add(normalize(label));
      aliases.forEach((a) => exclude.add(a));
    }
  }
  return [...dict, ...genericJobTerms(job, exclude)];
}

function keywordInText(normText: string, kw: Keyword): boolean {
  const entry = SKILL_DICTIONARY.find(([label]) => label === kw.label);
  const aliases = entry ? [normalize(entry[0]), ...entry.slice(1)] : [kw.key];
  return aliases.some((a) => containsTerm(normText, a));
}

export function extractJobTitle(job: string): string {
  const first = job
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  if (!first) return "";
  const cleaned = first
    .replace(/^(vaga|cargo|t[ií]tulo|posi[cç][aã]o|job title|position)\s*[:\-–]\s*/i, "")
    .replace(/[|–—].*$/, "")
    .trim();
  return cleaned.length > 70 ? cleaned.slice(0, 70).trim() : cleaned;
}

/* ------------------------------------------------------------------ */
/* Scoring                                                             */
/* ------------------------------------------------------------------ */

export function scoreToVerdict(score: number): { level: MatchLevel; verdict: string } {
  if (score >= 75) return { level: "strong", verdict: "Forte Compatibilidade" };
  if (score >= 50) return { level: "medium", verdict: "Compatibilidade Média" };
  return { level: "low", verdict: "Risco Alto de Triagem" };
}

export function analyzeAts(resume: string, job: string): AtsAnalysis {
  const normResume = normalize(resume);
  const keywords = extractJobKeywords(job);
  const matched = keywords.filter((k) => keywordInText(normResume, k));
  const missing = keywords.filter((k) => !keywordInText(normResume, k));
  const coverage = keywords.length ? matched.length / keywords.length : 0.5;

  // 1. Linear formatting
  const pipes = (resume.match(/\|/g) ?? []).length;
  const lines = Math.max(resume.split(/\n/).length, 1);
  const tabs = (resume.match(/\t/g) ?? []).length;
  const boxChars = /[┌┐└┘├┤┬┴┼─│═║╔╗╚╝]/.test(resume);
  const emojis = /\p{Extended_Pictographic}/u.test(resume);
  const tableLike = pipes / lines > 0.6 || tabs > 6 || boxChars;
  const formattingValue = tableLike ? 0.2 : emojis ? 0.6 : 1;

  // 2. Action verbs
  const verbsFound = ACTION_VERBS.filter((v) => containsTerm(normResume, v));
  const verbsValue = Math.min(verbsFound.length / 5, 1);

  // 3. Title alignment
  const jobTitle = extractJobTitle(job);
  const titleWords = normalize(jobTitle)
    .replace(/\(a\)|\(o\)/g, "")
    .split(/[^a-z0-9+#.-]+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  const titleHits = titleWords.filter((w) => containsTerm(normResume, w)).length;
  const titleValue = titleWords.length ? titleHits / titleWords.length : 0.5;

  // 4. Skill density
  const resumeSkills = dictionaryMatches(normResume).length;
  const densityValue = Math.min(resumeSkills / 10, 1);

  const raw =
    0.6 * coverage + 0.12 * verbsValue + 0.13 * titleValue + 0.05 * formattingValue + 0.1 * densityValue;
  const score = Math.max(0, Math.min(100, Math.round(raw * 100)));
  const { level, verdict } = scoreToVerdict(score);

  const checks: ComplianceCheck[] = [
    {
      id: "formatting",
      label: "Formatação Linear (sem tabelas complexas)",
      passed: formattingValue >= 1,
      value: formattingValue,
      detail: tableLike
        ? "Detectamos estrutura de tabela/colunas. Robôs ATS podem embaralhar o conteúdo."
        : emojis
          ? "Há emojis ou símbolos especiais. Prefira texto simples."
          : "Estrutura em texto corrido, legível por qualquer ATS.",
    },
    {
      id: "actionVerbs",
      label: "Verbos de Ação Presentes",
      passed: verbsFound.length >= 3,
      value: verbsValue,
      detail:
        verbsFound.length >= 3
          ? `${verbsFound.length} verbos de impacto encontrados.`
          : `Apenas ${verbsFound.length} verbo(s) de impacto. Comece tópicos com "Desenvolvi", "Liderei", "Reduzi"...`,
    },
    {
      id: "titleAlignment",
      label: "Alinhamento de Título",
      passed: titleValue >= 0.6,
      value: titleValue,
      detail:
        titleValue >= 0.6
          ? `Seu currículo reflete o cargo "${jobTitle}".`
          : `O cargo "${jobTitle}" não aparece claramente no seu currículo.`,
    },
    {
      id: "skillDensity",
      label: "Densidade de Habilidades",
      passed: resumeSkills >= 8,
      value: densityValue,
      detail:
        resumeSkills >= 8
          ? `${resumeSkills} competências técnicas reconhecidas.`
          : `Somente ${resumeSkills} competências reconhecidas. O ideal é 8 ou mais.`,
    },
  ];

  return { score, level, verdict, matched, missing, checks, jobTitle };
}

/* ------------------------------------------------------------------ */
/* Resume parsing & rewriting                                          */
/* ------------------------------------------------------------------ */

const BULLET_RE = /^\s*[-•*▪–·●◦>]\s*/;

function detectSection(line: string): string | null {
  const key = normalize(line)
    .replace(/[:\-–—_=#*]+$/g, "")
    .replace(/^[#*\s]+/, "")
    .trim();
  if (!key || key.length > 40) return null;
  for (const [section, aliases] of Object.entries(SECTION_ALIASES)) {
    if (aliases.includes(key)) return section;
  }
  return null;
}

function isContactLine(line: string): boolean {
  return /@|https?:|linkedin|github\.com|\(\d{2}\)|\+\d|\d{4,}|www\.|\b[A-Z]{2}\b\s*$|,\s*[A-Z]{2}\b/i.test(line);
}

interface ParsedResume {
  header: string[];
  sections: Record<string, string[]>;
  order: string[];
}

function parseResume(text: string): ParsedResume {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const header: string[] = [];
  const sections: Record<string, string[]> = {};
  const order: string[] = [];
  let current: string | null = null;
  for (const line of lines) {
    const section = detectSection(line);
    if (section) {
      current = section;
      if (!sections[section]) {
        sections[section] = [];
        order.push(section);
      }
      continue;
    }
    if (!line) continue;
    if (current) sections[current].push(line);
    else header.push(line);
  }
  return { header, sections, order };
}

const WEAK_STARTS: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
  [
    /^(?:fui |era )?respons[aá]vel (pelo|pela|pelos|pelas|por)\s+/i,
    (m) => {
      const map: Record<string, string> = { pelo: "o ", pela: "a ", pelos: "os ", pelas: "as ", por: "" };
      return `Conduzi ${map[m[1].toLowerCase()]}`;
    },
  ],
  [/^trabalh(?:ei|ava) com\s+/i, () => "Colaborei com "],
  [/^trabalh(?:ei|ava) (?:em|no|na)\s+/i, () => "Atuei em "],
  [
    /^particip(?:ei|ava) (de|do|da|dos|das|em|no|na|nos|nas)\s+/i,
    (m) => {
      const map: Record<string, string> = {
        de: "em", do: "no", da: "na", dos: "nos", das: "nas", em: "em", no: "no", na: "na", nos: "nos", nas: "nas",
      };
      return `Atuei ativamente ${map[m[1].toLowerCase()]} `;
    },
  ],
  [
    /^ajud(?:ei|ava)(?: (a|na|no|nas|nos|em|com))?\s+/i,
    (m) => {
      const map: Record<string, string> = { a: "para ", na: "para a ", no: "para o ", nas: "para as ", nos: "para os ", em: "em ", com: "com " };
      return `Contribuí ${m[1] ? map[m[1].toLowerCase()] : "para "}`;
    },
  ],
  [
    /^cuid(?:ei|ava) (de|da|do|das|dos)\s+/i,
    (m) => {
      const map: Record<string, string> = { de: "", da: "a ", do: "o ", das: "as ", dos: "os " };
      return `Gerenciei ${map[m[1].toLowerCase()]}`;
    },
  ],
  [/^(?:fazia|fiz)\s+/i, () => "Desenvolvi "],
  [/^auxili(?:ei|ava)\s+/i, () => "Apoiei "],
  [/^mantinha\s+/i, () => "Mantive "],
  [/^escrevia\s+/i, () => "Escrevi "],
  [/^desenvolvia\s+/i, () => "Desenvolvi "],
  [/^dava suporte\s+/i, () => "Prestei suporte "],
  [/^(\p{L}{3,})ava\s+/iu, (m) => `${capitalize(m[1].toLowerCase())}ei `],
];

export function rewriteBullet(raw: string): string {
  let text = raw.replace(BULLET_RE, "").trim().replace(/[;.,]+$/, "");
  for (const [re, replace] of WEAK_STARTS) {
    const m = text.match(re);
    if (m) {
      text = replace(m) + text.slice(m[0].length);
      break;
    }
  }
  return capitalize(text.trim()) + ".";
}

function parseExperiences(lines: string[]): ResumeExperience[] {
  const out: ResumeExperience[] = [];
  let cur: ResumeExperience | null = null;
  for (const line of lines) {
    const isBullet = BULLET_RE.test(line);
    if (isBullet) {
      if (!cur) {
        cur = { title: "Experiência", meta: [], bullets: [] };
        out.push(cur);
      }
      cur.bullets.push(rewriteBullet(line));
      continue;
    }
    if (cur && cur.bullets.length === 0 && line.length <= 100) {
      cur.meta.push(line);
    } else if (cur && line.length > 100) {
      cur.bullets.push(rewriteBullet(line));
    } else {
      cur = { title: line, meta: [], bullets: [] };
      out.push(cur);
    }
  }
  return out;
}

function splitSkills(lines: string[]): string[] {
  return lines
    .flatMap((l) => l.replace(BULLET_RE, "").split(/[,;|•·\/]|\s-\s/))
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter((s) => s.length > 1 && s.length < 50);
}

function firstSentences(text: string, max: number): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  return sentences
    .slice(0, max)
    .map((s) => s.trim())
    .join(" ")
    .trim();
}

export function buildOptimizedResume(resume: string, job: string, analysis: AtsAnalysis): OptimizedResume {
  const parsed = parseResume(resume);
  const [nameLine = "Seu Nome", ...restHeader] = parsed.header;
  const contacts: string[] = [];
  for (const line of restHeader) {
    if (isContactLine(line)) {
      contacts.push(
        ...line
          .split(/\s*[|•·]\s*/)
          .map((s) => s.trim())
          .filter(Boolean),
      );
    }
  }

  const headline = analysis.jobTitle.replace(/\s*\((a|o)\)/gi, "") || restHeader[0] || "";

  // Summary targeted at the role
  const originalSummary = firstSentences((parsed.sections['summary'] ?? []).join(" "), 2);
  const topMatched = analysis.matched.slice(0, 5).map((k) => k.label);
  const focus = analysis.missing.slice(0, 3).map((k) => k.label);
  const parts: string[] = [];
  if (topMatched.length) {
    parts.push(`${headline || "Profissional"} com experiência prática em ${formatList(topMatched)}.`);
  } else if (headline) {
    parts.push(`Profissional com foco em ${headline}.`);
  }
  if (originalSummary) parts.push(originalSummary.endsWith(".") ? originalSummary : `${originalSummary}.`);
  parts.push(
    focus.length
      ? `Perfil alinhado aos requisitos da vaga, com interesse direto em ${formatList(focus)} e orientação a resultados mensuráveis.`
      : "Perfil alinhado aos requisitos da vaga e orientado a resultados mensuráveis.",
  );

  // Skills: job-relevant first, then additions, then the rest of the original list
  const originalSkills = splitSkills(parsed.sections['skills'] ?? []);
  const seen = new Set<string>();
  const skills: ResumeSkill[] = [];
  const push = (label: string, added: boolean) => {
    const key = normalize(label);
    if (seen.has(key)) return;
    seen.add(key);
    skills.push({ label, added });
  };
  analysis.matched.forEach((k) => push(k.label, false));
  analysis.missing.forEach((k) => push(k.label, true));
  originalSkills.forEach((s) => {
    const key = normalize(s);
    const dup = analysis.matched.some((k) => keywordInText(key, k));
    if (!dup) push(s, false);
  });

  const sections: ResumeSection[] = [];
  for (const key of ["education", "certifications", "projects", "languages"]) {
    const lines = parsed.sections[key];
    if (lines?.length) {
      sections.push({
        title: SECTION_TITLES[key] ?? key,
        lines: lines.map((l) => l.replace(BULLET_RE, "").trim()),
      });
    }
  }

  return {
    name: nameLine,
    headline,
    contacts,
    summary: parts.join(" "),
    experiences: parseExperiences(parsed.sections['experience'] ?? []),
    skills: skills.slice(0, 40),
    sections,
  };
}

export function resumeToPlainText(r: OptimizedResume): string {
  const out: string[] = [];
  out.push(r.name.toUpperCase());
  if (r.headline) out.push(r.headline);
  if (r.contacts.length) out.push(r.contacts.join(" | "));
  out.push("", "RESUMO PROFISSIONAL", r.summary);
  if (r.experiences.length) {
    out.push("", "EXPERIÊNCIA PROFISSIONAL");
    r.experiences.forEach((exp, i) => {
      if (i > 0) out.push("");
      out.push(exp.title);
      exp.meta.forEach((m) => out.push(m));
      exp.bullets.forEach((b) => out.push(`• ${b}`));
    });
  }
  if (r.skills.length) {
    out.push("", "HABILIDADES TÉCNICAS", r.skills.map((s) => s.label).join(", "));
  }
  r.sections.forEach((s) => {
    out.push("", s.title.toUpperCase(), ...s.lines);
  });
  return out.join("\n");
}

export function runFullAnalysis(resume: string, job: string): AnalysisResult {
  const analysis = analyzeAts(resume, job);
  const optimized = buildOptimizedResume(resume, job, analysis);
  const optimizedScore = analyzeAts(resumeToPlainText(optimized), job).score;
  return { analysis, optimized, optimizedScore: Math.max(optimizedScore, analysis.score) };
}
