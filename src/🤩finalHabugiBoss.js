const INGREDIENTS = [
    { id: "bunTop", name: "윗번", emoji: "🫓", type: "bun" },
    { id: "bunBot", name: "아랫번", emoji: "🍞", type: "bun" },
    { id: "patty", name: "패티", emoji: "🥩", type: "main" },
    { id: "cheese", name: "치즈", emoji: "🧀", type: "addon" },
    { id: "lettuce", name: "양상추", emoji: "🥬", type: "veg" },
    { id: "tomato", name: "토마토", emoji: "🍅", type: "veg" },
    { id: "onion", name: "양파", emoji: "🧅", type: "veg" },
    { id: "bacon", name: "베이컨", emoji: "🥓", type: "addon" },
    { id: "pickle", name: "피클", emoji: "🥒", type: "addon" },
    { id: "sauce", name: "소스", emoji: "🧂", type: "sauce" },
];

const RECIPES = [
    // 간단 → 복잡
    { name: "클래식", seq: ["bunBot", "patty", "bunTop"] },
    { name: "치즈버거", seq: ["bunBot", "patty", "cheese", "bunTop"] },
    { name: "베이컨치즈", seq: ["bunBot", "patty", "cheese", "bacon", "bunTop"] },
    { name: "야채듬뿍", seq: ["bunBot", "patty", "lettuce", "tomato", "onion", "bunTop"] },
    { name: "피클러버", seq: ["bunBot", "patty", "cheese", "pickle", "sauce", "bunTop"] },
];

// ====== 유틸 ======
const $ = (sel) => document.querySelector(sel);
const el = (tag, attrs = {}, ...children) => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
        if (k === "class") node.className = v;
        else if (k === "dataset") Object.entries(v).forEach(([dk, dv]) => node.dataset[dk] = dv);
        else node.setAttribute(k, v);
    });
    children.forEach(c => node.append(c));
    return node;
};
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ====== 상태 ======
const state = {
    round: 1,
    score: 0,
    combo: 0,
    timeMax: 60,
    timeLeft: 60,
    ordersQueue: [],
    buildStack: [], // 위가 마지막 push, 화면엔 역순 표시
    ticking: null,
};

// ====== DOM 참조 ======
const roundEl = $("#round");
const scoreEl = $("#score");
const comboEl = $("#combo");
const timeLeftEl = $("#timeLeft");
const timeFillEl = $("#timeFill");
const orderListEl = $("#orderList");
const buildStackEl = $("#buildStack");
const judgeMsgEl = $("#judgeMsg");

const startBtn = $("#startBtn");
const undoBtn = $("#undoBtn");
const clearBtn = $("#clearBtn");
const submitBtn = $("#submitBtn");
const ingredientGrid = $("#ingredientGrid");

// ====== 초기화 UI ======
function renderPantry() {
    ingredientGrid.innerHTML = "";
    INGREDIENTS.forEach(ing => {
        const btn = el("button", { class: "ig", "data-id": ing.id });
        btn.innerHTML = `<span class="em">${ing.emoji}</span> <span class="nm">${ing.name}</span><span class="tag">${ing.id}</span>`;
        btn.addEventListener("click", () => addToStack(ing.id));
        ingredientGrid.append(btn);
    });
}

function renderOrders() {
    orderListEl.innerHTML = "";
    state.ordersQueue.forEach((o, idx) => {
        const li = el("li", { class: "order" });
        const isActive = idx === 0;
        li.innerHTML = `
      <div class="title">
        <span class="badge">${isActive ? "▶ 현재 주문" : "대기"}</span>
        <b>${o.name}</b>
        <span class="mono">${o.seq.length}층</span>
      </div>
    `;
        const row = el("div", { class: "recipe" });
        o.seq.forEach(id => {
            const ing = INGREDIENTS.find(x => x.id === id);
            row.append(el("span", { class: "badge" }, `${ing.emoji} ${ing.name}`));
        });
        li.append(row);
        orderListEl.append(li);
    });
}

function renderStack() {
    buildStackEl.innerHTML = "";
    // 시각적으로 위에서부터 아래로: 배열 마지막이 최상단 칩 → column-reverse를 쓰므로 그대로 append
    state.buildStack.forEach(id => {
        const ing = INGREDIENTS.find(x => x.id === id);
        buildStackEl.append(el("div", { class: "chip" }, el("span", { class: "em" }, ing.emoji), el("span", {}, ing.name), el("span", { class: "mono" }, `#${id}`)));
    });
}

function renderHUD() {
    roundEl.textContent = state.round;
    scoreEl.textContent = state.score;
    comboEl.textContent = `${state.combo}x`;
    timeLeftEl.textContent = `${state.timeLeft.toFixed(1)}s`;
    const pct = (state.timeLeft / state.timeMax) * 100;
    timeFillEl.style.width = `${clamp(pct, 0, 100)}%`;
}

// ====== 게임 루프 ======
function startRound() {
    // 난이도 스케일링(간단): 라운드가 오를수록 시간↓, 주문 수↑, 레시피 길이↑ 경향
    const ordersCount = clamp(2 + Math.floor((state.round - 1) / 1), 2, 6);
    const pool = RECIPES.filter(r => r.seq.length <= 3 + Math.floor(state.round / 2) || state.round > 3);
    state.ordersQueue = Array.from({ length: ordersCount }, () => choice(pool));
    state.buildStack = [];
    state.timeMax = clamp(60 - (state.round - 1) * 5, 35, 60);
    state.timeLeft = state.timeMax;
    state.combo = 0;
    judgeMsgEl.textContent = "";

    renderOrders();
    renderStack();
    renderHUD();

    if (state.ticking) clearInterval(state.ticking);
    state.ticking = setInterval(() => {
        state.timeLeft = Math.max(0, state.timeLeft - 0.1);
        renderHUD();
        if (state.timeLeft <= 0) endRound(false);
    }, 100);
}

function endRound(cleared) {
    clearInterval(state.ticking); state.ticking = null;
    if (cleared) {
        judgeMsgEl.textContent = `✅ 라운드 클리어! 다음 라운드로 진행됩니다.`;
        state.round++;
    } else {
        judgeMsgEl.textContent = `⏰ 시간 종료! 라운드 실패`;
        // 실패해도 라운드 유지, 재시작 유도
    }
}

// ====== 입력 / 조립 ======
function addToStack(id) {
    state.buildStack.push(id);
    renderStack();
}

function undo() {
    state.buildStack.pop();
    renderStack();
}

function clearStack() {
    state.buildStack = [];
    renderStack();
}

// ====== 판정 ======
function judgeSubmit() {
    if (state.ordersQueue.length === 0) {
        judgeMsgEl.textContent = "🎉 모든 주문 완료!";
        return;
    }
    const current = state.ordersQueue[0];
    const target = current.seq;
    const built = [...state.buildStack];

    const result = scoreRecipe(built, target);
    applyResult(result);

    // 주문 처리
    if (result.rank !== "Miss") {
        state.ordersQueue.shift();
        renderOrders();
        clearStack();
        if (state.ordersQueue.length === 0) {
            endRound(true);
        }
    }
    renderHUD();
}

// 순서/구성 판정: Perfect(순서+구성 일치) / Good(구성 같고 순서 다름) / Miss(누락/과다)
function scoreRecipe(built, target) {
    const sameLength = built.length === target.length;
    const exact = sameLength && built.every((v, i) => v === target[i]);

    // 구성 비교(순서 무시)
    const count = (arr) => arr.reduce((m, id) => (m[id] = (m[id] || 0) + 1, m), {});
    const bCount = count(built);
    const tCount = count(target);
    let compositionEqual = true;
    for (const k of new Set([...Object.keys(bCount), ...Object.keys(tCount)])) {
        if ((bCount[k] || 0) !== (tCount[k] || 0)) { compositionEqual = false; break; }
    }

    if (exact) {
        return { rank: "Perfect", score: 100 + 10 * target.length, time: +5 };
    }
    if (compositionEqual) {
        return { rank: "Good", score: 50 + 6 * target.length, time: +2 };
    }
    // 과다/누락 패널티: 길이 차 + 구성 차 가중
    const penalty = Math.abs(built.length - target.length) * 5;
    return { rank: "Miss", score: -penalty, time: -3 };
}

function applyResult(res) {
    if (res.rank === "Perfect") {
        state.combo += 1;
        state.score += Math.max(0, res.score) * Math.max(1, 1 + (state.combo - 1) * 0.2);
        state.timeLeft = clamp(state.timeLeft + res.time, 0, state.timeMax);
        judgeMsgEl.textContent = `💯 Perfect! 콤보 ${state.combo}x, 시간 +${res.time}s`;
    } else if (res.rank === "Good") {
        // 콤보 유지(증가 없음)
        state.score += res.score;
        state.timeLeft = clamp(state.timeLeft + res.time, 0, state.timeMax);
        judgeMsgEl.textContent = `✅ Good! 시간 +${res.time}s`;
    } else {
        state.combo = 0;
        state.score = Math.max(0, state.score + res.score);
        state.timeLeft = clamp(state.timeLeft + res.time, 0, state.timeMax);
        judgeMsgEl.textContent = `❌ Miss… 시간 ${res.time}s`;
    }
}

// ====== 이벤트 바인딩 ======
function bind() {
    startBtn.addEventListener("click", startRound);
    undoBtn.addEventListener("click", undo);
    clearBtn.addEventListener("click", clearStack);
    submitBtn.addEventListener("click", judgeSubmit);

    // 모바일: 길게 눌러도 클릭처럼 동작하도록 기본 제스처 억제
    ["touchstart", "pointerdown"].forEach(ev => {
        document.body.addEventListener(ev, e => {
            if (e.target.classList && e.target.classList.contains("ig")) {
                e.preventDefault();
            }
        }, { passive: false });
    });
}

// ====== 시작 ======
renderPantry();
renderHUD();
bind();