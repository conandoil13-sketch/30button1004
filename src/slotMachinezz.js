
function buildMarquee(layerSel, bulbs = 28) {
    const el = document.querySelector(layerSel);
    el.style.setProperty('--bulbs', bulbs);
    const frag = document.createDocumentFragment();
    for (let i = 0; i < bulbs; i++) {
        const b = document.createElement('i');
        b.className = 'bulb';
        b.style.setProperty('--i', i);
        frag.appendChild(b);
    }
    el.appendChild(frag);
}


buildMarquee('.marquee.layer-a', 28);
buildMarquee('.marquee.layer-b', 28);


const reelEls = ['#reel1', '#reel2', '#reel3'].map(sel => document.querySelector(sel));
const spinBtn = document.querySelector('#spinBtn');

function fakeSpinOne(reelEl, duration = 1800, rows = 6) {

    const cellH = reelEl.querySelector('.cell').getBoundingClientRect().height;

    const steps = 10 + Math.floor(Math.random() * 12);
    const dist = steps * cellH;


    reelEl.style.transition = `transform ${duration}ms cubic-bezier(.15, .85, .2, 1)`;
    reelEl.style.transform = `translateY(-${dist}px)`;


    setTimeout(() => {
        reelEl.style.transition = 'none';
        const pos = dist % (rows * cellH);
        reelEl.style.transform = `translateY(-${pos}px)`;

        void reelEl.offsetHeight;
    }, duration + 20);
}

spinBtn.addEventListener('click', () => {

    fakeSpinOne(reelEls[0], 1400);
    setTimeout(() => fakeSpinOne(reelEls[1], 1600), 90);
    setTimeout(() => fakeSpinOne(reelEls[2], 1800), 180);
});