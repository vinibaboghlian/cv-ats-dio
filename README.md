# 🎯 MatchCV — ATS Matcher & Resume Tailor

> Plataforma inteligente para auditoria de compatibilidade (Match Score) e reestruturação de currículos sob medida para vagas de emprego, 100% otimizada para superar filtros automáticos de RH (ATS).

🔗 **Aplicação Publicada:** [https://bilingual-resume-matchmaker.lovable.app/](https://bilingual-resume-matchmaker.lovable.app/)  
📦 **Repositório Oficial:** [https://github.com/vinibaboghlian/cv-ats-dio](https://github.com/vinibaboghlian/cv-ats-dio)

---

## 1. Qual Problema a Aplicação Resolve

Mais de 75% dos currículos enviados para médias e grandes empresas são descartados antes mesmo de chegarem às mãos de um recrutador humano. O motivo principal é a triagem fria dos sistemas **ATS (Applicant Tracking Systems)** — como Gupy, Workable, Greenhouse, Lever e Taleo —, que utilizam parsers automatizados para ranquear candidatos pela densidade semântica de palavras-chave e conformidade estrutural.

O candidato comum enfrenta dois grandes obstáculos:
1. **Descarte Silencioso:** Possui as competências para a função, mas não utilizou exatamente os mesmos termos técnicos presentes na descrição da oportunidade.
2. **Formatação Tóxica para Robôs:** Usa modelos visuais complexos (tabelas, colunas duplas, ícones gráficos ou elementos em camadas) que quebram o parser do robô de RH, resultando em pontuação zero ou dados corrompidos.

O **MatchCV** elimina essa barreira. Em segundos, ele analisa o currículo atual em paralelo com a vaga desejada, diagnostica termos ausentes e gera uma versão reestruturada, limpa e contextualizada com a linguagem da oportunidade, pronta para exportação imediata em **DOCX (Word)** e **PDF**.

---

## 2. O Mega Prompt Utilizado

A aplicação foi construída a partir de um mega prompt estruturado em Markdown, definindo design system, paleta de cores, fluxo sem fricção e as diretrizes de exportação client-side.

```markdown
### CONTEXTO E PROPÓSITO
Você é um engenheiro de software frontend especialista em React, TypeScript, Tailwind CSS, Shadcn UI e especialista em sistemas de recrutamento e triagem automatizada de candidatos (ATS - Applicant Tracking Systems).
Construa uma aplicação web de página única (SPA), responsiva e de alta performance chamada "MatchCV: ATS Matcher & Resume Tailor".
A aplicação resolve a dor de profissionais que são reprovados silenciosamente pelos robôs de RH (Gupy, Workable, Greenhouse, Lever, Taleo) por falta de palavras-chave e formatação inadequada. O app compara o currículo atual do usuário com a descrição de uma vaga específica, gera um diagnóstico minucioso de compatibilidade (Match Score) e cria uma versão otimizada sob medida pronta para exportação.

---

### PALETA DE CORES E DESIGN SYSTEM
- Design System: Componentes baseados em shadcn/ui (Radix UI + Tailwind CSS) e ícones semânticos da biblioteca lucide-react.
- Paleta de Cores Estrita:
  * Branco & Neutros: #FFFFFF como fundo principal e #F8FAFC (slate-50) para cards secundários e áreas de contraste.
  * Azul Claro (Primária / Ação): #0284C7 (sky-600) para botões de destaque, #38BDF8 (sky-400) para acentos e #E0F2FE (sky-100) para backgrounds sutis de tags.
  * Amarelo Claro (Secundária / Alerta ATS): #FEF08A (yellow-200) para badges de palavras-chave faltantes e #FACC15 (yellow-400) para destaque no score e barras de progresso.
  * Tipografia e Texto: #0F172A (slate-900) para títulos de alto contraste e #475569 (slate-600) para corpo de texto.
- Acesso Sem Fricção: Sem telas de login, autenticação ou senhas. Toda a computação e persistência de rascunho ocorrem localmente no navegador (client-side / localStorage).

---

### ESTRUTURA E COMPONENTES DA APLICAÇÃO

#### 1. CABEÇALHO & HERO INFORMATIVO
- Header limpo com logotipo estilizado "MatchCV", badge visual "ATS Compliant Engine" e botão para resetar/limpar workspace.
- Hero Banner direto ao ponto:
  * Título: "Vença os robôs de RH com um currículo sob medida para a sua vaga."
  * Subtítulo: "Cole seu currículo e a vaga desejada. Nossa engine audita os filtros ATS, calcula seu índice de match e gera um currículo otimizado com as palavras-chave certas."
  * Indicadores de impacto rápido: "+18.000 análises", "Compatível com Gupy/Workable", "100% Gratuito".

#### 2. WORKSPACE DE ENTRADA (COMPARAÇÃO DUPLA)
Disponibilize dois cards grandes do Shadcn UI posicionados lado a lado no desktop (ou em abas responsivas no mobile):
- Card 1: Seu Currículo Atual
  * Textarea ampla com contadores em tempo real de palavras e caracteres.
  * Placeholder: "Cole aqui todo o conteúdo do seu currículo atual (resumo, experiências, projetos, formação e habilidades)..."
  * Botão de ação rápida: "Carregar Currículo de Exemplo" (preenche um currículo de exemplo completo com um clique para testes imediatos).
- Card 2: Descrição da Vaga Alvo
  * Textarea com contador de palavras.
  * Placeholder: "Cole aqui a descrição completa da oportunidade (requisitos técnicos, diferenciais e responsabilidades)..."
  * Botão de ação rápida: "Carregar Vaga de Exemplo" (preenche uma vaga real para teste rápido).
- Botão Principal de Execução:
  * Botão em azul com hover em amarelo claro e ícone de varinha/raio: "Analisar Compatibilidade & Otimizar Currículo".
  * Ao clicar, exiba um estado de carregamento com barra de progresso simulando os passos da auditoria: "Identificando hard skills...", "Auditando pontuação ATS...", "Reestruturando tópicos de impacto...".

#### 3. ENGINE DE DIAGNÓSTICO ATS & DASHBOARD DE MATCH
Após o processamento client-side em TypeScript, exiba um painel visual dividido em:
- Card de Match Score:
  * Mostrador circular ou barra de progresso visual de 0% a 100%.
  * Veredito textual dinâmico (ex.: "85% - Forte Compatibilidade", "62% - Compatibilidade Média", "35% - Risco Alto de Triagem").
- Auditoria de Palavras-Chave (Badges Shadcn):
  * Palavras-Chave Correspondentes: Tags em fundo azul claro com ícone de check (competências da vaga que já estavam no currículo).
  * Palavras-Chave Críticas Faltantes: Tags em fundo amarelo suave com ícone de alerta (termos exigidos pela vaga que foram adicionados e destacados para a nova versão).
- Checklist de Conformidade Técnica:
  * 4 cartões de status: "Formatação Linear (sem tabelas complexas)", "Verbos de Ação Presentes", "Alinhamento de Título", "Densidade de Habilidades".

#### 4. VISUALIZAÇÃO DO NOVO CURRÍCULO E EXPORTAÇÃO COMPLETA
Apresente o novo currículo reescrito e formatado especificamente para a vaga, organizado em uma folha A4 virtual com design limpo.
Forneça uma Barra de Ações de Exportação com:
- Botão 1: "Baixar em DOCX (.docx)" (download client-side com cabeçalho compatível com MS Word).
- Botão 2: "Baixar em PDF (.pdf)" (folha A4 com regras de @media print e margens limpas).
- Botão 3: "Copiar Texto Formatado" (cópia rápida para área de transferência para formulários da Gupy).
- Botão 4: "Fazer Nova Análise".
