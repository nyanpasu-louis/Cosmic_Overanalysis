/* Theme cycling — palettes and switching logic from script-参考.js */
(function () {
  try {
    var P = [
      {p:'#8AAD9E',c:'#EAF0EE',o:'#1E2623',b:'#E5EDEA',l:'#DEE8E4',f:'#F6F8F7',h:'#718E82',s:'rgba(138,173,158,0.08)',x:'#232421',y:'#6D6F6B',z:'#949591',d:'#BEC5BC',i:'#ACB5AC'},
      {p:'#8D9FB2',c:'#EAEEF1',o:'#1F2327',b:'#E6EAEE',l:'#DFE4E9',f:'#F6F7F9',h:'#748292',s:'rgba(141,159,178,0.08)',x:'#232322',y:'#6D6D6D',z:'#949493',d:'#BFC1C2',i:'#AEB1B3'},
      {p:'#B89298',c:'#F2EBEC',o:'#282021',b:'#EFE7E8',l:'#EBE0E2',f:'#F9F6F7',h:'#97787D',s:'rgba(184,146,152,0.08)',x:'#252321',y:'#726B6A',z:'#989391',d:'#CCBDBA',i:'#BDACAA'},
      {p:'#A89AB8',c:'#EFEDF2',o:'#252228',b:'#ECE9EF',l:'#E7E3EB',f:'#F8F7F9',h:'#8A7E97',s:'rgba(168,154,184,0.08)',x:'#242322',y:'#716C6E',z:'#979493',d:'#C7BFC4',i:'#B7AFB5'},
      {p:'#B5A888',c:'#F2EFEA',o:'#28251E',b:'#EFECE5',l:'#EAE7DE',f:'#F9F8F5',h:'#948A70',s:'rgba(181,168,136,0.08)',x:'#252420',y:'#726E68',z:'#98958F',d:'#CBC3B6',i:'#BCB4A4'},
      {p:'#8DADA5',c:'#EAF0EF',o:'#1F2624',b:'#E6EDEB',l:'#DFE8E6',f:'#F6F8F8',h:'#748E87',s:'rgba(141,173,165,0.08)',x:'#232421',y:'#6D6F6C',z:'#949592',d:'#BFC5BE',i:'#AEB5AE'},
      {p:'#AD94A0',c:'#F0ECEE',o:'#262123',b:'#EDE7EA',l:'#E8E1E4',f:'#F8F6F7',h:'#8E7983',s:'rgba(173,148,160,0.08)',x:'#252321',y:'#716C6B',z:'#979391',d:'#C8BDBD',i:'#B9ADAC'},
      {p:'#AD8A7A',c:'#F0EAE7',o:'#261E1B',b:'#EDE5E2',l:'#E8DEDA',f:'#F8F6F4',h:'#8E7164',s:'rgba(173,138,122,0.08)',x:'#252220',y:'#716A67',z:'#97928E',d:'#C8BAB1',i:'#B9A99F'},
      {p:'#A3A888',c:'#EEEFEA',o:'#24251E',b:'#EBECE5',l:'#E5E7DE',f:'#F8F8F5',h:'#868A70',s:'rgba(163,168,136,0.08)',x:'#242420',y:'#706E68',z:'#96958F',d:'#C5C3B6',i:'#B5B4A4'}
    ];
    var S = document.documentElement.style, cur = 0;

    function A(n) {
      var d = P[n];
      // Use setProperty (not cssText) so each variable is seen as "changed"
      // rather than "removed-then-added", which triggers CSS transitions.
      S.setProperty('--accent', d.p);
      S.setProperty('--accent-hover', d.h);
      S.setProperty('--accent-subtle', d.s);
      S.setProperty('--primary-container', d.c);
      S.setProperty('--on-primary-container', d.o);
      S.setProperty('--bg', d.b);
      S.setProperty('--log-bg', d.l);
      S.setProperty('--surface', d.f);
      S.setProperty('--text', d.x);
      S.setProperty('--text-secondary', d.y);
      S.setProperty('--text-tertiary', d.z);
      S.setProperty('--border', d.d);
      S.setProperty('--input-border', d.i);
    }

    A(Math.floor(Math.random() * P.length));
    setInterval(function () { cur = (cur + 1) % P.length; A(cur); }, 10000);
  } catch (e) {}
})();

/* Minimal self-contained Markdown renderer (no external dependencies) */
(function () {
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 行内格式：行内代码、粗体、斜体、删除线、链接
  function inline(s) {
    var text = String(s);
    var codes = [];
    text = text.replace(/`([^`\n]+)`/g, function (m, c) {
      codes.push('<code>' + c + '</code>');
      return '\u0000' + (codes.length - 1) + '\u0000';
    });
    var bolds = [];
    text = text.replace(/\*\*([^*\n]+)\*\*/g, function (m, b) {
      bolds.push('<strong>' + b + '</strong>');
      return '\u0001' + (bolds.length - 1) + '\u0001';
    });
    text = text.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');
    text = text.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, label, url) {
      if (!/^(https?:\/\/|mailto:|#|\/)/i.test(url)) return m;
      return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
    });
    text = text.replace(/\u0001(\d+)\u0001/g, function (m, i) { return bolds[+i] || ''; });
    text = text.replace(/\u0000(\d+)\u0000/g, function (m, i) { return codes[+i] || ''; });
    return text;
  }

  // 块级解析：标题、分割线、引用、列表、围栏代码块、段落
  function renderBlock(lines) {
    var out = [];
    var i = 0;
    var n = lines.length;
    var isList = function (t) { return /^[-*+]\s+/.test(t); };
    var isNumList = function (t) { return /^\d+[.、)]\s+/.test(t); };
    var isHr = function (t) { return /^(-{3,}|\*{3,}|_{3,})$/.test(t.replace(/\s+/g, '')); };
    var isHeading = function (t) { return /^#{1,6}\s+/.test(t); };

    while (i < n) {
      var line = lines[i];
      var trimmed = line.trim();

      if (!trimmed) { i++; continue; }

      // 围栏代码块
      if (/^```/.test(trimmed)) {
        var buf = [];
        i++;
        while (i < n && !/^```/.test(lines[i].trim())) {
          buf.push(lines[i]);
          i++;
        }
        i++; // 跳过闭合围栏
        out.push('<pre><code>' + esc(buf.join('\n')) + '</code></pre>');
        continue;
      }

      // 标题
      var h = /^(#{1,6})\s+(.*)$/.exec(trimmed);
      if (h) {
        out.push('<h' + h[1].length + '>' + inline(h[2]) + '</h' + h[1].length + '>');
        i++;
        continue;
      }

      // 分割线
      if (isHr(trimmed)) {
        out.push('<hr>');
        i++;
        continue;
      }

      // 引用
      if (/^>/.test(trimmed)) {
        var quote = [];
        while (i < n && /^>/.test(lines[i].trim())) {
          quote.push(lines[i].trim().replace(/^>\s?/, ''));
          i++;
        }
        out.push('<blockquote>' + inline(quote.join('<br>')) + '</blockquote>');
        continue;
      }

      // 无序列表
      if (isList(trimmed)) {
        var items = [];
        while (i < n && isList(lines[i].trim())) {
          items.push('<li>' + inline(lines[i].trim().replace(/^[-*+]\s+/, '')) + '</li>');
          i++;
        }
        out.push('<ul>' + items.join('') + '</ul>');
        continue;
      }

      // 有序列表
      if (isNumList(trimmed)) {
        var numItems = [];
        while (i < n && isNumList(lines[i].trim())) {
          numItems.push('<li>' + inline(lines[i].trim().replace(/^\d+[.、)]\s+/, '')) + '</li>');
          i++;
        }
        out.push('<ol>' + numItems.join('') + '</ol>');
        continue;
      }

      // 普通段落：合并连续的普通行
      var para = [trimmed];
      i++;
      while (i < n) {
        var t2 = lines[i].trim();
        if (!t2 || /^```/.test(t2) || isHeading(t2) || isHr(t2) ||
            /^>/.test(t2) || isList(t2) || isNumList(t2)) break;
        para.push(t2);
        i++;
      }
      out.push('<p>' + inline(para.join('<br>')) + '</p>');
    }
    return out.join('\n');
  }

  window.renderMarkdown = function (md) {
    var text = String(md == null ? '' : md).replace(/\r\n?/g, '\n');
    return renderBlock(text.split('\n'));
  };
})();

/* Chat interactions: placeholder, send button, output */
(function () {
  var input = document.getElementById('main-input');
  var placeholder = document.getElementById('input-placeholder');
  var btnSend = document.getElementById('btn-send');
  var outputPanel = document.getElementById('output-panel');
  var outputBody = document.getElementById('output-body');
  var outputBack = document.getElementById('output-back');
  var outputMq = window.matchMedia('(max-aspect-ratio: 3/4)');
  var outputOpen = false;
  // AI 接口：你的 Cloudflare Worker（API Key 由 Worker 的 Secret 持有）
  var API_ENDPOINT = 'https://cosmic-overanalysis-proxy.liujiyuan666.workers.dev/';
  // 可选：与 Worker 的 API_TOKEN 保持一致（防止陌生人直接调用）；留空则不发送
  var API_TOKEN = '';
  var sending = false;
  if (!input || !placeholder || !btnSend) return;

  function syncOutputMode() {
    if (!outputOpen) return;
    if (outputMq.matches) {
      document.body.classList.add('output-open-mobile');
      document.body.classList.remove('output-open');
    } else {
      document.body.classList.add('output-open');
      document.body.classList.remove('output-open-mobile');
    }
  }

  function openOutput() {
    outputOpen = true;
    setOutputText('正在认真解读，请等待10-20s喵…');
    if (outputPanel) outputPanel.setAttribute('aria-hidden', 'false');
    syncOutputMode();
  }

  function setOutputText(text) {
    if (outputPanel) outputPanel.dataset.reply = String(text == null ? '' : text);
    if (!outputBody) return;
    if (window.renderMarkdown) {
      outputBody.innerHTML = window.renderMarkdown(text);
    } else {
      outputBody.textContent = text;
    }
  }

  function saveHistory(inputText, outputText) {
    if (window.saveHistoryRecord) {
      window.saveHistoryRecord({ input: inputText, output: outputText, ts: Date.now() });
    }
  }

  function askAI(message) {
    var headers = { 'Content-Type': 'application/json' };
    // 提示词已内嵌在 Worker 的 DEFAULT_PROMPT 里，前端不需要再传
    var body = { message: message };
    if (API_TOKEN) {
      headers['X-Api-Token'] = API_TOKEN;
      body.token = API_TOKEN;
    }
    return fetch(API_ENDPOINT, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    }).then(function (resp) {
      return resp.text().then(function (raw) {
        var data = null;
        try { data = JSON.parse(raw); } catch (e) { data = null; }
        if (!resp.ok) {
          var err = new Error((data && data.error) || ('API 请求失败: ' + resp.status));
          if (resp.status === 429) err.rateLimited = true;
          throw err;
        }
        if (!data) {
          var msg = raw.trim();
          throw new Error(msg ? ('接口返回非 JSON：' + msg.slice(0, 120)) : '接口返回为空');
        }
        var reply = data.reply;
        if (typeof reply !== 'string' || !reply.trim()) {
          throw new Error('API 返回缺少 reply 字段');
        }
        return reply;
      });
    });
  }

  function closeOutput() {
    outputOpen = false;
    document.body.classList.remove('output-open', 'output-open-mobile');
    if (outputPanel) outputPanel.setAttribute('aria-hidden', 'true');
  }

  if (outputBack) outputBack.addEventListener('click', closeOutput);
  if (outputMq.addEventListener) {
    outputMq.addEventListener('change', syncOutputMode);
  } else if (outputMq.addListener) {
    outputMq.addListener(syncOutputMode);
  }

  function syncPlaceholder() {
    placeholder.style.display = input.value ? 'none' : '';
    btnSend.disabled = sending || !input.value.trim();
  }

  function send() {
    if (sending) return;
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    sending = true;
    syncPlaceholder();
    openOutput();
    if (outputPanel) outputPanel.dataset.input = text;
    askAI(text)
      .then(function (reply) {
        setOutputText(reply);
        saveHistory(text, reply);
      })
      .catch(function (e) {
        console.warn('AI 调用失败：', e);
        if (e && e.rateLimited) {
          setOutputText('请求太频繁了，请稍后再试喵。');
        } else {
          setOutputText('请求失败：' + (e && e.message ? e.message : '未知错误'));
        }
      })
      .then(function () {
        sending = false;
        syncPlaceholder();
      });
    if (!outputMq.matches) input.focus();
  }

  input.addEventListener('input', syncPlaceholder);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !(e.ctrlKey || e.metaKey) && !e.isComposing) {
      e.preventDefault();
      send();
    }
  });
  btnSend.addEventListener('click', send);
  syncPlaceholder();
})();

/* Conversation history — IndexedDB storage + history panel UI */
(function () {
  var btnHistory = document.getElementById('btn-history');
  var historyPanel = document.getElementById('history-panel');
  var historyBack = document.getElementById('history-back');
  var historyClear = document.getElementById('history-clear');
  var historyList = document.getElementById('history-list');
  var historyEmpty = document.getElementById('history-empty');
  var detailPanel = document.getElementById('history-detail');
  var detailBack = document.getElementById('detail-back');
  var detailBody = document.getElementById('history-detail-body');
  var records = [];
  if (!btnHistory || !historyPanel || !historyBack || !historyClear || !historyList || !historyEmpty ||
      !detailPanel || !detailBack || !detailBody) return;

  var DB_NAME = 'cosmic-overanalysis';
  var STORE = 'history';

  function openDB() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error('IndexedDB 不可用')); return; }
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function withStore(db, mode, fn) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(STORE, mode);
      fn(tx.objectStore(STORE));
      tx.oncomplete = function () { db.close(); resolve(); };
      tx.onerror = function () { db.close(); reject(tx.error); };
      tx.onabort = function () { db.close(); reject(tx.error || new Error('abort')); };
    });
  }

  window.saveHistoryRecord = function (record) {
    return openDB().then(function (db) {
      return withStore(db, 'readwrite', function (store) { store.add(record); });
    }).catch(function (e) { console.error('保存历史失败', e); });
  };

  function loadAll() {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
        req.onsuccess = function () { db.close(); resolve(req.result || []); };
        req.onerror = function () { db.close(); reject(req.error); };
      });
    });
  }

  function clearAll() {
    return openDB().then(function (db) {
      return withStore(db, 'readwrite', function (store) { store.clear(); });
    });
  }

  function fmtTime(ts) {
    var d = new Date(ts);
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
           ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function render(list) {
    historyList.textContent = '';
    records = list;
    records.sort(function (a, b) { return b.ts - a.ts; });
    if (!records.length) {
      historyList.style.display = 'none';
      historyEmpty.style.display = 'flex';
      return;
    }
    historyEmpty.style.display = 'none';
    historyList.style.display = 'flex';
    records.forEach(function (r) {
      var item = document.createElement('div');
      item.className = 'history-item';
      var time = document.createElement('div');
      time.className = 'history-item-time';
      time.textContent = fmtTime(r.ts);
      var q = document.createElement('div');
      q.className = 'history-item-q';
      q.textContent = '输入：' + (r.input || '');
      var a = document.createElement('div');
      a.className = 'history-item-a';
      a.textContent = '输出：' + (r.output || '');
      var more = document.createElement('div');
      more.className = 'history-item-more';
      more.textContent = '查看详情 ›';
      item.appendChild(time);
      item.appendChild(q);
      item.appendChild(a);
      item.appendChild(more);
      item.addEventListener('click', function () { openDetail(r); });
      historyList.appendChild(item);
    });
  }

  function openDetail(r) {
    detailBody.textContent = '';
    var time = document.createElement('div');
    time.className = 'detail-time';
    time.textContent = fmtTime(r.ts);
    var q = document.createElement('div');
    q.className = 'detail-q';
    q.textContent = '输入：' + (r.input || '');
    var a = document.createElement('div');
    a.className = 'detail-a';
    var aLabel = document.createElement('div');
    aLabel.className = 'detail-a-label';
    aLabel.textContent = '输出：';
    var aContent = document.createElement('div');
    aContent.className = 'detail-a-content';
    if (window.renderMarkdown) {
      aContent.innerHTML = window.renderMarkdown(r.output || '');
    } else {
      aContent.textContent = r.output || '';
    }
    a.appendChild(aLabel);
    a.appendChild(aContent);
    detailBody.appendChild(time);
    detailBody.appendChild(q);
    detailBody.appendChild(a);
    detailPanel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('detail-open');
  }

  function closeDetail() {
    document.body.classList.remove('detail-open');
    detailPanel.setAttribute('aria-hidden', 'true');
  }

  function openHistory() {
    historyPanel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('history-open');
    loadAll().then(render).catch(function (e) { console.error(e); });
  }

  function closeHistory() {
    document.body.classList.remove('history-open');
    historyPanel.setAttribute('aria-hidden', 'true');
  }

  btnHistory.addEventListener('click', openHistory);
  historyBack.addEventListener('click', closeHistory);
  detailBack.addEventListener('click', closeDetail);
  historyClear.addEventListener('click', function () {
    if (!window.confirm('确定要清空所有对话记录喵？')) return;
    clearAll().then(function () { render([]); }).catch(function (e) { console.error(e); });
  });
})();

/* Download output result — TXT / MD / DOCX */
(function () {
  var outputBody = document.getElementById('output-body');
  var outputPanel = document.getElementById('output-panel');
  var btnDownload = document.getElementById('btn-download');
  var downloadMenu = document.getElementById('download-menu');
  if (!outputBody || !outputPanel || !btnDownload || !downloadMenu) return;

  function safeFileName(text) {
    var name = String(text || '').replace(/[\r\n\t]+/g, ' ')
      .replace(/[\\/:*?"<>|]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!name) name = '解读结果';
    if (name.length > 20) name = name.slice(0, 20);
    return name;
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  // 把原始 Markdown 粗略还原为纯文本（TXT / DOCX 下载用）
  function stripMarkdown(md) {
    return String(md)
      .replace(/```[\s\S]*?```/g, function (m) { return m.replace(/^```.*$/gm, '').trim(); })
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+[.、)]\s+/gm, '')
      .replace(/^\s*>\s?/gm, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/~~([^~]+)~~/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function downloadOutput(fmt) {
    var raw = outputPanel.dataset.reply || '';
    var plain = raw ? stripMarkdown(raw) : (outputBody.textContent || '');
    var text = (fmt === 'md' && raw) ? raw : plain;
    var base = safeFileName(outputPanel.dataset.input || plain);
    if (fmt === 'txt') {
      downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), base + '.txt');
    } else if (fmt === 'md') {
      downloadBlob(new Blob([text], { type: 'text/markdown;charset=utf-8' }), base + '.md');
    } else if (fmt === 'docx') {
      downloadBlob(makeDocxBlob(text), base + '.docx');
    }
  }

  btnDownload.addEventListener('click', function (e) {
    e.stopPropagation();
    downloadMenu.hidden = !downloadMenu.hidden;
  });

  document.addEventListener('click', function (e) {
    if (!downloadMenu.hidden && !downloadMenu.contains(e.target) && e.target !== btnDownload) {
      downloadMenu.hidden = true;
    }
  });

  downloadMenu.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn || !btn.dataset.format) return;
    downloadOutput(btn.dataset.format);
    downloadMenu.hidden = true;
  });

  /* ---- Minimal .docx generation (OOXML in a stored ZIP) ---- */
  function escXml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function documentXml(text) {
    var paras = String(text).split(/\n+/).map(function (p) { return p.trim(); }).filter(Boolean);
    if (!paras.length) paras = [' '];
    var body = paras.map(function (p) {
      return '<w:p><w:r><w:t>' + escXml(p) + '</w:t></w:r></w:p>';
    }).join('');
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
      body +
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>' +
      '</w:body></w:document>';
  }

  var CONTENT_TYPES = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '</Types>';

  var RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '</Relationships>';

  var crcTable = (function () {
    var t = [];
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(buf) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function buildZip(files) {
    var enc = new TextEncoder();
    var now = new Date();
    var dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
    var dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    var names = Object.keys(files);
    var parts = [], central = [], offset = 0;

    names.forEach(function (name) {
      var content = typeof files[name] === 'string' ? enc.encode(files[name]) : files[name];
      var nameBytes = enc.encode(name);
      var crc = crc32(content);

      var local = new Uint8Array(30 + nameBytes.length + content.length);
      var dv = new DataView(local.buffer);
      dv.setUint32(0, 0x04034b50, true);
      dv.setUint16(4, 20, true);
      dv.setUint16(6, 0x0800, true);
      dv.setUint16(8, 0, true);
      dv.setUint16(10, dosTime, true);
      dv.setUint16(12, dosDate, true);
      dv.setUint32(14, crc, true);
      dv.setUint32(18, content.length, true);
      dv.setUint32(22, content.length, true);
      dv.setUint16(26, nameBytes.length, true);
      dv.setUint16(28, 0, true);
      local.set(nameBytes, 30);
      local.set(content, 30 + nameBytes.length);
      parts.push(local);

      var cen = new Uint8Array(46 + nameBytes.length);
      var cdv = new DataView(cen.buffer);
      cdv.setUint32(0, 0x02014b50, true);
      cdv.setUint16(4, 20, true);
      cdv.setUint16(6, 20, true);
      cdv.setUint16(8, 0x0800, true);
      cdv.setUint16(10, 0, true);
      cdv.setUint16(12, dosTime, true);
      cdv.setUint16(14, dosDate, true);
      cdv.setUint32(16, crc, true);
      cdv.setUint32(20, content.length, true);
      cdv.setUint32(24, content.length, true);
      cdv.setUint16(28, nameBytes.length, true);
      cdv.setUint16(30, 0, true);
      cdv.setUint16(32, 0, true);
      cdv.setUint16(34, 0, true);
      cdv.setUint16(36, 0, true);
      cdv.setUint32(42, offset, true);
      cen.set(nameBytes, 46);
      central.push(cen);
      offset += local.length;
    });

    var centralOffset = offset;
    var centralSize = central.reduce(function (s, b) { return s + b.length; }, 0);
    var end = new Uint8Array(22);
    var edv = new DataView(end.buffer);
    edv.setUint32(0, 0x06054b50, true);
    edv.setUint16(8, names.length, true);
    edv.setUint16(10, names.length, true);
    edv.setUint32(12, centralSize, true);
    edv.setUint32(16, centralOffset, true);

    var all = new Uint8Array(centralOffset + centralSize + 22);
    var pos = 0;
    parts.forEach(function (p) { all.set(p, pos); pos += p.length; });
    central.forEach(function (p) { all.set(p, pos); pos += p.length; });
    all.set(end, pos);
    return all;
  }

  function makeDocxBlob(text) {
    var zip = buildZip({
      '[Content_Types].xml': CONTENT_TYPES,
      '_rels/.rels': RELS,
      'word/document.xml': documentXml(text)
    });
    return new Blob([zip], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
  }
})();

/* Platform-aware shortcut hint + mobile long-press newline bubble */
(function () {
  var input = document.getElementById('main-input');
  var composer = document.querySelector('.composer');
  var hint = document.querySelector('.composer-hint');
  if (!input || !composer) return;

  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
  var phoneMq = window.matchMedia('(max-aspect-ratio: 3/4)');
  var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  function updateHint() {
    if (!hint) return;
    if (phoneMq.matches) {
      hint.textContent = '长按输入框可换行喵';
    } else {
      hint.textContent = 'Enter 发送 · ' + (isMac ? 'Cmd' : 'Ctrl') + ' + Enter 换行喵';
    }
  }
  updateHint();
  if (phoneMq.addEventListener) phoneMq.addEventListener('change', updateHint);
  else if (phoneMq.addListener) phoneMq.addListener(updateHint);

  if (!phoneMq.matches || !isTouch) return;

  var bubble = document.createElement('div');
  bubble.className = 'longpress-bubble';
  bubble.textContent = '换行';
  document.body.appendChild(bubble);

  var pressTimer = null, hideTimer = null;
  var longPressed = false, suppressContext = false;
  var startX = 0, startY = 0;

  function hideBubble() {
    clearTimeout(hideTimer);
    bubble.classList.remove('show');
  }

  function showBubble(x, y) {
    bubble.classList.add('show');
    var rect = bubble.getBoundingClientRect();
    var left = Math.max(8, Math.min(x - rect.width / 2, window.innerWidth - rect.width - 8));
    var top = y - rect.height - 14;
    if (top < 8) top = y + 18;
    top = Math.min(top, window.innerHeight - rect.height - 8);
    bubble.style.left = left + 'px';
    bubble.style.top = top + 'px';
    hideTimer = setTimeout(hideBubble, 3000);
  }

  function insertNewline() {
    var start = input.selectionStart || 0;
    var end = input.selectionEnd || start;
    var val = input.value;
    input.value = val.slice(0, start) + '\n' + val.slice(end);
    var pos = start + 1;
    try { input.setSelectionRange(pos, pos); } catch (e) {}
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
  }

  composer.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    var t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    clearTimeout(pressTimer);
    longPressed = false;
    pressTimer = setTimeout(function () {
      longPressed = true;
      suppressContext = true;
      setTimeout(function () { suppressContext = false; }, 900);
      showBubble(startX, startY);
    }, 500);
  }, { passive: true });

  composer.addEventListener('touchmove', function () {
    clearTimeout(pressTimer);
    if (longPressed) { longPressed = false; hideBubble(); }
  }, { passive: true });

  composer.addEventListener('touchend', function (e) {
    clearTimeout(pressTimer);
    if (!longPressed) return;
    longPressed = false;
    var t = e.changedTouches[0];
    var rect = bubble.getBoundingClientRect();
    if (t.clientX >= rect.left && t.clientX <= rect.right &&
        t.clientY >= rect.top && t.clientY <= rect.bottom) {
      insertNewline();
      hideBubble();
    }
  }, { passive: true });

  bubble.addEventListener('touchend', function (e) {
    e.stopPropagation();
    insertNewline();
    hideBubble();
  }, { passive: true });
  bubble.addEventListener('click', function (e) {
    e.stopPropagation();
    insertNewline();
    hideBubble();
  });

  document.addEventListener('touchstart', function (e) {
    if (bubble.classList.contains('show') && !bubble.contains(e.target)) hideBubble();
  }, true);

  composer.addEventListener('contextmenu', function (e) {
    if (suppressContext) e.preventDefault();
  });
})();
