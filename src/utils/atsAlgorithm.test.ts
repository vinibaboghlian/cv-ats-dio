import { describe, expect, it } from "vitest";
import { runFullAnalysis, scoreToVerdict, validateInputs, rewriteBullet } from "./atsAlgorithm";
import { SAMPLE_JOB, SAMPLE_RESUME } from "./sampleData";

describe("ATS engine", () => {
  it("blocks analysis when the resume is blank", () => {
    expect(validateInputs("   ", SAMPLE_JOB)?.resume).toBeTruthy();
  });

  it("blocks analysis when the job description is blank", () => {
    expect(validateInputs(SAMPLE_RESUME, "")?.job).toBeTruthy();
  });

  it("accepts complete inputs", () => {
    expect(validateInputs(SAMPLE_RESUME, SAMPLE_JOB)).toBeNull();
  });

  it("maps score bands to verdicts", () => {
    expect(scoreToVerdict(85).verdict).toBe("Forte Compatibilidade");
    expect(scoreToVerdict(62).verdict).toBe("Compatibilidade Média");
    expect(scoreToVerdict(35).verdict).toBe("Risco Alto de Triagem");
  });

  it("separates matched and missing keywords from the job", () => {
    const { analysis } = runFullAnalysis(SAMPLE_RESUME, SAMPLE_JOB);
    const matched = analysis.matched.map((k) => k.label);
    const missing = analysis.missing.map((k) => k.label);
    expect(matched).toContain("React");
    expect(missing).toContain("TypeScript");
    expect(matched).not.toContain("TypeScript");
  });

  it("adds missing keywords to the optimized skills, flagged as added", () => {
    const { optimized } = runFullAnalysis(SAMPLE_RESUME, SAMPLE_JOB);
    expect(optimized.skills.find((s) => s.label === "TypeScript")?.added).toBe(true);
    expect(optimized.skills.find((s) => s.label === "React")?.added).toBe(false);
  });

  it("rewrites weak bullet openings into action verbs", () => {
    expect(rewriteBullet("- Responsável pelo desenvolvimento do app")).toBe("Conduzi o desenvolvimento do app.");
  });
});
