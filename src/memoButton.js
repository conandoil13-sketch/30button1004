(() => {

    const CELLS = 9;
    const ON_MS = 330;
    const OFF_MS = 130;
    const INPUT_FLASH_MS = 150;
    const SPEEDUP_EVERY = 3;
    const SPEEDUP_RATE = 0.9;


    const board = document.getElementById('board');
    const cells = Array.from(document.querySelectorAll('.cell'));
    const startBtn = document.getElementById('startBtn');
    const levelEl = document.getElementById('level');
    const bestEl = document.getElementById('best');
    const msgEl = document.getElementById('msg');


    let seq = [];
    let step = 0;
    let level = 0;
    let best = 0;
    let playing = false;
    let allowInput = false;


    const sleep = (ms) => new Promise(res => setTimeout(res, ms));
    const setMsg = (t) => msgEl.textContent = t;
    const updateHUD = () => {
        levelEl.textContent = level;
        bestEl.textContent = best;
    };

    function randCell() {
        return (Math.random() * CELLS) | 0; // 0..8
    }

    function flashCell(i, ms) {
        const el = cells[i];
        el.classList.add('active');
        return sleep(ms).then(() => el.classList.remove('active'));
    }

    async function playDemo() {
        playing = true;
        allowInput = false;
        board.classList.add('lock');
        setMsg('시범 중...');


        let on = ON_MS * Math.pow(SPEEDUP_RATE, Math.floor((level - 1) / SPEEDUP_EVERY));
        let off = OFF_MS * Math.pow(SPEEDUP_RATE, Math.floor((level - 1) / SPEEDUP_EVERY));

        for (let i = 0; i < seq.length; i++) {
            await flashCell(seq[i], on);
            await sleep(off);
        }

        playing = false;
        allowInput = true;
        board.classList.remove('lock');
        setMsg('같은 순서로 눌러봐!');
        step = 0;
    }

    async function nextRound() {
        level++;
        if (level - 1 > best) best = level - 1;
        updateHUD();


        seq.push(randCell());

        await sleep(300);
        await playDemo();
    }

    function resetGame() {
        seq = [];
        step = 0;
        level = 0;
        allowInput = false;
        playing = false;
        setMsg('시작!');
        updateHUD();
        nextRound();
    }

    function wrongFeedback() {
        board.classList.add('shake');
        setTimeout(() => board.classList.remove('shake'), 320);
    }

    async function onCellPress(i) {
        if (!allowInput || playing) return;


        cells[i].classList.add('active');
        setTimeout(() => cells[i].classList.remove('active'), INPUT_FLASH_MS);

        const need = seq[step];
        const ok = (i === need);

        if (!ok) {
            setMsg('앗! 다시 시범을 볼게');
            allowInput = false;
            wrongFeedback();

            setTimeout(playDemo, 450);
            return;
        }

        step++;


        if (step >= seq.length) {
            setMsg('좋아! 다음 라운드로 간다!');
            allowInput = false;

            setTimeout(nextRound, 1000);
            return;
        }
    }


    startBtn.addEventListener('click', resetGame);


    cells.forEach((el, idx) => {
        el.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            onCellPress(idx);
        });
    });


    setMsg('시작을 누르면 시범이 빠르게 재생됩니다.');
    updateHUD();
})();