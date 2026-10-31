import { FileCheck2, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onReset: () => void;
}

export function Header({ onReset }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-lift">
            <FileCheck2 className="size-5" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
            Match<span className="text-primary">CV</span>
          </span>
          <Badge variant="pill" className="ml-1 hidden text-[11px] sm:inline-flex">
            <ShieldCheck className="size-3.5 text-primary" />
            ATS Compliant Engine
          </Badge>
        </a>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
          <RotateCcw />
          <span className="hidden sm:inline">Limpar workspace</span>
        </Button>
      </div>
    </header>
  );
}
