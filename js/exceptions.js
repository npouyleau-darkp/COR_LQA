function getExceptionsLangKey(qi){
    if (qi === '3_1') return 'en-US';
    var lang = document.getElementById('globalCandidateLanguage');
    return (lang && lang.value) ? lang.value : 'en-US';
}

function getExceptionsForLanguage(key){
    try { return JSON.parse(localStorage.getItem('lqaExceptions_' + key) || '[]'); }
    catch (e) { return []; }
}

function getPendingExceptions(key){
    try { return JSON.parse(localStorage.getItem('lqaExceptions_pending_' + key) || '[]'); }
    catch (e) { return []; }
}

function getPendingConfirmedErrors(key){
    try { return JSON.parse(localStorage.getItem('lqaConfirmedErrors_pending_' + key) || '[]'); }
    catch (e) { return []; }
}

function addExceptionForLanguage(key, text, justification, pillar, severity, confidence){
    var t = (text || '').trim();
    if (!t) return;
    var pending = getPendingExceptions(key);
    var alreadyExists = pending.some(function(e){ return (e.term || e) === t; });
    if (!alreadyExists) pending.push({
        term: t,
        justification: (justification || '').trim(),
        date: new Date().toISOString().slice(0, 10),
        pillar: (pillar || ''),
        severity: (severity || ''),
        confidence: (confidence || '')
    });
    try { localStorage.setItem('lqaExceptions_pending_' + key, JSON.stringify(pending)); } catch (e) {}
    refreshExceptionsTracker();
}

function clearExceptionsForLanguage(key){
    try { localStorage.removeItem('lqaExceptions_' + key); } catch (e) {}
    try { localStorage.removeItem('lqaExceptions_pending_' + key); } catch (e) {}
    refreshExceptionsTracker();
}

function refreshExceptionsTracker(){
    var tracker = document.getElementById('exceptionsTracker');
    if (!tracker) return;
    var lang = document.getElementById('globalCandidateLanguage');
    var key = (lang && lang.value) ? lang.value : 'en-US';
    var label = (lang && lang.value) ? lang.options[lang.selectedIndex].text : 'no language selected yet';
    var validated = getExceptionsForLanguage(key);
    var pending = getPendingExceptions(key);
    var confirmed = getConfirmedErrors(key);
    var pendingErrors = getPendingConfirmedErrors(key);

    var excHtml = validated.length
        ? validated.length + ' exception(s) validated for ' + escapeHtmlHtmlEntities(label) +
          ' (' + escapeHtmlHtmlEntities(validated.slice(0,3).join(', ')) + (validated.length > 3 ? '&hellip;' : '') + ')' +
          ' <button type="button" onclick="clearExceptionsForLanguage(\'' + key.replace(/'/g, "\\'") + '\')">Clear all</button>'
        : 'No validated exceptions for ' + escapeHtmlHtmlEntities(label) + '.';

    var pendingHtml = (pending.length || pendingErrors.length)
        ? ' &nbsp;|&nbsp; <span style="color:#b45309;">' + (pending.length + pendingErrors.length) + ' pending validation</span>'
        : '';

    var confHtml = confirmed.length
        ? ' &nbsp;|&nbsp; ' + confirmed.length + ' confirmed error(s) validated'
        : '';

    tracker.innerHTML = excHtml + pendingHtml + confHtml;
}

function getConfirmedErrors(langKey){
    try { return JSON.parse(localStorage.getItem('lqaConfirmedErrors_' + langKey) || '[]'); }
    catch (e) { return []; }
}

function addConfirmedError(langKey, pillar, severity, confidence, issueText, justification){
    var t = (issueText || '').trim();
    if (!t) return;
    var pending = getPendingConfirmedErrors(langKey);
    pending.push({
        date: new Date().toISOString().slice(0, 10),
        pillar: (pillar || ''),
        severity: (severity || ''),
        confidence: (confidence || ''),
        issue: t,
        justification: (justification || '').trim()
    });
    try { localStorage.setItem('lqaConfirmedErrors_pending_' + langKey, JSON.stringify(pending)); } catch (e) {}
    refreshExceptionsTracker();
}

function handleNotAnErrorClick(evt){
    var btn = evt.currentTarget;
    var row = btn.closest('.issue-row');
    var existingPopup = document.getElementById('notAnErrorPopup');
    if (existingPopup){ existingPopup.remove(); }

    var issueText  = btn.getAttribute('data-text')       || '';
    var langKey    = btn.getAttribute('data-lang')       || '';
    var pillar     = btn.getAttribute('data-pillar')     || '';
    var severity   = btn.getAttribute('data-severity')   || '';
    var confidence = btn.getAttribute('data-confidence') || '';

    var popup = document.createElement('div');
    popup.className = 'not-an-error-inline-popup';
    popup.id = 'notAnErrorPopup';
    popup.innerHTML =
        '<div class="popup-field-label">Excerpt confirming it is not an error</div>' +
        '<textarea class="popup-excerpt" rows="2">' + escapeHtmlHtmlEntities(issueText) + '</textarea>' +
        '<div class="popup-field-label">Why this is not an error</div>' +
        '<textarea class="popup-explanation" rows="2" placeholder="Concise justification..."></textarea>' +
        '<div class="popup-actions">' +
        '<button type="button" class="popup-confirm-btn">Confirm exception</button>' +
        '<button type="button" class="popup-cancel-btn">Cancel</button>' +
        '</div>';

    if (row && row.parentNode) row.parentNode.insertBefore(popup, row.nextSibling);

    popup.querySelector('.popup-cancel-btn').addEventListener('click', function(){ popup.remove(); });

    popup.querySelector('.popup-confirm-btn').addEventListener('click', function(){
        var justification = popup.querySelector('.popup-explanation').value;
        addExceptionForLanguage(langKey, issueText, justification, pillar, severity, confidence);
        popup.remove();
        var badge = document.createElement('span');
        badge.className = 'badge badge-exception-confirmed';
        badge.textContent = 'Pending validation';
        var issueTextEl = row ? row.querySelector('.issue-text') : null;
        if (issueTextEl) issueTextEl.appendChild(badge);
        btn.textContent = 'Saved ✓';
        btn.disabled = true;
    });
}

function handleErrorConfirmedClick(evt){
    var btn = evt.currentTarget;
    var row = btn.closest('.issue-row');
    var existingPopup = document.getElementById('notAnErrorPopup');
    if (existingPopup){ existingPopup.remove(); }

    var langKey    = btn.getAttribute('data-lang')       || '';
    var pillar     = btn.getAttribute('data-pillar')     || '';
    var severity   = btn.getAttribute('data-severity')   || '';
    var confidence = btn.getAttribute('data-confidence') || '';
    var issueText  = btn.getAttribute('data-text')       || '';

    var popup = document.createElement('div');
    popup.className = 'not-an-error-inline-popup';
    popup.id = 'notAnErrorPopup';
    popup.innerHTML =
        '<div class="popup-field-label">Error to confirm</div>' +
        '<textarea class="popup-excerpt" rows="2" readonly>' + escapeHtmlHtmlEntities(issueText) + '</textarea>' +
        '<div class="popup-field-label">Pillar &nbsp;&middot;&nbsp; Severity &nbsp;&middot;&nbsp; Confidence</div>' +
        '<div style="font-size:13px; color:var(--text-color); padding:4px 0;">' +
        escapeHtmlHtmlEntities(pillar) + ' &nbsp;&middot;&nbsp; ' +
        escapeHtmlHtmlEntities(severity) + ' &nbsp;&middot;&nbsp; ' +
        escapeHtmlHtmlEntities(confidence) + ' confidence</div>' +
        '<div class="popup-field-label">Your justification (optional)</div>' +
        '<textarea class="popup-explanation" rows="2" placeholder="Why you are confirming this error..."></textarea>' +
        '<div class="popup-actions">' +
        '<button type="button" class="popup-confirm-btn">Confirm error</button>' +
        '<button type="button" class="popup-cancel-btn">Cancel</button>' +
        '</div>';

    if (row && row.parentNode) row.parentNode.insertBefore(popup, row.nextSibling);

    popup.querySelector('.popup-cancel-btn').addEventListener('click', function(){ popup.remove(); });

    popup.querySelector('.popup-confirm-btn').addEventListener('click', function(){
        var justification = popup.querySelector('.popup-explanation').value;
        addConfirmedError(langKey, pillar, severity, confidence, issueText, justification);
        popup.remove();
        var badge = document.createElement('span');
        badge.className = 'badge badge-reviewer-confirmed';
        badge.textContent = 'Pending validation';
        var issueTextEl = row ? row.querySelector('.issue-text') : null;
        if (issueTextEl) issueTextEl.appendChild(badge);
        btn.textContent = 'Saved ✓';
        btn.disabled = true;
    });
}
