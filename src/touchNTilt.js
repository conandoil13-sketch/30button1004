(() => {
    const stage = document.getElementById('stage');
    const ball = document.getElementById('ball');

    // ===== 튜닝 파라미터 =====
    const G_STEP = 0.08;   // 버튼 1틱 당 기울기 증가량
    const G_MAX = 2.2;    // 기울기 최대치
    const ACCEL = 0.35;   // 가속도: v += g * ACCEL
    const FRICTION = 0.985;  // 마찰(감쇠)
    const EDGE_BOUNCE = 0.4; // 벽 반발 (0=흡수, 1=완전탄성)
    const RELAX = 0.96;   // 손 떼면 기울기 0으로 수렴

    // ===== 크기/상태 =====
    let bounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    let ballSize = 0;

    // 위치/속도/가짜 중력(기울기)
    let x = 0, y = 0;
    let vx = 0, vy = 0;
    let gx = 0, gy = 0;

    // 눌림 상태 및 포인터 추적
    const pressed = { up: false, down: false, left: false, right: false };
    const pressMap = new Map(); // pointerId -> dir
    const btns = [...document.querySelectorAll('.btn')];

    // ===== 유틸 =====
    const setPressed = (dir, val, el) => {
        pressed[dir] = val;
        if (el) el.dataset.pressed = val ? '1' : '0';
    };

    const recalcBounds = () => {
        const rect = stage.getBoundingClientRect();
        ballSize = parseFloat(getComputedStyle(ball).width);
        bounds.minX = 0;
        bounds.minY = 0;
        bounds.maxX = rect.width - ballSize;
        bounds.maxY = rect.height - ballSize;

        // 위치를 안전하게 클램프
        x = Math.max(bounds.minX, Math.min(bounds.maxX, x));
        y = Math.max(bounds.minY, Math.min(bounds.maxY, y));
    };

    const centerBall = () => {
        const rect = stage.getBoundingClientRect();
        x = (rect.width - ballSize) / 2;
        y = (rect.height - ballSize) / 2;
    };

    // ===== 초기화 =====
    recalcBounds();
    centerBall();
    ball.style.transform = `translate(${x}px, ${y}px)`;

    // ===== 입력: 포인터(모바일/데스크탑 공통) =====
    btns.forEach(btn => {
        btn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            const dir = e.currentTarget.dataset.dir;
            pressMap.set(e.pointerId, dir);
            setPressed(dir, true, e.currentTarget);
        });
    });

    // 화면 어디서든 포인터가 끝나면 정리 (버튼 밖으로 드래그되어도 안전)
    const clearByEvent = (e) => {
        const dir = pressMap.get(e.pointerId);
        if (!dir) return;
        setPressed(dir, false, document.querySelector(`.btn.${dir}`));
        pressMap.delete(e.pointerId);
    };
    window.addEventListener('pointerup', clearByEvent);
    window.addEventListener('pointercancel', clearByEvent);
    window.addEventListener('blur', () => { // 탭 전환 등
        // 모든 눌림 해제
        for (const [pid, dir] of pressMap.entries()) {
            setPressed(dir, false, document.querySelector(`.btn.${dir}`));
            pressMap.delete(pid);
        }
    });

    // ===== 반응형: 리사이즈 시 경계 재계산 =====
    let resizeTimer = null;
    const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // 리사이즈 전 중앙 비율 유지
            const rect = stage.getBoundingClientRect();
            const rx = (x + ballSize / 2) / Math.max(rect.width, 1);
            const ry = (y + ballSize / 2) / Math.max(rect.height, 1);

            recalcBounds();

            // 이전 비율대로 재배치(가운데 기준)
            const rect2 = stage.getBoundingClientRect();
            x = rx * rect2.width - ballSize / 2;
            y = ry * rect2.height - ballSize / 2;

            // 안전 클램프
            x = Math.max(bounds.minX, Math.min(bounds.maxX, x));
            y = Math.max(bounds.minY, Math.min(bounds.maxY, y));
        }, 50);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    // ===== 메인 루프 =====
    function tick() {
        // 1) 입력 → 기울기 누적/감쇠
        if (pressed.left) gx = Math.max(-G_MAX, gx - G_STEP);
        if (pressed.right) gx = Math.min(G_MAX, gx + G_STEP);
        if (!pressed.left && !pressed.right) gx *= RELAX;

        if (pressed.up) gy = Math.max(-G_MAX, gy - G_STEP);
        if (pressed.down) gy = Math.min(G_MAX, gy + G_STEP);
        if (!pressed.up && !pressed.down) gy *= RELAX;

        // 2) 속도/위치 업데이트
        vx += gx * ACCEL;
        vy += gy * ACCEL;
        vx *= FRICTION;
        vy *= FRICTION;

        x += vx;
        y += vy;

        // 3) 벽 충돌
        if (x < bounds.minX) { x = bounds.minX; vx = -vx * EDGE_BOUNCE; }
        if (x > bounds.maxX) { x = bounds.maxX; vx = -vx * EDGE_BOUNCE; }
        if (y < bounds.minY) { y = bounds.minY; vy = -vy * EDGE_BOUNCE; }
        if (y > bounds.maxY) { y = bounds.maxY; vy = -vy * EDGE_BOUNCE; }

        // 4) 렌더
        ball.style.transform = `translate(${x}px, ${y}px)`;

        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
})();