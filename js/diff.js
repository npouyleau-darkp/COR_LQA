function escapeHtmlHtmlEntities(str){
    return (str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

function computeLqaTextDiffSegments(sourceText, targetText, mode){
    var src = sourceText || "", tgt = targetText || "";
    var s = [], t = [];
    if (mode === "cjk"){ s = Array.from(src); t = Array.from(tgt); }
    else if (mode === "paragraph"){ s = src.split(/(\n+)/); t = tgt.split(/(\n+)/); }
    else { s = src.split(/(\s+)/); t = tgt.split(/(\s+)/); }

    var n = s.length, m = t.length;
    var grid = Array(n + 1).fill(null).map(function(){ return Array(m + 1).fill(0); });
    for (var i = 1; i <= n; i++)
        for (var j = 1; j <= m; j++)
            grid[i][j] = (s[i-1] === t[j-1]) ? grid[i-1][j-1] + 1 : Math.max(grid[i-1][j], grid[i][j-1]);

    var i = n, j = m, out = [];
    while (i > 0 || j > 0){
        if (i > 0 && j > 0 && s[i-1] === t[j-1]){ out.unshift(escapeHtmlHtmlEntities(s[i-1])); i--; j--; }
        else if (j > 0 && (i === 0 || grid[i][j-1] >= grid[i-1][j])){
            var ins = t[j-1];
            out.unshift((ins.trim() === "" && mode !== "cjk") ? ins : '<span class="diff-insertion">' + escapeHtmlHtmlEntities(ins) + '</span>');
            j--;
        } else {
            var del = s[i-1];
            if (!(del.trim() === "" && mode !== "cjk")) out.unshift('<span class="diff-deletion">' + escapeHtmlHtmlEntities(del) + '</span>');
            i--;
        }
    }
    return out.join("");
}

function executeLqaDiffAuditor(qi){
    var cand = document.getElementById('cand_q' + qi).value;
    var refEl = document.getElementById('correction_q' + qi) || document.getElementById('ref_q' + qi);
    var ref = refEl ? refEl.value : '';
    var langMenu = document.getElementById('globalCandidateLanguage');
    var lang = langMenu ? langMenu.value : "en-US";
    var mode = (lang.indexOf("zh") === 0 || lang.indexOf("ja") === 0) ? "cjk" : "spaced";
    var longFallback = false;
    if (cand.length + ref.length > LONG_TEXT_DIFF_THRESHOLD){ mode = "paragraph"; longFallback = true; }

    var box = document.getElementById('report_q' + qi);
    if (!box) return;
    if (!cand.trim() && !ref.trim()){
        box.innerHTML = '<span style="color:#dc2626;font-weight:600;">Error: Inputs are empty.</span>';
        return;
    }
    var html = computeLqaTextDiffSegments(cand, ref, mode);
    if (longFallback) html = '<div class="report-meta-note">Long text — showing paragraph-level comparison.</div>' + html;
    box.innerHTML = html;
}

function runDiffSection(indices){ indices.forEach(executeLqaDiffAuditor); }
