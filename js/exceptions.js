function getExceptionsLangKey(qi){
    if (qi === 8) return 'en-US';
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
    if (!list.length){
        tracker.innerHTML = 'No exceptions saved yet for ' + escapeHtmlHtmlEntities(label) + '.';
    } else {
        tracker.innerHTML = list.length + ' saved for ' + escapeHtmlHtmlEntities(label) +
            ' (' + escapeHtmlHtmlEntities(list.slice(0,3).join(', ')) + (list.length > 3 ? '…' : '') + ')' +
            '<button type="button" onclick="clearExceptionsForLanguage(\'' + key.replace(/'/g,"\\'") + '\')">Clear</button>';
    }
}

function handleNotAnErrorClick(evt){
    var btn = evt.currentTarget;
    addExceptionForLanguage(btn.getAttribute('data-lang'), btn.getAttribute('data-text'));
    var row = btn.closest('.issue-row');
    if (row) row.style.opacity = '0.4';
    btn.textContent = 'Saved ✓';
    btn.disabled = true;
}
