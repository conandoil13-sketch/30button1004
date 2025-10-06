(() => {
    // ====== 설정(튜닝) ======
    const CELLS = 9;               // 버튼 9개 (3×3)
    const ON_MS = 330;             // 시범에서 켜지는 시간 (약간 빠른 편)
    const OFF_MS = 130;            // 시범에서 꺼지는 간격
    const INPUT_FLASH_MS = 150;    // 사용자가 누를 때 점등 길이
    const SPEEDUP_EVERY = 3;       // n라운드마다 약간 가속
    const SPEEDUP_RATE = 0.9;      // ON/OFF에 곱해지는 비율(가속)

    // ====== DOM ======
    const board = document.getElementById('board');
    const cells = Array.from(document.querySelectorAll('.cell'));
    const startBtn = document.getElementById('startBtn');
    const levelEl = document.getElementById('level');
    const bestEl = document.getElementById('best');
    const msgEl = document.getElementById('msg');

    // ====== 상태 ======
    let seq = [];          // 정답 시퀀스 (숫자 0..8)
    let step = 0;          // 사용자의 입력 진행 인덱스
    let level = 0;         // 길이(라운드)
    let best = 0;          // 최고 레벨
    let playing = false;   // 시범 재생 중?
    let allowInput = false;

    // ====== 유틸 ======
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

        // 속도 가속(옵션): 3라운드마다 살짝 빨라짐
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
        if (level - 1 > best) best = level - 1; // 완료한 라운드 기준으로 갱신
        updateHUD();

        // 새로운 버튼 추가 (연속 같은 버튼도 나올 수 있음)
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

        // 입력 플래시
        cells[i].classList.add('active');
        setTimeout(() => cells[i].classList.remove('active'), INPUT_FLASH_MS);

        const need = seq[step];
        const ok = (i === need);

        if (!ok) {
            setMsg('앗! 다시 시범을 볼게');
            allowInput = false;
            wrongFeedback();
            // 같은 라운드 다시 시범
            setTimeout(playDemo, 450);
            return;
        }

        step++;

        // 라운드 완료
        if (step >= seq.length) {
            setMsg('좋아! 다음 라운드로 간다!');
            allowInput = false;
            // 잠깐 쉬고 다음 라운드
            setTimeout(nextRound, 600);
            return;
        }
    }

    // ====== 이벤트 바인딩 ======
    startBtn.addEventListener('click', resetGame);

    // 터치/마우스 모두 대응 (pointerdown 권장)
    cells.forEach((el, idx) => {
        el.addEventListener('pointerdown', (e) => {
            e.preventDefault(); // 모바일 더블탭 확대 방지
            onCellPress(idx);
        });
    });

    // 초기 메시지
    setMsg('시작을 누르면 시범이 빠르게 재생됩니다.');
    updateHUD();
})();