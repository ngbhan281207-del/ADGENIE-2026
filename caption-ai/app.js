
(() => {
  const { LIMITS, TONE_LABEL, SPICES, BOOST, MAX, len, validateInput, charStatus, normalizeOutput, mockGenerate, ANGLES, themeHue, hashtagScore, nicheTags } = Logic
  const $ = (s) => document.querySelector(s);
  const KEY = 'caption_history_v1', MAX_HISTORY = 30;
  const SAMPLES = [
    { name: 'Cà phê rang mộc Đắk Lắk', desc: '100% hạt Robusta đậm đà, thơm nồng, không pha tạp chất, túi 500g.', aud: 'Dân văn phòng cần tỉnh táo làm việc', tone: 'tre-trung' },
    { name: 'Váy hoa nhí vintage dáng xòe', desc: 'Chất voan tơ mềm mại, thoáng mát, họa tiết hoa nhí phong cách Hàn Quốc.', aud: 'Bạn nữ 18–28 tuổi thích chụp ảnh dạo phố', tone: 'hai-huoc' },
    { name: 'Bún bò Huế chuẩn vị cố đô', desc: 'Nước dùng hầm xương 12 tiếng, chả giò giòn, thịt nạm mềm thơm.', aud: 'Gia đình và tín đồ ẩm thực', tone: 'trang-trong' },
  ];
  let tone = 'tre-trung', lenMode = 'standard', spice = 'none', boost = 0, last = null, seed = 0, busy = false, current = null;

  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const icons = () => { try { window.lucide && lucide.createIcons(); } catch {} };
  function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 1800); }
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); return true; } catch { return false; } } };

  // ---- Tông giọng ----
  function setTone(t) { tone = t; document.querySelectorAll('.tone').forEach((b) => b.setAttribute('aria-pressed', b.dataset.tone === t)); }

  // ---- Gia vị cảm xúc & giao diện động ----
  function setSpice(k, b) { spice = SPICES[k] ? k : 'none'; boost = spice === 'none' ? 0 : (b != null ? b : boost || 2); $('#boost').value = boost; $('#boost-l').textContent = BOOST[boost]; document.querySelectorAll('.spice').forEach((x) => x.setAttribute('aria-pressed', x.dataset.spice === spice)); }
  function setLen(k) { lenMode = Logic.LENGTHS[k] ? k : 'standard'; document.querySelectorAll('.len').forEach((x) => x.setAttribute('aria-pressed', x.dataset.len === lenMode)); }
  function applyTheme() {
    const text = $('#name').value + ' ' + $('#desc').value, ov = store.get('caption_theme'), auto = !ov || ov === 'auto';
    const hue = auto ? themeHue(text) : +ov || 265, key = text.trim().length < 3 ? 'default' : Logic.industry(text);
    document.documentElement.style.setProperty('--h', hue);
    document.dispatchEvent(new CustomEvent('theme:change', { detail: { hue, key, auto } }));
  }
  let themeTimer; const themeSoon = () => { clearTimeout(themeTimer); themeTimer = setTimeout(applyTheme, 350); };

  // ---- Form ----
  const readForm = () => ({ name: $('#name').value, desc: $('#desc').value, aud: $('#aud').value, tone, spice, boost, length: lenMode });
  function fillForm(i) { $('#name').value = i.name; $('#desc').value = i.desc; $('#aud').value = i.aud; setTone(i.tone); setSpice(i.spice || 'none', i.boost || 0); setLen(i.length || 'standard'); count(); showErrors({}); applyTheme(); }
  function showErrors(e) { ['name', 'desc', 'aud', 'tone'].forEach((k) => { $('#e-' + k).textContent = e[k] || ''; const f = document.getElementById(k); if (f) f.setAttribute('aria-invalid', !!e[k]); }); }
  function count() { $('#count').textContent = `${len($('#desc').value)}/${MAX.desc}`; }

  // ---- Lịch sử ----
  function loadHistory() { try { const a = JSON.parse(store.get(KEY)); return Array.isArray(a) ? a.filter((h) => h && h.id && h.input && TONE_LABEL[h.input.tone] && normalizeOutput(h.result)) : []; } catch { return []; } }
  function saveHistory(a) { if (!store.set(KEY, JSON.stringify(a.slice(0, MAX_HISTORY)))) toast('Không lưu được lịch sử (bộ nhớ đầy hoặc bị chặn).'); }
  function renderHistory() {
    const list = loadHistory(), ul = $('#history'); ul.replaceChildren();
    $('#h-empty').hidden = list.length > 0; $('#clear').hidden = !list.length;
    list.forEach((h) => {
      const li = el('li'), act = el('div', 'row');
      const v = el('button', 'mini', 'Xem lại'), d = el('button', 'mini danger', 'Xóa'); v.type = d.type = 'button';
      v.onclick = () => { fillForm(h.input); last = h.input; render(h.result, h.mode); applyTheme(); scrollTo({ top: 0, behavior: 'smooth' }); };
      d.onclick = () => { saveHistory(loadHistory().filter((x) => x.id !== h.id)); renderHistory(); toast('Đã xóa mục lịch sử.'); };
      act.append(v, d);
      li.append(el('b', '', h.input.name), el('span', 'mute', `${TONE_LABEL[h.input.tone]} · ${new Date(h.id).toLocaleString('vi-VN')} · ${h.mode === 'ai' ? 'AI thật' : 'Mô phỏng'}`), act); ul.append(li);
    });
  }

  // ---- Tạo nội dung ----
  async function callAI(input, variant) {
    const c = new AbortController(), t = setTimeout(() => c.abort(), 20000);
    try {
      const r = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...input, variant }), signal: c.signal });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const o = normalizeOutput(await r.json()); if (!o) throw new Error('Sai định dạng'); return o;
    } finally { clearTimeout(t); }
  }
  async function fetchSet(input, sd) {
    try { return { result: await callAI(input, sd), mode: 'ai' }; } catch { return { result: mockGenerate(input, sd), mode: 'mock' }; }
  }
  async function run(input, regen, tweak) {
    if (busy) return;
    const v = validateInput(input); showErrors(v.errors);
    if (!v.ok) { const k = Object.keys(v.errors)[0]; (document.getElementById(k) || $('#name')).focus(); return; }
    $('#go').classList.add('busy');
    busy = true; $('#go').disabled = $('#regen').disabled = true; $('#go span').textContent = 'Đang tạo…';
    $('#empty').hidden = true; $('#out').hidden = false; $('#headlines').replaceChildren(); $('#hashtags').replaceChildren();
    $('#captions').replaceChildren(...[1, 2, 3].map(() => el('div', 'item skel')));
    seed = tweak ? seed : regen ? seed + 1 : Math.floor(Math.random() * 1000);
    const { result, mode: m } = await fetchSet(v.clean, seed);
    if (m === 'mock') toast('Chưa gọi được AI thật, đang dùng dữ liệu mô phỏng.');
    last = v.clean; render(result, m);
    if (!tweak) { const h = loadHistory(); h.unshift({ id: Date.now(), input: v.clean, result, mode: m }); saveHistory(h); renderHistory(); }
    if (!tweak) document.dispatchEvent(new CustomEvent('caption:generated'));
    $('#go').classList.remove('busy');
    busy = false; $('#go').disabled = $('#regen').disabled = false; $('#go span').textContent = 'Tạo Caption';
  }

  // ---- Hiển thị (textContent, không chèn HTML) ----
  let lastBtn = null; document.addEventListener('click', (e) => { lastBtn = e.target.closest('button.mini'); }, true);
  function flash(b) { if (!b || b.dataset.flash) return; const o = b.textContent; b.dataset.flash = 1; b.textContent = '✓ Đã sao chép!'; setTimeout(() => { b.textContent = o; delete b.dataset.flash; }, 1400); }
  async function copy(text) {
    const btn = lastBtn; lastBtn = null; flash(btn);
    try { await navigator.clipboard.writeText(text); toast('Đã sao chép.'); }
    catch { const t = el('textarea'); t.value = text; document.body.append(t); t.select(); let ok = false; try { ok = document.execCommand('copy'); } catch {} t.remove(); toast(ok ? 'Đã sao chép.' : 'Không copy được, hãy chọn và sao chép thủ công.'); }
  }
  function item(text, isCap, idx) {
    const box = el('div', 'item'), field = isCap ? el('textarea') : el('p', '', text), row = el('div', 'row');
    if (isCap) { field.value = text; field.rows = 3; field.setAttribute('aria-label', 'Caption, có thể chỉnh sửa'); }
    box.append(field);
    if (isCap) {
      const g = el('div', 'gauge'), bar = el('i'), meta = el('span', 'meta'), badges = el('div', 'badges'); g.append(bar);
      const upd = () => {
        const n = len(field.value), st = charStatus(n);
        box.classList.remove('ok', 'soft', 'over'); box.classList.add(st);
        bar.style.width = Math.min(100, (n / LIMITS.HARD) * 100) + '%';
        meta.textContent = st === 'over' ? `${n}/${LIMITS.HARD} · Vượt giới hạn 2.200 ký tự của Instagram/Facebook, hãy rút gọn` : st === 'soft' ? `${n} ký tự · Vượt 280 (X/Twitter, hook ngắn), vẫn hợp Facebook/Instagram` : `${n} ký tự`;
        badges.replaceChildren(el('span', 'angle', ANGLES[idx] || 'Caption'), el('span', 'badge' + (n > LIMITS.HARD ? ' no' : ''), n > LIMITS.HARD ? 'Instagram ✗' : 'Instagram ✓'), el('span', 'badge' + (n > LIMITS.HARD ? ' no' : ''), n > LIMITS.HARD ? 'Facebook ✗' : 'Facebook ✓'), el('span', 'badge' + (n > LIMITS.SOFT ? ' warn' : ''), n > LIMITS.SOFT ? 'X/Twitter ✗ (>280)' : 'X/Twitter ✓'));
        field.style.height = 'auto'; field.style.height = field.scrollHeight + 'px';
      };
      field.addEventListener('input', upd); badges.prepend(el('span', 'angle', ANGLES[idx] || 'Caption')); box.prepend(badges); row.append(g, meta); setTimeout(upd, 0);
    }
    const b = el('button', 'mini', 'Copy'); b.type = 'button'; b.onclick = () => copy(isCap ? field.value : text); row.append(b);
    if (isCap) { const c = el('button', 'mini', 'Copy cả bài + hashtag'); c.type = 'button'; c.onclick = () => copy(field.value + '\n\n' + current.hashtags.join(' ')); row.append(c); }
    box.append(row); return box;
  }
  function render(r, m) {
    current = r; $('#empty').hidden = true; $('#out').hidden = false; $('#regen').hidden = false;
    $('#headlines').replaceChildren(...r.headlines.map((t) => item(t, false)));
    $('#captions').replaceChildren(...r.captions.map((t, i) => item(t, true, i)));
    const tagBtn = (h, niche) => { const sc = hashtagScore(h), b = el('button', 'tag' + (niche ? ' niche' : ''), h); b.type = 'button'; b.title = 'Độ hot ước tính ' + sc.score + '/99. Bấm để copy'; b.append(el('span', 'hs', (sc.tier === 'hot' ? '🔥 ' : sc.tier === 'warm' ? '↗ ' : '◇ ') + sc.score)); b.onclick = () => copy(h); return b; };
    $('#hashtags').replaceChildren(...r.hashtags.map((h) => tagBtn(h, false)));
    $('#niche').replaceChildren(...(last ? nicheTags(last, r.hashtags) : []).map((h) => tagBtn(h, true)));
    $('#banner').hidden = m === 'ai';
    document.dispatchEvent(new CustomEvent('caption:rendered'));
  }

  // ---- Sự kiện ----
  $('#form').addEventListener('submit', (e) => { e.preventDefault(); run(readForm(), false); });
  $('#regen').onclick = () => last && run(last, true);
  $('#desc').addEventListener('input', () => { count(); themeSoon(); }); $('#name').addEventListener('input', themeSoon);
  let tw; const tweakSoon = () => { if (!last) return; clearTimeout(tw); tw = setTimeout(() => { const v = validateInput(readForm()); if (v.ok) run(v.clean, false, true); }, 450); };
  document.querySelectorAll('.spice').forEach((b) => (b.onclick = () => { setSpice(b.dataset.spice); tweakSoon(); }));
  document.querySelectorAll('.len').forEach((b) => (b.onclick = () => { setLen(b.dataset.len); tweakSoon(); }));
  $('#boost').addEventListener('input', (e) => { boost = +e.target.value; $('#boost-l').textContent = BOOST[boost]; if (boost > 0 && spice === 'none') setSpice('genz', boost); if (boost === 0) setSpice('none', 0); tweakSoon(); });
  $('#copy-tags').onclick = () => current && copy(current.hashtags.join(' '));
  $('#clear').onclick = () => { if (confirm('Xóa toàn bộ lịch sử?')) { saveHistory([]); renderHistory(); } };
  document.querySelectorAll('.tone').forEach((b) => (b.onclick = () => setTone(b.dataset.tone)));
  document.querySelectorAll('[data-sample]').forEach((b) => (b.onclick = () => { fillForm(SAMPLES[b.dataset.sample]); toast('Đã điền mẫu, bấm Tạo nội dung.'); }));
  document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(readForm(), false); } });
  window.App = {
    el, copy, toast, store, fetchSet, applyTheme,
    validate() { const v = validateInput(readForm()); showErrors(v.errors); if (!v.ok) { (document.getElementById(Object.keys(v.errors)[0]) || $('#name')).focus(); return null; } return v.clean; },
    captionFields: () => [...document.querySelectorAll('#captions textarea')],
    hashtags: () => (current ? current.hashtags : []),
    getLast: () => last,
    exportData: () => (current && last ? { input: last, r: { headlines: [...document.querySelectorAll('#headlines p')].map((p) => p.textContent), captions: [...document.querySelectorAll('#captions textarea')].map((t) => t.value), hashtags: current.hashtags } } : null),
  };
  setTone(tone); renderHistory(); count();
  window.addEventListener('load', icons);
})();
