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

var TRANSLATION_SOURCES = {
    '2_5': 'An error has occurred (CE-108255-1). The game data may be corrupted. Please delete the application and reinstall it from your library. If the issue persists, visit PlayStation Support.',
    '2_6': 'Unable to connect to Nintendo eShop. Please check your internet connection settings or try again later. Visit support.nintendo.com for assistance. Error Code: 2811-5001.',
    '2_7': 'Your controller has been disconnected. Please reconnect your controller and press the A Button to continue. Check the battery level if the issue persists. Error: 0x82D40003.',
    '2_8': '{player_name} rises up from the top of the key, hangs in the air for a split second, and throws down a thunderous two-handed slam — and the {team_name} crowd goes absolutely wild!'
};

var TRANSLATION_PLATFORM_CONTEXT = {
    '2_5': 'Sony PlayStation 5 system error message. Apply Sony/PlayStation localization compliance guidelines: formal register, no truncation, preserve error code format exactly as-is.',
    '2_6': 'Nintendo eShop connection message. Apply Nintendo localization standards: natural phrasing, family-friendly tone. Do not literally translate UI button names; follow Nintendo platform conventions per language.',
    '2_7': 'Xbox system prompt. Apply Microsoft localization guidelines for Xbox: consistent controller button naming per Xbox Terminology (button labels may differ by language per Microsoft guidelines), active voice, concise phrasing.',
    '2_8': 'NBA basketball live commentary excerpt. Preserve the energy, pace, and technical terminology of US basketball broadcasting. Variables in {curly braces} such as {player_name} and {team_name} must not be translated and must be preserved verbatim.'
};

var TRANSLATION_QUESTION_IDS = ['2_5', '2_6', '2_7', '2_8'];
var WRITING_QUESTION_IDS = ['3_1', '3_2'];
