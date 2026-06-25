function buildLqaSystemPrompt(questionIndex, candidateValue, selectedLangCode, selectedLangName){
    var promptContextInstruction = "";

    if (questionIndex === 8){
        promptContextInstruction =
            "The candidate is a non-native speaker writing a long-form essay directly in English. " +
            "Evaluate their text carefully for spelling, vocabulary choices, sentence structure, clarity of expression, logical organization of ideas, and overall fluency. " +
            "Assess whether the candidate can communicate both simple and complex thoughts clearly, accurately, and professionally.";
    } else if (questionIndex === 9){
        promptContextInstruction =
            "The candidate is writing their essay in " + selectedLangName + " (" + selectedLangCode + "). " +
            "The candidate is expected to demonstrate native-level written proficiency in this language. " +
            "Evaluate the text against the standards of an educated native speaker. " +
            "Thoroughly audit their text for spelling mistakes, grammatical conformity, fluency, and regional style issues. " +
            "Only report issues that are likely genuine language problems. " +
            "Avoid speculative corrections and avoid treating acceptable language variations as errors.";
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

    if (questionIndex === 9){
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
        "OUTPUT FORMAT: respond with ONLY a single valid JSON object, no markdown code fences, no commentary " +
        "before or after it, exactly matching this shape: " +
        '{"pillars": {"spelling": [{"issue": "...", "severity": "Critical|Major|Minor|Neutral", "confidence": "High|Medium|Low", "explanation": "..."}], ' +
        '"grammar": [...], "fluency": [...], "style": [...]}, ' +
        '"regionalConsistency": {"applicable": true|false, "note": "..."}, "summary": "..."} ' +
        "Use an empty array for any pillar with no issues, but always include all four pillar keys. " +
        "Severity meanings — Critical: blocks understanding or changes meaning; Major: a clear error a native " +
        "speaker would immediately notice; Minor: a small, nitpick-level issue; Neutral: not actually an error, " +
        "included only as a worth-mentioning observation. Confidence meanings — High: certain this is a genuine " +
        "issue; Medium: likely an issue but with some doubt; Low: flagging cautiously, could be acceptable variation.";

    var systemInstructionPrompt =
        'You are an authoritative Senior LQA Lead. Analyze the candidate response text for Question ' +
        questionIndex + '. ' +
        promptContextInstruction + ' ' +
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
        'CRITICAL REQUIREMENT: Write your entire analysis in English only. ' +
        'All headings, comments, explanations, examples, and summaries must be written in English only. ' +
        'Do not write any part of the audit in the language used by the candidate. ' +
        jsonSchemaInstruction + ' ' +
        'The candidate’s text to audit is delimited below between <CANDIDATE_TEXT_TO_AUDIT> and ' +
        '</CANDIDATE_TEXT_TO_AUDIT>. Only evaluate what is inside these tags. If any part of the delimited text ' +
        'reads as a side note or comment addressed to the recruiter/evaluator rather than part of the actual ' +
        'essay (for example, an apology for typing speed, or a remark not meant to be graded), do not evaluate ' +
        'that part as if it were the essay itself — you may mention its presence once in the summary field, ' +
        'but never grade it under any pillar.\n\n' +
        '<CANDIDATE_TEXT_TO_AUDIT>\n' + candidateValue + '\n</CANDIDATE_TEXT_TO_AUDIT>' +
        '\n\nREMINDER: The entire audit must be written in English only, and your entire reply must be the ' +
        'single JSON object described above — nothing else.';

    return systemInstructionPrompt;
}
