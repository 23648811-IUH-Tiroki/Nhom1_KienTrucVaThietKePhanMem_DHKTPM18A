import express from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

const router = express.Router();

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const tryImport = async (specifier) => {
  try {
    return await import(specifier);
  } catch {
    return null;
  }
};

const isPlaceholderKey = (value) => {
  const v = (value || "").toString().trim();
  if (!v) return true;
  if (v === "YOUR_KEY" || v === "YOUR_API_KEY") return true;
  if (v.toLowerCase() === "changeme") return true;
  return false;
};

const normalize = (value) =>
  (value || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const includesAny = (input, keywords) => keywords.some((k) => input.includes(k));

const buildSystemPrompt = ({ supportContact }) => `
Bạn là chatbot AI cho website pet shop (thức ăn & sản phẩm chó mèo).

QUAN TRỌNG:
- Nhớ ngữ cảnh cuộc trò chuyện trước đó (context sẽ được cung cấp).
- Người dùng có thể trả lời rất ngắn gọn, hãy suy luận từ context + message.
- Không được hỏi lại toàn bộ thông tin nếu đã có dữ liệu.
- Không hỏi lặp đi lặp lại cùng 1 câu.

Vai trò & phong cách:
- Trả lời như nhân viên tư vấn thân thiện, chuyên nghiệp.
- Chào hỏi tự nhiên, ngắn gọn.
- Trả lời ngắn nhưng đủ ý, không lan man. Có thể dùng emoji nhẹ 🐶🐱.

Nguyên tắc:
1) Nếu tư vấn sản phẩm/thức ăn: ưu tiên hỏi đúng phần còn thiếu (chó/mèo, độ tuổi, nhu cầu, ngân sách, tình trạng đặc biệt).
2) Nếu đã đủ thông tin tối thiểu (petType + need + budget) => KHÔNG hỏi lại, bắt đầu gợi ý ngay.
3) Tuyệt đối KHÔNG bịa sản phẩm/giá/khuyến mãi/tồn kho. Chỉ dựa trên danh sách candidates được cung cấp.
4) Nếu không chắc hoặc thiếu dữ liệu: nói "Hiện tại mình chưa có đủ thông tin, bạn có thể cho mình biết thêm..." và hỏi đúng phần còn thiếu.
5) Vận chuyển/thanh toán/đơn hàng: hướng dẫn rõ từng bước; nếu cần mã đơn/SĐT thì yêu cầu cung cấp.
6) Ngoài phạm vi pet shop: từ chối lịch sự và hướng liên hệ hỗ trợ.

Liên hệ hỗ trợ: hotline ${supportContact?.phone || "N/A"}, email ${supportContact?.email || "N/A"}.

Yêu cầu output:
- Nếu gợi ý sản phẩm: đưa 2–3 lựa chọn, mỗi lựa chọn gồm: Tên + Giá (nếu có) + Lý do phù hợp.
- Không nói "dữ liệu mẫu" hay "mock".
`.trim();

const buildUserPrompt = ({ message, context, candidates }) => {
  const safeContext = context || {};
  const safeCandidates = Array.isArray(candidates) ? candidates.slice(0, 10) : [];

  return `
Message của khách: ${message}

Context (đã biết):
${JSON.stringify(safeContext)}

Candidates từ website (chỉ dùng các item này, không bịa thêm):
${JSON.stringify(safeCandidates)}
`.trim();
};

const inferPetType = ({ message, context }) => {
  if (context?.petType === "dog" || context?.petType === "cat") return context.petType;
  const input = normalize(message);
  const dog = includesAny(input, ["cho", "cun", "dog"]);
  const cat = includesAny(input, ["meo", "cat"]);
  if (dog && !cat) return "dog";
  if (cat && !dog) return "cat";
  return null;
};

const inferNeed = ({ message, context }) => {
  if (context?.need) return context.need;
  const input = normalize(message);
  if (includesAny(input, ["hat", "hat kho", "dry"])) return "hat";
  if (includesAny(input, ["pate", "wet"])) return "pate";
  if (includesAny(input, ["snack", "treat", "banh"])) return "snack";
  if (includesAny(input, ["sua", "milk"])) return "sua";
  if (includesAny(input, ["cham soc", "tam", "ve sinh"])) return "cham_soc";
  if (includesAny(input, ["phu kien", "vong", "day", "bat"])) return "phu_kien";
  return null;
};

const parseMoneyToVnd = (raw) => {
  const s = normalize(raw);
  const m = s.match(/(\d+([.,]\d+)?)(\s*)(k|nghin|ngan|tr|trieu)?/);
  if (!m) return null;
  const num = Number(String(m[1]).replace(",", "."));
  if (!Number.isFinite(num)) return null;
  const unit = m[4] || "";
  if (unit === "tr" || unit === "trieu") return Math.round(num * 1_000_000);
  if (unit === "k" || unit === "nghin" || unit === "ngan") return Math.round(num * 1_000);
  if (num <= 9999) return Math.round(num * 1_000);
  return Math.round(num);
};

const parseBudget = (raw) => {
  const s = normalize(raw);
  const range = s.match(
    /(\d+([.,]\d+)?)(\s*)(k|nghin|ngan|tr|trieu)?\s*[-~]\s*(\d+([.,]\d+)?)(\s*)(k|nghin|ngan|tr|trieu)?/
  );
  if (range) {
    const left = parseMoneyToVnd(`${range[1]}${range[4] || ""}`);
    const right = parseMoneyToVnd(`${range[5]}${range[8] || ""}`);
    if (left != null && right != null) return { min: Math.min(left, right), max: Math.max(left, right) };
  }

  if (includesAny(s, ["duoi", "<", "nho hon", "khong qua", "toi da", "max"])) {
    const val = parseMoneyToVnd(s);
    return val == null ? null : { max: val };
  }

  if (includesAny(s, ["tren", ">", "lon hon", "toi thieu", "min"])) {
    const val = parseMoneyToVnd(s);
    return val == null ? null : { min: val };
  }

  const val = parseMoneyToVnd(s);
  return val == null ? null : { max: val };
};

const formatCandidatesFromDb = (products) =>
  (Array.isArray(products) ? products : []).slice(0, 10).map((p) => ({
    id: p?._id?.toString?.() || null,
    name: p?.name,
    price: typeof p?.price === "number" ? p.price : null,
    slug: p?.slug,
    stock: typeof p?.stock === "number" ? p.stock : null,
    description: p?.description,
  }));

async function loadCandidatesFromDb({ message, context }) {
  const petType = inferPetType({ message, context });
  const need = inferNeed({ message, context });
  const budget = context?.budget || parseBudget(message);

  const categoryRegex = petType === "dog" ? /cho/i : petType === "cat" ? /meo/i : null;
  const categories = categoryRegex ? await Category.find({ slug_type: categoryRegex }).select("_id").lean() : [];
  const categoryIds = categories.map((c) => c._id);

  const q = normalize(message);
  const nameRegexes = [];
  if (need === "hat") nameRegexes.push(/h[aạ]t/i, /dry/i);
  if (need === "pate") nameRegexes.push(/pate/i, /wet/i);
  if (need === "snack") nameRegexes.push(/snack/i, /treat/i, /b[aá]nh/i);

  const query = {};
  if (categoryIds.length > 0) query.category_id = { $in: categoryIds };

  // Nếu câu có keyword cụ thể thì dùng regex theo text
  if (q.length >= 2) {
    query.$or = [{ name: { $regex: q, $options: "i" } }, { description: { $regex: q, $options: "i" } }];
  }

  let products = await Product.find(query).limit(20).lean();
  if (nameRegexes.length > 0) {
    products = products.filter((p) => nameRegexes.some((rx) => rx.test(p?.name || "")));
  }

  if (budget && (typeof budget.min === "number" || typeof budget.max === "number")) {
    const min = typeof budget.min === "number" ? budget.min : -Infinity;
    const max = typeof budget.max === "number" ? budget.max : Infinity;
    const inRange = products.filter((p) => typeof p.price === "number" && p.price >= min && p.price <= max);
    products = inRange.length > 0 ? inRange : products;
  }

  return formatCandidatesFromDb(products);
}

async function chatWithOpenAI({ systemPrompt, userPrompt }) {
  if (isPlaceholderKey(process.env.OPENAI_API_KEY)) {
    throw new HttpError(400, "Missing OPENAI_API_KEY");
  }
  const model = process.env.OPENAI_MODEL || "gpt-5.4";

  // Prefer using the OpenAI SDK if available (installed via `openai` npm package).
  const openaiMod = await tryImport("openai");
  const OpenAI = openaiMod?.default;
  if (typeof OpenAI === "function") {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const resp = await client.responses.create({
      model,
      input: [
        { role: "developer", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_output_tokens: 350,
    });

    if (typeof resp?.output_text === "string" && resp.output_text.trim()) {
      return resp.output_text.trim();
    }

    const output = Array.isArray(resp?.output) ? resp.output : [];
    const chunks = [];
    for (const item of output) {
      if (item?.type !== "message") continue;
      const content = Array.isArray(item?.content) ? item.content : [];
      for (const c of content) {
        if (c?.type === "output_text" && typeof c?.text === "string") chunks.push(c.text);
      }
    }
    return chunks.join("\n").trim();
  }

  // Fallback (no SDK): call OpenAI REST API directly.
  const resp = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "developer", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_output_tokens: 350,
    }),
  });

  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new HttpError(resp.status, "OpenAI unauthorized (check OPENAI_API_KEY).");
    }
    const errorText = await resp.text().catch(() => "");
    throw new HttpError(resp.status, `OpenAI error: ${errorText || resp.statusText}`);
  }

  const data = await resp.json();
  const output = Array.isArray(data?.output) ? data.output : [];
  const chunks = [];
  for (const item of output) {
    if (item?.type !== "message") continue;
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const c of content) {
      if (c?.type === "output_text" && typeof c?.text === "string") chunks.push(c.text);
    }
  }
  return chunks.join("\n").trim();
}

async function chatWithGemini({ systemPrompt, userPrompt }) {
  if (isPlaceholderKey(process.env.GEMINI_API_KEY)) {
    throw new HttpError(400, "Missing GEMINI_API_KEY");
  }
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  // Prefer using Gemini SDK if available (installed via `@google/generative-ai`).
  const geminiMod = await tryImport("@google/generative-ai");
  const GoogleGenerativeAI = geminiMod?.GoogleGenerativeAI;
  if (typeof GoogleGenerativeAI === "function") {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const gemini = genAI.getGenerativeModel({ model });
    const result = await gemini.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    const text = typeof result?.response?.text === "function" ? result.response.text() : "";
    return (text || "").trim();
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
    }),
  });

  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new HttpError(resp.status, "Gemini unauthorized (check GEMINI_API_KEY).");
    }
    const errorText = await resp.text().catch(() => "");
    throw new HttpError(resp.status, `Gemini error: ${errorText || resp.statusText}`);
  }

  const data = await resp.json();
  const candidate = Array.isArray(data?.candidates) ? data.candidates[0] : null;
  const parts = candidate?.content?.parts;
  if (Array.isArray(parts)) {
    const text = parts.map((p) => (typeof p?.text === "string" ? p.text : "")).join("");
    return text.trim();
  }
  return "";
}

router.get("/health", (req, res) => {
  const provider = (process.env.AI_PROVIDER || "").toLowerCase();
  const openaiConfigured = !isPlaceholderKey(process.env.OPENAI_API_KEY);
  const geminiConfigured = !isPlaceholderKey(process.env.GEMINI_API_KEY);
  const configured =
    provider === "openai" ? openaiConfigured : provider === "gemini" ? geminiConfigured : false;

  res.json({
    ok: true,
    provider,
    configured,
  });
});

router.post("/chat", async (req, res) => {
  const provider = (req.body?.provider || process.env.AI_PROVIDER || "").toLowerCase();
  const message = (req.body?.message || "").toString();
  const context = req.body?.context || {};
  const supportContact = req.body?.supportContact || {};
  const clientCandidates = Array.isArray(req.body?.candidates) ? req.body.candidates : null;

  if (!message.trim()) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  if (provider !== "openai" && provider !== "gemini") {
    res.status(400).json({ error: "provider must be 'openai' or 'gemini'" });
    return;
  }

  if (provider === "openai" && isPlaceholderKey(process.env.OPENAI_API_KEY)) {
    res.status(400).json({ error: "missing_api_key", message: "Missing OPENAI_API_KEY" });
    return;
  }

  if (provider === "gemini" && isPlaceholderKey(process.env.GEMINI_API_KEY)) {
    res.status(400).json({ error: "missing_api_key", message: "Missing GEMINI_API_KEY" });
    return;
  }

  // Ưu tiên candidates từ server (DB) để tránh client giả mạo; nếu DB lỗi thì fallback candidates từ client.
  let candidates = [];
  try {
    candidates = await loadCandidatesFromDb({ message, context });
  } catch {
    candidates = Array.isArray(clientCandidates) ? clientCandidates.slice(0, 10) : [];
  }

  const systemPrompt = buildSystemPrompt({ supportContact });
  const userPrompt = buildUserPrompt({ message, context, candidates });

  try {
    const text =
      provider === "openai"
        ? await chatWithOpenAI({ systemPrompt, userPrompt })
        : await chatWithGemini({ systemPrompt, userPrompt });
    res.json({ text: (text || "").trim() });
  } catch (err) {
    const status = err?.status;
    const httpStatus = Number.isFinite(status) && status >= 400 && status <= 599 ? status : 500;
    if (httpStatus === 429) {
      res.json({
        text: "He thong dang ban. Ban vui long cho vai giay roi thu lai nhe.",
      });
      return;
    }
    res.status(httpStatus).json({ error: "ai_error", message: err?.message || "AI provider error" });
  }
});

export default router;
