function toggleDarkMode(){
    document.body.classList.toggle('dark-mode');
    var dark = document.body.classList.contains('dark-mode');
    document.getElementById('themeToggle').innerHTML = dark ? "☀️ Light Mode" : "🌙 Dark Mode";
}

function updateProviderUI(){
    var p = document.getElementById('aiProviderSelect');
    var hf = document.getElementById('hfKeyRow'), co = document.getElementById('cohereKeyRow');
    var note = document.getElementById('providerLanguageNote');
    if (!p || !hf || !co || !note) return;
    if (p.value === 'cohere'){
        hf.style.display = 'none'; co.style.display = 'flex';
        note.innerHTML = '✅ <strong>Strong across all 32 languages in the dropdown above</strong> — Cohere's Command A+ officially lists 48 supported languages, including dedicated work on Arabic dialects and non-European languages. Still spot-check uncommon scripts since this model is new.';
    } else {
        hf.style.display = 'flex'; co.style.display = 'none';
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
        if (score) score.value = "";
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
