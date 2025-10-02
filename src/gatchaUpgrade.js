const orange = document.querySelector('#orange');
const result = document.querySelector('#result');
const tries = document.querySelector('#tries');
const gems = document.querySelector('#gems')
const won = document.querySelector('#won')

let num = 0;
let gemstone = 0
let wons = 0

orange.onclick = () => {
    let roll = Math.random();

    if (roll < 0.05) {
        result.innerHTML = '🌟 레전드 아이템 🌟';
        result.style.backgroundColor = 'yellow';
    } else if (roll < 0.2) {
        result.innerHTML = '⭐ 희귀 아이템 ⭐';
        result.style.backgroundColor = 'blue';
    } else {
        result.innerHTML = '일반 아이템';
        result.style.backgroundColor = 'green';
    };

    num += 1;
    tries.innerHTML = num + '회';

    gemstone += 30;
    gems.innerHTML = gemstone + '젬'

    wons += 900;
    won.innerHTML = '당신은' + wons + '원을 운영자에게 바쳤습니다.';
}

