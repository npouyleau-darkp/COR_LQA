function sanitizeReportHtmlForPrint(rptBox){
    var clone = rptBox.cloneNode(true);
    clone.querySelectorAll('script,button').forEach(function(el){ el.remove(); });
    return clone.innerHTML;
}

function computeSectionAverage(questionIds){
    var total = 0, count = 0;
    questionIds.forEach(function(id){
        var el = document.getElementById('score_q' + id);
        if (el && el.value !== '' && !isNaN(el.value)){
            total += parseFloat(el.value);
            count++;
        }
    });
    return count > 0 ? (total / count).toFixed(1) + ' / 10 (' + count + ' scored)' : '— (no scores entered)';
}

function exportDashboardToPdf(){
    var firstName = (document.getElementById('candidateFirstName') || {}).value || '';
    var lastName  = (document.getElementById('candidateLastName')  || {}).value || '';
    var email     = (document.getElementById('candidateEmail')     || {}).value || '';
    var candidateLine = [firstName, lastName].filter(Boolean).join(' ');

    var sectionAIds = ['1_2','1_3','1_4','1_5'];
    var sectionBIds = ['2_1','2_2','2_3','2_4','2_5','2_6','2_7','2_8'];
    var sectionCIds = ['3_1','3_2'];

    var avgA = computeSectionAverage(sectionAIds);
    var avgB = computeSectionAverage(sectionBIds);
    var avgC = computeSectionAverage(sectionCIds);

    var css = [
        'body { font-family: Segoe UI, Arial, sans-serif; padding: 32px 40px; color: #1e293b; font-size: 14px; line-height: 1.6; }',
        'h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; }',
        '.candidate-meta { font-size: 14px; color: #475569; margin-bottom: 8px; }',
        '.section-averages { display: flex; gap: 16px; flex-wrap: wrap; margin: 16px 0 28px 0; }',
        '.avg-chip { padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 13px; }',
        '.avg-a { background: #eff6ff; border: 1px solid #93c5fd; color: #1e3a8a; }',
        '.avg-b { background: #f0fdf4; border: 1px solid #86efac; color: #14532d; }',
        '.avg-c { background: #fdf4ff; border: 1px solid #d8b4fe; color: #4c1d95; }',
        'h2 { font-size: 17px; font-weight: 700; color: #0f172a; border-left: 5px solid #2563eb; padding-left: 10px; margin: 32px 0 16px 0; }',
        'h3 { font-size: 14px; font-weight: 700; color: #1e293b; margin: 24px 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }',
        '.field-label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-top: 10px; margin-bottom: 3px; }',
        '.field-value { padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13.5px; white-space: pre-wrap; word-break: break-word; margin-bottom: 6px; }',
        '.score-chip { display: inline-block; padding: 4px 14px; border-radius: 20px; background: #0f172a; color: #fff; font-weight: 700; font-size: 13px; margin-top: 6px; }',
        '.report-section { margin-top: 8px; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; }',
        '.pillar-block { margin-bottom: 14px; }',
        '.pillar-block h4 { font-size: 13px; font-weight: 700; margin: 0 0 6px 0; color: #334155; }',
        '.issue-row { padding: 6px 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 6px; font-size: 13px; }',
        '.badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 1px 7px; border-radius: 10px; margin-right: 4px; }',
        '.badge-critical { background: #7f1d1d; color: #fff; }',
        '.badge-major { background: #dc2626; color: #fff; }',
        '.badge-minor { background: #f59e0b; color: #1e293b; }',
        '.badge-neutral { background: #94a3b8; color: #1e293b; }',
        '.badge-conf-high { background: #15803d; color: #fff; }',
        '.badge-conf-medium { background: #ca8a04; color: #fff; }',
        '.badge-conf-low { background: #64748b; color: #fff; }',
        '.ai-score-box { margin-top: 10px; padding: 8px 14px; border-radius: 6px; background: #f0fdf4; border: 1px solid #86efac; font-size: 13px; font-weight: 600; color: #14532d; }',
        '.regional-consistency-box { margin-top: 8px; padding: 8px 14px; border-radius: 6px; background: #eef2ff; border: 1px solid #6366f1; font-size: 13px; }',
        '.report-meta-note { font-size: 12px; color: #64748b; margin-top: 8px; font-style: italic; }',
        'hr { border: none; border-top: 1px solid #e2e8f0; margin: 28px 0; }',
        '@media print { body { padding: 16px; } }'
    ].join('\n');

    var sections = [
        {
            title: 'Section A — LQA Bugs',
            avgClass: 'avg-a',
            avgLabel: 'Section A',
            avg: avgA,
            questions: [
                { id: '1_2', label: 'Q 1-2 — Neon Racers', hasCorrection: true, hasAI: false },
                { id: '1_3', label: 'Q 1-3 — Diagnostic Node 3', hasCorrection: true, hasAI: false },
                { id: '1_4', label: 'Q 1-4 — Stellar Forge', hasCorrection: true, hasAI: false },
                { id: '1_5', label: 'Q 1-5 — CrimeCity Vice', hasCorrection: true, hasAI: false }
            ]
        },
        {
            title: 'Section B — Proofreading / Translation',
            avgClass: 'avg-b',
            avgLabel: 'Section B',
            avg: avgB,
            questions: [
                { id: '2_1', label: 'Q 2-1 — Proofread Segment Alpha', hasCorrection: true, hasAI: false },
                { id: '2_2', label: 'Q 2-2 — Proofread Segment Beta', hasCorrection: true, hasAI: false },
                { id: '2_3', label: 'Q 2-3 — Proofread Segment Gamma', hasCorrection: true, hasAI: false },
                { id: '2_4', label: 'Q 2-4 — Proofread Segment Delta', hasCorrection: true, hasAI: false },
                { id: '2_5', label: 'Q 2-5 — Translation: PS5 Error Message', hasCorrection: false, hasAI: true },
                { id: '2_6', label: 'Q 2-6 — Translation: Nintendo eShop', hasCorrection: false, hasAI: true },
                { id: '2_7', label: 'Q 2-7 — Translation: Xbox System Prompt', hasCorrection: false, hasAI: true },
                { id: '2_8', label: 'Q 2-8 — Translation: NBA Commentary', hasCorrection: false, hasAI: true }
            ]
        },
        {
            title: 'Section C — Writing Skill',
            avgClass: 'avg-c',
            avgLabel: 'Section C',
            avg: avgC,
            questions: [
                { id: '3_1', label: 'Q 3-1 — English Essay', hasCorrection: false, hasAI: true },
                { id: '3_2', label: 'Q 3-2 — Target Language Essay', hasCorrection: false, hasAI: true }
            ]
        }
    ];

    var html = '<h1>LQA Grading Report</h1>';
    if (candidateLine || email){
        html += '<div class="candidate-meta">';
        if (candidateLine) html += '<strong>' + escapeHtmlHtmlEntities(candidateLine) + '</strong>';
        if (candidateLine && email) html += ' &nbsp;|&nbsp; ';
        if (email) html += escapeHtmlHtmlEntities(email);
        html += '</div>';
    }
    html += '<div class="section-averages">';
    sections.forEach(function(s){
        html += '<div class="avg-chip ' + s.avgClass + '">' + s.avgLabel + ' : ' + s.avg + '</div>';
    });
    html += '</div>';

    sections.forEach(function(section){
        html += '<h2>' + section.title + '</h2>';
        section.questions.forEach(function(q){
            var cand  = document.getElementById('cand_q' + q.id);
            if (!cand) return;
            var notes = document.getElementById('notes_q' + q.id);
            var score = document.getElementById('score_q' + q.id);
            var rpt   = document.getElementById('report_q' + q.id);
            var corr  = document.getElementById('correction_q' + q.id);

            html += '<h3>' + q.label + '</h3>';

            html += '<div class="field-label">Candidate response</div>';
            html += '<div class="field-value">' + escapeHtmlHtmlEntities(cand.value || '(empty)').replace(/\n/g,'<br>') + '</div>';

            if (q.hasCorrection && corr && corr.value.trim()){
                html += '<div class="field-label">Correction / Comments</div>';
                html += '<div class="field-value">' + escapeHtmlHtmlEntities(corr.value).replace(/\n/g,'<br>') + '</div>';
            }

            if (q.hasAI && rpt){
                html += '<div class="field-label">AI Report</div>';
                html += '<div class="report-section">' + sanitizeReportHtmlForPrint(rpt) + '</div>';
            }

            if (notes && notes.value.trim()){
                html += '<div class="field-label">Recruiter notes</div>';
                html += '<div class="field-value">' + escapeHtmlHtmlEntities(notes.value).replace(/\n/g,'<br>') + '</div>';
            }

            if (score && score.value !== ''){
                html += '<div class="field-label">Score</div>';
                html += '<span class="score-chip">' + escapeHtmlHtmlEntities(score.value) + ' / 10</span>';
            }
        });
        html += '<hr>';
    });

    var w = window.open('', '_blank');
    w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>LQA Report</title><style>' + css + '</style></head><body>' + html + '</body></html>');
    w.document.close();
    w.focus();
    w.onafterprint = function(){ w.close(); };
    w.print();
}

function exportConfirmedErrors(langKey){
    var list = getConfirmedErrors(langKey);
    if (!list.length){ alert('No confirmed errors saved for this language.'); return; }
    var date = new Date().toISOString().slice(0, 10);
    var payload = {
        language: langKey,
        exportDate: date,
        confirmedTerms: list.map(function(e){ return (typeof e === 'string') ? e : (e.issue || ''); })
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'confirmed-errors-' + langKey + '-' + date + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Stub: Teams webhook URL not configured yet.
function sendToTeamsWebhook(){
    alert("Teams webhook not configured yet.");
}
