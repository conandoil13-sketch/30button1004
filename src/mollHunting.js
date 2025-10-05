const garden = document.querySelector('#garden');
const holes = Array.from(document.querySelectorAll('.hole'));
const scoreEl = document.querySelector('#score');
const missEl = document.querySelector('#miss');
const msgEl = document.querySelector('#msg');
const startBtn = document.querySelector('#startBtn');

let score = 0, miss = 0, playing = false;
let upTimer = null, hideTimer = null, currentHole = null;

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function resetState() {
    score = 0; miss = 0; playing = false;
    scoreEl.textContent = '0';
    missEl.textContent = '0';
    msgEl.textContent = '시작 버튼을 눌러주세요!';
    holes.forEach(h => h.classList.remove('up', 'hit'));
    currentHole = null;
    clearTimeout(upTimer); clearTimeout(hideTimer);
}

function chooseHole() {
    const available = holes.filter(h => h !== currentHole);
    return available[randInt(0, available.length - 1)];
}

function popOnce() {
    if (!playing) return;
    const h = chooseHole();
    currentHole = h;
    h.classList.add('up');
    const upFor = randInt(500, 700); // 올라와 있는 시간 (판정 여유)
    hideTimer = setTimeout(() => {
        if (h.classList.contains('up')) {
            h.classList.remove('up');
            miss++;
            missEl.textContent = String(miss);
            if (miss >= 3) { endGame(); return; }
        }
        scheduleNext();
    }, upFor);
}

function scheduleNext() {
    if (!playing) return;
    upTimer = setTimeout(popOnce, randInt(350, 650));
}

function startGame() {
    resetState();
    playing = true;
    msgEl.textContent = '두더지를 잡아봐!';
    scheduleNext();
}

function endGame() {
    playing = false;
    clearTimeout(upTimer); clearTimeout(hideTimer);
    msgEl.textContent = `게임 종료! 점수: ${score}`;
}

garden.addEventListener('click', (e) => {
    if (!playing) return;
    const hole = e.target.closest('.hole');
    if (!hole) return;
    if (hole.classList.contains('up')) {
        hole.classList.add('hit');
        hole.classList.remove('up');
        score++;
        scoreEl.textContent = String(score);
        setTimeout(() => hole.classList.remove('hit'), 120);
    }
});

startBtn.addEventListener('click', startGame);

resetState();