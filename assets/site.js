// Shared logic for AI Daily — runs only what the current page needs.

const WEEKDAY_DE = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
const MONTH_DE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

// ---------- Theme toggle (every page) ----------
function setupTheme() {
  const btn = document.getElementById('theme');
  if (!btn) return;
  const saved = localStorage.getItem('ai-news-theme') || 'dark';
  document.documentElement.dataset.theme = saved;
  btn.textContent = saved === 'dark' ? '🌙' : '☀';
  btn.addEventListener('click', () => {
    const cur = document.documentElement.dataset.theme || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    btn.textContent = next === 'dark' ? '🌙' : '☀';
    localStorage.setItem('ai-news-theme', next);
  });
}

// ---------- TTS (only on edition pages) ----------
let voices = [];
let voiceDe = null;
let voiceEn = null;
let speed = 1.0;

function loadVoices() {
  voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  const findBest = (lang, preferredLocale) => {
    const all = voices.filter(v => v.lang.toLowerCase().startsWith(lang));
    const preferred = preferredLocale
      ? voices.filter(v => v.lang.toLowerCase().startsWith(preferredLocale))
      : all;
    const quality = /premium|enhanced|natural|neural/i;
    return preferred.find(v => quality.test(v.name))
        || all.find(v => quality.test(v.name))
        || preferred.find(v => v.localService)
        || all.find(v => v.localService)
        || preferred[0]
        || all[0]
        || null;
  };
  voiceDe = findBest('de', 'de-de');
  voiceEn = findBest('en', 'en-us');
  populateSelector('voice-de', 'de', voiceDe);
  populateSelector('voice-en', 'en', voiceEn);
}

function populateSelector(id, langPrefix, defaultVoice) {
  const sel = document.getElementById(id);
  if (!sel) return;
  sel.innerHTML = '';
  const matching = voices.filter(v => v.lang.toLowerCase().startsWith(langPrefix));
  if (!matching.length) {
    const opt = document.createElement('option');
    opt.textContent = '(no voice)';
    sel.appendChild(opt);
    sel.disabled = true;
    return;
  }
  matching.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.name;
    opt.textContent = v.name + ' · ' + v.lang;
    sel.appendChild(opt);
  });
  if (defaultVoice) sel.value = defaultVoice.name;
}

function wrapWords() {
  document.querySelectorAll('.tts-text').forEach(el => {
    if (el.dataset.wrapped) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) textNodes.push(node);
    textNodes.forEach(tn => {
      if (!tn.nodeValue.trim()) return;
      const frag = document.createDocumentFragment();
      tn.nodeValue.split(/(\s+)/).forEach(p => {
        if (p === '') return;
        if (/\S/.test(p)) {
          const span = document.createElement('span');
          span.className = 'word';
          span.textContent = p;
          frag.appendChild(span);
        } else {
          frag.appendChild(document.createTextNode(p));
        }
      });
      tn.parentNode.replaceChild(frag, tn);
    });
    el.dataset.wrapped = 'true';
  });
}

function clearActive() {
  document.querySelectorAll('.word.active').forEach(w => w.classList.remove('active'));
  document.querySelectorAll('.speak-btn.playing').forEach(b => b.classList.remove('playing'));
}

function speak(text, lang, btn, paragraphEl) {
  speechSynthesis.cancel();
  clearActive();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = lang === 'de' ? voiceDe : voiceEn;
  u.lang = lang === 'de' ? 'de-DE' : 'en-US';
  u.rate = speed;
  u.pitch = 1;
  const wordSpans = paragraphEl ? Array.from(paragraphEl.querySelectorAll('.word')) : [];
  let idx = 0;
  u.onboundary = (e) => {
    if (e.name && e.name !== 'word') return;
    document.querySelectorAll('.word.active').forEach(w => w.classList.remove('active'));
    if (wordSpans[idx]) {
      wordSpans[idx].classList.add('active');
      const rect = wordSpans[idx].getBoundingClientRect();
      if (rect.bottom > window.innerHeight - 100 || rect.top < 80) {
        wordSpans[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      idx++;
    }
  };
  u.onend = () => { btn?.classList.remove('playing'); document.querySelectorAll('.word.active').forEach(w => w.classList.remove('active')); };
  u.onerror = u.onend;
  btn?.classList.add('playing');
  speechSynthesis.speak(u);
}

function setupTTS() {
  if (!document.querySelector('.tts-text')) return;
  speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();
  wrapWords();
  document.querySelectorAll('.speak-btn').forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = 'true';
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang || 'en';
      const para = btn.dataset.target ? document.querySelector(btn.dataset.target) : btn.parentElement.querySelector('.tts-text');
      if (!para) return;
      if (btn.classList.contains('playing')) {
        speechSynthesis.cancel();
        clearActive();
        return;
      }
      speak(para.textContent.trim(), lang, btn, para);
    });
  });
  const speedSel = document.getElementById('speed');
  if (speedSel) speedSel.addEventListener('change', e => speed = parseFloat(e.target.value));
  const dSel = document.getElementById('voice-de');
  if (dSel) dSel.addEventListener('change', e => voiceDe = voices.find(v => v.name === e.target.value));
  const eSel = document.getElementById('voice-en');
  if (eSel) eSel.addEventListener('change', e => voiceEn = voices.find(v => v.name === e.target.value));
  const stopBtn = document.getElementById('stop');
  if (stopBtn) stopBtn.addEventListener('click', () => { speechSynthesis.cancel(); clearActive(); });
  window.addEventListener('beforeunload', () => speechSynthesis.cancel());
}

// ---------- Editions list (only on archive landing) ----------
function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return {
    weekday: WEEKDAY_DE[dt.getUTCDay()],
    short: `${String(d).padStart(2,'0')}.${String(m).padStart(2,'0')}.${y}`,
  };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function loadEditions() {
  const container = document.getElementById('editions');
  if (!container) return;
  try {
    const res = await fetch('editions.json?_=' + Date.now());
    if (!res.ok) throw new Error('Failed to load editions.json');
    const data = await res.json();
    renderEditions(data.editions || [], container);
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Konnte editions.json nicht laden: ${err.message}</div>`;
  }
}

function renderEditions(editions, container) {
  if (!editions.length) {
    container.innerHTML = '<div class="empty-state">Noch keine Ausgaben veröffentlicht. Die erste erscheint heute Abend um 18:00.</div>';
    return;
  }
  editions.sort((a, b) => b.date.localeCompare(a.date));
  container.innerHTML = editions.map(ed => {
    const d = formatDate(ed.date);
    const headlines = (ed.headlines || []).slice(0, 5).map(h => `<li>${escapeHtml(h)}</li>`).join('');
    const meta = [];
    if (ed.story_count) meta.push(`${ed.story_count} Stories`);
    if (ed.reading_time_min) meta.push(`📖 ${ed.reading_time_min} min lesen`);
    if (ed.listen_time_min) meta.push(`🎧 ${ed.listen_time_min} min hören`);
    if (ed.vocab_count) meta.push(`${ed.vocab_count} Vokabeln`);
    return `
      <a href="editions/${ed.date}.html" class="edition-card">
        <div class="edition-date">${d.short}</div>
        <div class="edition-day">${d.weekday}</div>
        <ul class="edition-headlines">${headlines}</ul>
        ${meta.length ? `<div class="edition-meta">${meta.map(m => `<span>${m}</span>`).join('')}</div>` : ''}
      </a>`;
  }).join('');
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  setupTheme();
  setupTTS();
  loadEditions();
});
