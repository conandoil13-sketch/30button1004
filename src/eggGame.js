const egg = document.querySelector('#egg');
const message = document.querySelector('#message');
const remaining = document.querySelector('#remaining');

const animals = [
    "🐶 강아지", "🐱 고양이", "🐥 병아리",
    "🐢 거북이", "🐰 토끼", "🦊 여우",
    "🐻 곰", "🦁 사자", "🐸 개구리", "🐼 판다"
];

const rarity = [
    "⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"
];

let target = Math.floor(Math.random() * 100) + 1;
let count = 0;



egg.onclick = () => {
    count++;
    updateRemaining();

    if (count >= target) {
        const baby = animals[Math.floor(Math.random() * animals.length)]
        const star = rarity[Math.floor(Math.random() * rarity.length)];
        message.textContent = `우와! ${star}${baby}(이)가 태어났어요!`;


        setTimeout(() => {
            message.textContent = "";
            count = 0;
            target = Math.floor(Math.random() * 200) + 1;
            egg.textContent = "🥚";
            updateRemaining();
        }, 2000);
    }
};

function updateRemaining() {
    const left = target - count;
    remaining.textContent = `남은 클릭 횟수: ${left}`;
}