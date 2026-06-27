var _valCurrentTab = 'exceptions';

function openValidationPanel(){
    document.getElementById('mainApplicationWrapper').style.display = 'none';
    document.getElementById('credentialsBox').style.display = 'none';
    document.getElementById('validationPanel').style.display = 'block';
    _valPopulateLangFilter();
    _valRenderList();
}

function closeValidationPanel(){
    document.getElementById('validationPanel').style.display = 'none';
    document.getElementById('mainApplicationWrapper').style.display = 'block';
    document.getElementById('credentialsBox').style.display = 'flex';
    refreshExceptionsTracker();
}

function _valSwitchTab(tab){
    _valCurrentTab = tab;
    document.getElementById('valTabExceptions').classList.toggle('val-tab-active', tab === 'exceptions');
    document.getElementById('valTabErrors').classList.toggle('val-tab-active', tab === 'errors');
    _valPopulateLangFilter();
    _valRenderList();
}

function _valGetAllPendingLangs(){
    var seen = {};
    var prefixes = ['lqaExceptions_pending_', 'lqaConfirmedErrors_pending_'];
    for (var i = 0; i < localStorage.length; i++){
        var k = localStorage.key(i);
        if (!k) continue;
        for (var p = 0; p < prefixes.length; p++){
            if (k.indexOf(prefixes[p]) === 0){
                var lang = k.slice(prefixes[p].length);
                if (lang) seen[lang] = true;
            }
        }
    }
    return Object.keys(seen).sort();
}

function _valPopulateLangFilter(){
    var sel = document.getElementById('valLangFilter');
    if (!sel) return;
    var current = sel.value;
    var langs = _valGetAllPendingLangs();
    sel.innerHTML = '<option value="">— All Languages —</option>';
    langs.forEach(function(lang){
        var opt = document.createElement('option');
        opt.value = lang;
        opt.textContent = lang;
        if (lang === current) opt.selected = true;
        sel.appendChild(opt);
    });
}

function _valEscAttr(s){
    return (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _valRenderList(){
    var container = document.getElementById('valPendingList');
    if (!container) return;
    var langFilter = (document.getElementById('valLangFilter') || {}).value || '';
    var prefix = _valCurrentTab === 'exceptions' ? 'lqaExceptions_pending_' : 'lqaConfirmedErrors_pending_';
    var items = [];

    for (var i = 0; i < localStorage.length; i++){
        var k = localStorage.key(i);
        if (!k || k.indexOf(prefix) !== 0) continue;
        var lang = k.slice(prefix.length);
        if (!lang) continue;
        if (langFilter && lang !== langFilter) continue;

        if (_valCurrentTab === 'exceptions'){
            var list = getPendingExceptions(lang);
            list.forEach(function(entry, idx){
                var term = (typeof entry === 'object') ? (entry.term || '') : entry;
                var justification = (typeof entry === 'object') ? (entry.justification || '') : '';
                items.push({ lang: lang, index: idx, text: term, justification: justification });
            });
        } else {
            var list2 = getPendingConfirmedErrors(lang);
            list2.forEach(function(entry, idx){
                items.push({ lang: lang, index: idx, entry: entry });
            });
        }
    }

    if (items.length === 0){
        container.innerHTML = '<div class="val-empty">No pending items' +
            (langFilter ? ' for <strong>' + escapeHtmlHtmlEntities(langFilter) + '</strong>' : '') + '.</div>';
        return;
    }

    var html = '';
    if (_valCurrentTab === 'exceptions'){
        items.forEach(function(item, i){
            html += '<div class="val-item">' +
                '<span class="val-item-lang">' + escapeHtmlHtmlEntities(item.lang) + '</span>' +
                '<div class="val-item-text">' + escapeHtmlHtmlEntities(item.text) + '</div>' +
                (item.justification ? '<div class="val-item-meta">Justification: ' + escapeHtmlHtmlEntities(item.justification) + '</div>' : '') +
                '<div class="val-item-actions">' +
                '<button type="button" class="val-btn-accept" ' +
                    'onclick="_valAcceptException(\'' + _valEscAttr(item.lang) + '\',' + item.index + ',this)">' +
                    'Accept</button>' +
                '<button type="button" class="val-btn-reject" ' +
                    'onclick="_valRejectException(\'' + _valEscAttr(item.lang) + '\',' + item.index + ',this)">' +
                    'Reject</button>' +
                '</div></div>';
        });
    } else {
        items.forEach(function(item, i){
            var e = item.entry || {};
            html += '<div class="val-item">' +
                '<span class="val-item-lang">' + escapeHtmlHtmlEntities(item.lang) + '</span>' +
                '<div class="val-item-text">' + escapeHtmlHtmlEntities(e.issue || '') + '</div>' +
                '<div class="val-item-meta">' +
                    escapeHtmlHtmlEntities(e.pillar || '') + ' &nbsp;&middot;&nbsp; ' +
                    escapeHtmlHtmlEntities(e.severity || '') + ' &nbsp;&middot;&nbsp; ' +
                    escapeHtmlHtmlEntities(e.confidence || '') + ' confidence' +
                    (e.date ? ' &nbsp;&middot;&nbsp; ' + escapeHtmlHtmlEntities(e.date) : '') +
                '</div>' +
                '<div class="val-item-actions">' +
                '<button type="button" class="val-btn-accept" ' +
                    'onclick="_valAcceptError(\'' + _valEscAttr(item.lang) + '\',' + item.index + ',this)">' +
                    'Accept</button>' +
                '<button type="button" class="val-btn-reject" ' +
                    'onclick="_valRejectError(\'' + _valEscAttr(item.lang) + '\',' + item.index + ',this)">' +
                    'Reject</button>' +
                '</div></div>';
        });
    }
    container.innerHTML = html;
}

function _valAcceptException(lang, index, btn){
    var list = getPendingExceptions(lang);
    if (index < 0 || index >= list.length){ _valRenderList(); return; }
    var text = (typeof list[index] === 'object') ? (list[index].term || '') : list[index];
    list.splice(index, 1);
    try { localStorage.setItem('lqaExceptions_pending_' + lang, JSON.stringify(list)); } catch(e) {}
    if (text){
        var validated = getExceptionsForLanguage(lang);
        if (validated.indexOf(text) === -1){
            validated.push(text);
            try { localStorage.setItem('lqaExceptions_' + lang, JSON.stringify(validated)); } catch(e) {}
        }
    }
    _valRenderList();
}

function _valRejectException(lang, index, btn){
    var list = getPendingExceptions(lang);
    if (index < 0 || index >= list.length){ _valRenderList(); return; }
    list.splice(index, 1);
    try { localStorage.setItem('lqaExceptions_pending_' + lang, JSON.stringify(list)); } catch(e) {}
    _valRenderList();
}

function _valAcceptError(lang, index, btn){
    var list = getPendingConfirmedErrors(lang);
    if (index < 0 || index >= list.length){ _valRenderList(); return; }
    var entry = list[index];
    entry.issue = entry.issue || '';
    list.splice(index, 1);
    try { localStorage.setItem('lqaConfirmedErrors_pending_' + lang, JSON.stringify(list)); } catch(e) {}
    var validated = getConfirmedErrors(lang);
    validated.push(entry);
    try { localStorage.setItem('lqaConfirmedErrors_' + lang, JSON.stringify(validated)); } catch(e) {}
    _valRenderList();
}

function _valRejectError(lang, index, btn){
    var list = getPendingConfirmedErrors(lang);
    if (index < 0 || index >= list.length){ _valRenderList(); return; }
    list.splice(index, 1);
    try { localStorage.setItem('lqaConfirmedErrors_pending_' + lang, JSON.stringify(list)); } catch(e) {}
    _valRenderList();
}
