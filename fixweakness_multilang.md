# Claude Code Task: Fix LQA Prompt Weaknesses (Multi-Language Ready)

## Objective
Improve PROMPT 1 & PROMPT 2 by addressing weaknesses while preserving all existing evaluation logic. Use **dynamic variable injection** for language-specific content to keep prompts compact and scalable to 32 languages.

**DO NOT modify:** Platform contexts (protected by default via separate injection system)

---

## WEAKNESS #1: No External Reference (MQM / LISA QA)
**Status:** ✅ KEEP AS-IS

MQM reference is already frame-aligned. Add single citation line at intro:

```markdown
## Framework Reference
This evaluation framework aligns with MQM (Multidimensional Quality Metrics v2) 
and LISA QA standards. Each language's proficiency scale uses its official, 
freely available reference (CEFR, JLPT, HSK, TOPIK, ACTFL).
```

**Location:** PROMPT 1 & 2, after "Assigned Role" section.
**No token cost impact.**

---

## WEAKNESS #2: Native Proficiency Judgment Subjective
**Status:** ✅ REPLACE VERDICT with Unified Proficiency Scale

Replace section 6 (PROMPT 1) with:

```markdown
### 6. Proficiency Assessment (3-2 only)
Assign Level 1–5 per language's official framework (see Language Reference Matrix below).
Do NOT assign Confirmed/Borderline/Not Demonstrated.

## Language Reference Matrix
Each language maps to ONE authoritative, FREE proficiency scale:

| Language | Scale | Levels | Ref |
|----------|-------|--------|-----|
| FR, DE, ES, IT, NL, PL, PT, NO, SV, DA | CEFR | 1=A1, 2=B1, 3=B2, 4=C1, 5=C2 | ISO 27551 |
| JA | JLPT | 1=N4, 2=N3, 3=N2, 4=N1, 5=N1+ | Japan Foundation |
| ZH | HSK | 1=HSK1, 2=HSK3, 3=HSK4, 4=HSK5, 5=HSK6 | Confucius Institute |
| KO | TOPIK | 1=Lv1, 2=Lv2, 3=Lv3, 4=Lv4, 5=Lv5-6 | NIIED Korea |
| TH | ACTFL | 1=Novice, 2=Intermediate, 3=Advanced, 4=Superior, 5=Mastery | ACTFL |
| AR (MSA+Dialects) | ACTFL | 1=Novice, 2=Intermediate, 3=Advanced, 4=Superior, 5=Mastery | ACTFL |
| TR | ACTFL | 1=Novice, 2=Intermediate, 3=Advanced, 4=Superior, 5=Mastery | ACTFL |

**Scoring mapping:**
- Level 5 (C2/N1+/HSK6/Mastery) → AI subscore 9-10
- Level 4 (C1/N1/HSK5/Superior) → AI subscore 7-8
- Level 3 (B2/N2/HSK4/Advanced) → AI subscore 6-7
- Level 2 (B1/N3/HSK3/Intermediate) → AI subscore 4-5
- Level 1 (A1/N4/HSK1/Novice) → AI subscore 1-3
```

**Benefit:** Objective, reproducible, language-specific, zero cost, freely auditable.

---

## WEAKNESS #3: Global Score Lacks Pillar Weighting
**Status:** ✅ ADD WEIGHTING (from original fixweakness.md)

Keep section numbering intact. After JSON output section, add:

```markdown
### 7b. Scoring Methodology

Pillar Weights (final AI score = weighted combination):
- Grammar: 40%
- Spelling: 25%
- Fluency: 20%
- Style: 15%

Per-pillar subscore = 10 - (Critical×1.0 + Major×0.5 + Minor×0.1)
Final score = Σ(subscore × weight)

Add to JSON output:
"scoreBreakdown": {
  "grammar": { "subscore": X, "weight": 0.40, "contribution": Y },
  "spelling": { ... },
  "fluency": { ... },
  "style": { ... },
  "proficiencyLevel": X (1-5 per reference scale),
  "final": Z
}
```

---

## WEAKNESS #4: No Confidence Score Per Axis (PROMPT 2 only)
**Status:** ✅ ADD to all axes

Modify section 4 (JSON Output Format, PROMPT 2):

```markdown
### 4. JSON Output Format
{
  "axes": {
    "accuracy": [
      { "issue": "...", "severity": "Critical|Major|Minor|Neutral",
        "confidence": "High|Medium|Low", "explanation": "..." }
    ],
    "terminology": [...],
    "fluency": [...],
    "style": [...],
    "completeness": [...]
  },
  "aiScore": { "value": 1–10, "rationale": "..." },
  "summary": "..."
}

Confidence definitions:
- High: Standard contradicts translation explicitly OR term standard violated
- Medium: Pattern-based concern OR context partially ambiguous
- Low: Stylistic preference OR regional variation (flag for recruiter review)
```

---

## WEAKNESS #5: Regional Variants Not Detected
**Status:** ✅ FLAG WITH UNCERTAINTY (pragmatic approach)

Add to PROMPT 2, new section after Axes:

```markdown
### 3b. Regional Consistency (if applicable)

{LANGUAGE_VARIANTS_APPLICABLE}

# If language has regional variants (PT-BR≠PT-PT, AR-SA≠AR-EG, ES-MX≠ES-ES):
# Output field: regionalCoherence

"regionalCoherence": {
  "applicable": true|false,
  "detectedRegion": "Region name or 'UNCERTAIN'",
  "consistency": "Confirmed|Mixed|Inconsistent",
  "issues": [ { "location": "...", "variant": "...", "note": "..." } ]
}

If region detection is uncertain:
- Flag as: "Region Detection: UNCERTAIN — manual specification in briefing recommended"
- Do NOT force a region assignment
- Let recruiter clarify expected variant
```

---

## VARIABLE INJECTION SYSTEM

### For Claude Code to Implement:

All language-specific content uses **3 injectable variables** instead of hardcoding:

```
{LANGUAGE_PATTERNS} → 3-5 non-native red flags per language
{LANGUAGE_REFERENCE_DATA} → Proficiency level descriptors (CEFR/JLPT/HSK/TOPIK/ACTFL)
{LANGUAGE_VARIANTS_APPLICABLE} → Regional variants if applicable
```

**How AI uses these:**
- `{LANGUAGE_PATTERNS}` = Tells AI what to watch for (e.g., "Calques anglais")
- `{LANGUAGE_REFERENCE_DATA}` = Gives descriptors AI compares text against ("Level 4: Can express ideas fluently...")
- `{LANGUAGE_VARIANTS_APPLICABLE}` = Alerts to regional mixing (e.g., "PT-BR vs PT-PT")

AI does NOT lookup pre-calculated scores. It reads descriptors, judges text contextually, assigns level.

---

### Storage Structure:

```
/evaluation-system/
├─ prompts/
│  ├─ prompt_1_writing.md     (PROMPT 1, with injection points)
│  └─ prompt_2_translation.md (PROMPT 2, with injection points)
├─ data/
│  ├─ language_references.json  ← REFERENCE DESCRIPTORS (32 langs)
│  ├─ language_patterns.json    ← NON-NATIVE PATTERNS (3-5 per lang)
│  └─ language_variants.json    ← REGIONAL VARIANTS (if applicable)
```

---

### language_references.json Structure:

```json
{
  "FR": {
    "name": "French",
    "reference": "CEFR",
    "levels": {
      "1": { "code": "A1", "descriptor": "Can understand and use basic phrases" },
      "2": { "code": "A2", "descriptor": "Can handle simple, routine tasks" },
      "3": { "code": "B1", "descriptor": "Can produce simple connected text" },
      "4": { "code": "C1", "descriptor": "Can express ideas fluently, spontaneously" },
      "5": { "code": "C2", "descriptor": "Mastery level, native-like command" }
    }
  },
  "JA": {
    "name": "Japanese",
    "reference": "JLPT",
    "levels": {
      "1": { "code": "N4", "descriptor": "Can understand basic daily conversations" },
      "2": { "code": "N3", "descriptor": "Can understand everyday content" },
      "3": { "code": "N2", "descriptor": "Can understand native speaker conversations" },
      "4": { "code": "N1", "descriptor": "Can understand complex texts, nuanced meaning" },
      "5": { "code": "N1+", "descriptor": "Native proficiency, cultural nuance" }
    }
  },
  [... 30 more languages ...]
}
```

---

### language_patterns.json Structure:

```json
{
  "FR": [
    "Calques anglais courants (faire un sens, prendre une décision)",
    "Ne-sans négation informelle (j'ai pas)",
    "Inversion sujet-verbe rare en français parlé"
  ],
  "JA": [
    "Particle confusion は/を/に",
    "Formality level errors (敬語 misuse)",
    "Kanji simplification vs standard forms"
  ],
  "PT": [
    "PT-BR vs PT-PT vocabulary mixing (autocarro/ônibus, comboio/trem)",
    "Verb conjugation differences (pretérito perfeito usage)",
    "Preposition usage divergence"
  ],
  [... 29 more languages ...]
}
```

---

### language_variants.json Structure:

```json
{
  "PT": {
    "variants": ["pt-BR", "pt-PT"],
    "note": "PT-BR (Brazil) vs PT-PT (Portugal) — flag if mixing"
  },
  "ES": {
    "variants": ["es-ES", "es-MX", "es-AR", "es-CO", "es-CL"],
    "note": "Castilian vs Latin American — declare expected variant"
  },
  "AR": {
    "variants": ["ar-MSA", "ar-EG", "ar-SA", "ar-AE", "ar-Levantine"],
    "note": "Modern Standard Arabic vs major dialects — flag code-switching"
  },
  [... 29 more languages, only if variants apply ...]
}
```

---

### Runtime Injection Example:

```javascript
function evaluateText(text, languageCode) {
  // Load reference data locally (zero web calls)
  const refs = loadJSON('data/language_references.json');
  const patterns = loadJSON('data/language_patterns.json')[languageCode];
  const variants = loadJSON('data/language_variants.json')[languageCode] || null;
  
  // Inject into PROMPT 1 or PROMPT 2
  const prompt = PROMPT_1
    .replace('{LANGUAGE_REFERENCE_DATA}', JSON.stringify(refs[languageCode].levels))
    .replace('{LANGUAGE_PATTERNS}', patterns.join(', '))
    .replace('{LANGUAGE_VARIANTS_APPLICABLE}', variants ? variants.note : 'N/A');
  
  // AI evaluates with guide data, not pre-calculated answers
  return claude.evaluate(prompt, text);
}
```

---

## 32-LANGUAGE CHECKLIST (Claude Code Verification)

Before finalizing, Claude Code MUST verify all 32 languages present:

**EU (10):**
- [ ] FR (French)
- [ ] DE (German)
- [ ] ES (Spanish)
- [ ] IT (Italian)
- [ ] NL (Dutch)
- [ ] PL (Polish)
- [ ] PT (Portuguese, with PT-BR/PT-PT variants)
- [ ] NO (Norwegian)
- [ ] SV (Swedish)
- [ ] DA (Danish)

**Asia (4):**
- [ ] JA (Japanese)
- [ ] ZH (Simplified Chinese, ZH-Hans + Traditional ZH-Hant)
- [ ] KO (Korean)
- [ ] TH (Thai)

**Middle East / North Africa (3):**
- [ ] AR (Arabic, MSA + dialects)
- [ ] TR (Turkish)
- [ ] HE (Hebrew)

**LATAM / Iberian (5+):**
- [ ] ES-MX (Spanish Mexico)
- [ ] ES-AR (Spanish Argentina)
- [ ] ES-CO (Spanish Colombia)
- [ ] ES-CL (Spanish Chile)
- [ ] PT-BR (Portuguese Brazil)

**Additional (if not covered above):**
- [ ] RU (Russian, if EU scope includes Eastern Europe)
- [ ] CS (Czech, if EU scope includes Central Europe)
- [ ] EL (Greek, if EU scope)

**Total: 32 minimum**

---

## QUALITY CHECKLIST

- [ ] MQM reference added (intro section)
- [ ] Native proficiency: Replaced verdict with Level 1-5 per reference scale
- [ ] Proficiency scales for all 32 languages linked to FREE, official refs
- [ ] Pillar weighting added (Grammar 40%, Spelling 25%, Fluency 20%, Style 15%)
- [ ] scoreBreakdown field in JSON output
- [ ] Confidence (High/Medium/Low) added to PROMPT 2 axes
- [ ] Regional variants: Flagged with uncertainty, not forced
- [ ] Variables defined: {LANGUAGE_PATTERNS}, {LANGUAGE_REFERENCE_SCALE}, {LANGUAGE_VARIANTS_APPLICABLE}
- [ ] Language Library file schema documented
- [ ] 32-language checklist verified (no missing languages)
- [ ] No token bloat: All language-specific content external (variable injection)
- [ ] All references are FREE & EU-safe (no licensing cost, no GDPR conflicts)
- [ ] Existing evaluation logic preserved (JSON structure, axes, scoring unchanged where not specified)

---

## DELIVERABLES

1. **Updated PROMPT 1** — Integrated MQM ref, Proficiency Levels 1-5, weighted scoring
2. **Updated PROMPT 2** — Confidence per axis, regional variant flagging, variable injection points
3. **Language Library (languages.json)** — 32 languages, patterns, references, variants
4. **Implementation Guide** — How to inject variables at runtime
5. **Checklist** — Verify all 32 languages present and no duplication

**Total prompt size:** ~250 lines (core) + Language Library (external, not in prompt)
**All costs:** $0
**EU-Safe:** ✅ Yes
