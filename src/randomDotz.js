
const DOT_SIZE = 10;
const PADDING = 4;

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function addDot() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const maxX = Math.max(PADDING, w - DOT_SIZE - PADDING);
    const maxY = Math.max(PADDING, h - DOT_SIZE - PADDING);

    const x = randInt(PADDING, maxX);
    const y = randInt(PADDING, maxY);

    const d = document.createElement('div');
    d.className = 'dot';
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    d.style.width = DOT_SIZE + 'px';
    d.style.height = DOT_SIZE + 'px';

    document.body.appendChild(d);
}

function resetAll() {
    location.reload();
}


window.addDot = addDot;
window.resetAll = resetAll;


window.addEventListener('DOMContentLoaded', function () {
    const addBtn = document.getElementById('add');
    const resetBtn = document.getElementById('reset');

    if (!addBtn || !resetBtn) {
        console.error('버튼을 못 찾았습니다. HTML id 확인!');
        return;
    }
    addBtn.onclick = addDot;
    resetBtn.onclick = resetAll;

    console.log('[dots] ready');
});