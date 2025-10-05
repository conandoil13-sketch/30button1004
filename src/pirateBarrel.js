
const SLOTS = 24;


let bombIndex = Math.floor(Math.random() * SLOTS);
let locked = false;


const barrel = document.querySelector('#barrel');
const pirate = document.querySelector('#pirate');
const statusEl = document.querySelector('#status');
const resetBtn = document.querySelector('#resetBtn');
const slots = Array.from(document.querySelectorAll('.slot'));


statusEl.textContent = '구멍을 선택해 칼을 꽂아보자!';


slots.forEach(btn => {
    btn.addEventListener('click', () => {
        if (locked || btn.classList.contains('used')) return;

        const idx = Number(btn.dataset.idx);
        btn.classList.add('used');


        if (idx === bombIndex) {

            pirate.classList.add('pop');
            barrel.classList.add('boom');
            statusEl.className = 'ok';
            statusEl.textContent = `펑! 해적이 튀어나왔어! (정답: ${idx + 1}번)`;
            locked = true;

            slots.forEach(s => s.classList.add('disabled'));
        } else {

            statusEl.className = '';
            statusEl.textContent = `아깝다! (${idx + 1}번) 계속 시도해봐.`;

            btn.classList.add('disabled');
        }
    });
});


resetBtn.addEventListener('click', () => {
    locked = false;
    bombIndex = Math.floor(Math.random() * SLOTS);
    statusEl.className = '';
    statusEl.textContent = '새 라운드! 구멍을 선택해 칼을 꽂아보자!';
    pirate.classList.remove('pop');
    barrel.classList.remove('boom');
    slots.forEach(s => s.classList.remove('used', 'disabled'));
});