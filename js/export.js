function sanitizeReportHtmlForPrint(rptBox){
    var clone = rptBox.cloneNode(true);
    clone.querySelectorAll('script,button').forEach(function(el){ el.remove(); });
    return clone.innerHTML;
}

function exportDashboardToPdf(){
    var html = "<h1>LQA Grading Report</h1>";
    for (var i = 1; i <= 9; i++){
        var cand = document.getElementById('cand_q' + i);
        if (!cand) continue;
        var ref = document.getElementById('ref_q' + i);
        var notes = document.getElementById('notes_q' + i);
        var rpt = document.getElementById('report_q' + i);
        html += "<h3>Question " + i + "</h3>";
        html += "<p><strong>Candidate:</strong><br>" + escapeHtmlHtmlEntities(cand.value).replace(/\n/g,"<br>") + "</p>";
        if (ref) html += "<p><strong>Reference/Correction:</strong><br>" + escapeHtmlHtmlEntities(ref.value).replace(/\n/g,"<br>") + "</p>";
        if (rpt) html += "<p><strong>Report:</strong><br>" + sanitizeReportHtmlForPrint(rpt) + "</p>";
        if (notes) html += "<p><strong>Recruiter notes:</strong><br>" + escapeHtmlHtmlEntities(notes.value).replace(/\n/g,"<br>") + "</p>";
        html += "<hr>";
    }
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
