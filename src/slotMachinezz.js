const reels = ['#reel1', '#reel2', '#reel3'].map(s => document.querySelector(s)).filter(Boolean);
const btn = document.querySelector('#spinBtn');

function spinOne(reel, duration = 1800, rows = 6, minSteps = 10, maxSteps = 22) {
    if (!reel) return 0;
    const cell = reel.querySelector('.cell');
    if (!cell) return 0;
    const h = cell.getBoundingClientRect().height || 80;
    const steps = minSteps + Math.floor(Math.random() * (maxSteps - minSteps + 1));
    const dist = steps * h;
    reel.style.transition = `transform ${duration}ms cubic-bezier(.15,.85,.2,1)`;
    reel.style.transform = `translateY(-${dist}px)`;
    setTimeout(() => {
        reel.style.transition = 'none';
        const pos = dist % (rows * h);
        reel.style.transform = `translateY(-${pos}px)`;
        void reel.offsetHeight;
    }, duration + 20);
    return duration + 40;
}

function spinAll() {
    if (!btn) return;
    btn.disabled = true;
    const t1 = spinOne(reels[0], 1400);
    setTimeout(() => spinOne(reels[1], 1600), 90);
    setTimeout(() => spinOne(reels[2], 1800), 180);
    const unlock = Math.max(1400, 1600 + 90, 1800 + 180) + 200;
    setTimeout(() => { btn.disabled = false; }, unlock);
}

if (btn) btn.addEventListener('click', spinAll);
