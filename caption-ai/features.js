/* Tính năng mở rộng: Viral Hook, xem trước đa nền tảng + đăng nhanh, lịch chiến dịch tuần */
(() => {
  const L = Logic, A = window.App, el = A.el, $ = (s) => document.querySelector(s);
  const press = (sel, key, val) => document.querySelectorAll(sel).forEach((b) => b.setAttribute('aria-pressed', b.dataset[key] === val));
  const pick = () => +$('#pv-pick').value || 0;

  // ---------- 1. Viral Hook Generator ----------
  let strat = 'question', hseed = 0, hbusy = false;
  function insertHook(h) {
    const f = A.captionFields()[pick()];
    if (!f) { A.copy(h); return A.toast('Chưa có caption, đã copy hook.'); }
    let v = f.value; const prev = f.dataset.hook;
    if (prev && v.startsWith(prev + '\n')) v = v.slice(prev.length + 1);
    f.value = h + '\n' + v; f.dataset.hook = h; f.dispatchEvent(new Event('input', { bubbles: true }));
    A.toast(`Đã chèn hook vào Caption ${pick() + 1}.`);
  }
  async function runHooks() {
    const input = A.validate(); if (!input || hbusy) return;
    hbusy = true; hseed++; $('#hook-go').disabled = true;
    const box = $('#hooks'); box.replaceChildren(...[1, 2, 3].map(() => el('div', 'item skel')));
    let hooks;
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 20000);
    try {
      const r = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...input, action: 'hooks', strategy: strat, variant: hseed }), signal: ctl.signal });
      if (!r.ok) throw new Error(r.status);
      hooks = L.normalizeHooks((await r.json()).hooks); if (!hooks) throw new Error('format');
    } catch { hooks = L.mockHooks(input, strat, hseed); }
    clearTimeout(t);
    box.replaceChildren(...hooks.map((h) => {
      const it = el('div', 'item'), row = el('div', 'row');
      const a = el('button', 'mini', 'Chèn vào đầu caption'), b = el('button', 'mini', 'Copy');
      a.type = b.type = 'button'; a.onclick = () => insertHook(h); b.onclick = () => A.copy(h);
      row.append(a, b); it.append(el('p', '', h), row); return it;
    }));
    window.FX && FX.stagger(box.children);
    hbusy = false; $('#hook-go').disabled = false;
  }
  document.querySelectorAll('.strat').forEach((b) => (b.onclick = () => { strat = b.dataset.s; press('.strat', 's', strat); runHooks(); }));
  $('#hook-go').onclick = runHooks;

  // ---------- 2. Xem trước đa nền tảng + đăng nhanh ----------
  let plat = 'facebook';
  const OPEN = { facebook: 'https://www.facebook.com/', instagram: 'https://www.instagram.com/', tiktok: 'https://www.tiktok.com/upload', threads: 'https://www.threads.net/' };
  const ACTS = { facebook: '👍 Thích    💬 Bình luận    ↗ Chia sẻ', instagram: '♡    💬    ➤', tiktok: '♥    💬    ↪', threads: '♡    💬    ⟲    ➤' };
  function full() { const f = A.captionFields()[pick()]; return f ? f.value.trim() + '\n\n' + A.hashtags().join(' ') : ''; }
  let typeTimer;
  function typeInto(node, text, tail) {
    const chars = [...text], step = Math.max(2, Math.ceil(chars.length / 60)), tn = document.createTextNode(''); let i = 0; node.append(tn);
    typeTimer = setInterval(() => { i += step; tn.data = chars.slice(0, i).join(''); if (i >= chars.length) { clearInterval(typeTimer); if (tail) node.append(' ', tail); } }, 18);
  }
  function renderPreview(animate) {
    clearInterval(typeTimer);
    const t = full(), box = $('#mock'), note = $('#pv-note'); box.className = 'mock ' + plat;
    $('#pv-open').textContent = 'Copy & mở ' + L.PLATFORMS[plat].label;
    if (!t) { box.replaceChildren(el('p', 'mute', 'Tạo caption để xem trước bài đăng.')); note.textContent = ''; note.className = 'pv-note'; return; }
    const info = L.previewInfo(t, plat), name = (A.getLast() || {}).name || 'Shop của bạn';
    const head = el('div', 'm-head'), who = el('div'), body = el('p', 'm-body');
    who.append(el('b', '', name), el('br'), el('small', '', plat === 'facebook' ? 'Vừa xong · 🌐' : 'Vừa xong'));
    head.append(el('span', 'm-av', [...name][0].toUpperCase()), who);
    body.style.whiteSpace = 'pre-wrap';
    const moreEl = info.truncated ? el('span', 'more', plat === 'facebook' ? 'Xem thêm' : 'more') : null;
    if (animate === true && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) typeInto(body, info.shown, moreEl);
    else { body.append(info.shown); if (moreEl) body.append(' ', moreEl); }
    const media = el('div', 'm-media', name), acts = el('div', 'm-acts', ACTS[plat]);
    box.replaceChildren(head, ...(plat === 'instagram' || plat === 'tiktok' ? [media, acts, body] : [body, media, acts]));
    note.className = 'pv-note' + (info.over ? ' warn' : '');
    note.textContent = info.over ? `Vượt giới hạn ${L.PLATFORMS[plat].label} (${info.n}/${info.limit} ký tự), hãy rút gọn.`
      : info.truncated ? `Chỉ hiển thị khoảng ${info.fold} ký tự đầu, phần còn lại nằm sau “Xem thêm” (tổng ${info.n} ký tự). Hãy để câu hook ở đầu.` : `Hiển thị đầy đủ (${info.n} ký tự).`;
  }
  document.querySelectorAll('.ptab').forEach((b) => (b.onclick = () => { plat = b.dataset.p; press('.ptab', 'p', plat); renderPreview(true); }));
  $('#pv-pick').onchange = () => renderPreview(); $('#captions').addEventListener('input', () => renderPreview());
  document.addEventListener('caption:generated', () => renderPreview(true)); document.addEventListener('caption:rendered', () => renderPreview());
  const need = () => { const t = full(); if (!t) A.toast('Hãy tạo caption trước.'); return t; };
  $('#pv-copy').onclick = () => { const t = need(); t && A.copy(t); };
  // Đăng "bán tự động": Threads có sẵn intent điền nội dung; nền tảng khác copy rồi mở trang đăng
  $('#pv-threads').onclick = () => { const t = need(); t && window.open('https://www.threads.net/intent/post?text=' + encodeURIComponent(t), '_blank', 'noopener'); };
  $('#pv-share').onclick = async () => { const t = need(); if (!t) return; if (navigator.share) { try { await navigator.share({ text: t }); } catch {} } else A.copy(t); };
  $('#pv-open').onclick = async () => { const t = need(); if (!t) return; await A.copy(t); window.open(OPEN[plat], '_blank', 'noopener'); A.toast('Đã copy, hãy dán vào ô đăng bài.'); };

  // ---------- 3. Lịch chiến dịch tuần ----------
  const CKEY = 'caption_calendar_v1';
  const ROLE = { 0: ['Giới thiệu', 'trang-trong'], 2: ['Tương tác', 'hai-huoc'], 4: ['Chốt sale', 'tre-trung'] };
  const DAY_OF_TONE = { 'trang-trong': 0, 'hai-huoc': 2, 'tre-trung': 4 };
  const uid = () => Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  let cal = (() => { try { const a = JSON.parse(A.store.get(CKEY)); return Array.isArray(a) ? a.filter((x) => x && Number.isInteger(x.day) && x.day >= 0 && x.day < 7 && typeof x.text === 'string') : []; } catch { return []; } })();
  const save = () => { if (!A.store.set(CKEY, JSON.stringify(cal))) A.toast('Không lưu được lịch (bộ nhớ đầy hoặc bị chặn).'); };
  function renderCal() {
    $('#cal').replaceChildren(...L.DAYS.map((d, i) => {
      const col = el('div', 'day'), h = el('b', '', d);
      if (ROLE[i]) h.append(el('span', 'role', ROLE[i][0])); col.append(h);
      const posts = cal.filter((x) => x.day === i);
      if (!posts.length) col.append(el('span', 'none', '—'));
      posts.forEach((x) => {
        const it = el('div', 'cal-item'), row = el('div', 'row'), c = el('button', 'mini', 'Copy'), r = el('button', 'mini danger', 'Xóa');
        c.type = r.type = 'button'; c.onclick = () => A.copy(x.text);
        r.onclick = () => { cal = cal.filter((y) => y.id !== x.id); save(); renderCal(); };
        row.append(c, r); it.append(el('small', '', `${x.name} · ${L.TONE_LABEL[x.tone] || ''}`), el('p', '', x.text), row); col.append(it);
      });
      return col;
    }));
  }
  $('#pv-cal').onclick = () => {
    const t = need(); if (!t) return; const last = A.getLast() || {}, day = DAY_OF_TONE[last.tone] ?? 0;
    cal.push({ id: uid(), day, role: ROLE[day][0], tone: last.tone, name: last.name || 'Sản phẩm', text: t }); save(); renderCal();
    A.toast(`Đã thêm vào ${L.DAYS[day]}.`); $('#cal').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  $('#cal-week').onclick = async () => {
    const input = A.validate(); if (!input) return; const btn = $('#cal-week'); btn.disabled = true; btn.textContent = 'Đang tạo…';
    cal = cal.filter((x) => !(x.name === input.name && ROLE[x.day]));
    for (const [d, [role, tone]] of Object.entries(ROLE)) {
      const { result } = await A.fetchSet({ ...input, tone }, +d + Math.floor(Math.random() * 1000));
      cal.push({ id: uid(), day: +d, role, tone, name: input.name, text: result.captions[0] + '\n\n' + result.hashtags.join(' ') });
    }
    save(); renderCal(); btn.disabled = false; btn.textContent = '⚡ Tạo chiến dịch tuần'; A.toast('Đã tạo 3 bài cho Thứ 2, Thứ 4, Thứ 6.');
  };
  function download(name, type, data) { const a = el('a'); a.href = URL.createObjectURL(new Blob([data], { type })); a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
  const guard = (fn) => () => (cal.length ? fn() : A.toast('Lịch đang trống.'));
  $('#cal-md').onclick = guard(() => download('lich-dang-bai.md', 'text/markdown;charset=utf-8', L.calendarToMarkdown(cal)));
  $('#cal-json').onclick = guard(() => download('lich-dang-bai.json', 'application/json', JSON.stringify(cal, null, 2)));
  $('#cal-clear').onclick = guard(() => { if (confirm('Xóa toàn bộ lịch tuần?')) { cal = []; save(); renderCal(); } });
  renderCal();

  // ---------- 4. CTA gợi ý theo ngành + xuất Markdown/TXT ----------
  function renderCta() {
    const last = A.getLast(); if (!last) return;
    const key = L.industry(last.name + ' ' + last.desc); $('#cta-ind').textContent = '· ngành: ' + L.INDUSTRY_LABEL[key];
    $('#cta').replaceChildren(...L.ctaFor(key).map((c) => {
      const b = el('button', 'tag', c); b.type = 'button';
      b.onclick = () => {
        const f = A.captionFields()[pick()]; if (!f) return;
        f.value = f.value.replace(/\n?👉 [^\n]*$/, '') + '\n👉 ' + c; f.dispatchEvent(new Event('input', { bubbles: true }));
        A.toast(`Đã gắn CTA vào Caption ${pick() + 1}.`);
      };
      return b;
    }));
  }
  document.addEventListener('caption:rendered', renderCta);
  const exp = (md) => () => { const d = A.exportData(); if (!d) return A.toast('Hãy tạo caption trước.'); download(md ? 'caption-ai.md' : 'caption-ai.txt', md ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8', L.exportContent(d.input, d.r, md)); };
  $('#exp-md').onclick = exp(true); $('#exp-txt').onclick = exp(false);
})();
