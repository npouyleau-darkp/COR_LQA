function sanitizeReportHtmlForPrint(rptBox){
    var clone = rptBox.cloneNode(true);
    clone.querySelectorAll('script,button').forEach(function(el){ el.remove(); });
    return clone.innerHTML;
}

function exportDashboardToPdf(){
    var sections = [
        {
            title: "Section A — LQA Bugs",
            questions: [
                { id: '1_2', label: 'Question 1-2 — Neon Racers', hasCorrection: true, hasAI: false },
                { id: '1_3', label: 'Question 1-3 — Diagnostic Node 3', hasCorrection: true, hasAI: false },
                { id: '1_4', label: 'Question 1-4 — Stellar Forge', hasCorrection: true, hasAI: false },
                { id: '1_5', label: 'Question 1-5 — CrimeCity Vice', hasCorrection: true, hasAI: false }
            ]
        },
        {
            title: "Section B — Proofreading / Translation",
            questions: [
                { id: '2_1', label: 'Question 2-1 — Proofread Segment Alpha', hasCorrection: true, hasAI: false },
                { id: '2_2', label: 'Question 2-2 — Proofread Segment Beta', hasCorrection: true, hasAI: false },
                { id: '2_3', label: 'Question 2-3 — Proofread Segment Gamma', hasCorrection: true, hasAI: false },
                { id: '2_4', label: 'Question 2-4 — Proofread Segment Delta', hasCorrection: true, hasAI: false },
                { id: '2_5', label: 'Question 2-5 — Translation: PS5 Error Message', hasCorrection: false, hasAI: true },
                { id: '2_6', label: 'Question 2-6 — Translation: Nintendo eShop', hasCorrection: false, hasAI: true },
                { id: '2_7', label: 'Question 2-7 — Translation: Xbox System Prompt', hasCorrection: false, hasAI: true },
                { id: '2_8', label: 'Question 2-8 — Translation: NBA Commentary', hasCorrection: false, hasAI: true }
            ]
        },
        {
            title: "Section C — Writing Skill",
            questions: [
                { id: '3_1', label: 'Question 3-1 — English Essay', hasCorrection: false, hasAI: true },
                { id: '3_2', label: 'Question 3-2 — Target Language Essay', hasCorrection: false, hasAI: true }
            ]
        }
    ];

    var html = "<h1>LQA Grading Report</h1>";

    sections.forEach(function(section){
        html += "<h2>" + section.title + "</h2>";
        section.questions.forEach(function(q){
            var cand = document.getElementById('cand_q' + q.id);
            if (!cand) return;
            var notes = document.getElementById('notes_q' + q.id);
            var score = document.getElementById('score_q' + q.id);
            var rpt = document.getElementById('report_q' + q.id);
            var corr = document.getElementById('correction_q' + q.id);

            html += "<h3>" + q.label + "</h3>";
            html += "<p><strong>Candidate response:</strong><br>" + escapeHtmlHtmlEntities(cand.value).replace(/\n/g,"<br>") + "</p>";
            if (q.hasCorrection && corr && corr.value)
                html += "<p><strong>Correction / Comments:</strong><br>" + escapeHtmlHtmlEntities(corr.value).replace(/\n/g,"<br>") + "</p>";
            if (q.hasAI && rpt)
                html += "<p><strong>AI Report:</strong><br>" + sanitizeReportHtmlForPrint(rpt) + "</p>";
            if (notes && notes.value)
                html += "<p><strong>Recruiter notes:</strong><br>" + escapeHtmlHtmlEntities(notes.value).replace(/\n/g,"<br>") + "</p>";
            if (score && score.value)
                html += "<p><strong>Score:</strong> " + escapeHtmlHtmlEntities(score.value) + " / 10</p>";
            html += "<hr>";
        });
    });

    var w = window.open("", "_blank");
    w.document.write("<html><head><title>LQA Report</title></head><body>" + html + "</body></html>");
    w.document.close();
    w.focus();
    w.print();
}

// Stub: Teams webhook URL not configured yet.
function sendToTeamsWebhook(){
    alert("Teams webhook not configured yet.");
}
