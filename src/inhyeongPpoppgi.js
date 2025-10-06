(() => {
    // ===== DOM =====
    const stage = document.getElementById('stage');
    const claw = document.getElementById('claw');
    const cable = document.getElementById('cable');
    const head = document.getElementById('head');
    const payload = document.getElementById('payload');
    const msg = document.getElementById('msg');
    const coinsEl = document.getElementById('coins');
    const winsEl = document.getElementById('wins');
    const dropBtn = document.getElementById('dropBtn');

    // ===== 인형 랜덤 배치 (시각용, 로직엔 영향 X) =====
    const dollsContainer = document.getElementById('dolls');
    const dolls = [...dollsContainer.children];
    function layoutDolls() {
        const r = stage.getBoundingClientRect();
        dolls.forEach(d => {
            const x = Math.random() * (r.width - 40) + 8;
            const y = Math.random() * (r.height - 80) + 40; // 상단 빈 공간
            d.style.left = `${x}px`;
            d.style.top = `${y}px`;
        });
    }

    // ===== 파라미터 (튜닝 지점) =====
    const SPEED_X = 3.0;   // 수평 이동 속도(px/frame)
    const DROP_SPEED = 4.0;   // 하강 속도
    const LIFT_SPEED = 4.2;   // 상승 속도
    const RETURN_SPEED = 3.2;   // 복귀 속도
    const P_CATCH = 0.55;  // 잡기 기본 성공률
    const P_SLIP = 0.35;  // 올라가는 도중 한 번 미끄럼 확률
    const HOME_X_PCT = 0.08;  // 복귀 위치(왼쪽에서 몇 %)
    const TOP_MARGIN = 8;     // 케이블 최소 길이 보정

    // ===== 상태 =====
    const State = { FREE: 'FREE', DROPPING: 'DROPPING', LIFTING: 'LIFTING', RETURNING: 'RETURNING' };
    let state = State.FREE;

    let coins = 5;
    let wins = 0;

    // 위치
    let x = 0; // 집게 X (좌표는 stage 내부)
    let y = 0; // 케이블 길이(집게 Y 위치)
    let maxY = 0; // 바닥 근처 최저점
    let homeX = 0;
    let caught = false;      // 이번 시도에서 잡았는가
    let slipChecked = false; // 미끄럼 판정 한 번만

    // 입력(좌/우) 상태
    const pressed = { left: false, right: false };
    const pressMap = new Map();

    function setMsg(t) { msg.textContent = t; }
    function updateHUD() { coinsEl.textContent = coins; winsEl.textContent = wins; }

    // 크기 재계산 및 초기 위치
    function recalc() {
        const r = stage.getBoundingClientRect();
        maxY = r.height - parseFloat(getComputedStyle(head).height) - parseFloat(getComputedStyle(stage).getPropertyValue('--floor')) - 8;
        homeX = r.width * HOME_X_PCT;
        if (state === State.FREE && x === 0 && y === 0) {
            x = homeX; y = TOP_MARGIN;
        }
        layoutDolls();
    }
    recalc();
    window.addEventListener('resize', recalc);
    window.addEventListener('orientationchange', recalc);

    // 집게 렌더
    function renderClaw() {
        claw.style.transform = `translate(${x}px, 0px)`; // X만 이동
        cable.style.height = `${Math.max(y, 0)}px`;
    }
    renderClaw();

    // 버튼 입력(멀티터치 가능)
    function onPointerDownBtn(e) {
        e.preventDefault();
        const dir = e.currentTarget.dataset.dir;
        if (!dir) return;
        pressMap.set(e.pointerId, dir);
        e.currentTarget.dataset.pressed = '1';
        if (dir === 'left') pressed.left = true;
        if (dir === 'right') pressed.right = true;
    }
    function onPointerUpAny(e) {
        const dir = pressMap.get(e.pointerId);
        if (!dir) return;
        pressMap.delete(e.pointerId);
        const btn = document.querySelector(`.btn.${dir}`);
        if (btn) btn.dataset.pressed = '0';
        if (dir === 'left') pressed.left = false;
        if (dir === 'right') pressed.right = false;
    }
    document.querySelectorAll('.btn.left,.btn.right').forEach(b => {
        b.addEventListener('pointerdown', onPointerDownBtn);
    });
    window.addEventListener('pointerup', onPointerUpAny);
    window.addEventListener('pointercancel', onPointerUpAny);
    window.addEventListener('blur', () => {
        pressed.left = pressed.right = false;
        document.querySelectorAll('.btn.left,.btn.right').forEach(b => b.dataset.pressed = '0');
    });

    // 드롭 버튼
    dropBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        tryDrop();
    });
    dropBtn.addEventListener('click', (e) => e.preventDefault());

    function tryDrop() {
        if (state !== State.FREE) return;
        if (coins <= 0) { setMsg('코인이 없습니다'); return; }

        coins--; updateHUD();
        state = State.DROPPING;
        caught = false;
        slipChecked = false;
        payload.textContent = ''; // 비우기
        setMsg('내려가는 중...');

        // 하강 시작 위치 보정
        y = Math.max(y, TOP_MARGIN);
    }

    // 메인 루프
    function tick() {
        const r = stage.getBoundingClientRect();
        // FREE 상태에서만 좌우 이동
        if (state === State.FREE) {
            if (pressed.left) x = Math.max(4, x - SPEED_X);
            if (pressed.right) x = Math.min(r.width - parseFloat(getComputedStyle(head).width) - 4, x + SPEED_X);
        }

        // 상태별 업데이트
        if (state === State.DROPPING) {
            // 내려가기
            y += DROP_SPEED;
            if (y >= maxY) {
                y = maxY;

                // 잡기 판정(중앙 고려 X, 단순 확률)
                caught = Math.random() < P_CATCH;
                if (caught) {
                    payload.textContent = '🧸'; // 집게 안 인형 보이기
                    setMsg('잡았다! 올라가는 중...');
                } else {
                    payload.textContent = '';
                    setMsg('빈 집게... 올라가는 중...');
                }
                state = State.LIFTING;
            }
        }
        else if (state === State.LIFTING) {
            // 올라가기
            const startY = y; // 현재 위치(아래쪽)
            y -= LIFT_SPEED;
            if (!slipChecked) {
                // 중간 지점 통과하면 1회 미끄럼 판정
                const halfBound = maxY * 0.5;
                if (startY >= halfBound && y < halfBound) {
                    if (caught && Math.random() < P_SLIP) {
                        // 미끄러짐 → 빈 집게로 전환
                        caught = false;
                        payload.textContent = '';
                        setMsg('미끄러웠다! 빈 집게로...');
                    }
                    slipChecked = true;
                }
            }
            if (y <= TOP_MARGIN) {
                y = TOP_MARGIN;
                state = State.RETURNING;
                setMsg('복귀 중...');
            }
        }
        else if (state === State.RETURNING) {
            // 왼쪽 홈 위치로 복귀
            if (x > homeX) x = Math.max(homeX, x - RETURN_SPEED);
            else if (x < homeX) x = Math.min(homeX, x + RETURN_SPEED);

            if (Math.abs(x - homeX) <= 0.5) {
                x = homeX;
                // 결과 처리
                if (payload.textContent) { // 성공
                    wins++;
                    updateHUD();
                    setMsg('성공! 다시 시도해봐');
                    // 잠깐 보여줬다가 비우고 FREE로
                    setTimeout(() => { payload.textContent = ''; }, 500);
                } else {
                    setMsg('실패! 다시 맞춰보자');
                }
                state = State.FREE;
            }
        }

        renderClaw();
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // 초기 HUD
    updateHUD();
})();