/* ==========================================================
   POME BOX - i18n (JA / EN)
   使い方:
     HTML側 : <h3 data-en="Shake Shake!">シェケシェケ！</h3>
              属性は data-en-attr='{"aria-label":"..."}' で対応
     JS側   : POME_T('日本語','English')  /  POME_LANG で現在の言語
     切替時 : window に 'langchange' イベントが飛ぶ
   ========================================================== */
(function () {
  'use strict';

  var KEY = 'pome_lang';

  function detect() {
    try {
      var saved = localStorage.getItem(KEY);
      if (saved === 'ja' || saved === 'en') return saved;
    } catch (e) {}
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'ja';
    return /^ja/i.test(nav) ? 'ja' : 'en';
  }

  var lang = detect();
  window.POME_LANG = lang;

  /* 動的テキスト用ヘルパー */
  window.POME_T = function (ja, en) {
    return window.POME_LANG === 'en' ? en : ja;
  };
  /* 「」/ “” の出し分け */
  window.POME_Q = function (s) {
    return window.POME_LANG === 'en' ? '\u201C' + s + '\u201D' : '\u300C' + s + '\u300D';
  };

  function applyText(l) {
    var nodes = document.querySelectorAll('[data-en]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.getAttribute('data-ja') === null) {
        el.setAttribute('data-ja', el.innerHTML);
      }
      el.innerHTML = (l === 'en') ? el.getAttribute('data-en') : el.getAttribute('data-ja');
    }
    var attrNodes = document.querySelectorAll('[data-en-attr]');
    for (var j = 0; j < attrNodes.length; j++) {
      var an = attrNodes[j], map;
      try { map = JSON.parse(an.getAttribute('data-en-attr')); } catch (e) { continue; }
      for (var k in map) {
        if (!Object.prototype.hasOwnProperty.call(map, k)) continue;
        var backup = 'data-ja-attr-' + k;
        if (an.getAttribute(backup) === null) {
          an.setAttribute(backup, an.getAttribute(k) || '');
        }
        an.setAttribute(k, (l === 'en') ? map[k] : an.getAttribute(backup));
      }
    }
  }

  function applyMeta(l) {
    var tEn = document.querySelector('meta[name="i18n-title-en"]');
    var dEn = document.querySelector('meta[name="i18n-desc-en"]');
    if (tEn) {
      if (!document.documentElement.getAttribute('data-title-ja')) {
        document.documentElement.setAttribute('data-title-ja', document.title);
      }
      document.title = (l === 'en')
        ? tEn.getAttribute('content')
        : document.documentElement.getAttribute('data-title-ja');
    }
    if (dEn) {
      var desc = document.querySelector('meta[name="description"]');
      if (desc) {
        if (!desc.getAttribute('data-ja-content')) {
          desc.setAttribute('data-ja-content', desc.getAttribute('content') || '');
        }
        desc.setAttribute('content', (l === 'en')
          ? dEn.getAttribute('content')
          : desc.getAttribute('data-ja-content'));
      }
    }
  }

  function syncButtons() {
    var btns = document.querySelectorAll('.pome-lang-btn');
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute('data-lang') === window.POME_LANG;
      btns[i].classList.toggle('is-on', on);
      btns[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function apply(l) {
    window.POME_LANG = l;
    document.documentElement.setAttribute('lang', l);
    applyText(l);
    applyMeta(l);
    syncButtons();
    try {
      window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: l } }));
    } catch (e) {
      var ev = document.createEvent('Event');
      ev.initEvent('langchange', false, false);
      window.dispatchEvent(ev);
    }
  }

  window.POME_setLang = function (l) {
    if (l !== 'ja' && l !== 'en') return;
    try { localStorage.setItem(KEY, l); } catch (e) {}
    apply(l);
  };

  function injectStyle() {
    var css =
      '.pome-lang{display:inline-flex;align-items:center;gap:2px;' +
      'border:2px solid currentColor;border-radius:999px;padding:2px;' +
      'font-family:"Archivo","Helvetica Neue",Arial,sans-serif;' +
      'font-weight:700;font-size:11px;letter-spacing:.06em;line-height:1;' +
      'background:rgba(255,255,255,.72);vertical-align:middle}' +
      '.pome-lang-btn{appearance:none;border:0;background:transparent;color:inherit;' +
      'font:inherit;cursor:pointer;padding:5px 9px;border-radius:999px;' +
      'transition:background .2s,color .2s}' +
      '.pome-lang-btn.is-on{background:currentColor}' +
      '.pome-lang-btn.is-on span{color:#FBFAF4;mix-blend-mode:normal}' +
      '.pome-lang-btn:not(.is-on):hover{background:rgba(0,0,0,.07)}' +
      '.pome-lang-float{position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:9999}';
    var s = document.createElement('style');
    s.appendChild(document.createTextNode(css));
    document.head.appendChild(s);
  }

  function buildToggle() {
    var box = document.createElement('div');
    box.className = 'pome-lang';
    ['ja', 'en'].forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pome-lang-btn';
      b.setAttribute('data-lang', l);
      b.setAttribute('aria-label', l === 'ja' ? '日本語で表示' : 'View in English');
      b.innerHTML = '<span>' + (l === 'ja' ? 'JA' : 'EN') + '</span>';
      b.addEventListener('click', function () { window.POME_setLang(l); });
      box.appendChild(b);
    });
    var mount = document.getElementById('langMount');
    if (mount) {
      mount.appendChild(box);
    } else {
      box.classList.add('pome-lang-float');
      document.body.appendChild(box);
    }
  }

  function init() {
    injectStyle();
    buildToggle();
    apply(window.POME_LANG);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
