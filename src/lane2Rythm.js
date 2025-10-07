(function lockZoomGlobally() {

    document.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });

    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });


    ['gesturestart', 'gesturechange', 'gestureend'].forEach(type => {
        document.addEventListener(type, (e) => e.preventDefault(), { passive: false });
    });


    document.addEventListener('dblclick', (e) => {
        e.preventDefault();
    }, { passive: false });


    document.addEventListener('wheel', (e) => {
        if (e.ctrlKey) e.preventDefault();
    }, { passive: false });
})();
document.addEventListener('DOMContentLoaded', () => {

    const stage = document.getElementById('stage');
    const laneL = document.getElementById('laneL');
    const laneR = document.getElementById('laneR');
    const hitline = document.getElementById('hitline');

    const scoreEl = document.getElementById('score');
    const judgeEl = document.getElementById('judge');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');


    const state = {
        running: false,
        notes: [],
        lastT: performance.now(),
        spawnTimer: null,
        score: 0,
        combo: 0,
    };


    const LANES = [laneL, laneR];
    const COLORS = ['cyan', 'mag'];
    const HIT_Y = () => hitline.getBoundingClientRect().top - stage.getBoundingClientRect().top;
    const H = () => stage.clientHeight;
    const IS_COARSE = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;


    let PERFECT_W = 24;
    let GOOD_W = 60;
    if (IS_COARSE) { PERFECT_W *= 1.0; GOOD_W *= 1.4; }


    const LATE_MS = IS_COARSE ? 180 : 140;

    const zfill6 = (n) => n.toString().padStart(6, '0');
    const setScore = (delta) => {
        state.score = Math.max(0, Math.round(state.score + delta));
        scoreEl.textContent = zfill6(state.score);
    };
    const setJudge = (kind) => {
        judgeEl.className = 'judge ' + (kind || '');
        judgeEl.textContent =
            kind === 'perfect' ? 'PERFECT!' :
                kind === 'good' ? 'GOOD!' :
                    kind === 'miss' ? 'MISS' : '';
        if (kind) {
            clearTimeout(judgeEl._t);
            judgeEl._t = setTimeout(() => setJudge(''), 420);
        }
    };


    function spawnNote() {
        if (!state.running) return;

        const lane = Math.random() < 0.5 ? 0 : 1;
        const el = document.createElement('div');
        el.className = `note ${COLORS[lane]}`;
        el.style.top = `-24px`;
        LANES[lane].appendChild(el);


        const base = IS_COARSE ? 140 : 180;
        const varr = IS_COARSE ? 120 : 160;
        const speed = base + Math.random() * varr;

        state.notes.push({ lane, y: -24, speed, el, hit: false, crossedAt: null });


        const delay = 650 + Math.random() * 700;
        state.spawnTimer = setTimeout(spawnNote, delay);
    }


    function loop(now) {
        const dt = Math.min(0.03, (now - state.lastT) / 1000);
        state.lastT = now;

        if (state.running) {
            const hitY = HIT_Y();

            for (let i = state.notes.length - 1; i >= 0; i--) {
                const n = state.notes[i];
                n.y += n.speed * dt;
                n.el.style.top = `${n.y}px`;


                const center = n.y + 9;


                if (n.crossedAt == null && center >= hitY) {
                    n.crossedAt = performance.now();
                }


                if (!n.hit && n.crossedAt != null && (performance.now() - n.crossedAt) > LATE_MS) {
                    setJudge('miss');
                    state.combo = 0;
                    setScore(-20);
                    n.hit = true;
                    n.el.remove();
                    state.notes.splice(i, 1);
                    continue;
                }


                if (n.y > H() + 40) {
                    n.el.remove();
                    state.notes.splice(i, 1);
                }
            }
        }
        requestAnimationFrame(loop);
    }


    function tryHit(lane) {
        if (!state.running) return;
        const hitY = HIT_Y();


        const SEARCH_W = Math.max(GOOD_W * 1.6, 120);
        let best = null, bestDist = Infinity;

        for (const n of state.notes) {
            if (n.lane !== lane || n.hit) continue;
            const center = n.y + 9;
            const dist = Math.abs(center - hitY);
            if (dist <= SEARCH_W && dist < bestDist) { best = n; bestDist = dist; }
        }

        if (!best) {
            setJudge('miss'); state.combo = 0; setScore(-5); makeBurst(lane, true);
            return;
        }


        const effPerfect = PERFECT_W + best.speed * 0.04;
        const effGood = GOOD_W + best.speed * 0.06;


        const withinTimeGrace = best.crossedAt != null && (performance.now() - best.crossedAt) <= LATE_MS;

        if (bestDist <= effGood || withinTimeGrace) {
            const kind = (bestDist <= effPerfect) ? 'perfect' : 'good';
            setJudge(kind);
            if (kind === 'perfect') { state.combo += 1; } else { state.combo = 0; }
            const base = (kind === 'perfect') ? 100 : 60; // 늦은 Good도 60점
            const bonus = (kind === 'perfect') ? state.combo * 5 : 0;
            setScore(base + bonus);

            makeBurst(lane);
            best.hit = true;
            best.el.remove();
            state.notes = state.notes.filter(n => n !== best);
        } else {
            setJudge('miss'); state.combo = 0; setScore(-5); makeBurst(lane, true);
        }
    }


    function makeBurst(lane, weak = false) {
        const b = document.createElement('div');
        b.className = `burst ${COLORS[lane]}`;
        b.style.top = `${HIT_Y()}px`;
        LANES[lane].appendChild(b);
        if (weak) b.style.transform = 'translate(-50%, -50%) scale(.55)';
        requestAnimationFrame(() => b.classList.add('run'));
        setTimeout(() => b.remove(), 240);
    }


    ['pointerdown', 'touchstart'].forEach(ev => {
        laneL.addEventListener(ev, e => { e.preventDefault(); tryHit(0); }, { passive: false });
        laneR.addEventListener(ev, e => { e.preventDefault(); tryHit(1); }, { passive: false });
    });


    function start() {
        if (state.running) return;
        clearAllNotes();
        state.score = 0; state.combo = 0;
        setScore(0); setJudge('');
        state.running = true;
        state.lastT = performance.now();
        spawnNote();
    }
    function stop() {
        state.running = false;
        clearTimeout(state.spawnTimer);
        setJudge('');
        clearAllNotes();
    }
    function clearAllNotes() {
        state.notes.forEach(n => n.el.remove());
        state.notes.length = 0;
    }

    startBtn.addEventListener('click', start);
    stopBtn.addEventListener('click', stop);


    state.lastT = performance.now();
    requestAnimationFrame(loop);
});
