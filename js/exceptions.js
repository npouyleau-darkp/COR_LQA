function getExceptionsLangKey(qi){
    if (qi === '3_1') return 'en-US';
    var lang = document.getElementById('globalCandidateLanguage');
    return (lang && lang.value) ? lang.value : 'en-US';
}

function getExceptionsForLanguage(key){
    try { return JSON.parse(localStorage.getItem('lqaExceptions_' + key) || "[]"); }
    catch (e) { return []; }
}

function addExceptionForLanguage(key, text){
    var list = getExceptionsForLanguage(key);
    var t = (text || "").trim();
    if (!t || list.indexOf(t) !== -1) return;
    list.push(t);
    try { localStorage.setItem('lqaExceptions_' + key, JSON.stringify(list)); } catch (e) {}
    refreshExceptionsTracker();
}

function clearExceptionsForLanguage(key){
    try { localStorage.removeItem('lqaExceptions_' + key); } catch (e) {}
    refreshExceptionsTracker();
}

function refreshExceptionsTracker(){
    var tracker = document.getElementById('exceptionsTracker');
    if (!tracker) return;
    var lang = document.getElementById('globalCandidateLanguage');
    var key = (lang && lang.value) ? lang.value : 'en-US';
    var label = (lang && lang.value) ? lang.options[lang.selectedIndex].text : 'no language selected yet';
    var list = getExceptionsForLanguage(key);
    var confirmed = getConfirmedErrors(key);
    var excHtml = list.length
        ? list.length + ' exception(s) for ' + escapeHtmlHtmlEntities(label) +
          ' (' + escapeHtmlHtmlEntities(list.slice(0,3).join(', ')) + (list.length > 3 ? '&hellip;' : '') + ')' +
          ' <button type="button" onclick="clearExceptionsForLanguage(\'' + key.replace(/'/g,"\\'") + '\')">Clear</button>'
        : 'No exceptions saved yet for ' + escapeHtmlHtmlEntities(label) + '.';
    var confHtml = confirmed.length
        ? ' &nbsp;|&nbsp; ' + confirmed.length + ' confirmed error(s)' +
          ' <button type="button" onclick="exportConfirmedErrors(\'' + key.replace(/'/g,"\\'") + '\')">Download</button>'
        : '';
    tracker.innerHTML = excHtml + confHtml;
}

function getConfirmedErrors(langKey){
    try { return JSON.parse(localStorage.getItem('lqaConfirmedErrors_' + langKey) || '[]'); }
    catch (e) { return []; }
}

function addConfirmedError(langKey, pillar, severity, confidence, issueText){
    var list = getConfirmedErrors(langKey);
    var t = (issueText || '').trim();
    if (!t) return;
    list.push({ date: new Date().toISOString().slice(0,10), pillar: pillar, severity: severity, confidence: confidence, issue: t });
    try { localStorage.setItem('lqaConfirmedErrors_' + langKey, JSON.stringify(list)); } catch (e) {}
    refreshExceptionsTracker();
}

function handleNotAnErrorClick(evt){
    var btn = evt.currentTarget;
    var row = btn.closest('.issue-row');
    var existingPopup = document.getElementById('notAnErrorPopup');
    if (existingPopup){ existingPopup.remove(); }

    var issueText = btn.getAttribute('data-text') || '';
    var langKey = btn.getAttribute('data-lang') || '';

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
        addExceptionForLanguage(langKey, issueText);
        popup.remove();
        var badge = document.createElement('span');
        badge.className = 'badge badge-exception-confirmed';
        badge.textContent = 'Exception confirmed';
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
        '<div class="popup-field-label">Pillar &nbsp;·&nbsp; Severity &nbsp;·&nbsp; Confidence</div>' +
        '<div style="font-size:13px; color:var(--text-color); padding:4px 0;">' +
        escapeHtmlHtmlEntities(pillar) + ' &nbsp;·&nbsp; ' +
        escapeHtmlHtmlEntities(severity) + ' &nbsp;·&nbsp; ' +
        escapeHtmlHtmlEntities(confidence) + ' confidence</div>' +
        '<div class="popup-actions">' +
        '<button type="button" class="popup-confirm-btn">Confirm error</button>' +
        '<button type="button" class="popup-cancel-btn">Cancel</button>' +
        '</div>';

    if (row && row.parentNode) row.parentNode.insertBefore(popup, row.nextSibling);

    popup.querySelector('.popup-cancel-btn').addEventListener('click', function(){ popup.remove(); });

    popup.querySelector('.popup-confirm-btn').addEventListener('click', function(){
        addConfirmedError(langKey, pillar, severity, confidence, issueText);
        popup.remove();
        var badge = document.createElement('span');
        badge.className = 'badge badge-reviewer-confirmed';
        badge.textContent = 'Reviewer Confirmed';
        var issueTextEl = row ? row.querySelector('.issue-text') : null;
        if (issueTextEl) issueTextEl.appendChild(badge);
        btn.textContent = 'Confirmed ✓';
        btn.disabled = true;
    });
}
