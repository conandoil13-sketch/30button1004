// 목표 시간(초)
const TARGET = 10.00;

// 상태
let startTime = 0;        // 시작 시각(ms)
let ticking = null;       // setInterval 핸들
let running = false;      // 진행 중 여부
let lastElapsed = 0;      // 마지막 측정 시간(초)

// DOM
const $elapsed = document.querySelector('#elapsed');
const $startStop = document.querySelector('#startStop');
const $reset = document.querySelector('#reset');
const $result = document.querySelector('#result');
const $blind = document.querySelector('#blindMode');

// 숫자 포맷: 2자리 소수
const f2 = (n) => n.toFixed(2);

// 경과 표시 업데이트
function renderElapsed(sec) {
    // 블라인드 모드면 진행 중에는 숨김
    if (running && $blind.checked) {
        $elapsed.textContent = '—.—';
    } else {
        $elapsed.textContent = f2(sec);
    }
}

// 점수/판정 표시
function renderResult(sec) {
    const diff = sec - TARGET;             // +면 초과, -면 부족
    const adiff = Math.abs(diff);          // 절대 오차
    const msg = `기록 ${f2(sec)}s / 오차 ${f2(adiff)}s (${diff > 0 ? '+' : ''}${f2(diff)}s)`;

    // 간단한 등급
    let cls = 'bad';
    if (adiff <= 0.10) cls = 'ok';
    else if (adiff <= 0.50) cls = 'warn';

    $result.className = cls;
    $result.textContent = msg;
}

// 틱(화면 갱신)
function tick() {
    const now = performance.now();               // ms, 고해상도 타이머
    const sec = (now - startTime) / 1000;
    lastElapsed = sec;
    renderElapsed(sec);
}

// 시작
function start() {
    if (running) return;
    running = true;
    $result.textContent = '';
    startTime = performance.now();
    tick();                                      // 즉시 한 번
    ticking = setInterval(tick, 20);             // 50fps 정도로 갱신
    $startStop.textContent = '정지';
    $reset.disabled = true;
}

// 정지
function stop() {
    if (!running) return;
    running = false;
    clearInterval(ticking);
    ticking = null;
    // 마지막 값 고정 렌더
    renderElapsed(lastElapsed);
    renderResult(lastElapsed);
    $startStop.textContent = '다시 시작';
    $reset.disabled = false;
}

// 리셋
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

// 버튼 바인딩
$startStop.addEventListener('click', () => {
    if (!running) start(); else stop();
});
$reset.addEventListener('click', resetAll);


