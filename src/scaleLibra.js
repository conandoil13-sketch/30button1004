

document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);


    const panL = $('panL');
    const panR = $('panR');
    const beam = $('beam');

    const addL = $('addL');
    const removeL = $('removeL');
    const addR = $('addR');
    const removeR = $('removeR');
    const resetBtn = $('reset');
    const sizeAffectsMassChk = $('sizeAffectsMass');

    const massLEl = $('massL');
    const massREl = $('massR');
    const countLEl = $('countL');
    const countREl = $('countR');
    const degEl = $('deg');


    const required = [panL, panR, beam, addL, removeL, addR, removeR, resetBtn, sizeAffectsMassChk, massLEl, massREl, countLEl, countREl, degEl];
    if (required.some(el => !el)) {
        console.warn('[Scale] 필수 요소를 못 찾았어요. HTML의 id를 확인하세요.');
        return;
    }


    const state = {
        massL: 0, massR: 0,
        blocksL: [], blocksR: [],
        angle: 0, angVel: 0, target: 0,
        stiffness: 6.0, damping: 1.6,
        torqueScale: 0.06, maxDeg: 18,
        lastTime: performance.now(), running: true,
        sizeAffectsMass: false,
    };


    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const rad2deg = r => r * 180 / Math.PI;
    const deg2rad = d => d * Math.PI / 180;


    function createBlock(side) {
        const div = document.createElement('div');
        div.className = 'block pop';

        const w = 28 + Math.floor(Math.random() * 28);
        const h = 28 + Math.floor(Math.random() * 28);
        div.style.width = w + 'px';
        div.style.height = h + 'px';

        const panEl = side === 'L' ? panL : panR;
        const panW = panEl.clientWidth || 200;
        const pad = 8;
        const half = Math.max(0, (panW / 2) - (w / 2) - pad);
        const offset = (Math.random() * 2 - 1) * half;
        div.style.left = `calc(50% + ${offset}px)`;

        let mass = 1;
        if (state.sizeAffectsMass) {
            const area = w * h;
            mass = 0.0008 * area + 0.4;
        }
        div.dataset.mass = String(mass);
        return div;
    }

    function updateHUD() {
        massLEl.textContent = state.massL.toFixed(2);
        massREl.textContent = state.massR.toFixed(2);
        countLEl.textContent = state.blocksL.length;
        countREl.textContent = state.blocksR.length;
        degEl.textContent = rad2deg(state.angle).toFixed(1) + '°';
    }


    function computeTargetAngle() {
        const diff = state.massL - state.massR;
        const maxRad = deg2rad(state.maxDeg);
        state.target = clamp(-(diff) * state.torqueScale, -maxRad, maxRad);
    }


    function step(dt) {
        computeTargetAngle();
        const err = state.target - state.angle;
        const acc = state.stiffness * err - state.damping * state.angVel;
        state.angVel += acc * dt;
        state.angle += state.angVel * dt;

        if (Math.abs(state.angVel) < 0.00005 && Math.abs(err) < deg2rad(0.02)) {
            state.angVel = 0; state.angle = state.target;
        }

        beam.style.transform = `translate(-50%,-50%) rotate(${rad2deg(state.angle)}deg)`;
        updateHUD();
    }


    function loop(now) {
        const dt = Math.min(0.033, (now - state.lastTime) / 1000);
        state.lastTime = now;
        if (state.running) step(dt);
        requestAnimationFrame(loop);
    }


    function addBlock(side) {
        const block = createBlock(side);
        const m = parseFloat(block.dataset.mass);
        if (side === 'L') {
            panL.appendChild(block);
            state.blocksL.push(block);
            state.massL += m;
        } else {
            panR.appendChild(block);
            state.blocksR.push(block);
            state.massR += m;
        }
        updateHUD();
    }
    function removeBlock(side) {
        if (side === 'L' && state.blocksL.length) {
            const b = state.blocksL.pop();
            state.massL -= parseFloat(b.dataset.mass);
            b.remove();
        } else if (side === 'R' && state.blocksR.length) {
            const b = state.blocksR.pop();
            state.massR -= parseFloat(b.dataset.mass);
            b.remove();
        }
        updateHUD();
    }


    addL.addEventListener('click', () => addBlock('L'));
    addR.addEventListener('click', () => addBlock('R'));
    removeL.addEventListener('click', () => removeBlock('L'));
    removeR.addEventListener('click', () => removeBlock('R'));

    resetBtn.addEventListener('click', () => {
        [...state.blocksL, ...state.blocksR].forEach(b => b.remove());
        state.blocksL.length = 0; state.blocksR.length = 0;
        state.massL = 0; state.massR = 0;
        state.target = 0; state.angle = 0; state.angVel = 0;
        beam.style.transform = 'translate(-50%,-50%) rotate(0deg)';
        updateHUD();
    });

    sizeAffectsMassChk.addEventListener('change', (e) => {
        state.sizeAffectsMass = e.target.checked;
    });


    updateHUD();
    requestAnimationFrame(t => { state.lastTime = t; loop(t); });
});
