
let level = 0;

function getChance() {
    let c = 0.95 - level * 0.05;
    if (c < 0.1) c = 0.05;
    return c;
}


function pct(x) {
    return Math.round(x * 100);
}


function updateUI(msg = '') {
    document.querySelector('#level').textContent = `현재 강화: +${level}`;
    document.querySelector('#chance').textContent = `${pct(getChance())}%`;
    if (msg) document.querySelector('#result').textContent = msg;
}


updateUI();


document.querySelector('#btn').addEventListener('click', () => {
    const chance = getChance();

    if (Math.random() < chance) {

        level++;
        updateUI(`✅ 성공! 이제 +${level}`);
    } else {

        let msg = `❌ 실패… (+${level})`;


        if (Math.random() < 0.5) {

            if (Math.random() < 0.5) {
                document.querySelector('#result').textContent = '💥 대실패! 초기화됩니다…';

                setTimeout(() => location.reload(), 400);
                return;
            } else {

                level = Math.max(0, level - 1);
                msg = `⬇️ 실패로 레벨 하락… 현재 +${level}`;
            }
        }

        updateUI(msg);
    }
});