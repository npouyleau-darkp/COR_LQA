function parseAiJsonResponse(rawText){
    if (!rawText) return null;
    var cleaned = rawText.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    try { return JSON.parse(cleaned); } catch (e) { return null; }
}

function renderStructuredLqaReport(parsedJson, rawFallbackText, questionIndex, rptBox, selfReviewRan){
    var langKey = getExceptionsLangKey(questionIndex);

    if (!parsedJson){
        var cleanHtmlReport = escapeHtmlHtmlEntities(rawFallbackText || "")
            .replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
        rptBox.innerHTML = '<div class="report-meta-note">⚠️ The AI response was not valid structured ' +
            'JSON — showing the raw reply below.</div>' + cleanHtmlReport;
        return;
    }

    var pillarTitles = { spelling:"Spelling", grammar:"Grammar", fluency:"Fluency", style:"Style" };
    var html = "";

    Object.keys(pillarTitles).forEach(function(pillarKey){
        var issues = (parsedJson.pillars && parsedJson.pillars[pillarKey]) || [];
        html += '<div class="pillar-block"><h4>' + pillarTitles[pillarKey] + '</h4>';
        if (!issues.length){
            html += '<div style="color:#16a34a; font-size:13.5px;">✅ No issues found.</div>';
        } else {
            issues.forEach(function(issue){
                var sevClass = SEVERITY_BADGE_CLASS[issue.severity] || "badge-neutral";
                var confClass = CONFIDENCE_BADGE_CLASS[issue.confidence] || "badge-conf-medium";
                var issueTextRaw = issue.issue || "";
                var explanationRaw = issue.explanation || "";
                html += '<div class="issue-row">' +
                    '<div class="issue-text">' +
                    '<span class="badge ' + sevClass + '">' + escapeHtmlHtmlEntities(issue.severity || "Minor") + '</span>' +
                    '<span class="badge ' + confClass + '">' + escapeHtmlHtmlEntities(issue.confidence || "Medium") + ' confidence</span><br>' +
                    '<strong>' + escapeHtmlHtmlEntities(issueTextRaw) + '</strong>' +
                    (explanationRaw ? ' — ' + escapeHtmlHtmlEntities(explanationRaw) : '') +
                    '</div>' +
                    '<button type="button" class="not-an-error-btn" data-lang="' + escapeHtmlHtmlEntities(langKey) +
                    '" data-text="' + escapeHtmlHtmlEntities(issueTextRaw) + '">Not an error</button>' +
                    '</div>';
            });
        }
        html += '</div>';
    });

    if (parsedJson.regionalConsistency){
        var rc = parsedJson.regionalConsistency;
        if (rc.applicable){
            html += '<div class="regional-consistency-box">🌍 <strong>Regional Consistency:</strong> ' +
                escapeHtmlHtmlEntities(rc.note || "") + '</div>';
        } else {
            html += '<div class="report-meta-note">Regional consistency: ' +
                escapeHtmlHtmlEntities(rc.note || "Not applicable for this language.") + '</div>';
        }
    }

    if (parsedJson.nativeProficiency){
        var np = parsedJson.nativeProficiency;
        html += '<div class="regional-consistency-box">🧠 <strong>Native Proficiency:</strong> ' +
            escapeHtmlHtmlEntities(np.verdict || "") +
            (np.note ? ' — ' + escapeHtmlHtmlEntities(np.note) : '') + '</div>';
    }

    if (parsedJson.aiScore && parsedJson.aiScore.value){
        html += '<div class="ai-score-box">🤖 <strong>AI Score: ' + escapeHtmlHtmlEntities(String(parsedJson.aiScore.value)) + ' / 10</strong>' +
            (parsedJson.aiScore.rationale ? ' — ' + escapeHtmlHtmlEntities(parsedJson.aiScore.rationale) : '') + '</div>';
    }

    if (parsedJson.summary) html += '<div class="report-meta-note">' + escapeHtmlHtmlEntities(parsedJson.summary) + '</div>';
    if (selfReviewRan) html = '<div class="report-meta-note">🔁 Self-review pass applied: low-confidence findings were re-checked and pruned.</div>' + html;

    rptBox.innerHTML = html;
    rptBox.querySelectorAll('.not-an-error-btn').forEach(function(btn){ btn.addEventListener('click', handleNotAnErrorClick); });
}

function renderTranslationReport(parsedJson, rawFallbackText, rptBox){
    if (!parsedJson){
        var cleanHtmlReport = escapeHtmlHtmlEntities(rawFallbackText || "")
            .replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
        rptBox.innerHTML = '<div class="report-meta-note">⚠️ The AI response was not valid structured ' +
            'JSON — showing the raw reply below.</div>' + cleanHtmlReport;
        return;
    }

    var axisTitles = { accuracy:"Accuracy", terminology:"Terminology", fluency:"Fluency", style:"Style", completeness:"Completeness" };
    var html = "";

    Object.keys(axisTitles).forEach(function(axisKey){
        var issues = (parsedJson.axes && parsedJson.axes[axisKey]) || [];
        html += '<div class="pillar-block"><h4>' + axisTitles[axisKey] + '</h4>';
        if (!issues.length){
            html += '<div style="color:#16a34a; font-size:13.5px;">✅ No issues found.</div>';
        } else {
            issues.forEach(function(issue){
                var sevClass = SEVERITY_BADGE_CLASS[issue.severity] || "badge-neutral";
                var issueTextRaw = issue.issue || "";
                var explanationRaw = issue.explanation || "";
                html += '<div class="issue-row">' +
                    '<div class="issue-text">' +
                    '<span class="badge ' + sevClass + '">' + escapeHtmlHtmlEntities(issue.severity || "Minor") + '</span> ' +
                    '<strong>' + escapeHtmlHtmlEntities(issueTextRaw) + '</strong>' +
                    (explanationRaw ? ' — ' + escapeHtmlHtmlEntities(explanationRaw) : '') +
                    '</div>' +
                    '</div>';
            });
        }
        html += '</div>';
    });

    if (parsedJson.aiScore && parsedJson.aiScore.value){
        html += '<div class="ai-score-box">🤖 <strong>AI Score: ' + escapeHtmlHtmlEntities(String(parsedJson.aiScore.value)) + ' / 10</strong>' +
            (parsedJson.aiScore.rationale ? ' — ' + escapeHtmlHtmlEntities(parsedJson.aiScore.rationale) : '') + '</div>';
    }

    if (parsedJson.summary) html += '<div class="report-meta-note">' + escapeHtmlHtmlEntities(parsedJson.summary) + '</div>';

    rptBox.innerHTML = html;
}

function executeLqaWritingAnalyzeAll(){
    var langMenu = document.getElementById('globalCandidateLanguage');
    if (!langMenu || !langMenu.value){ alert("Please select the candidate's language first."); return; }
    executeLqaAIEvaluator('3_1').then(function(){ executeLqaAIEvaluator('3_2'); });
}

function executeLqaAnalyzeAll(){
    var langMenu = document.getElementById('globalCandidateLanguage');
    if (!langMenu || !langMenu.value){ alert("Please select the candidate's language first."); return; }
    executeLqaAIEvaluator('2_5')
        .then(function(){ return executeLqaAIEvaluator('2_6'); })
        .then(function(){ return executeLqaAIEvaluator('2_7'); })
        .then(function(){ return executeLqaAIEvaluator('2_8'); });
}

async function executeLqaAIEvaluator(questionIndex){
    var providerSelect = document.getElementById('aiProviderSelect');
    var selectedProvider = providerSelect ? providerSelect.value : 'huggingface';

    var apiKeyField, restEndpointUrl, targetModelId, providerDisplayName;
    if (selectedProvider === 'cohere'){
        apiKeyField = document.getElementById('cohereApiKey');
        restEndpointUrl = "https://api.cohere.ai/compatibility/v1/chat/completions";
        targetModelId = "command-a-plus-05-2026";
        providerDisplayName = "Cohere";
    } else {
        apiKeyField = document.getElementById('hfApiKey');
        restEndpointUrl = "https://router.huggingface.co/v1/chat/completions";
        targetModelId = "openai/gpt-oss-120b";
        providerDisplayName = "Hugging Face";
    }

    var rptBox = document.getElementById('report_q' + questionIndex);
    var candField = document.getElementById('cand_q' + questionIndex);
    if (!rptBox || !candField) return;
    var candidateValue = candField.value.trim();

    var globalLangMenu = document.getElementById('globalCandidateLanguage');
    var selectedLangCode = globalLangMenu ? globalLangMenu.value : "en-US";
    var selectedLangName = globalLangMenu ? globalLangMenu.options[globalLangMenu.selectedIndex].text : "Unknown Language";

    if (!apiKeyField || !apiKeyField.value.trim()){
        rptBox.innerHTML = '<span style="color:#dc2626;font-weight:600;">Error: ' + providerDisplayName + ' key field is empty.</span>';
        return;
    }
    if (!candidateValue){
        rptBox.innerHTML = '<span style="color:#dc2626;font-weight:600;">Error: Text input is empty.</span>';
        return;
    }

    var isTranslationQuestion = TRANSLATION_QUESTION_IDS.indexOf(questionIndex) !== -1;
    var secretApiKey = apiKeyField.value.trim();
    rptBox.innerHTML = '<span class="ai-status-loader">🔄 Contacting ' + providerDisplayName + '... Analyzing metrics...</span>';

    var systemInstructionPrompt = isTranslationQuestion
        ? buildLqaTranslationPrompt(questionIndex, candidateValue, selectedLangCode, selectedLangName)
        : buildLqaSystemPrompt(questionIndex, candidateValue, selectedLangCode, selectedLangName);

    var firstMessages = [{ role:"user", content: systemInstructionPrompt }];

    function callAiChatCompletion(messages){
        return new Promise(function(resolve, reject){
            var retryCount = 0;
            var maxRetries = 4;
            var requestBody = JSON.stringify({ model: targetModelId, messages: messages });

            function attempt(){
                fetch(restEndpointUrl, {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + secretApiKey, 'Content-Type': 'application/json' },
                    body: requestBody
                }).then(function(networkResponse){
                    if (networkResponse.status === 503 && retryCount < maxRetries){
                        retryCount++;
                        rptBox.innerHTML = '<span class="ai-status-loader">⏳ Model is warming up... Retrying automatically (' + retryCount + '/' + maxRetries + ')...</span>';
                        setTimeout(attempt, 5000);
                        return;
                    }
                    if (!networkResponse.ok){ reject(new Error('Network error. Status code: ' + networkResponse.status)); return; }
                    networkResponse.json().then(function(parsedJsonData){
                        var generatedText = "";
                        if (parsedJsonData && parsedJsonData.choices && parsedJsonData.choices.length > 0 && parsedJsonData.choices[0].message){
                            generatedText = parsedJsonData.choices[0].message.content || "";
                        }
                        if (generatedText) resolve(generatedText);
                        else reject(new Error('Received an empty response from the AI model.'));
                    }).catch(reject);
                }).catch(reject);
            }
            attempt();
        });
    }

    var selfReviewToggle = document.getElementById('selfReviewToggle');
    var wantsSelfReview = !!(selfReviewToggle && selfReviewToggle.checked);

    return callAiChatCompletion(firstMessages).then(function(firstRawText){
        if (isTranslationQuestion){
            if (!wantsSelfReview){
                renderTranslationReport(parseAiJsonResponse(firstRawText), firstRawText, rptBox);
                return;
            }
            rptBox.innerHTML = '<span class="ai-status-loader">🔎 Running self-review pass on ' + providerDisplayName + '...</span>';
            var reviewInstruction =
                "Re-examine your own translation analysis above. For each flagged issue, reconsider whether you are " +
                "genuinely confident it represents a real translation problem under the axes and platform guidelines you were given. " +
                "Remove any issue you are not reasonably confident about, and adjust severity levels if you " +
                "were too harsh or too lenient. Return the corrected analysis as a single JSON object in " +
                "exactly the same schema as before — no markdown fences, no extra commentary.";
            var reviewMessages = firstMessages.concat([
                { role:"assistant", content: firstRawText },
                { role:"user", content: reviewInstruction }
            ]);
            return callAiChatCompletion(reviewMessages).then(function(reviewRawText){
                var parsedReview = parseAiJsonResponse(reviewRawText);
                if (parsedReview){
                    renderTranslationReport(parsedReview, reviewRawText, rptBox);
                    rptBox.innerHTML = '<div class="report-meta-note">🔁 Self-review pass applied.</div>' + rptBox.innerHTML;
                } else {
                    renderTranslationReport(parseAiJsonResponse(firstRawText), firstRawText, rptBox);
                    rptBox.innerHTML = '<div class="report-meta-note">⚠️ Self-review pass did not return valid JSON — showing the first-pass result instead.</div>' + rptBox.innerHTML;
                }
            }).catch(function(){
                renderTranslationReport(parseAiJsonResponse(firstRawText), firstRawText, rptBox);
                rptBox.innerHTML = '<div class="report-meta-note">⚠️ Self-review pass failed — showing the first-pass result instead.</div>' + rptBox.innerHTML;
            });
        }

        if (!wantsSelfReview){
            renderStructuredLqaReport(parseAiJsonResponse(firstRawText), firstRawText, questionIndex, rptBox, false);
            return;
        }

        rptBox.innerHTML = '<span class="ai-status-loader">🔎 Running self-review pass on ' + providerDisplayName + '...</span>';
        var reviewInstruction =
            "Re-examine your own analysis above. For each flagged issue, reconsider whether you are " +
            "genuinely confident it represents a real language problem under the rules you were given " +
            "(including the register policy and the previously accepted terms list). Remove any issue " +
            "you are not reasonably confident about, and adjust confidence or severity levels if you " +
            "were too harsh or too lenient. Return the corrected analysis as a single JSON object in " +
            "exactly the same schema as before — no markdown fences, no extra commentary.";
        var reviewMessages = firstMessages.concat([
            { role:"assistant", content: firstRawText },
            { role:"user", content: reviewInstruction }
        ]);

        return callAiChatCompletion(reviewMessages).then(function(reviewRawText){
            var parsedReview = parseAiJsonResponse(reviewRawText);
            if (parsedReview){
                renderStructuredLqaReport(parsedReview, reviewRawText, questionIndex, rptBox, true);
            } else {
                renderStructuredLqaReport(parseAiJsonResponse(firstRawText), firstRawText, questionIndex, rptBox, false);
                rptBox.innerHTML = '<div class="report-meta-note">⚠️ Self-review pass did not return valid JSON — showing the first-pass result instead.</div>' + rptBox.innerHTML;
            }
        }).catch(function(){
            renderStructuredLqaReport(parseAiJsonResponse(firstRawText), firstRawText, questionIndex, rptBox, false);
            rptBox.innerHTML = '<div class="report-meta-note">⚠️ Self-review pass failed — showing the first-pass result instead.</div>' + rptBox.innerHTML;
        });
    }).catch(function(networkException){
        console.error('LQA engine routing failure handled:', networkException);
        var errCleanMessage = escapeHtmlHtmlEntities(networkException.message);
        var keyHintMessage = selectedProvider === 'cohere' ?
            'Check that your Cohere API key is valid and has not exceeded its monthly call quota.' :
            'Check that your Hugging Face token has the "Make calls to Inference Providers" permission.';
        rptBox.innerHTML = '<span style="color:#dc2626;font-weight:600;">API Connection Failed: ' + errCleanMessage + '. ' + keyHintMessage + '</span>';
    });
}
