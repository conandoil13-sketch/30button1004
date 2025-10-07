
const state = {
    massL: 0, massR: 0,
    blocksL: [], blocksR: [],
    angle: 0,
    angVel: 0,
    target: 0,

    stiffness: 6.0,
    damping: 1.6,
    torqueScale: 0.06,
    maxDeg: 18,
    lastTime: performance.now(),
    running: true,
    sizeAffectsMass: false,
};


const panL = document.getElementById('panL');
const panR = document.getElementById('panR');
const beam = document.getElementById('beam');

const addL = document.getElementById('addL');
const removeL = document.getElementById('removeL');
const addR = document.getElementById('addR');
const removeR = document.getElementById('removeR');
const resetBtn = document.getElementById('reset');
const sizeAffectsMassChk = document.getElementById('sizeAffectsMass');

const massLEl = document.getElementById('massL');
const massREl = document.getElementById('massR');
const countLEl = document.getElementById('countL');
const countREl = document.getElementById('countR');
const degEl = document.getElementById('deg');


const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rad2deg = r => r * 180 / Math.PI;
const deg2rad = d => d * Math.PI / 180;


function createBlock() {
    const div = document.createElement('div');
    div.className = 'block pop';


    const w = 28 + Math.floor(Math.random() * 28);
    const h = 28 + Math.floor(Math.random() * 28);
    div.style.width = w + 'px';
    div.style.height = h + 'px';


    const offset = (Math.random() * 100 - 50);
    div.style.left = `calc(50% + ${offset}px)`;


    let mass = 1;
    if (state.sizeAffectsMass) {
        const area = w * h;
        mass = 0.0008 * area + 0.4;
    }
    div.dataset.mass = String(mass);
    return div;
}


function addBlock(side) {
    const block = createBlock();
    if (side === 'L') {
        panL.appendChild(block);
        state.blocksL.push(block);
        state.massL += parseFloat(block.dataset.mass);
    } else {
        panR.appendChild(block);
        state.blocksR.push(block);
        state.massR += parseFloat(block.dataset.mass);
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

function updateHUD() {
    massLEl.textContent = state.massL.toFixed(2);
    massREl.textContent = state.massR.toFixed(2);
    countLEl.textContent = state.blocksL.length;
    countREl.textContent = state.blocksR.length;
    degEl.textContent = rad2deg(state.angle).toFixed(1) + '°';
}


function computeTargetAngle() {
    const diff = state.massL - state.massR;
    let target = diff * state.torqueScale;
    const maxRad = deg2rad(state.maxDeg);
    target = clamp(target, -maxRad, maxRad);
    state.target = target;
}


function step(dt) {

    computeTargetAngle();


    const err = state.target - state.angle;
    const acc = state.stiffness * err - state.damping * state.angVel;

    state.angVel += acc * dt;
    state.angle += state.angVel * dt;


    if (Math.abs(state.angVel) < 0.00005 && Math.abs(err) < deg2rad(0.02)) {
        state.angVel = 0;
        state.angle = state.target;
    }


    beam.style.transform = `translate(-50%,-50%) rotate(${rad2deg(state.angle)}deg)`;
    updateHUD();
}


function loop(now) {
    const dt = Math.min(0.033, (now - state.lastTime) / 1000); // 30fps 상한
    state.lastTime = now;
    if (state.running) step(dt);
    requestAnimationFrame(loop);
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


['pointerdown', 'touchstart'].forEach(ev => {
    document.body.addEventListener(ev, (e) => {
        if ((e.target instanceof HTMLElement) && e.target.classList.contains('btn')) e.preventDefault();
    }, { passive: false });
});


updateHUD();
requestAnimationFrame((t) => { state.lastTime = t; loop(t); });
