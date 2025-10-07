document.addEventListener('DOMContentLoaded', () => {

    const sayOneBtn = document.getElementById('sayOne');
    const passBtn = document.getElementById('passTurn');
    const resetBtn = document.getElementById('resetGame');
    const statusEl = document.getElementById('status');
    const historyEl = document.getElementById('history');
    const yourCountEl = document.getElementById('yourCount');
    const cpuHintEl = document.getElementById('cpuHint');

    const needAll = [sayOneBtn, passBtn, resetBtn, statusEl, historyEl, yourCountEl, cpuHintEl];
    if (needAll.some(n => !n)) {
        console.warn('필수 요소 누락: HTML id를 확인하세요.');
        return;
    }


    const TARGET = 31;
    const MAX_PER_TURN = 3;
    const SAFE_NUMS = [4, 8, 12, 16, 20, 24, 28];

    const state = {
        current: 0,
        turn: 'you',
        saidThisTurn: 0,
        over: false,
    };


    const el = (tag, attrs = {}, ...children) => {
        const node = document.createElement(tag);
        Object.entries(attrs).forEach(([k, v]) => {
            if (k === 'class') node.className = v; else node.setAttribute(k, v);
        });
        children.forEach(c => node.append(c));
        return node;
    };

    const appendLog = (who, nums) => {
        const line = el('div', {},
            el('span', { class: 'badge' }, who === 'you' ? '플레이어' : 'CPU'),
            el('span', { class: 'mono' }, nums.join(', '))
        );
        historyEl.append(line);
        historyEl.scrollTop = historyEl.scrollHeight;
    };

    const setStatus = (msg, cls = '') => {
        statusEl.className = `bignum ${cls}`;
        statusEl.textContent = msg;
    };

    const updateYourCount = () => {
        yourCountEl.textContent = `이번 턴 남은 말 수: ${MAX_PER_TURN - state.saidThisTurn}`;
    };

    const nextSafe = (n) => SAFE_NUMS.find(s => s > n) ?? null;


    const cpuDecideCount = (current) => {
        const remain = TARGET - current;

        if (remain <= MAX_PER_TURN) {

            return Math.max(1, remain - 1);
        }

        const target = nextSafe(current);
        if (target) {
            const k = target - current;
            if (k >= 1 && k <= MAX_PER_TURN) return k;
        }

        return 1 + Math.floor(Math.random() * MAX_PER_TURN);
    };


    function refreshUI() {
        setStatus(`현재 숫자: ${state.current}`);
        updateYourCount();

        const ns = nextSafe(state.current);
        cpuHintEl.textContent = ns ? `CPU 안정수 목표: ${ns}` : '엔드게임: 30에서 멈추기 노림';

        if (state.over) {
            sayOneBtn.disabled = true;
            passBtn.disabled = true;
            return;
        }
        const myTurn = state.turn === 'you';
        sayOneBtn.disabled = !myTurn || state.saidThisTurn >= MAX_PER_TURN;

        passBtn.disabled = !myTurn || !(state.saidThisTurn >= 1 && state.saidThisTurn <= 2);
    }

    function checkLose() {
        if (state.current >= TARGET) {
            state.over = true;

            if (state.turn === 'you') {
                setStatus('패배! (31을 말함)', 'lose');
            } else {
                setStatus('승리! (CPU가 31을 말함)', 'win');
            }
            refreshUI();
            return true;
        }
        return false;
    }


    function endYourTurn() {
        state.turn = 'cpu';
        state.saidThisTurn = 0;
        refreshUI();
        setTimeout(cpuTurn, 450);
    }

    function yourSayOne() {
        if (state.over || state.turn !== 'you' || state.saidThisTurn >= MAX_PER_TURN) return;
        state.current += 1;
        appendLog('you', [state.current]);
        state.saidThisTurn += 1;

        if (checkLose()) return;

        if (state.saidThisTurn >= MAX_PER_TURN) {

            endYourTurn();
        } else {
            refreshUI();
        }
    }

    function yourPass() {
        if (state.over || state.turn !== 'you') return;

        if (state.saidThisTurn >= 1 && state.saidThisTurn <= 2) {
            endYourTurn();
        }
    }


    function cpuTurn() {
        if (state.over || state.turn !== 'cpu') return;

        const count = cpuDecideCount(state.current);
        const nums = [];
        for (let i = 0; i < count; i++) {
            state.current += 1;
            nums.push(state.current);
            if (state.current >= TARGET) break;
        }
        appendLog('cpu', nums);

        if (checkLose()) return;


        state.turn = 'you';
        state.saidThisTurn = 0;
        refreshUI();
    }


    function resetGame() {
        state.current = 0;
        state.turn = 'you';
        state.saidThisTurn = 0;
        state.over = false;
        historyEl.innerHTML = '';
        setStatus('게임 시작! 당신부터');
        refreshUI();
    }


    sayOneBtn.addEventListener('click', yourSayOne);
    passBtn.addEventListener('click', yourPass);
    resetBtn.addEventListener('click', resetGame);


    resetGame();
});