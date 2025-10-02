const TICK_MS = 50;
const TAP_GAIN = 8;
const DECAY_PER_SEC = 16;
const DECAY_PER_TICK = DECAY_PER_SEC * (TICK_MS / 1000);


const fill = document.querySelector('#fill');
const meterText = document.querySelector('#meterText');
const tapBtn = document.querySelector('#tap');
const resetBtn = document.querySelector('#reset');


let gauge = 0;


const clamp01 = (v) => Math.max(0, Math.min(100, v));
const updateGaugeUI = () => {
    const pct = Math.round(gauge);
    fill.style.width = pct + '%';
    meterText.textContent = pct + '%';
};


tapBtn.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' || e.pointerType === 'pen') e.preventDefault();
    gauge = clamp01(gauge + TAP_GAIN);
    updateGaugeUI();
});


setInterval(() => {
    gauge = clamp01(gauge - DECAY_PER_TICK);
    updateGaugeUI();
}, TICK_MS);


resetBtn.addEventListener('click', () => {
    gauge = 0;
    updateGaugeUI();
});


updateGaugeUI();