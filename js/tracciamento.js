/* ============================================================
   TRACCIAMENTO – BECA (Google Ads + Google Analytics 4)
   - Banner cookie con Consent Mode v2 (Accetta / Rifiuta)
   - Conversioni Google Ads: clic telefono, clic WhatsApp, invio modulo
   ============================================================ */
(function () {
  'use strict';

  // Conversioni Google Ads (account 962-404-1666)
  var CONVERSIONI = {
    telefono: 'AW-18567955332/2zbrCIScpLcdEISH8pVF', // Clic telefono sito
    whatsapp: 'AW-18567955332/if4SCIqcpLcdEISH8pVF', // Clic WhatsApp sito
    modulo:   'AW-18567955332/bwIPCIecpLcdEISH8pVF'  // Invio modulo sito
  };

  // Nomi degli stessi eventi per Google Analytics 4
  var EVENTI_GA4 = {
    telefono: 'clic_telefono',
    whatsapp: 'clic_whatsapp',
    modulo:   'generate_lead'
  };

  var CHIAVE = 'beca_consenso_cookie';
  var DURATA = 180 * 24 * 60 * 60 * 1000; // la scelta vale 6 mesi

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  // ── CONVERSIONI ─────────────────────────────────────────────
  window.becaTraccia = function (tipo) {
    if (!CONVERSIONI[tipo]) return;
    gtag('event', 'conversion', { send_to: CONVERSIONI[tipo] });
    gtag('event', EVENTI_GA4[tipo]);
  };

  // Clic su numero di telefono e su WhatsApp (tutti i link del sito)
  document.addEventListener('click', function (e) {
    var link = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!link) return;
    var href = (link.getAttribute('href') || '').toLowerCase();
    if (href.indexOf('tel:') === 0) {
      window.becaTraccia('telefono');
    } else if (href.indexOf('wa.me/') !== -1 || href.indexOf('api.whatsapp.com') !== -1 || href.indexOf('whatsapp://') === 0) {
      window.becaTraccia('whatsapp');
    }
  }, true);

  // ── CONSENSO COOKIE ─────────────────────────────────────────
  function leggiScelta() {
    try {
      var c = JSON.parse(localStorage.getItem(CHIAVE) || 'null');
      if (c && c.scelta && (Date.now() - c.data) < DURATA) return c.scelta;
    } catch (err) {}
    return null;
  }

  function salvaScelta(scelta) {
    try {
      localStorage.setItem(CHIAVE, JSON.stringify({ scelta: scelta, data: Date.now() }));
    } catch (err) {}
    var stato = scelta === 'accetta' ? 'granted' : 'denied';
    gtag('consent', 'update', {
      ad_storage: stato,
      ad_user_data: stato,
      ad_personalization: stato,
      analytics_storage: stato
    });
    if (scelta !== 'accetta') cancellaCookieGoogle();
  }

  // Se l'utente rifiuta dopo aver accettato, toglie i cookie Google già salvati
  function cancellaCookieGoogle() {
    var dominio = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var nome = c.split('=')[0].trim();
      if (/^(_ga|_gid|_gat|_gcl)/.test(nome)) {
        document.cookie = nome + '=; Max-Age=0; path=/';
        document.cookie = nome + '=; Max-Age=0; path=/; domain=.' + dominio;
      }
    });
  }

  var CSS =
    '#beca-cookie{position:fixed;left:16px;right:16px;bottom:16px;z-index:10000;max-width:760px;margin:0 auto;' +
    'background:#fff;color:#1a1a1a;border:1px solid rgba(0,0,0,.1);border-radius:12px;' +
    'box-shadow:0 4px 32px rgba(0,0,0,.18);padding:18px 20px;font-size:14px;line-height:1.5;' +
    'display:flex;flex-wrap:wrap;gap:14px;align-items:center}' +
    '#beca-cookie p{margin:0;flex:1 1 320px}' +
    '#beca-cookie a{color:#F07000;text-decoration:underline}' +
    '#beca-cookie .beca-cookie-btns{display:flex;gap:10px}' +
    '#beca-cookie button{font:inherit;font-weight:600;min-width:110px;padding:10px 22px;border:0;' +
    'border-radius:8px;background:#F07000;color:#fff;cursor:pointer}' +
    '#beca-cookie button:hover{background:#d46200}' +
    '@media (max-width:520px){#beca-cookie .beca-cookie-btns{width:100%}#beca-cookie button{flex:1}}';

  function mostraBanner() {
    if (document.getElementById('beca-cookie')) return;
    if (!document.getElementById('beca-cookie-css')) {
      var stile = document.createElement('style');
      stile.id = 'beca-cookie-css';
      stile.textContent = CSS;
      document.head.appendChild(stile);
    }
    var box = document.createElement('div');
    box.id = 'beca-cookie';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Preferenze cookie');
    box.innerHTML =
      '<p>Usiamo cookie tecnici necessari al sito e, solo con il tuo consenso, cookie di Google Analytics ' +
      'e Google Ads per misurare le visite e i risultati degli annunci. ' +
      '<a href="privacy-policy.html">Privacy e cookie policy</a></p>' +
      '<div class="beca-cookie-btns">' +
      '<button type="button" data-scelta="rifiuta">Rifiuta</button>' +
      '<button type="button" data-scelta="accetta">Accetta</button>' +
      '</div>';
    box.addEventListener('click', function (e) {
      var bottone = e.target.closest('button[data-scelta]');
      if (!bottone) return;
      salvaScelta(bottone.getAttribute('data-scelta'));
      box.parentNode.removeChild(box);
    });
    document.body.appendChild(box);
  }

  // Link "Preferenze cookie" nel footer: riapre il banner
  document.addEventListener('click', function (e) {
    var link = e.target && e.target.closest ? e.target.closest('[data-cookie-preferenze]') : null;
    if (!link) return;
    e.preventDefault();
    mostraBanner();
  });

  function avvia() {
    if (!leggiScelta()) mostraBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', avvia);
  } else {
    avvia();
  }
})();
