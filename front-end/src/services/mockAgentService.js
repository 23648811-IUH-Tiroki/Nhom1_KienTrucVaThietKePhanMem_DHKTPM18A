import axios from "axios";
import axiosInstance from "../utils/axiosInstance";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const aiHttp = axios.create({
    baseURL: API_BASE_URL,
    timeout: 20000,
    withCredentials: true,
});

const supportContact = {
    phone: "0915 020 903",
    email: "info@petstationshop.com",
};

const getNow = () => new Date().toISOString();

const makeBotMessage = (text) => ({
    id: `bot-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sender: "bot",
    text,
    timestamp: getNow(),
});

const normalizeText = (value) =>
    (value || "")
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

const includesAny = (input, keywords) => keywords.some((key) => input.includes(key));

let cachedProducts = null;
let cachedAt = 0;
const CACHE_TTL_MS = 2 * 60 * 1000;

export const createEmptyAgentContext = () => ({
    petType: null, // "dog" | "cat"
    budget: null, // { min?: number, max?: number }
    ageMonths: null,
    need: null, // "hat" | "pate" | "snack" | "sua" | "cham_soc" | "phu_kien"
    healthNotes: {
        sensitiveStomach: false,
        picky: false,
        overweight: false,
        allergy: false,
    },
    askedCounts: {
        petType: 0,
        budget: 0,
        ageMonths: 0,
        need: 0,
    },
});

const pickText = (product) => {
    const name = product?.name || product?.title || product?.product_name || "";
    const slug = product?.slug || "";
    return `${name} ${slug}`.trim();
};

const getProductPrice = (product) => {
    const candidates = [product?.price, product?.salePrice, product?.sale_price, product?.finalPrice, product?.final_price];
    const price = candidates.find((v) => typeof v === "number" && Number.isFinite(v));
    return typeof price === "number" ? price : null;
};

const formatVnd = (amount) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const loadProducts = async () => {
    const now = Date.now();
    if (cachedProducts && now - cachedAt < CACHE_TTL_MS) return cachedProducts;
    const response = await axiosInstance.get("/api/products");
    cachedProducts = Array.isArray(response.data) ? response.data : [];
    cachedAt = now;
    return cachedProducts;
};

const AI_PROVIDER = (import.meta.env.VITE_AI_PROVIDER || "").toLowerCase(); // "openai" | "gemini"
const AI_ENABLED = AI_PROVIDER === "openai" || AI_PROVIDER === "gemini";
let aiRuntimeDisabled = false;
let aiDisableNoticeShown = false;
let aiHealthChecked = false;
let aiHealthOk = false;

const ensureAiHealthy = async () => {
    if (aiHealthChecked) return aiHealthOk;
    aiHealthChecked = true;
    try {
        const res = await aiHttp.get("/api/ai/health");
        aiHealthOk = Boolean(res?.data?.configured);
        return aiHealthOk;
    } catch {
        aiHealthOk = false;
        return false;
    }
};

const fallbackMessage = `Mình chưa đủ thông tin để tư vấn chính xác. Bạn cho mình biết giúp:
1) Chó hay mèo
2) Độ tuổi
3) Ngân sách
4) Nhu cầu đặc biệt (nhạy tiêu hóa / lông da / kiểm soát cân nặng)

Hoặc bạn liên hệ ${supportContact.phone} / ${supportContact.email} để được hỗ trợ nhanh.`;

export const getWelcomeMessage = () =>
    makeBotMessage(
        "Chào bạn 🐶🐱 Mình là trợ lý tư vấn của shop.\nMình có thể hỗ trợ chọn thức ăn/sản phẩm cho chó mèo, kiểm tra sản phẩm trên website, vận chuyển & thanh toán.\nBạn đang cần cho chó hay mèo ạ?"
    );

const replyOutsideScope = () =>
    makeBotMessage(
        `Mình xin phép chưa hỗ trợ tốt chủ đề này. Bạn có thể mô tả nhu cầu về thức ăn chó/mèo hoặc liên hệ CSKH qua ${supportContact.phone} / ${supportContact.email} để được hỗ trợ nhanh nhé.`
    );

const parseMoneyToVnd = (raw) => {
    const s = normalizeText(raw);
    const m = s.match(/(\d+([.,]\d+)?)(\s*)(k|nghin|ngan|tr|trieu)?/);
    if (!m) return null;
    const num = Number(String(m[1]).replace(",", "."));
    if (!Number.isFinite(num)) return null;
    const unit = m[4] || "";
    if (unit === "tr" || unit === "trieu") return Math.round(num * 1_000_000);
    if (unit === "k" || unit === "nghin" || unit === "ngan") return Math.round(num * 1_000);
    // Mặc định: nếu nhỏ (<= 9999) thì hiểu là nghìn (ví dụ "200" => 200k)
    if (num <= 9999) return Math.round(num * 1_000);
    return Math.round(num);
};

const parseBudget = (raw) => {
    const s = normalizeText(raw);
    // "200-300k"
    const range = s.match(/(\d+([.,]\d+)?)(\s*)(k|nghin|ngan|tr|trieu)?\s*[-~]\s*(\d+([.,]\d+)?)(\s*)(k|nghin|ngan|tr|trieu)?/);
    if (range) {
        const left = parseMoneyToVnd(`${range[1]}${range[4] || ""}`);
        const right = parseMoneyToVnd(`${range[5]}${range[8] || ""}`);
        if (left != null && right != null) return { min: Math.min(left, right), max: Math.max(left, right) };
    }

    // "duoi 200k"
    if (includesAny(s, ["duoi", "<", "nho hon", "khong qua", "toi da", "max"])) {
        const val = parseMoneyToVnd(s);
        return val == null ? null : { max: val };
    }

    // "tren 200k"
    if (includesAny(s, ["tren", ">", "lon hon", "toi thieu", "min"])) {
        const val = parseMoneyToVnd(s);
        return val == null ? null : { min: val };
    }

    // Chỉ đưa 1 số: hiểu là max
    const val = parseMoneyToVnd(s);
    return val == null ? null : { max: val };
};

const parseAgeMonths = (raw) => {
    const s = normalizeText(raw);
    // "6 thang" | "6t"
    const m = s.match(/(\d{1,2})(\s*)(thang|t)\b/);
    if (m) return Number(m[1]);
    // "1 tuoi" => 12
    const y = s.match(/(\d{1,2})(\s*)(tuoi|y)\b/);
    if (y) return Number(y[1]) * 12;
    return null;
};

const inferNeed = (input) => {
    if (includesAny(input, ["hat", "hat kho", "dry"])) return "hat";
    if (includesAny(input, ["pate", "wet", "sup"])) return "pate";
    if (includesAny(input, ["snack", "banh", "treat"])) return "snack";
    if (includesAny(input, ["sua", "milk"])) return "sua";
    if (includesAny(input, ["tam", "cham soc", "ve sinh", "cat mong", "luoc"])) return "cham_soc";
    if (includesAny(input, ["phu kien", "vong", "day dat", "bat an", "cat", "nha"])) return "phu_kien";
    return null;
};

const inferPetType = (input) => {
    const dog = includesAny(input, ["cho", "cun", "dog"]);
    const cat = includesAny(input, ["meo", "cat"]);
    if (dog && !cat) return "dog";
    if (cat && !dog) return "cat";
    return null;
};

const updateContextFromUser = (prevCtx, rawInput) => {
    const ctx = prevCtx ? structuredClone(prevCtx) : createEmptyAgentContext();
    const input = normalizeText(rawInput);

    const petType = inferPetType(input);
    if (petType) ctx.petType = petType;

    const budget = parseBudget(input);
    // chỉ set budget khi user nói rõ giá/chi phí
    if (budget && includesAny(input, ["k", "nghin", "ngan", "tr", "trieu", "duoi", "tren", "-", "~", "gia", "ngan sach", "bao nhieu"])) {
        ctx.budget = budget;
    }

    const age = parseAgeMonths(input);
    if (age != null && Number.isFinite(age) && age > 0) ctx.ageMonths = age;

    const need = inferNeed(input);
    if (need) ctx.need = need;

    if (includesAny(input, ["ken an", "kho an"])) ctx.healthNotes.picky = true;
    if (includesAny(input, ["nhay tieu hoa", "tieu chay", "non", "day bung"])) ctx.healthNotes.sensitiveStomach = true;
    if (includesAny(input, ["beo phi", "thua can", "giam can"])) ctx.healthNotes.overweight = true;
    if (includesAny(input, ["di ung", "ngua", "noi man"])) ctx.healthNotes.allergy = true;

    return ctx;
};

const buildRealProductSuggestion = async ({ petType, need, queryText }) => {
    const label = petType === "dog" ? "chó" : "mèo";

    let products = [];
    try {
        products = await loadProducts();
    } catch {
        return makeBotMessage(
            `Dạ mình chưa truy cập được danh sách sản phẩm trên website lúc này. Bạn cho mình biết thêm nhu cầu của bé, hoặc liên hệ CSKH ${supportContact.phone} / ${supportContact.email} để được hỗ trợ nhanh nhé.`
        );
    }

    const petKeywords = petType === "dog" ? ["cho", "dog", "puppy"] : ["meo", "cat", "kitten"];

    const q = normalizeText(queryText);
    const terms = q.split(/\s+/).filter(Boolean).slice(0, 6);
    const filtered = products
        .filter((p) => {
            const text = normalizeText(pickText(p));
            const matchPet = petKeywords.some((k) => text.includes(k));
            const matchTerms = terms.length === 0 ? true : terms.every((t) => text.includes(t));
            // ưu tiên đúng petType, nhưng nếu không match được thì vẫn cho lọc theo terms
            return (matchPet && matchTerms) || (!matchPet && matchTerms);
        })
        .slice(0, 3);

    if (filtered.length === 0) {
        return makeBotMessage(
            `Dạ mình chưa tìm thấy sản phẩm khớp yêu cầu ngay. Bạn cho mình biết rõ hơn: ${label} bao nhiêu tháng tuổi, nhu cầu (${need || "hạt/pate/snack"}), và ngân sách dự kiến nhé.`
        );
    }

    const lines = filtered.map((p) => {
        const name = p?.name || p?.title || "Sản phẩm";
        const price = getProductPrice(p);
        const priceText = price == null ? "" : ` — ${formatVnd(price)}`;
        return `- ${name}${priceText}`;
    });

    return makeBotMessage(
        `Dạ mình gợi ý nhanh ${filtered.length} sản phẩm đang có trên website cho ${label}:\n` +
            lines.join("\n") +
            "\n\nBạn muốn mình lọc kỹ hơn theo độ tuổi/nhạy tiêu hóa/ngân sách không ạ?"
    );
};

const filterByBudget = (products, budget) => {
    if (!budget) return products;
    const min = typeof budget.min === "number" ? budget.min : -Infinity;
    const max = typeof budget.max === "number" ? budget.max : Infinity;

    const withPrice = products
        .map((p) => ({ p, price: getProductPrice(p) }))
        .filter((x) => x.price != null)
        .sort((a, b) => a.price - b.price);

    const inRange = withPrice.filter((x) => x.price >= min && x.price <= max).map((x) => x.p);
    if (inRange.length > 0) return inRange;

    // Nếu không có sản phẩm trong ngân sách: chọn gần đúng nhất (gần max hoặc min)
    const target = Number.isFinite(max) ? max : Number.isFinite(min) ? min : null;
    if (target == null || withPrice.length === 0) return products;

    let best = withPrice[0];
    let bestDiff = Math.abs(withPrice[0].price - target);
    for (const x of withPrice) {
        const diff = Math.abs(x.price - target);
        if (diff < bestDiff) {
            best = x;
            bestDiff = diff;
        }
    }
    return [best.p];
};

const buildSuggestionsFromWebsite = async ({ ctx, rawInput }) => {
    const label = ctx.petType === "dog" ? "chó" : "mèo";

    let products = [];
    try {
        products = await loadProducts();
    } catch {
        return makeBotMessage(
            `Dạ mình chưa truy cập được dữ liệu sản phẩm lúc này. Bạn liên hệ CSKH ${supportContact.phone} / ${supportContact.email} giúp mình nhé.`
        );
    }

    const petKeywords = ctx.petType === "dog" ? ["cho", "dog", "puppy"] : ["meo", "cat", "kitten"];
    const needKeywordsMap = {
        hat: ["hat", "dry"],
        pate: ["pate", "wet"],
        snack: ["snack", "treat", "banh"],
        sua: ["sua", "milk"],
        cham_soc: ["tam", "cham soc", "ve sinh", "luoc"],
        phu_kien: ["phu kien", "vong", "day", "bat"],
    };

    const input = normalizeText(rawInput);
    const baseTerms = input.split(/\s+/).filter(Boolean).slice(0, 8);
    const needTerms = ctx.need ? needKeywordsMap[ctx.need] || [] : [];

    let filtered = products.filter((p) => {
        const text = normalizeText(pickText(p));
        const matchPet = petKeywords.some((k) => text.includes(k));
        if (!matchPet) return false;
        if (needTerms.length > 0) return needTerms.some((k) => text.includes(k));
        // nếu user gõ keyword cụ thể thì match thêm, còn không thì pass
        if (baseTerms.length >= 2) return baseTerms.some((t) => text.includes(t));
        return true;
    });

    filtered = filterByBudget(filtered, ctx.budget);
    const top = filtered.slice(0, 3);
    const candidates = filtered.slice(0, 10).map((p) => ({
        id: p?._id || p?.id,
        name: p?.name,
        price: getProductPrice(p),
        slug: p?.slug,
        stock: typeof p?.stock === "number" ? p.stock : null,
        description: p?.description,
    }));

    if (top.length === 0) {
        return makeBotMessage(
            `Dạ mình chưa tìm thấy sản phẩm phù hợp ngay. Bạn cho mình xin thêm nhu cầu (hạt/pate/snack) và ngân sách để mình lọc chính xác hơn cho bé ${label} nhé.`
        );
    }

    // Nếu đã cấu hình AI thật, ưu tiên để model viết câu trả lời tự nhiên + đúng guideline.
    if (AI_ENABLED && !aiRuntimeDisabled) {
        try {
            const healthy = await ensureAiHealthy();
            if (!healthy) {
                aiRuntimeDisabled = true;
                if (!aiDisableNoticeShown) {
                    aiDisableNoticeShown = true;
                    return makeBotMessage(
                        "Dạ hiện tại hệ thống tư vấn AI đang chưa được cấu hình (API key). Mình sẽ hỗ trợ bạn theo dữ liệu sản phẩm của shop nhé."
                    );
                }
            }

            const res = await aiHttp.post("/api/ai/chat", {
                provider: AI_PROVIDER,
                message: rawInput,
                context: ctx,
                candidates,
                supportContact,
            });
            const text = res?.data?.text;
            if (typeof text === "string" && text.trim()) {
                return makeBotMessage(text.trim());
            }
        } catch (err) {
            const status = err?.response?.status;
            const msg = err?.response?.data?.message || err?.message || "";
            const isConfigError =
                (typeof msg === "string" && msg.includes("Missing ") && msg.includes("API_KEY")) ||
                (typeof msg === "string" && (msg.includes("invalid_api_key") || msg.includes("Incorrect API key"))) ||
                status === 401 ||
                status === 403;

            if (isConfigError) {
                aiRuntimeDisabled = true;
                if (!aiDisableNoticeShown) {
                    aiDisableNoticeShown = true;
                    return makeBotMessage(
                        "Dạ hiện tại hệ thống tư vấn AI đang tạm thời chưa sẵn sàng. Mình sẽ hỗ trợ bạn theo dữ liệu sản phẩm của shop nhé."
                    );
                }
            }
            // fallback xuống rule-based bên dưới
        }
    }

    const lines = top.map((p) => {
        const name = p?.name || p?.title || "Sản phẩm";
        const price = getProductPrice(p);
        const priceText = price == null ? "" : ` — ${formatVnd(price)}`;

        const reasons = [];
        if (ctx.budget) reasons.push("ưu tiên trong ngân sách");
        if (ctx.need) reasons.push(`đúng nhu cầu (${ctx.need})`);
        if (ctx.healthNotes.sensitiveStomach) reasons.push("ưu tiên dễ tiêu hóa");
        if (ctx.healthNotes.picky) reasons.push("ưu tiên dễ ăn");
        if (ctx.healthNotes.overweight) reasons.push("ưu tiên kiểm soát cân nặng");
        if (ctx.healthNotes.allergy) reasons.push("lưu ý dị ứng (cần kiểm tra thành phần)");

        return `- ${name}${priceText}\n  Lý do: ${reasons.length ? reasons.join(", ") : "phù hợp cho bé"}。`.replace("。", ".");
    });

    return makeBotMessage(
        `Dạ mình gợi ý ${top.length} lựa chọn cho bé ${label}:\n` +
            lines.join("\n") +
            "\n\nBạn muốn mình gửi link sản phẩm hoặc lọc theo độ tuổi/khẩu vị cụ thể hơn không ạ?"
    );
};

const getNextMissingField = (ctx) => {
    if (!ctx.petType) return "petType";
    if (!ctx.need) return "need";
    if (!ctx.budget) return "budget";
    return null;
};

const askForMissing = (ctx, field) => {
    const next = structuredClone(ctx);
    next.askedCounts[field] = (next.askedCounts[field] || 0) + 1;

    if (field === "petType") {
        return { ctx: next, message: makeBotMessage("Dạ bạn cần cho chó hay mèo ạ? 🐶🐱") };
    }
    if (field === "need") {
        return { ctx: next, message: makeBotMessage("Dạ bạn muốn mua loại nào ạ: hạt, pate, snack, sữa, đồ chăm sóc hay phụ kiện?") };
    }
    if (field === "budget") {
        return { ctx: next, message: makeBotMessage("Dạ ngân sách của bạn khoảng bao nhiêu ạ? (ví dụ: dưới 200k / 200–300k)") };
    }
    return { ctx: next, message: makeBotMessage("Dạ bạn cho mình xin thêm thông tin để tư vấn chính xác hơn nhé.") };
};

export const generateAgentReply = async (rawInput, prevContext) => {
    const input = normalizeText(rawInput);
    const ctx = updateContextFromUser(prevContext, rawInput);

    if (!input) {
        const missing = getNextMissingField(ctx) || "petType";
        const asked = ctx.askedCounts?.[missing] || 0;
        // tránh loop: nếu hỏi quá 2 lần mà vẫn thiếu thì fallback
        if (asked >= 2) return { reply: makeBotMessage(fallbackMessage), context: ctx };
        const askedMsg = askForMissing(ctx, missing);
        return { reply: askedMsg.message, context: askedMsg.ctx };
    }

    if (includesAny(input, ["xin chao", "hello", "hi", "chao"])) {
        const missing = getNextMissingField(ctx) || "petType";
        const askedMsg = askForMissing(ctx, missing);
        return { reply: askedMsg.message, context: askedMsg.ctx };
    }

    // Tình huống phàn nàn / bức xúc
    if (includesAny(input, ["giao sai", "sai hang", "kem", "toi te", "phan nan", "buc minh", "tuc", "khong hai long"])) {
        return {
            reply: makeBotMessage(
            "Dạ mình xin lỗi bạn vì trải nghiệm chưa tốt này. Bạn gửi giúp mình mã đơn hàng (nếu có) và mô tả ngắn vấn đề / ảnh sản phẩm đã nhận được nhé, mình sẽ kiểm tra và hướng xử lý đổi/trả cho bạn."
            ),
            context: ctx,
        };
    }

    if (includesAny(input, ["van chuyen", "ship", "giao hang", "phi ship", "phi giao"])) {
        return {
            reply: makeBotMessage(
            "Dạ shop có giao hàng toàn quốc. Bạn cho mình xin khu vực (tỉnh/thành) và giá trị đơn hàng dự kiến để mình kiểm tra phí ship/điều kiện freeship cho bạn nhé."
            ),
            context: ctx,
        };
    }

    if (includesAny(input, ["thanh toan", "cod", "chuyen khoan", "the", "vi dien tu"])) {
        return {
            reply: makeBotMessage(
            "Dạ shop hỗ trợ COD và chuyển khoản. Bạn muốn thanh toán theo cách nào ạ? Nếu bạn cần, mình hướng dẫn đặt hàng từng bước ngay."
            ),
            context: ctx,
        };
    }

    if (includesAny(input, ["lien he", "hotline", "ho tro", "email"])) {
        return {
            reply: makeBotMessage(
            `Bạn liên hệ CSKH qua hotline ${supportContact.phone} hoặc email ${supportContact.email}.\nNếu bạn gửi giúp mình tên + SĐT + nhu cầu, mình ghi nhận để CSKH gọi lại.`
            ),
            context: ctx,
        };
    }

    if (includesAny(input, ["don hang", "ma don", "order", "kiem tra don", "tinh trang don", "tracking"])) {
        return {
            reply: makeBotMessage("Dạ bạn cho mình xin mã đơn hàng (hoặc SĐT đặt hàng) để mình hỗ trợ kiểm tra tình trạng đơn nhé."),
            context: ctx,
        };
    }

    if (includesAny(input, ["gia", "bao nhieu", "ngan sach", "duoi", "tren", "re", "tiet kiem"])) {
        const missing = getNextMissingField(ctx);
        if (missing) {
            const asked = ctx.askedCounts?.[missing] || 0;
            if (asked >= 2) return { reply: makeBotMessage(fallbackMessage), context: ctx };
            const askedMsg = askForMissing(ctx, missing);
            return { reply: askedMsg.message, context: askedMsg.ctx };
        }
        const suggestion = await buildSuggestionsFromWebsite({ ctx, rawInput });
        return { reply: suggestion, context: ctx };
    }

    const wantsProduct = includesAny(input, ["tim", "search", "goi y", "san pham", "tu van", "thuc an", "hat", "pate", "snack", "sua", "do cham soc", "phu kien"]);
    const mentionsDog = includesAny(input, ["cho", "cun", "dog"]);
    const mentionsCat = includesAny(input, ["meo", "cat"]);

    if (wantsProduct && mentionsDog && mentionsCat) {
        return { reply: makeBotMessage("Dạ bạn muốn tư vấn cho chó hay mèo trước ạ?"), context: ctx };
    }

    // Nếu user trả lời ngắn gọn theo kiểu "chó dưới 200" => ctx đã có đủ
    if (wantsProduct || ctx.petType || ctx.budget || ctx.need) {
        const missing = getNextMissingField(ctx);
        if (missing) {
            const asked = ctx.askedCounts?.[missing] || 0;
            // Tránh hỏi vòng lặp: hỏi tối đa 2 lần/field, sau đó gợi ý gần đúng nếu có thể
            if (asked >= 2) {
                if (ctx.petType) {
                    const suggestion = await buildSuggestionsFromWebsite({ ctx, rawInput });
                    return { reply: suggestion, context: ctx };
                }
                return { reply: makeBotMessage(fallbackMessage), context: ctx };
            }
            const askedMsg = askForMissing(ctx, missing);
            return { reply: askedMsg.message, context: askedMsg.ctx };
        }

        // Đã đủ thông tin tối thiểu => gợi ý ngay, không hỏi lại
        const suggestion = await buildSuggestionsFromWebsite({ ctx, rawInput });
        return { reply: suggestion, context: ctx };
    }

    if (wantsProduct && (mentionsDog || mentionsCat)) {
        const suggestion = await buildSuggestionsFromWebsite({ ctx, rawInput });
        return { reply: suggestion, context: ctx };
    }

    if (includesAny(input, ["khuyen mai", "voucher", "giam gia"])) {
        return {
            reply: makeBotMessage("Dạ bạn muốn xem khuyến mãi cho chó hay mèo và tầm giá bao nhiêu ạ?"),
            context: ctx,
        };
    }

    if (includesAny(input, ["doi tra", "bao hanh", "refund"])) {
        return {
            reply: makeBotMessage(
                "Dạ bạn cho mình biết đơn hàng thuộc trường hợp nào (sai sản phẩm / sản phẩm lỗi / đổi khẩu vị) để mình hướng dẫn đúng bước tiếp theo nhé."
            ),
            context: ctx,
        };
    }

    if (includesAny(input, ["code", "lap trinh", "chinh tri", "y te", "thuat toan"])) {
        return { reply: replyOutsideScope(), context: ctx };
    }

    return { reply: makeBotMessage(fallbackMessage), context: ctx };
};

// Cấu trúc dễ nâng cấp sang AI thật:
// - Thay `generateAgentReply` bằng hàm gọi API (OpenAI/Gemini) và giữ nguyên shape message output.
export const agentService = {
    getWelcomeMessage,
    sendMessage: generateAgentReply,
};
