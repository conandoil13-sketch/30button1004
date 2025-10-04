const container = document.querySelector('.game-container');
const startBtn = document.querySelector('#startBtn');

startBtn.addEventListener('click', (e) => {
    spawnButtons(e.target);
});

function createButton(x, y) {
    const btn = document.createElement('button');
    btn.className = 'spawn';
    btn.textContent = '✨';

    const hue = Math.floor(Math.random() * 360);
    btn.style.background = `hsl(${hue}, 100%, 65%)`;
    btn.style.boxShadow = `0 0 20px hsla(${hue}, 100%, 60%, 0.5)`;

    btn.style.top = `${y}px`;
    btn.style.left = `${x}px`;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        spawnButtons(e.target);
    });

    container.appendChild(btn);
}


function spawnButtons(baseBtn) {
    const rect = baseBtn.getBoundingClientRect();
    const baseX = rect.left + rect.width / 2;
    const baseY = rect.top + rect.height / 2;

    const count = Math.floor(Math.random() * 2) + 2; // 2~3개
    for (let i = 0; i < count; i++) {
        const offsetX = (Math.random() - 0.5) * 400;
        const offsetY = (Math.random() - 0.5) * 400;

        const newX = Math.min(window.innerWidth - 40, Math.max(40, baseX + offsetX));
        const newY = Math.min(window.innerHeight - 40, Math.max(40, baseY + offsetY));

        createButton(newX, newY);
    }
}