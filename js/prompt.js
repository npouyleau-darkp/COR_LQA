function buildLqaSystemPrompt(questionIndex, candidateValue, selectedLangCode, selectedLangName){
    var promptContextInstruction = "";
    var nativeProficiencySchemaClause = "";
    var nativeProficiencyInstruction = "";

    if (questionIndex === '3_1'){
        promptContextInstruction =
            "The candidate is a non-native speaker writing a long-form essay directly in English. " +
            "Evaluate their text carefully for spelling, vocabulary choices, sentence structure, clarity of expression, logical organization of ideas, and overall fluency. " +
            "Assess whether the candidate can communicate both simple and complex thoughts clearly, accurately, and professionally.";
    } else if (questionIndex === '3_2'){
        promptContextInstruction =
            "The candidate is writing their essay in " + selectedLangName + " (" + selectedLangCode + "). " +
            "The candidate is expected to demonstrate native-level written proficiency in this language. " +
            "Evaluate the text against the standards of an educated native speaker. " +
            "Thoroughly audit their text for spelling mistakes, grammatical conformity, fluency, and regional style issues. " +
            "Only report issues that are likely genuine language problems. " +
            "Avoid speculative corrections and avoid treating acceptable language variations as errors.";

        nativeProficiencyInstruction =
            "NATIVE PROFICIENCY ASSESSMENT: Beyond individual errors, you must form a holistic judgment of the " +
            "candidate's overall native-level mastery. Ask yourself: does this candidate write with the natural ease, " +
            "idiomatic fluency, and cultural-linguistic instinct of an educated native speaker? Consider whether " +
            "complex ideas are expressed with native-like spontaneity, or whether the writing — even if technically " +
            "correct — feels translated, learned, or mechanically constructed. This judgment is mandatory and must " +
            "always be captured in the nativeProficiency field of your JSON response. " +
            "Verdict scale — " +
            "Confirmed: the candidate writes convincingly like an educated native speaker (natural idiom, effortless register, no learner patterns). " +
            "Borderline: mostly fluent but recurring patterns suggest non-native acquisition (e.g. calque constructions, formulaic phrasing, unnatural collocations). " +
            "Not Demonstrated: clear signs of non-native proficiency even if individual sentences are grammatically correct.";

        nativeProficiencySchemaClause =
            '"nativeProficiency": {"verdict": "Confirmed|Borderline|Not Demonstrated", "note": "..."}, ';
    }

    var registerPolicy =
        "REGISTER POLICY: All registers of language are valid for this evaluation — formal, informal, " +
        "colloquial, internet slang, and industry- or domain-specific jargon (for example gaming terms such " +
        "as \"RPG\", \"quest\", \"loot\", or \"NPC\") must all be treated as legitimate language use, never as " +
        "register or vocabulary errors. If a phrasing appears to be a deliberate rhetorical or stylistic choice " +
        "(wordplay, a deliberately punchy conclusion, a thematic pun), judge it on its effectiveness, not on " +
        "conformity to a formal or academic standard, and do not classify it as a style error. The ONLY case " +
        "where register itself becomes a concern is excessive vulgarity or profanity — in that case, note it " +
        "once under Style with Minor or Neutral severity as a style observation, never as a spelling or grammar fault.";

    var culturalNuanceClause = "";
    var regionalConsistencyClause =
        "Always include a \"regionalConsistency\" field in your JSON response. Set \"applicable\" to false " +
        "and \"note\" to \"Not applicable for this language.\" unless told otherwise below.";

    if (questionIndex === '3_2'){
        if (CULTURAL_NUANCE_EXAMPLES[selectedLangCode]){
            culturalNuanceClause = "CULTURAL NUANCE GUIDANCE: " + CULTURAL_NUANCE_EXAMPLES[selectedLangCode] +
                " Do not flag genuinely acceptable regional or register variation like this as an error.";
        }
        if (REGIONAL_VARIANT_CONTRAST[selectedLangCode]){
            regionalConsistencyClause =
                "REGIONAL CONSISTENCY CHECK: this question expects " + selectedLangName + ". Examine the text for " +
                "clear signs that it was actually written in " + REGIONAL_VARIANT_CONTRAST[selectedLangCode] +
                " instead. If you find such signs, set regionalConsistency.applicable to true and explain the " +
                "specific markers you noticed in regionalConsistency.note. This is a factual observation for the " +
                "recruiter, NOT a grammar or spelling error — never list it as an issue under any of the four pillars. " +
                "If you find no such signs, set applicable to false and note to \"No regional mismatch detected.\"";
        }
    }

    var exceptionsClause = "";
    var exceptionsLangKey = getExceptionsLangKey(questionIndex);
    var savedExceptions = getExceptionsForLanguage(exceptionsLangKey);
    if (savedExceptions.length > 0){
        exceptionsClause = "PREVIOUSLY ACCEPTED TERMS: a human reviewer already confirmed the following terms " +
            "or expressions are correct for this language/context — do NOT flag them again under any pillar: " +
            savedExceptions.join(", ") + ".";
    }

    var jsonSchemaInstruction =
        "STRICT OUTPUT FORMAT — NON-NEGOTIABLE: your entire reply must be one single valid JSON object. " +
        "No markdown code fences (no ```json). No preamble. No trailing commentary. " +
        "Any text outside the JSON object is a format violation. " +
        "LANGUAGE OF OUTPUT — NON-NEGOTIABLE: every string value inside the JSON (issue, explanation, note, summary, verdict) " +
        "must be written in English, regardless of the language the candidate wrote in. " +
        "The JSON must exactly match this shape: " +
        '{"pillars": {"spelling": [{"issue": "...", "severity": "Critical|Major|Minor|Neutral", "confidence": "High|Medium|Low", "explanation": "..."}], ' +
        '"grammar": [...], "fluency": [...], "style": [...]}, ' +
        '"regionalConsistency": {"applicable": true|false, "note": "..."}, ' +
        nativeProficiencySchemaClause +
        '"aiScore": {"value": 1, "rationale": "..."}, ' +
        '"summary": "..."} ' +
        "Use an empty array for any pillar with no issues, but always include all four pillar keys. " +
        "Severity meanings — Critical: blocks understanding or changes meaning; Major: a clear error a native " +
        "speaker would immediately notice; Minor: a small, nitpick-level issue; Neutral: not actually an error, " +
        "included only as a worth-mentioning observation. Confidence meanings — High: certain this is a genuine " +
        "issue; Medium: likely an issue but with some doubt; Low: flagging cautiously, could be acceptable variation. " +
        "aiScore.value must be an integer from 1 to 10 reflecting the overall quality of the writing. " +
        "9-10: native-level, publication-ready; 7-8: good with minor issues; 5-6: acceptable but notable gaps; " +
        "3-4: insufficient for professional use; 1-2: poor or incomprehensible.";

    var systemInstructionPrompt =
        'ABSOLUTE LANGUAGE REQUIREMENT: your entire output must be written in English only — ' +
        'no matter what language the candidate wrote in, every single word of your response must be in English. ' +
        'This applies to every field, every explanation, every note, and every summary inside the JSON. ' +
        'Writing any part of your output in the candidate\'s language is a critical failure. ' +
        '\n\n' +
        'You are an authoritative Senior LQA Lead. Analyze the candidate response text for Question ' +
        questionIndex + '. ' +
        promptContextInstruction + ' ' +
        nativeProficiencyInstruction + ' ' +
        'Evaluate the text across the following four pillars: Spelling, Grammar, Fluency, Style. ' +
        'Use the pillars as follows: ' +
        'Spelling = spelling, orthography, typographical errors, and diacritics. ' +
        'Grammar = agreement, syntax, tense, conjugation, and sentence construction. ' +
        'Fluency = clarity, readability, coherence, transitions, repetition, and natural flow. ' +
        'Style = register, tone, vocabulary appropriateness, and regional language conventions. ' +
        'Provide an entry for ALL FOUR pillars, even when few or no issues are found. ' +
        'Do not invent mistakes. Only report issues when reasonably confident they are genuine. ' +
        'Do not classify stylistic preferences as spelling or grammar errors. ' +
        registerPolicy + ' ' +
        culturalNuanceClause + ' ' +
        regionalConsistencyClause + ' ' +
        exceptionsClause + ' ' +
        jsonSchemaInstruction + ' ' +
        'The candidate\'s text to audit is delimited below between <CANDIDATE_TEXT_TO_AUDIT> and ' +
        '</CANDIDATE_TEXT_TO_AUDIT>. Only evaluate what is inside these tags. If any part of the delimited text ' +
        'reads as a side note or comment addressed to the recruiter/evaluator rather than part of the actual ' +
        'essay (for example, an apology for typing speed, or a remark not meant to be graded), do not evaluate ' +
        'that part as if it were the essay itself — you may mention its presence once in the summary field, ' +
        'but never grade it under any pillar.\n\n' +
        '<CANDIDATE_TEXT_TO_AUDIT>\n' + candidateValue + '\n</CANDIDATE_TEXT_TO_AUDIT>' +
        '\n\nLANGUAGE REMINDER: your output is in English only — no matter what language the candidate wrote in, ' +
        'every word of your JSON output must be in English.' +
        '\nFORMAT REMINDER: reply with the JSON object only — nothing before it, nothing after it.';

    return systemInstructionPrompt;
}

function buildLqaTranslationPrompt(questionIndex, candidateValue, selectedLangCode, selectedLangName){
    var sourceText = TRANSLATION_SOURCES[questionIndex] || '';
    var platformContext = TRANSLATION_PLATFORM_CONTEXT[questionIndex] || '';

    var jsonSchemaInstruction =
        "STRICT OUTPUT FORMAT — NON-NEGOTIABLE: your entire reply must be one single valid JSON object. " +
        "No markdown code fences (no ```json). No preamble. No trailing commentary. " +
        "Any text outside the JSON object is a format violation. " +
        "LANGUAGE OF OUTPUT — NON-NEGOTIABLE: every string value inside the JSON (issue, explanation, summary, rationale) " +
        "must be written in English, regardless of the target language being evaluated. " +
        "The JSON must exactly match this shape: " +
        '{"axes": {' +
        '"accuracy":     [{"issue": "...", "severity": "Critical|Major|Minor|Neutral", "explanation": "..."}], ' +
        '"terminology":  [...], ' +
        '"fluency":      [...], ' +
        '"style":        [...], ' +
        '"completeness": [...] ' +
        '}, ' +
        '"aiScore": {"value": 1, "rationale": "..."}, ' +
        '"summary": "..."} ' +
        "Use an empty array for any axis with no issues, but always include all five axis keys. " +
        "Severity meanings — Critical: fundamentally wrong or changes meaning; Major: clear error a professional translator would not make; Minor: small imprecision; Neutral: observation worth noting, not an actual error. " +
        "aiScore.value must be an integer from 1 to 10 reflecting the overall professional translation quality. " +
        "9-10: publication-ready, native-level, fully compliant with platform guidelines; " +
        "7-8: good translation with minor defects; " +
        "5-6: acceptable but with notable gaps; " +
        "3-4: insufficient quality for professional use; " +
        "1-2: inadequate or incorrect translation.";

    var systemInstructionPrompt =
        'ABSOLUTE LANGUAGE REQUIREMENT: your entire output must be written in English only — ' +
        'no matter what target language is being evaluated, every single word of your response must be in English. ' +
        'This applies to every field, every explanation, and every summary inside the JSON. ' +
        'Writing any part of your output in the target language is a critical failure. ' +
        '\n\n' +
        'You are an authoritative Senior Translation Quality Assessor and localization specialist. ' +
        'Evaluate the candidate\'s professional translation for Question ' + questionIndex + '. ' +
        '\n\n' +
        'TARGET LANGUAGE: ' + selectedLangName + ' (' + selectedLangCode + '). ' +
        'Evaluate the translation against the standards, conventions, and guidelines applicable to ' + selectedLangName + ' (' + selectedLangCode + '). ' +
        'Platform-specific terminology, button names, and UI conventions may vary by language — apply the correct localization standard for this language. ' +
        '\n\n' +
        'PLATFORM CONTEXT: ' + platformContext + ' ' +
        '\n\n' +
        'Evaluate the translation across the following five axes: ' +
        'ACCURACY: semantic fidelity to the source text — no omissions, no additions, no meaning distortion. ' +
        'TERMINOLOGY: correct use of platform-specific terms, brand names, and interface conventions for ' + selectedLangName + ' (' + selectedLangCode + '). ' +
        'Note that controller button names (A, B, X, Y etc.) and system UI labels follow platform-specific localization guidelines that vary per language and publisher. ' +
        'FLUENCY: naturalness and readability in the target language — the translation should read effortlessly to a native speaker. ' +
        'STYLE: appropriate register for the context (formal/technical for system messages; energetic/dynamic for sports commentary). ' +
        'COMPLETENESS: no source elements omitted; variables in {curly braces} such as {player_name} and {team_name} must be preserved verbatim and untranslated. ' +
        '\n\n' +
        jsonSchemaInstruction + ' ' +
        '\n\n' +
        'The source text (English) is delimited below between <SOURCE_TEXT> and </SOURCE_TEXT>. ' +
        'The candidate\'s translation is delimited between <CANDIDATE_TRANSLATION> and </CANDIDATE_TRANSLATION>. ' +
        'Only evaluate the translation against the source — do not evaluate the source itself. ' +
        '\n\n' +
        '<SOURCE_TEXT>\n' + sourceText + '\n</SOURCE_TEXT>' +
        '\n\n' +
        '<CANDIDATE_TRANSLATION>\n' + candidateValue + '\n</CANDIDATE_TRANSLATION>' +
        '\n\nLANGUAGE REMINDER: your output is in English only — every word of your JSON output must be in English.' +
        '\nFORMAT REMINDER: reply with the JSON object only — nothing before it, nothing after it.';

    return systemInstructionPrompt;
}
