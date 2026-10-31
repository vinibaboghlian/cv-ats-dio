import { BadgeCheck, BarChart3, Gift } from "lucide-react";

const STATS = [
  { icon: BarChart3, label: "+18.000 análises" },
  { icon: BadgeCheck, label: "Compatível com Gupy/Workable" },
  { icon: Gift, label: "100% Gratuito" },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-hero print:hidden">
      <div className="pointer-events-none absolute inset-0 grid-dots opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
      <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pt-20">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-glow/40 bg-background/80 px-3 py-1 font-mono text-xs font-medium uppercase tracking-widest text-primary-deep">
          <span className="size-1.5 rounded-full bg-score" />
          ATS Matcher & Resume Tailor
        </p>
        <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.05] text-foreground sm:text-6xl">
          Vença os <span className="marker">robôs de RH</span> com um currículo sob medida para a sua
          vaga.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Cole seu currículo e a vaga desejada. Nossa engine audita os filtros ATS, calcula seu índice
          de match e gera um currículo otimizado com as palavras-chave certas.
        </p>
        <ul className="mt-8 flex flex-wrap gap-3">
          {STATS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-soft"
            >
              <Icon className="size-4 text-primary" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
