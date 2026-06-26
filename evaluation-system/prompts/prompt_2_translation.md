# PROMPT 2 — Translation Evaluation (Q2-5 / Q2-6 / Q2-7 / Q2-8)

> **Framework:** MQM v2 + LISA QA  
> **Variable injection:** `getLangInjection(langCode)` in `language_data.js`

---

## Injection points

| Variable | Source | Used in |
|---|---|---|
| `{LANGUAGE_PATTERNS}` | `LANG_PATTERNS[code]` | Non-Native Pattern Watch clause |
| `{LANGUAGE_VARIANTS_APPLICABLE}` | `LANG_VARIANTS[code].note` | Regional Coherence section |

---

## Prompt structure (runtime order)

```
ABSOLUTE LANGUAGE REQUIREMENT (English output only)

FRAMEWORK: MQM v2 + LISA QA reference line

ROLE: Senior Translation Quality Assessor — Question {questionIndex}

TARGET LANGUAGE: {selectedLangName} ({selectedLangCode})

PLATFORM CONTEXT: {from config.js TRANSLATION_PLATFORM_CONTEXT}

NON-NATIVE PATTERN WATCH:
  {LANGUAGE_PATTERNS}

REGIONAL COHERENCE:
  {LANGUAGE_VARIANTS_APPLICABLE}
  — if variants applicable: detect consistency, flag mixing as Mixed/Inconsistent
  — if region uncertain: set detectedRegion = "UNCERTAIN" — do NOT force assignment
  — if not applicable: set applicable = false, detectedRegion = "N/A"

FIVE AXES:
  Accuracy | Terminology | Fluency | Style | Completeness

  Completeness note: {curly brace} variables must be preserved verbatim.

JSON OUTPUT (strict shape):
{
  "axes": {
    "accuracy":     [{"issue":"...","severity":"Critical|Major|Minor|Neutral","confidence":"High|Medium|Low","explanation":"..."}],
    "terminology":  [...],
    "fluency":      [...],
    "style":        [...],
    "completeness": [...]
  },
  "regionalCoherence": {
    "applicable": true,
    "detectedRegion": "Region name or UNCERTAIN",
    "consistency": "Confirmed|Mixed|Inconsistent",
    "issues": [{"location":"...","variant":"...","note":"..."}]
  },
  "aiScore": {"value": 8, "rationale": "..."},
  "summary": "..."
}

<SOURCE_TEXT>
{sourceText}
</SOURCE_TEXT>

<CANDIDATE_TRANSLATION>
{candidateValue}
</CANDIDATE_TRANSLATION>
```

---

## Confidence definitions (per axis issue)

| Level | Meaning |
|---|---|
| High | Standard contradicts translation explicitly OR term standard violated |
| Medium | Pattern-based concern OR context partially ambiguous |
| Low | Stylistic preference OR regional variation — flag for recruiter review |

---

## Notes

- `confidence` field added to all five axes (was absent in previous version).
- `regionalCoherence` replaces the simpler `regionalConsistency` field from Prompt 1 — more granular (per-issue tracking).
- All explanation/summary/rationale in English.
- Platform contexts (Nintendo, Xbox, etc.) are injected from `config.js TRANSLATION_PLATFORM_CONTEXT` — do not modify.
