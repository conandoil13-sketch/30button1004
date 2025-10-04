
const TARGET = 10.00;

let startTime = 0;
let ticking = null;
let running = false;
let lastElapsed = 0;


const $elapsed = document.querySelector('#elapsed');
const $startStop = document.querySelector('#startStop');
const $reset = document.querySelector('#reset');
const $result = document.querySelector('#result');
const $blind = document.querySelector('#blindMode');


const f2 = (n) => n.toFixed(2);


function renderElapsed(sec) {

    if (running && $blind.checked) {
        $elapsed.textContent = '—.—';
    } else {
        $elapsed.textContent = f2(sec);
    }
}


function renderResult(sec) {
    const diff = sec - TARGET;
    const adiff = Math.abs(diff);
    const msg = `기록 ${f2(sec)}s / 오차 ${f2(adiff)}s (${diff > 0 ? '+' : ''}${f2(diff)}s)`;


    let cls = 'bad';
    if (adiff <= 0.10) cls = 'ok';
    else if (adiff <= 0.50) cls = 'warn';

    $result.className = cls;
    $result.textContent = msg;
}


function tick() {
    const now = performance.now();
    const sec = (now - startTime) / 1000;
    lastElapsed = sec;
    renderElapsed(sec);
}


function start() {
    if (running) return;
    running = true;
    $result.textContent = '';
    startTime = performance.now();
    tick();
    ticking = setInterval(tick, 20);
    $startStop.textContent = '정지';
    $reset.disabled = true;
}


function stop() {
    if (!running) return;
    running = false;
    clearInterval(ticking);
    ticking = null;

    renderElapsed(lastElapsed);
    renderResult(lastElapsed);
    $startStop.textContent = '다시 시작';
    $reset.disabled = false;
}


function resetAll() {
    running = false;
    clearInterval(ticking);
    ticking = null;
    lastElapsed = 0;
    renderElapsed(0);
    $result.textContent = '';
    $startStop.textContent = '시작';
    $reset.disabled = true;
}


$startStop.addEventListener('click', () => {
    if (!running) start(); else stop();
});
$reset.addEventListener('click', resetAll);


