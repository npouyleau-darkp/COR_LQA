# 32-Language Verification Checklist

Verified against `index.html` dropdown (ground truth).

## European (21 codes)

- [x] fr-FR — French (France) — CEFR
- [x] de-DE — German (Germany) — CEFR
- [x] it-IT — Italian (Italy) — CEFR
- [x] nl-NL — Dutch (Netherlands) — CEFR
- [x] sv-SE — Swedish (Sweden) — CEFR / Swedex
- [x] no-NO — Norwegian (Norway) — CEFR / Norskprøven *(Bokmål default; Nynorsk mixing = error)*
- [x] da-DK — Danish (Denmark) — CEFR / Prøve i Dansk
- [x] fi-FI — Finnish (Finland) — CEFR / YKI
- [x] es-ES — Spanish (Spain) — CEFR / DELE
- [x] es-419 — Spanish (Latin America) — CEFR / DELE *(sub-variant uncertain unless briefed)*
- [x] pt-PT — Portuguese (Portugal) — CEFR / CAPLE
- [x] pt-BR — Portuguese (Brazil) — CEFR / Celpe-Bras
- [x] ru-RU — Russian (Russia) — TORFL *(maps to CEFR)*
- [x] pl-PL — Polish (Poland) — CEFR
- [x] cs-CZ — Czech (Czech Republic) — CEFR / CCE
- [x] hu-HU — Hungarian (Hungary) — CEFR / ECL
- [x] el-GR — Greek (Greece) — CEFR / KPG
- [x] tr-TR — Turkish (Turkey) — CEFR / TYS
- [x] uk-UA — Ukrainian (Ukraine) — CEFR / UkrELP
- [x] ro-RO — Romanian (Romania) — CEFR
- [x] bg-BG — Bulgarian (Bulgaria) — CEFR

## Middle East / North Africa (1 code)

- [x] ar-AA — Arabic (RTL, MSA + dialects) — ACTFL *(dialect uncertain unless briefed)*

## South Asia (1 code)

- [x] hi-IN — Hindi (India) — ACTFL

## East Asia (4 codes)

- [x] zh-CN — Chinese Simplified (Mainland) — HSK
- [x] zh-TW — Chinese Traditional (Taiwan) — TOCFL
- [x] zh-HK — Chinese Traditional (Hong Kong) — TOCFL *(Cantonese context)*
- [x] ja-JP — Japanese (Japan) — JLPT
- [x] ko-KR — Korean (Korea) — TOPIK

## Southeast Asia (4 codes)

- [x] vi-VN — Vietnamese (Vietnam) — ACTFL
- [x] th-TH — Thai (Thailand) — ACTFL
- [x] ms-MY — Malay (Malaysia) — ACTFL
- [x] id-ID — Indonesian (Indonesia) — UKBI

---

**Total: 32 ✓** (matches `index.html` dropdown exactly)

## Quality checklist

- [x] MQM v2 + LISA QA reference added to both prompts
- [x] `proficiencyLevel` (1-5, scale-specific) replaces `nativeProficiency.verdict`
- [x] CEFR mapping correct: A1/A2 → 1, B1 → 2, B2 → 3, C1 → 4, C2 → 5 *(no A2 skip)*
- [x] Proficiency scales for all 32 codes — free & official references only
- [x] Pillar weighting added (Grammar 40%, Spelling 25%, Fluency 20%, Style 15%)
- [x] `scoreBreakdown` field in PROMPT 1 JSON schema
- [x] `confidence` (High/Medium/Low) added to PROMPT 2 axes *(was already in PROMPT 1)*
- [x] Regional variants: UNCERTAIN flag, no forced assignment
- [x] `{LANGUAGE_PATTERNS}` — 3-5 patterns per language, all 32 codes
- [x] `{LANGUAGE_REFERENCE_DATA}` — 5-level descriptors per language, all 32 codes
- [x] `{LANGUAGE_VARIANTS_APPLICABLE}` — 12 languages with meaningful variants
- [x] HE (Hebrew) removed — not in project dropdown
- [x] es-419 replaces 4 separate LATAM codes — matches project reality
- [x] RU, CS, EL treated as base languages (not optional/conditional)
- [x] zh-HK treated as distinct from zh-TW with Cantonese context
- [x] ar-AA used as root code with dialect sub-variant awareness
- [x] All references free & EU-safe (coe.int, jlpt.jp, chinesetest.cn, topik.go.kr, actfl.org, torfl.ru, tocfl.tw, badanbahasa.kemdikbud.go.id)
- [x] Existing evaluation logic preserved (JSON axes/pillars unchanged where not specified)
- [x] No token bloat: all language-specific content external in `language_data.js`

## Files created / modified

| File | Status |
|---|---|
| `evaluation-system/data/language_references.json` | ✅ Created |
| `evaluation-system/data/language_patterns.json` | ✅ Created |
| `evaluation-system/data/language_variants.json` | ✅ Created |
| `evaluation-system/data/language_data.js` | ✅ Created (browser wrapper) |
| `evaluation-system/prompts/prompt_1_writing.md` | ✅ Created |
| `evaluation-system/prompts/prompt_2_translation.md` | ✅ Created |
| `js/prompt.js` | ✅ Updated |
| `index.html` | ✅ Updated (language_data.js script tag added) |
