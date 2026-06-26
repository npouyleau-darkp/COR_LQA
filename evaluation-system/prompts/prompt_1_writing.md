# PROMPT 1 — Writing Evaluation (Q3-2)

> **Framework:** MQM v2 + LISA QA  
> **Scale authority:** Official per-language reference (CEFR / JLPT / HSK / TOPIK / ACTFL / TORFL / TOCFL / UKBI)  
> **Variable injection:** `getLangInjection(langCode)` in `language_data.js`

---

## Injection points

| Variable | Source | Used in |
|---|---|---|
| `{LANGUAGE_REFERENCE_DATA}` | `LANG_REFERENCES[code].levels` | Proficiency Assessment section |
| `{LANGUAGE_PATTERNS}` | `LANG_PATTERNS[code]` | Non-Native Pattern Watch clause |
| `{LANGUAGE_VARIANTS_APPLICABLE}` | `LANG_VARIANTS[code].note` | Regional Consistency Check clause |

---

## Prompt structure (runtime order)

```
ABSOLUTE LANGUAGE REQUIREMENT (English output only)

FRAMEWORK: MQM v2 + LISA QA reference line

ROLE: Senior LQA Lead — Question {questionIndex}

CONTEXT: Candidate writes in {selectedLangName} ({selectedLangCode}).
         Expected: native-level written proficiency.

PROFICIENCY ASSESSMENT (mandatory for Q3-2):
  Scale: {LANGUAGE_REFERENCE_DATA}
  Assign level 1–5. Do NOT default to middle. Justify choice.
  Level 5 = C2/N1/HSK6/TOPIK6/Distinguished/Istimewa
  Level 1 = A1-A2/N5/HSK1-2/TOPIK1/Novice/Marginal

NON-NATIVE PATTERN WATCH:
  {LANGUAGE_PATTERNS}

FOUR PILLARS:
  Spelling | Grammar | Fluency | Style

REGISTER POLICY: all registers valid; only excessive vulgarity flagged once under Style.

CULTURAL NUANCE GUIDANCE: {from config.js CULTURAL_NUANCE_EXAMPLES}

REGIONAL CONSISTENCY CHECK:
  {LANGUAGE_VARIANTS_APPLICABLE}
  — if uncertain: "Region Detection: UNCERTAIN" — do NOT force assignment
  — factual observation only, never a pillar error

PREVIOUSLY ACCEPTED TERMS: {from exceptions.js}

SCORING METHODOLOGY:
  Subscore = 10 – (Critical×1.0 + Major×0.5 + Minor×0.1)
  Final = Grammar×0.40 + Spelling×0.25 + Fluency×0.20 + Style×0.15

JSON OUTPUT (strict shape):
{
  "pillars": {
    "spelling":  [{"issue":"...","severity":"Critical|Major|Minor|Neutral","confidence":"High|Medium|Low","explanation":"..."}],
    "grammar":   [...],
    "fluency":   [...],
    "style":     [...]
  },
  "scoreBreakdown": {
    "grammar":  {"subscore": 10, "weight": 0.40},
    "spelling": {"subscore": 10, "weight": 0.25},
    "fluency":  {"subscore": 10, "weight": 0.20},
    "style":    {"subscore": 10, "weight": 0.15}
  },
  "regionalConsistency": {"applicable": false, "note": "..."},
  "proficiencyLevel": {"scale":"CEFR","level":4,"code":"C1","rationale":"..."},
  "aiScore": {"value": 8, "rationale": "..."},
  "summary": "..."
}

<CANDIDATE_TEXT_TO_AUDIT>
{candidateValue}
</CANDIDATE_TEXT_TO_AUDIT>
```

---

## Notes

- `proficiencyLevel` replaces the former `nativeProficiency.verdict` (Confirmed/Borderline/Not Demonstrated).
- `scoreBreakdown` must be populated; `aiScore.value` must equal the weighted result.
- `confidence` field on each pillar issue: High = certain; Medium = likely; Low = may be acceptable variation.
- Issue field for Q3-2: `[English label] + [verbatim text in language-correct quotes]`.
- All explanation/summary/rationale in English regardless of candidate language.
