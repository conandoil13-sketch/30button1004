
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

    const PERFECT_W = 36;
    const GOOD_W = 85;
    if (IS_COARSE) {
        PERFECT_W *= 1.5;  // 24→36
        GOOD_W *= 1.5;  // 60→90
    }

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const zfill6 = (n) => n.toString().padStart(6, '0');
    function setScore(delta) {
        state.score = Math.max(0, Math.round(state.score + delta));
        scoreEl.textContent = zfill6(state.score);
    }
    function setJudge(kind) {
        judgeEl.className = 'judge ' + (kind || '');
        if (kind === 'perfect') judgeEl.textContent = 'PERFECT!';
        else if (kind === 'good') judgeEl.textContent = 'GOOD!';
        else if (kind === 'miss') judgeEl.textContent = 'MISS';
        else judgeEl.textContent = '';
        if (kind) {
            clearTimeout(judgeEl._t);
            judgeEl._t = setTimeout(() => setJudge(''), 420);
        }
    }


    function spawnNote() {
        if (!state.running) return;

        const lane = Math.random() < 0.5 ? 0 : 1;
        const el = document.createElement('div');
        el.className = `note ${COLORS[lane]}`;
        el.style.top = `-24px`;
        LANES[lane].appendChild(el);

        const speed = 180 + Math.random() * 160;
        state.notes.push({ lane, y: -24, speed, el, hit: false });


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


                if (n.y - hitY > GOOD_W + 28 && !n.hit) {

                    n.hit = true;
                    setJudge('miss');
                    state.combo = 0;
                    setScore(-20);

                    n.el.remove();
                    state.notes.splice(i, 1);
                } else if (n.y > H() + 40) {

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


        let best = null;
        let bestDist = Infinity;

        for (const n of state.notes) {
            if (n.lane !== lane || n.hit) continue;
            const center = n.y + 9;
            const dist = Math.abs(center - hitY);
            if (dist < bestDist) {
                bestDist = dist;
                best = n;
            }
        }

        if (best && bestDist <= GOOD_W) {
            best.hit = true;

            const kind = (bestDist <= PERFECT_W) ? 'perfect' : 'good';
            setJudge(kind);
            state.combo = (kind === 'perfect') ? state.combo + 1 : state.combo; // 간단히 perfect에만 콤보 가산
            const base = (kind === 'perfect') ? 100 : 50;
            const bonus = (kind === 'perfect') ? state.combo * 5 : 0;
            setScore(base + bonus);


            makeBurst(lane);


            best.el.remove();
            state.notes = state.notes.filter(n => n !== best);
        } else {

            setJudge('miss');
            state.combo = 0;
            setScore(-10);
            makeBurst(lane, true);
        }
    }


    function makeBurst(lane, weak = false) {
        const b = document.createElement('div');
        b.className = `burst ${COLORS[lane]}`;

        const y = HIT_Y();
        b.style.top = `${y}px`;
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
