var LONG_TEXT_DIFF_THRESHOLD = 8000;

var CULTURAL_NUANCE_EXAMPLES = {
    "fr-FR": "Examples of acceptable variation: dropping \"ne\" in informal negation (\"je sais pas\") is standard informal register, not a grammar error.",
    "de-DE": "Colloquial \"weil\" with main-clause word order is common in informal writing and should not be auto-flagged; Austrian/Swiss spelling are legitimate variants.",
    "ar-AA": "Arabic is diglossic: a casual-register text may legitimately mix Modern Standard Arabic with dialectal vocabulary (Egyptian, Levantine, Gulf, Maghrebi).",
    "es-ES": "If the expected variant is Peninsular Spanish, voseo or heavy Latin American vocabulary may indicate a regional mismatch — flag under regionalConsistency instead.",
    "es-419": "Voseo (\"vos tenés\") is correct standard usage in Argentina, Uruguay, and parts of Central America.",
    "pt-PT": "European Portuguese conventions (\"estou a fazer\", \"tu\") differ from Brazilian Portuguese — both correct within their own variant.",
    "pt-BR": "Brazilian Portuguese conventions (\"estou fazendo\", \"você\") differ from European Portuguese — both correct within their own variant.",
    "zh-CN": "Casual Mandarin commonly omits subject pronouns and uses sentence-final particles (吧, 呢, 啊, 啦) — natural, not grammar errors.",
    "zh-TW": "Same as zh-CN, plus Traditional characters are expected here.",
    "zh-HK": "Written Cantonese vernacular forms (啦, 嘱, 嗄, 喜) are legitimate in a Hong Kong context."
};

var REGIONAL_VARIANT_CONTRAST = {
    "fr-FR": "Québécois French or other Francophone regional variants outside Metropolitan France",
    "es-ES": "Latin American Spanish (e.g. voseo, regional vocabulary)",
    "es-419": "Peninsular Spanish (Spain) vocabulary and grammar",
    "pt-PT": "Brazilian Portuguese (gerund forms, \"você\" usage, Brazilian-specific vocabulary)",
    "pt-BR": "European Portuguese (\"estou a fazer\", \"tu\" usage, Portugal-specific vocabulary)",
    "zh-CN": "Traditional Chinese characters, or Hong Kong / Cantonese-specific vernacular forms",
    "zh-TW": "Simplified Chinese characters, or Mainland Mandarin-specific phrasing",
    "zh-HK": "Mandarin-only phrasing with no Cantonese-specific forms, or unexpected Simplified characters"
};

var SEVERITY_BADGE_CLASS = { "Critical":"badge-critical", "Major":"badge-major", "Minor":"badge-minor", "Neutral":"badge-neutral" };
var CONFIDENCE_BADGE_CLASS = { "High":"badge-conf-high", "Medium":"badge-conf-medium", "Low":"badge-conf-low" };
