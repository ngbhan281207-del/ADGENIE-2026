/* Giao diện động theo chủ đề + hiệu ứng chuyển động: hạt emoji theo ngành, ripple, confetti, parallax, stagger */
(() => {
  const A = window.App, L = Logic, $ = (s) => document.querySelector(s);
  const mq = (q) => !!(window.matchMedia && matchMedia(q).matches);
  const REDUCE = mq('(prefers-reduced-motion: reduce)');
  const SETS = { food: ['☕', '🍜', '🥐', '🍰'], fashion: ['👗', '👠', '👜', '✨'], beauty: ['💄', '🧴', '🌸', '✨'], tech: ['💻', '📱', '⚡', '🎧'], health: ['🌿', '🍃', '💚', '🥗'], kids: ['🧸', '🎈', '⭐', '🎨'], home: ['🛋️', '💡', '🪴', '🏡'], other: ['🛍️', '💬', '⭐', '✨'], default: ['✨', '💬', '🛍️', '⭐'] };
  const HUES = [[28, 'Cam'], [335, 'Hồng'], [305, 'Tím hồng'], [215, 'Xanh dương'], [145, 'Xanh lá'], [265, 'Tím']];
  let key = '';

  // ---- Bảng chọn màu: Tự động (theo sản phẩm) hoặc chọn tay ----
  const cur = () => A.store.get('caption_theme') || 'auto';
  const sw = $('#swatches');
  const mk = (val, label, bg) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'sw'; b.dataset.v = val; b.title = label; b.setAttribute('aria-label', 'Màu giao diện: ' + label); if (bg) b.style.background = bg; b.onclick = () => { A.store.set('caption_theme', val); A.applyTheme(); }; sw.append(b); };
  mk('auto', 'Tự động theo sản phẩm', 'conic-gradient(#f9a03f,#e1306c,#833ab4,#3b82f6,#22c55e,#f9a03f)');
  HUES.forEach(([h, n]) => mk(String(h), n, `hsl(${h} 80% 50%)`));
  const mark = () => sw.querySelectorAll('.sw').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === cur()));

  // ---- Hạt emoji bay theo ngành hàng ----
  function spawn(k) {
    if (REDUCE) return;
    const box = $('#float');
    box.querySelectorAll('span').forEach((s) => { s.style.setProperty('opacity', '0', 'important'); setTimeout(() => s.remove(), 600); });
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('span'); s.textContent = SETS[k][i % 4];
      s.style.cssText = `left:${5 + Math.random() * 90}%;font-size:${18 + Math.random() * 18}px;animation-duration:${16 + Math.random() * 12}s;animation-delay:${-Math.random() * 20}s`;
      box.append(s);
    }
  }
  document.addEventListener('theme:change', (e) => {
    const { key: k, auto } = e.detail;
    $('#theme-name').textContent = (k === 'default' ? 'Mặc định' : L.INDUSTRY_LABEL[k]) + (auto ? '' : ' · màu tự chọn');
    $('#theme-ico').textContent = SETS[k][0]; mark();
    if (k !== key) { key = k; spawn(k); }
  });

  // ---- Stagger khi kết quả xuất hiện ----
  function stagger(list) { [...list].forEach((e, i) => { e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); e.style.setProperty('--i', i); }); }
  window.FX = { stagger };

  // ---- Confetti emoji khi tạo xong ----
  let pressed = null;
  document.addEventListener('pointerdown', (e) => {
    pressed = e.target.closest('#go,#regen,#hook-go,#cal-week') || pressed;
    const b = e.target.closest('.btn.gold,.btn.ghost'); if (!b || REDUCE) return; // ripple
    const r = b.getBoundingClientRect(), z = Math.max(r.width, r.height) * 2, s = document.createElement('span');
    s.className = 'ripple'; s.style.cssText = `width:${z}px;height:${z}px;left:${e.clientX - r.left - z / 2}px;top:${e.clientY - r.top - z / 2}px`;
    b.append(s); setTimeout(() => s.remove(), 600);
  }, true);
  document.addEventListener('caption:generated', () => {
    stagger(document.querySelectorAll('#out .item, #out .tag'));
    if (REDUCE) return;
    const o = pressed && document.contains(pressed) && !pressed.hidden ? pressed : $('#go'), r = o.getBoundingClientRect(), set = SETS[key || 'default'];
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('span'); s.className = 'confetti'; s.textContent = set[i % 4];
      s.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;--dx:${(Math.random() - 0.5) * 280}px;--dy:${-(70 + Math.random() * 190)}px;--rot:${(Math.random() - 0.5) * 540}deg`;
      document.body.append(s); setTimeout(() => s.remove(), 1100);
    }
  });

  // ---- Parallax nhẹ theo chuột (chỉ máy có chuột) ----
  if (!REDUCE && mq('(pointer: fine)')) addEventListener('pointermove', (e) => {
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    $('.bg').style.transform = `translate3d(${-x * 18}px,${-y * 18}px,0)`; $('.aurora').style.transform = `translate3d(${x * 30}px,${y * 30}px,0)`;
  }, { passive: true });

  A.applyTheme(); // áp dụng màu đã lưu / chủ đề ban đầu
})();
