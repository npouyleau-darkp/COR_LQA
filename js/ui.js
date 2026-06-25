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
        note.innerHTML = '✅ <strong>Strong across all 32 languages in the dropdown above</strong> — Cohere’s Command A+ officially lists 48 supported languages, including dedicated work on Arabic dialects and non-European languages. Still spot-check uncommon scripts since this model is new.';
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
    for (var i = 1; i <= 9; i++){
        var cand = document.getElementById('cand_q' + i);
        var ref = document.getElementById('ref_q' + i);
        var notes = document.getElementById('notes_q' + i);
        var rpt = document.getElementById('report_q' + i);
        if (cand) cand.value = "";
        if (ref) ref.value = "";
        if (notes) notes.value = "";
        if (rpt) rpt.innerHTML = (i <= 7) ? "[Diff report output container empty]" : "[Automated AI grading report empty]";
    }
}
