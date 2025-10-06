
const $ = (id) => document.getElementById(id);
const fmt = (v) => (isFinite(v) ? (v < 1 ? v.toFixed(3).slice(1) : v.toFixed(3)) : ".000");
const n = (el) => Math.max(0, Number(el.value) || 0);


function compute() {
    const PA = n($("pa")), AB = n($("ab")), H = n($("h")), BB = n($("bb")), HBP = n($("hbp")), SF = n($("sf"));
    const Doubles = n($("doubles")), Triples = n($("triples")), HR = n($("hr"));
    const Singles = Math.max(0, H - Doubles - Triples - HR);
    const TB = Singles + 2 * Doubles + 3 * Triples + 4 * HR;
    const AVG = AB > 0 ? H / AB : 0;
    const OBP = (AB + BB + HBP + SF) > 0 ? (H + BB + HBP) / (AB + BB + HBP + SF) : 0;
    const SLG = (AB > 0) ? TB / AB : 0;
    const OPS = OBP + SLG;

    $("avg").textContent = fmt(AVG);
    $("obp").textContent = fmt(OBP);
    $("slg").textContent = fmt(SLG);
    $("ops").textContent = fmt(OPS);

    const level = $("level").value;
    let minPA = 50; let eliteOPS = 0.900, goodOPS = 0.800, weakOPS = 0.650;
    if (level === "kbo") { minPA = 50; }
    if (level === "mlb") { minPA = 80; }

    let comment = ""; let flagClass = "warn";
    if (PA < minPA) {
        comment = `샘플 타석 부족: 최소 ${minPA} PA 필요`;
        flagClass = "warn";
    } else if (OPS >= eliteOPS) {
        if (OBP >= 0.400 && SLG >= 0.500) {
            comment = "엘리트 공격자원: 출루+장타 동시 우수";
        } else if (OBP >= 0.380) {
            comment = "고출루 타입: 선구·컨택이 강점";
        } else if (SLG >= 0.520) {
            comment = "장타 특화: 장타 생산이 탁월";
        } else {
            comment = "균형형 강타자";
        }
        flagClass = "ok";
    } else if (OPS >= goodOPS) {
        if (AVG >= 0.300) {
            comment = "컨택 위주의 준수한 타자";
        } else if (HR >= 10 && SLG >= 0.480) {
            comment = "파워 포텐셜 보유";
        } else {
            comment = "리그 평균 이상의 안정적 생산";
        }
        flagClass = "ok";
    } else if (OPS < weakOPS) {
        if (OBP < 0.290) {
            comment = "출루 저조: 타석 퀄리티 개선 필요";
        } else if (SLG < 0.330) {
            comment = "장타 부족: 타구 질/각도 개선 과제";
        } else {
            comment = "전반적 생산 저하";
        }
        flagClass = "bad";
    } else {
        comment = "평균권 성능";
        flagClass = "warn";
    }

    $("comment").textContent = comment;
    const flag = $("flag");
    flag.className = `pill ${flagClass}`;
    flag.textContent = flagClass === "ok" ? "적정 표본 / 해석 가능" : (flagClass === "bad" ? "주의 필요" : "평균/표본 경고");

    $("logicView").textContent =
        `if (PA < ${minPA}) {\n  "샘플 부족"\n} else if (OPS >= ${eliteOPS.toFixed(3)}) {\n  if (OBP >= 0.400 && SLG >= 0.500) {\n    "엘리트: 출루+장타"\n  } else if (OBP >= 0.380) {\n    "고출루"\n  } else if (SLG >= 0.520) {\n    "장타 특화"\n  } else {\n    "균형형 강타자"\n  }\n} else if (OPS >= ${goodOPS.toFixed(3)}) {\n  if (AVG >= 0.300) {\n    "컨택형 준수"\n  } else if (HR >= 10 && SLG >= 0.480) {\n    "파워 포텐셜"\n  } else {\n    "평균 이상"\n  }\n} else if (OPS < ${weakOPS.toFixed(3)}) {\n  if (OBP < 0.290) {\n    "출루 저조"\n  } else if (SLG < 0.330) {\n    "장타 부족"\n  } else {\n    "생산 저하"\n  }\n} else {\n  "평균권"\n}`;
}


let balls = 0, strikes = 0;
function clampProb() {
    const pB = n($("pBall"));
    const pS = n($("pStrike"));
    let pC = 100 - pB - pS; if (pC < 0) pC = 0; if (pC > 100) pC = 100;
    $("pContact").value = pC;
}
function parseHitMix() {
    const txt = $("hitMix").value.trim();
    const parts = txt.split('/').map(x => Number(x) || 0);
    let [p1, p2, p3, p4] = [parts[0] || 70, parts[1] || 18, parts[2] || 2, parts[3] || 10];
    const sum = p1 + p2 + p3 + p4 || 1; return [p1 / sum, p2 / sum, p3 / sum, p4 / sum];
}
function rand() { return Math.random(); }
function pushLog(text) {
    const log = $("log"); const now = new Date().toLocaleTimeString();
    log.textContent = `[${now}] ${text}\n` + (log.textContent === '—' ? '' : log.textContent);
}
function updateBadge() { $("countBadge").textContent = `B ${balls}  |  S ${strikes}`; }

const totals = { PA: 0, AB: 0, H: 0, BB: 0, HBP: 0, SF: 0, Doubles: 0, Triples: 0, HR: 0 };
function setInputsFromTotals(t) {
    $("pa").value = t.PA; $("ab").value = t.AB; $("h").value = t.H; $("bb").value = t.BB; $("hbp").value = t.HBP; $("sf").value = t.SF;
    $("doubles").value = t.Doubles; $("triples").value = t.Triples; $("hr").value = t.HR;
}
function endPA(outcome) {

    totals.PA++;
    if (outcome === 'BB') {
        totals.BB++; pushLog('볼넷으로 출루');
    } else if (outcome.startsWith('HIT')) {
        totals.AB++; totals.H++;
        const kind = outcome.split(':')[1];
        if (kind === '2B') { totals.Doubles++; }
        if (kind === '3B') { totals.Triples++; }
        if (kind === 'HR') { totals.HR++; }
        pushLog(`안타(${kind})!`);
    } else {
        totals.AB++; pushLog('아웃');
    }
    balls = 0; strikes = 0; updateBadge(); setInputsFromTotals(totals); compute();
}
function swing() {
    clampProb();
    const pB = n($("pBall")) / 100, pS = n($("pStrike")) / 100, pC = n($("pContact")) / 100;
    const r1 = rand();
    if (r1 < pB) {
        balls++; pushLog('볼'); if (balls >= 4) { endPA('BB'); return; }
    } else if (r1 < pB + pS) {
        strikes++; pushLog('스트라이크'); if (strikes >= 3) { endPA('OUT'); return; }
    } else {
        const r2 = rand(); const pInPlay = n($("pInPlay")) / 100;
        if (r2 < pInPlay) {
            const r3 = rand(); const pSafe = n($("pSafe")) / 100;
            if (r3 < pSafe) {
                const [p1, p2, p3, p4] = parseHitMix(); const r4 = rand();
                if (r4 < p1) { endPA('HIT:1B'); }
                else if (r4 < p1 + p2) { endPA('HIT:2B'); }
                else if (r4 < p1 + p2 + p3) { endPA('HIT:3B'); }
                else { endPA('HIT:HR'); }
                return;
            } else { endPA('OUT'); return; }
        } else {
            if (strikes < 2) { strikes++; pushLog('파울 (스트라이크+)'); }
            else { pushLog('파울'); }
        }
    }
    updateBadge();
}


$("calc").addEventListener('click', compute);
$("sample").addEventListener('click', () => {
    const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    $("pa").value = r(40, 250);
    $("ab").value = r(30, 220);
    const H = r(10, 80); $("h").value = H;
    const d = r(0, Math.min(20, H)); $("doubles").value = d;
    const t = r(0, Math.min(5, H - d)); $("triples").value = t;
    const hr = r(0, Math.min(20, H - d - t)); $("hr").value = hr;
    $("bb").value = r(5, 40);
    $("hbp").value = r(0, 5);
    $("sf").value = r(0, 5);
    compute();
});
$("swingBtn").addEventListener('click', swing);
$("newPA").addEventListener('click', () => { balls = 0; strikes = 0; updateBadge(); pushLog('타석 리셋'); });
$("pBall").addEventListener('input', clampProb);
$("pStrike").addEventListener('input', clampProb);

function init() {
    clampProb(); updateBadge(); setInputsFromTotals(totals); compute();
}
init();
