(() => {

    const stage = document.getElementById('stage');
    const claw = document.getElementById('claw');
    const cable = document.getElementById('cable');
    const head = document.getElementById('head');
    const payload = document.getElementById('payload');
    const msg = document.getElementById('msg');
    const coinsEl = document.getElementById('coins');
    const winsEl = document.getElementById('wins');
    const dropBtn = document.getElementById('dropBtn');


    const dollsContainer = document.getElementById('dolls');
    const dolls = [...dollsContainer.children];
    function layoutDolls() {
        const r = stage.getBoundingClientRect();
        dolls.forEach(d => {
            const x = Math.random() * (r.width - 40) + 8;
            const y = Math.random() * (r.height - 420) + 300; // 상단 빈 공간
            d.style.left = `${x}px`;
            d.style.top = `${y}px`;
        });
    }


    const SPEED_X = 3.0;
    const DROP_SPEED = 4.0;
    const LIFT_SPEED = 4.2;
    const RETURN_SPEED = 3.2;
    const P_CATCH = 0.55;
    const P_SLIP = 0.35;
    const HOME_X_PCT = 0.08;
    const TOP_MARGIN = 8;


    const State = { FREE: 'FREE', DROPPING: 'DROPPING', LIFTING: 'LIFTING', RETURNING: 'RETURNING' };
    let state = State.FREE;

    let coins = 5;
    let wins = 0;


    let x = 0;
    let y = 0;
    let maxY = 0;
    let homeX = 0;
    let caught = false;
    let slipChecked = false;


    const pressed = { left: false, right: false };
    const pressMap = new Map();

    function setMsg(t) { msg.textContent = t; }
    function updateHUD() { coinsEl.textContent = coins; winsEl.textContent = wins; }

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


    function renderClaw() {
        claw.style.transform = `translate(${x}px, 0px)`; // X만 이동
        cable.style.height = `${Math.max(y, 0)}px`;
        const headH = parseFloat(getComputedStyle(head).height);
        head.style.top = `${Math.max(0, y - headH)}px`;
    }
    renderClaw();


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
        payload.textContent = '';
        setMsg('내려가는 중...');

        y = Math.max(y, TOP_MARGIN);
    }


    function tick() {
        const r = stage.getBoundingClientRect();

        if (state === State.FREE) {
            if (pressed.left) x = Math.max(4, x - SPEED_X);
            if (pressed.right) x = Math.min(r.width - parseFloat(getComputedStyle(head).width) - 4, x + SPEED_X);
        }


        if (state === State.DROPPING) {

            y += DROP_SPEED;
            if (y >= maxY) {
                y = maxY;


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

            const startY = y;
            y -= LIFT_SPEED;
            if (!slipChecked) {

                const halfBound = maxY * 0.5;
                if (startY >= halfBound && y < halfBound) {
                    if (caught && Math.random() < P_SLIP) {

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

            if (x > homeX) x = Math.max(homeX, x - RETURN_SPEED);
            else if (x < homeX) x = Math.min(homeX, x + RETURN_SPEED);

            if (Math.abs(x - homeX) <= 0.5) {
                x = homeX;

                if (payload.textContent) {
                    wins++;
                    updateHUD();
                    setMsg('성공! 다시 시도해봐');

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


    updateHUD();
})();