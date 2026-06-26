function toggleDarkMode(){
    document.body.classList.toggle('dark-mode');
    var dark = document.body.classList.contains('dark-mode');
    document.getElementById('themeToggle').innerHTML = dark ? "☀️ Light Mode" : "🌙 Dark Mode";
}

function updateProviderUI(){
    var p = document.getElementById('aiProviderSelect');
    var hf = document.getElementById('hfApiKey'), co = document.getElementById('cohereApiKey'), ge = document.getElementById('geminiApiKey');
    var note = document.getElementById('providerLanguageNote');
    if (!p || !hf || !co || !ge || !note) return;
    hf.style.display = 'none'; co.style.display = 'none'; ge.style.display = 'none';
    if (p.value === 'cohere'){
        co.style.display = 'block';
        note.innerHTML = '✅ <strong>Strong across all 32 languages in the dropdown above</strong> — Cohere\'s Command A+ officially lists 48 supported languages, including dedicated work on Arabic dialects and non-European languages. Still spot-check uncommon scripts since this model is new.';
    } else if (p.value === 'gemini'){
        ge.style.display = 'block';
        note.innerHTML = '✅ <strong>Excellent multilingual coverage</strong> — Gemini 2.5 Flash handles European, Asian, and Middle Eastern languages well. Free tier (1,500 req/day). Data privacy protected under EEA rules even on the free tier.';
    } else {
        hf.style.display = 'block';
        note.innerHTML = '✅ <strong>Solid:</strong> French, Spanish, German, Italian, Portuguese, Dutch and most other Western European languages. ⚠️ <strong>Documented weak spots:</strong> Chinese and Arabic. Have a human double-check those languages, or switch to Cohere above.';
    }
}

function updateLanguageLockState(){
    var lang = document.getElementById('globalCandidateLanguage');
    var warn = document.getElementById('langLockWarningRow');
    var has = !!(lang && lang.value);
    document.querySelectorAll('.btn-diff,.btn-ai,.btn-analyze-all').forEach(function(b){ b.disabled = !has; });
    if (warn) warn.style.display = has ? 'none' : 'flex';
    refreshExceptionsTracker();
}

function initScorePickers(){
    document.querySelectorAll('input.score-input').forEach(function(input){
        var row = input.parentNode;
        var picker = document.createElement('div');
        picker.className = 'score-picker';
        var display = document.createElement('span');
        display.className = 'score-value-display';
        display.textContent = '—';

        for (var v = 0; v <= 10; v++){
            (function(val){
                var dot = document.createElement('div');
                dot.className = 'score-dot';
                dot.setAttribute('data-v', val);
                dot.textContent = val;
                dot.title = val + ' / 10';
                dot.addEventListener('click', function(){
                    picker.querySelectorAll('.score-dot').forEach(function(d){ d.classList.remove('selected'); });
                    dot.classList.add('selected');
                    input.value = val;
                    display.textContent = val;
                });
                picker.appendChild(dot);
            })(v);
        }

        input._pickerRef = picker;
        input._displayRef = display;
        row.insertBefore(picker, input);
        row.insertBefore(display, input);
    });
}

function resetScorePicker(input){
    if (!input) return;
    input.value = '';
    if (input._pickerRef) input._pickerRef.querySelectorAll('.score-dot').forEach(function(d){ d.classList.remove('selected'); });
    if (input._displayRef) input._displayRef.textContent = '—';
}

function clearDashboardFields(){
    if (!confirm("Are you sure you want to clear all data text fields in this grading dashboard?")) return;
    var allIds = ['1_2','1_3','1_4','1_5','2_1','2_2','2_3','2_4','2_5','2_6','2_7','2_8','3_1','3_2'];
    var noAiIds = ['1_2','1_3','1_4','1_5','2_1','2_2','2_3','2_4'];
    var aiIds = ['2_5','2_6','2_7','2_8','3_1','3_2'];
    var correctionIds = ['1_2','1_3','1_4','1_5','2_1','2_2','2_3','2_4'];

    allIds.forEach(function(id){
        var cand = document.getElementById('cand_q' + id);
        var notes = document.getElementById('notes_q' + id);
        var score = document.getElementById('score_q' + id);
        if (cand) cand.value = "";
        if (notes) notes.value = "";
        resetScorePicker(score);
    });
    correctionIds.forEach(function(id){
        var corr = document.getElementById('correction_q' + id);
        if (corr) corr.value = "";
    });
    aiIds.forEach(function(id){
        var rpt = document.getElementById('report_q' + id);
        if (rpt) rpt.innerHTML = "[AI grading report empty]";
    });
}
