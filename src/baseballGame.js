
(() => {
    const $ = (id) => document.getElementById(id);
    const fmt = (v) => (isFinite(v) ? (v < 1 ? v.toFixed(3).slice(1) : v.toFixed(3)) : '.000');
    const log = (t) => { const el = $('log'); const now = new Date().toLocaleTimeString(); el.textContent = `[${now}] ${t}\n` + (el.textContent === '—' ? '' : el.textContent); };

    const P_BALL = 0.31, P_STRIKE = 0.26;
    const P_INPLAY = 0.72;
    const P_SAFE = 0.46;
    const HIT_MIX = [0.76, 0.16, 0.01, 0.07];

    let balls = 0, strikes = 0, timer = null, autoOn = false;
    const totals = { PA: 0, AB: 0, H: 0, Doubles: 0, Triples: 0, HR: 0, BB: 0 };

    const updateCount = () => { $('b').textContent = balls; $('s').textContent = strikes; };
    const setTotalsUI = () => {
        const map = { PA: 'PA', AB: 'AB', H: 'H', Doubles: 'Doubles', Triples: 'Triples', HR: 'HR', BB: 'BB' };
        for (const k in map) { const el = $(map[k]); if (el) el.value = totals[k]; }
    };
    const compute = () => {
        const AB = totals.AB, H = totals.H, BB = totals.BB;
        const TB = (H - totals.Doubles - totals.Triples - totals.HR) + 2 * totals.Doubles + 3 * totals.Triples + 4 * totals.HR;
        const AVG = AB > 0 ? H / AB : 0;
        const OBP = (AB + BB) > 0 ? (H + BB) / (AB + BB) : 0;
        const SLG = AB > 0 ? TB / AB : 0;
        $('avg').textContent = fmt(AVG);
        $('obp').textContent = fmt(OBP);
        $('slg').textContent = fmt(SLG);
        $('ops').textContent = fmt(OBP + SLG);
    };

    const rand = () => Math.random();
    const resetCount = () => { balls = 0; strikes = 0; updateCount(); };
    const endPA = (kind) => {
        totals.PA++;
        if (kind === 'BB') { totals.BB++; log('볼넷'); }
        else if (kind === 'K') { totals.AB++; log('삼진 아웃'); }
        else if (kind === 'OUT') { totals.AB++; log('인플레이 아웃'); }
        else if (kind.startsWith('HIT:')) {
            totals.AB++; totals.H++;
            const t = kind.split(':')[1];
            if (t === '2B') totals.Doubles++; else
                if (t === '3B') totals.Triples++; else
                    if (t === 'HR') totals.HR++;
            log(`안타(${t})`);
        }
        resetCount(); setTotalsUI(); compute();
    };

    const swing = () => {
        const r1 = rand();

        if (r1 < P_BALL) {
            balls++; log('볼');
            if (balls >= 4) endPA('BB'); else updateCount();
        } else if (r1 < P_BALL + P_STRIKE) {
            strikes++; log('스트라이크');
            if (strikes >= 3) endPA('K'); else updateCount();
        } else {

            const r2 = rand();
            if (r2 < P_INPLAY) {

                const r3 = rand();
                if (r3 < P_SAFE) {

                    const r4 = rand(); const c1 = HIT_MIX[0], c2 = c1 + HIT_MIX[1], c3 = c2 + HIT_MIX[2];
                    if (r4 < c1) { endPA('HIT:1B'); }
                    else if (r4 < c2) { endPA('HIT:2B'); }
                    else if (r4 < c3) { endPA('HIT:3B'); }
                    else { endPA('HIT:HR'); }
                } else {
                    endPA('OUT');
                }
            } else {

                if (strikes < 2) { strikes++; log('파울 (스트+)'); }
                else { log('파울'); }
                updateCount();
            }
        }
    };

    const startAuto = () => {
        if (autoOn) return; autoOn = true; $('auto').textContent = '정지'; $('autoDock').textContent = '정지';
        timer = setInterval(swing, 300);
    };
    const stopAuto = () => {
        autoOn = false; $('auto').textContent = '오토'; $('autoDock').textContent = '오토';
        if (timer) { clearInterval(timer); timer = null; }
    };
    const toggleAuto = () => autoOn ? stopAuto() : startAuto();


    const onTap = (el, fn) => { el.addEventListener('click', fn, { passive: true }); el.addEventListener('touchend', (e) => { e.preventDefault(); fn(); }, { passive: false }); };

    window.addEventListener('DOMContentLoaded', () => {
        onTap($('swing'), swing); onTap($('swingDock'), swing);
        onTap($('auto'), toggleAuto); onTap($('autoDock'), toggleAuto);
        onTap($('reset'), () => { stopAuto(); balls = 0; strikes = 0; for (const k in totals) totals[k] = 0; updateCount(); setTotalsUI(); compute(); log('리셋'); });
        onTap($('resetDock'), () => { stopAuto(); balls = 0; strikes = 0; for (const k in totals) totals[k] = 0; updateCount(); setTotalsUI(); compute(); log('리셋'); });

        updateCount(); setTotalsUI(); compute(); log('Ready: 모바일 랜덤 타격 시뮬레이터');
    });
})();
