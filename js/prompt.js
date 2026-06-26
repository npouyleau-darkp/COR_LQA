function buildLqaSystemPrompt(questionIndex, candidateValue, selectedLangCode, selectedLangName){
    var promptContextInstruction = "";
    var proficiencyInstruction = "";
    var proficiencySchemaClause = "";

    // Language injection (patterns, reference scale, regional variants)
    var langInj = (typeof getLangInjection === 'function')
        ? getLangInjection(selectedLangCode)
        : { LANGUAGE_REFERENCE_DATA: '', LANGUAGE_PATTERNS: '', LANGUAGE_VARIANTS_APPLICABLE: 'N/A' };

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

        var refScale = langInj.LANGUAGE_REFERENCE_DATA
            ? "PROFICIENCY SCALE (" + selectedLangName + "): " + langInj.LANGUAGE_REFERENCE_DATA + " "
            : "";

        var patternsClause = langInj.LANGUAGE_PATTERNS
            ? "NON-NATIVE PATTERN WATCH: the following patterns are reliable indicators of non-native acquisition in " + selectedLangName + " — watch for them without treating every occurrence as an error: " + langInj.LANGUAGE_PATTERNS + ". "
            : "";

        proficiencyInstruction =
            "PROFICIENCY ASSESSMENT (mandatory): Assign a proficiency level 1–5 based on the official scale for this language. " +
            "Level 5 = highest (C2 / N1 / HSK6 / TOPIK6 / Distinguished / Istimewa). " +
            "Level 1 = lowest (A1-A2 / N5 / HSK1-2 / TOPIK1 / Novice / Marginal). " +
            refScale +
            "Compare the candidate's text holistically against the descriptors above and assign the level that best matches their demonstrated ability. " +
            "Do NOT default to a middle value — justify your choice. " +
            patternsClause +
            "Capture the level in the proficiencyLevel field of your JSON response.";

        proficiencySchemaClause =
            '"proficiencyLevel": {"scale": "CEFR|JLPT|HSK|TOPIK|ACTFL|TORFL|TOCFL|UKBI", "level": 1, "code": "B2|N2|...", "rationale": "..."}, ';
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
        // Use language_variants.json data if available, else fall back to config.js
        if (langInj.LANGUAGE_VARIANTS_APPLICABLE && langInj.LANGUAGE_VARIANTS_APPLICABLE !== 'N/A'){
            regionalConsistencyClause =
                "REGIONAL CONSISTENCY CHECK: " + langInj.LANGUAGE_VARIANTS_APPLICABLE + " " +
                "If you detect clear regional variant markers that do not match the expected variant, " +
                "set regionalConsistency.applicable to true and describe the specific markers in regionalConsistency.note. " +
                "If detection is uncertain, write: 'Region Detection: UNCERTAIN — manual specification in briefing recommended'. " +
                "Do NOT force a region assignment. This is a factual observation for the recruiter, " +
                "NOT a grammar or spelling error — never list it under any pillar.";
        } else if (REGIONAL_VARIANT_CONTRAST[selectedLangCode]){
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

    var issueFieldRule = questionIndex === '3_2'
        ? "ISSUE FIELD RULE — NON-NEGOTIABLE: the \"issue\" field must be a short English label that names " +
          "the type of error and embeds the candidate's exact problematic word or phrase quoted verbatim in their " +
          "language, using the typographically correct quotation marks for that language " +
          "(« » for French, „ " for German, " " for English, " +
          "「」 for Japanese, 「」 for Korean, etc.). " +
          "The format must mirror Q3-1 style: [Brief English description] + [verbatim candidate text in correct quotes]. " +
          "Correct examples: " +
          "'Missing plural agreement in « des armures brillante »', " +
          "'Incorrect expression « en faite »', " +
          "'Subject-verb agreement error in „He fight enemies\"'. " +
          "The verbatim candidate text in the issue field must never be translated or paraphrased. " +
          "The explanation field is where you explain the problem and correct form, entirely in English. "
        : "";

    var langOutputRule = questionIndex === '3_2'
        ? "LANGUAGE OF OUTPUT — NON-NEGOTIABLE: the explanation, note, summary, verdict, and rationale fields " +
          "must be written in English, regardless of the language the candidate wrote in. "
        : "LANGUAGE OF OUTPUT — NON-NEGOTIABLE: every string value inside the JSON (issue, explanation, note, summary, verdict) " +
          "must be written in English, regardless of the language the candidate wrote in. ";

    var scoringMethodology =
        "SCORING METHODOLOGY: " +
        "Per-pillar subscore = 10 - (Critical x 1.0 + Major x 0.5 + Minor x 0.1), minimum 0. " +
        "Pillar weights: Grammar 40%, Spelling 25%, Fluency 20%, Style 15%. " +
        "Final AI score = round(grammar_subscore x 0.40 + spelling_subscore x 0.25 + fluency_subscore x 0.20 + style_subscore x 0.15). " +
        "Report the per-pillar subscores in scoreBreakdown. The aiScore.value must equal the weighted final score. ";

    var jsonSchemaInstruction =
        "STRICT OUTPUT FORMAT — NON-NEGOTIABLE: your entire reply must be one single valid JSON object. " +
        "No markdown code fences (no ```json). No preamble. No trailing commentary. " +
        "Any text outside the JSON object is a format violation. " +
        langOutputRule +
        issueFieldRule +
        scoringMethodology +
        "The JSON must exactly match this shape: " +
        '{"pillars": {"spelling": [{"issue": "...", "severity": "Critical|Major|Minor|Neutral", "confidence": "High|Medium|Low", "explanation": "..."}], ' +
        '"grammar": [...], "fluency": [...], "style": [...]}, ' +
        '"scoreBreakdown": {"grammar": {"subscore": 10, "weight": 0.40}, "spelling": {"subscore": 10, "weight": 0.25}, "fluency": {"subscore": 10, "weight": 0.20}, "style": {"subscore": 10, "weight": 0.15}}, ' +
        '"regionalConsistency": {"applicable": true|false, "note": "..."}, ' +
        proficiencySchemaClause +
        '"aiScore": {"value": 1, "rationale": "..."}, ' +
        '"summary": "..."} ' +
        "Use an empty array for any pillar with no issues, but always include all four pillar keys. " +
        "Severity meanings — Critical: blocks understanding or changes meaning; Major: a clear error a native " +
        "speaker would immediately notice; Minor: a small, nitpick-level issue; Neutral: not actually an error, " +
        "included only as a worth-mentioning observation. " +
        "Confidence meanings — High: certain this is a genuine issue; Medium: likely an issue but with some doubt; Low: flagging cautiously, could be acceptable variation. " +
        "aiScore.value must be an integer from 1 to 10 reflecting the overall quality of the writing. " +
        "9-10: native-level, publication-ready; 7-8: good with minor issues; 5-6: acceptable but notable gaps; " +
        "3-4: insufficient for professional use; 1-2: poor or incomprehensible.";

    var mqmReference =
        "FRAMEWORK: this evaluation aligns with MQM (Multidimensional Quality Metrics v2) and LISA QA standards. " +
        "Proficiency scale used is the official reference for " + selectedLangName + " (see PROFICIENCY ASSESSMENT below). ";

    var systemInstructionPrompt =
        'ABSOLUTE LANGUAGE REQUIREMENT: your entire output must be written in English only — ' +
        'no matter what language the candidate wrote in, every single word of your response must be in English. ' +
        'This applies to every field, every explanation, every note, and every summary inside the JSON. ' +
        'Writing any part of your output in the candidate\'s language is a critical failure. ' +
        '\n\n' +
        mqmReference +
        '\n\n' +
        'You are an authoritative Senior LQA Lead. Analyze the candidate response text for Question ' +
        questionIndex + '. ' +
        promptContextInstruction + ' ' +
        proficiencyInstruction + ' ' +
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

    // Language injection for translation prompt
    var langInj = (typeof getLangInjection === 'function')
        ? getLangInjection(selectedLangCode)
        : { LANGUAGE_REFERENCE_DATA: '', LANGUAGE_PATTERNS: '', LANGUAGE_VARIANTS_APPLICABLE: 'N/A' };

    var patternsClause = langInj.LANGUAGE_PATTERNS
        ? "NON-NATIVE PATTERN WATCH: the following patterns are known non-native indicators in " + selectedLangName + " — use them to detect subtle quality issues: " + langInj.LANGUAGE_PATTERNS + ". "
        : "";

    var regionalCoherenceSchema =
        '"regionalCoherence": {"applicable": true|false, "detectedRegion": "Region name or UNCERTAIN", "consistency": "Confirmed|Mixed|Inconsistent", "issues": [{"location": "...", "variant": "...", "note": "..."}]}';

    var regionalCoherenceInstruction = langInj.LANGUAGE_VARIANTS_APPLICABLE && langInj.LANGUAGE_VARIANTS_APPLICABLE !== 'N/A'
        ? "REGIONAL COHERENCE: " + langInj.LANGUAGE_VARIANTS_APPLICABLE + " " +
          "Detect whether the translation uses consistent regional conventions throughout. " +
          "If mixing is found, set regionalCoherence.consistency to 'Mixed' or 'Inconsistent' and list the specific mixing instances. " +
          "If region is uncertain, set detectedRegion to 'UNCERTAIN'. Do NOT force a region assignment. "
        : "REGIONAL COHERENCE: set regionalCoherence.applicable to false and detectedRegion to 'N/A' for this language. ";

    var jsonSchemaInstruction =
        "STRICT OUTPUT FORMAT — NON-NEGOTIABLE: your entire reply must be one single valid JSON object. " +
        "No markdown code fences (no ```json). No preamble. No trailing commentary. " +
        "Any text outside the JSON object is a format violation. " +
        "LANGUAGE OF OUTPUT — NON-NEGOTIABLE: every string value inside the JSON (issue, explanation, summary, rationale) " +
        "must be written in English, regardless of the target language being evaluated. " +
        "The JSON must exactly match this shape: " +
        '{"axes": {' +
        '"accuracy":     [{"issue": "...", "severity": "Critical|Major|Minor|Neutral", "confidence": "High|Medium|Low", "explanation": "..."}], ' +
        '"terminology":  [{"issue": "...", "severity": "Critical|Major|Minor|Neutral", "confidence": "High|Medium|Low", "explanation": "..."}], ' +
        '"fluency":      [{"issue": "...", "severity": "Critical|Major|Minor|Neutral", "confidence": "High|Medium|Low", "explanation": "..."}], ' +
        '"style":        [{"issue": "...", "severity": "Critical|Major|Minor|Neutral", "confidence": "High|Medium|Low", "explanation": "..."}], ' +
        '"completeness": [{"issue": "...", "severity": "Critical|Major|Minor|Neutral", "confidence": "High|Medium|Low", "explanation": "..."}] ' +
        '}, ' +
        regionalCoherenceSchema + ', ' +
        '"aiScore": {"value": 1, "rationale": "..."}, ' +
        '"summary": "..."} ' +
        "Use an empty array for any axis with no issues, but always include all five axis keys. " +
        "Severity meanings — Critical: fundamentally wrong or changes meaning; Major: clear error a professional translator would not make; Minor: small imprecision; Neutral: observation worth noting, not an actual error. " +
        "Confidence meanings — High: standard contradicts translation explicitly or term standard violated; Medium: pattern-based concern or context partially ambiguous; Low: stylistic preference or regional variation (flag for recruiter review). " +
        "aiScore.value must be an integer from 1 to 10 reflecting the overall professional translation quality. " +
        "9-10: publication-ready, native-level, fully compliant with platform guidelines; " +
        "7-8: good translation with minor defects; " +
        "5-6: acceptable but with notable gaps; " +
        "3-4: insufficient quality for professional use; " +
        "1-2: inadequate or incorrect translation.";

    var mqmReference =
        "FRAMEWORK: this evaluation aligns with MQM (Multidimensional Quality Metrics v2) and LISA QA standards. ";

    var systemInstructionPrompt =
        'ABSOLUTE LANGUAGE REQUIREMENT: your entire output must be written in English only — ' +
        'no matter what target language is being evaluated, every single word of your response must be in English. ' +
        'This applies to every field, every explanation, and every summary inside the JSON. ' +
        'Writing any part of your output in the target language is a critical failure. ' +
        '\n\n' +
        mqmReference +
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
        patternsClause +
        '\n\n' +
        regionalCoherenceInstruction +
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
