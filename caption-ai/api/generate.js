// Vercel serverless function: gọi AI ở phía server, khóa API không bao giờ lộ ra trình duyệt.
// Hỗ trợ 2 nhà cung cấp: "openai" (mọi API tương thích OpenAI) và "gemini" (Google AI Studio).
const { validateInput, normalizeOutput, normalizeHooks, buildPrompt, buildHookPrompt, STRATEGIES } = require('../logic.js');

// Một số mạng/Node 18 bị treo khi thử IPv6 tới Google; ưu tiên IPv4 để tránh timeout
try { require('dns').setDefaultResultOrder('ipv4first'); } catch {}

const cfg = () => {
  const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase() === 'gemini' ? 'gemini' : 'openai';
  return { provider, key: process.env.AI_API_KEY, model: process.env.AI_MODEL || (provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini') };
};

// Giới hạn đơn giản 20 lượt/phút/IP (best-effort trên serverless) để tránh bị lạm dụng khóa
const hits = new Map();
function limited(ip) {
  const now = Date.now(), a = (hits.get(ip) || []).filter((t) => now - t < 60000);
  a.push(now); hits.set(ip, a); if (hits.size > 1000) hits.clear();
  return a.length > 20;
}

// Lỗi của nhà cung cấp: lấy thông điệp gốc (đã che khóa) để người dùng biết nguyên nhân
async function providerError(r, key) {
  let detail = '';
  try { const d = await r.json(); detail = String(d?.error?.message || d?.message || JSON.stringify(d)); } catch {}
  detail = detail.split(key).join('***').replace(/\s+/g, ' ').slice(0, 240);
  return Object.assign(new Error('provider'), { status: r.status, detail });
}

// Model Gemini đổi tên/ngừng hỗ trợ rất nhanh (404). Khi đó tự hỏi Google danh sách model còn dùng được và chọn bản Flash mới nhất.
let good = null;                       // model dự phòng đã chạy được (nhớ 10 phút)
let poolCache = { at: 0, list: [] };   // danh sách model khả dụng (nhớ 10 phút)
const RETRY = (e) => !e.status || [404, 408, 429, 500, 502, 503, 504].includes(e.status); // lỗi tạm thời → thử model khác

// Model mới nhất hay quá tải (503/timeout) hoặc đổi tên (404). Cách xử lý:
//  - lỗi tạm thời → thử ngay model kế tiếp (ưu tiên bản cũ hơn model đang cấu hình vì thường ổn định hơn);
//  - quá 5 giây chưa có trả lời → gọi thêm 1 model dự phòng song song, ai về trước thì dùng (tối đa 3 model, trong giới hạn ms).
const gver = (n) => parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [0, 0])[1]);
async function callGemini(c, system, user, ms) {
  const t0 = Date.now(), deadline = t0 + ms, tried = [];
  const first = good && good.until > t0 ? good.model : c.model;
  let cand = [first], next = 0, lastErr, loaded = false; const pending = new Map();
  const start = () => {
    const m = cand[next++], left = deadline - Date.now();
    pending.set(m, geminiCall(c.key, m, system, user, Math.max(left, 1000)).then((text) => ({ ok: true, m, text }), (e) => ({ ok: false, m, e })));
  };
  const more = async () => {
    if (loaded) return; loaded = true;
    if (Date.now() - poolCache.at > 600000) poolCache = { at: Date.now(), list: await listGeminiModels(c.key).catch(() => []) };
    const v = gver(first);
    cand = cand.concat(poolCache.list.filter((x) => x !== first).sort((a, b) => ((gver(a) > v) - (gver(b) > v)) || gver(b) - gver(a)).slice(0, 2));
  };
  start();
  while (pending.size) {
    let timer; const hedge = new Promise((r) => { timer = setTimeout(() => r('hedge'), 5000); });
    const r = await Promise.race([...pending.values(), hedge]); clearTimeout(timer);
    if (r === 'hedge') { await more(); if (next < cand.length && deadline - Date.now() > 3000) start(); continue; }
    pending.delete(r.m);
    if (r.ok) {
      if (r.m !== c.model) { if (!good || good.model !== r.m) console.warn(`[AI] "${c.model}" đang lỗi/chậm, dùng "${r.m}". Có thể đặt AI_MODEL=${r.m}`); good = { model: r.m, until: Date.now() + 600000 }; } else good = null;
      return { text: r.text, model: r.m };
    }
    lastErr = r.e; tried.push(`${r.m}: ${r.e.status || 'timeout'}`);
    if (!RETRY(r.e)) throw r.e;
    if (!pending.size) { await more(); if (next < cand.length && deadline - Date.now() > 2500) start(); }
  }
  lastErr = lastErr || new Error('timeout');
  lastErr.detail = (lastErr.detail || why(lastErr)) + ' | đã thử: ' + tried.join(', ');
  throw lastErr;
}
async function listGeminiModels(key) {
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', { headers: { 'x-goog-api-key': key }, signal: AbortSignal.timeout(10000) });
  if (!r.ok) return [];
  const names = ((await r.json()).models || []).filter((m) => (m.supportedGenerationMethods || []).includes('generateContent')).map((m) => m.name.replace(/^models\//, ''));
  const bad = /(image|tts|live|audio|embed|exp|robot|preview|thinking|vision|computer|gemma|learnlm)/;
  const ver = (n) => parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [0, 0])[1]);
  const flash = names.filter((n) => /^gemini-/.test(n) && /flash/.test(n) && !bad.test(n));
  const pool = flash.length ? flash : names.filter((n) => /^gemini-/.test(n) && !bad.test(n));
  pool.sort((a, b) => (/lite/.test(a) - /lite/.test(b)) || ver(b) - ver(a));
  return pool;
}
const pickGeminiModel = async (key) => (await listGeminiModels(key))[0] || null;

async function geminiCall(key, model, system, user, ms, think = true, plain = false) {
  const gc = plain ? {} : { temperature: 0.9, responseMimeType: 'application/json' };
  // Giảm bước "suy nghĩ" để trả lời nhanh (2.5: ngân sách 0; 3.x: mức thấp). Model không hỗ trợ sẽ báo 400 và tự thử lại không có tùy chọn này.
  if (!plain && think) { if (/gemini-2\.5-flash/.test(model)) gc.thinkingConfig = { thinkingBudget: 0 }; else if (/gemini-3/.test(model)) gc.thinkingConfig = { thinkingLevel: 'low' }; }
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: gc,
    }),
    signal: AbortSignal.timeout(ms),
  });
  if (!r.ok) {
    const e = await providerError(r, key);
    if (gc.thinkingConfig && e.status === 400 && /think/i.test(e.detail || '')) return geminiCall(key, model, system, user, ms, false);
    throw e;
  }
  const d = await r.json();
  return (d?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
}

async function callModel({ provider, key, model }, system, user, ms = 19000) {
  if (provider === 'gemini') return callGemini({ key, model }, system, user, ms);
  const base = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
  const r = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, temperature: 0.9, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
    signal: AbortSignal.timeout(ms),
  });
  if (!r.ok) throw await providerError(r, key);
  const d = await r.json();
  return { text: d?.choices?.[0]?.message?.content || '', model };
}

module.exports = async (req, res) => {
  const c = cfg();
  const ip = String(req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || 'ip').split(',')[0].trim();
  if (req.method === 'GET') {
    // /api/generate → xem đã cấu hình chưa;  /api/generate?test=1 → gọi thử 1 lần và báo nguyên nhân nếu lỗi (không lộ khóa)
    const info = { configured: !!c.key, provider: c.provider, model: (good && good.model) || c.model, base: c.provider === 'openai' ? process.env.AI_BASE_URL || 'https://api.openai.com/v1' : undefined };
    const test = new URL(req.url || '/', 'http://x').searchParams.get('test');
    if (!test || !c.key) return res.status(200).json(info);
    if (limited(ip)) return res.status(429).json({ ...info, error: 'Gọi quá nhanh' });
    if (test === 'gen') {
      // Chạy đúng prompt tạo caption thật với dữ liệu mẫu, cho biết thời gian, kết quả có hợp lệ không và nội dung thô AI trả về
      const v = validateInput({ name: 'Serum Vitamin C dưỡng sáng da', desc: 'Giúp da sáng đều màu, thấm nhanh, không bết dính.', aud: 'Nhân viên văn phòng 22-30 tuổi', tone: 'tre-trung' });
      const { system, user } = buildPrompt(v.clean, 1), t = Date.now();
      try { const o = await callModel(c, system, user, 40000); return res.status(200).json({ ...info, model: o.model, ms: Date.now() - t, valid: !!normalizeOutput(coerce(safeParse(o.text))), raw: o.text.slice(0, 1200) }); }
      catch (e) { return res.status(200).json({ ...info, ok: false, ms: Date.now() - t, status: e.status, detail: e.detail || why(e) }); }
    }
    if (test === 'all' && c.provider === 'gemini') {
      // Thử song song vài model (12 giây/model) + 1 lần gọi "thô" (không JSON mode, không thinkingConfig) để tìm nguyên nhân treo
      const pool = await listGeminiModels(c.key).catch(() => []);
      const jobs = [...new Set([c.model, ...pool.slice(0, 4)])].map((m) => ({ model: m, plain: false })).concat([{ model: c.model, plain: true }]);
      const results = await Promise.all(jobs.map(async (j) => {
        const t = Date.now();
        try { await geminiCall(c.key, j.model, 'Trả về JSON {"ok":true}', 'ping', 12000, true, j.plain); return { model: j.model, plain: j.plain, ok: true, ms: Date.now() - t }; }
        catch (e) { return { model: j.model, plain: j.plain, ok: false, ms: Date.now() - t, status: e.status, error: e.detail || why(e) }; }
      }));
      return res.status(200).json({ ...info, results });
    }
    // Bước 1: kiểm tra mạng + khóa (nhẹ); bước 2: gọi sinh nội dung thử và đo thời gian
    let list;
    if (c.provider === 'gemini') {
      const t = Date.now();
      try { const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1', { headers: { 'x-goog-api-key': c.key }, signal: AbortSignal.timeout(15000) }); list = { status: r.status, ms: Date.now() - t }; }
      catch (e) { list = { error: why(e), ms: Date.now() - t }; }
    }
    const t = Date.now();
    try { const o = await callModel(c, 'Trả về JSON {"ok":true}', 'ping', 30000); return res.status(200).json({ ...info, model: o.model, ok: true, genMs: Date.now() - t, list }); }
    catch (e) { return res.status(200).json({ ...info, ok: false, status: e.status, detail: e.detail || why(e), genMs: Date.now() - t, list }); }
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Chỉ hỗ trợ POST' });
  if (!c.key) return res.status(503).json({ error: 'Chưa cấu hình AI_API_KEY' });
  if (limited(ip)) return res.status(429).json({ error: 'Gọi quá nhanh, hãy thử lại sau ít giây' });

  const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) || {};
  const v = validateInput(body);
  if (!v.ok) return res.status(400).json({ error: 'Dữ liệu không hợp lệ', details: v.errors });

  const hooks = body.action === 'hooks';
  if (hooks && !STRATEGIES[body.strategy]) return res.status(400).json({ error: 'Chiến lược hook không hợp lệ' });
  const variant = Number(body.variant) || 0;
  const { system, user } = hooks ? buildHookPrompt(v.clean, body.strategy, variant) : buildPrompt(v.clean, variant);
  try {
    const parsed = coerce(safeParse((await callModel(c, system, user)).text));
    const out = hooks ? (normalizeHooks(parsed && parsed.hooks) && { hooks: normalizeHooks(parsed.hooks) }) : normalizeOutput(parsed);
    if (!out) return res.status(502).json({ error: 'AI trả kết quả sai định dạng' });
    return res.status(200).json(out);
  } catch (e) {
    console.error('[AI]', c.provider, c.model, e.status || '', e.detail || why(e));
    return res.status(e.status ? 502 : 504).json({ error: e.status ? 'Nhà cung cấp AI trả lỗi ' + e.status : 'Không gọi được AI (quá thời gian hoặc lỗi mạng)', detail: e.detail || (e.status ? undefined : why(e)) });
  }
};

// Một số model trả captions dạng [{text:"..."}], khóa viết hoa, hashtag là 1 chuỗi, hoặc bọc trong mảng: chuẩn hóa về dạng quen thuộc
function coerce(o) {
  if (Array.isArray(o)) o = o[0];
  if (!o || typeof o !== 'object') return o;
  const get = (...ks) => { for (const k of ks) { const kk = Object.keys(o).find((x) => x.toLowerCase() === k); if (kk) return o[kk]; } };
  const txt = (x) => (typeof x === 'string' ? x : x && typeof x === 'object' ? x.text || x.caption || x.content || x.headline || x.title || x.hashtag || x.tag || '' : '');
  const arr = (v) => (Array.isArray(v) ? v.map(txt) : v);
  const tags = get('hashtags', 'tags', 'hashtag');
  return { captions: arr(get('captions', 'caption')), headlines: arr(get('headlines', 'headline', 'titles')), hashtags: typeof tags === 'string' ? tags.split(/[\s,]+/).filter(Boolean) : arr(tags), hooks: arr(get('hooks', 'hook')) };
}

// Gộp lý do gốc của lỗi mạng (ví dụ UND_ERR_CONNECT_TIMEOUT, ENOTFOUND) vào thông báo
function why(e) { return [e.message, e.cause && (e.cause.code || e.cause.message)].filter(Boolean).join(' · '); }

function safeParse(s) { try { return JSON.parse(String(s).replace(/```json|```/g, '').trim()); } catch { return null; } }
