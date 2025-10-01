const diceOne = document.querySelector('#diceOne');
const diceTwo = document.querySelector('#diceTwo');
const result = document.querySelector('#result');

const diceSymbols = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
let roll1 = 0;
let roll2 = 0;

function judge() {

    diceOne.classList.remove('winner');
    diceTwo.classList.remove('winner');
    result.textContent = '';

    if (roll1 === 0 || roll2 === 0) return;

    const sum1 = roll1;
    const sum2 = roll2;

    if (sum1 > sum2) {
        diceOne.classList.add('winner');
        result.textContent = `플레이어1 승! (${sum1} : ${sum2})`;
    } else if (sum2 > sum1) {
        diceTwo.classList.add('winner');
        result.textContent = `플레이어2 승! (${sum1} : ${sum2})`;
    } else {
        result.textContent = `무승부! (${sum1} : ${sum2})`;
    }
}

let symbol1 = "";
let symbol2 = "";

diceOne.onclick = () => {
    roll1 = Math.floor(Math.random() * 6) + 1;
    symbol1 = diceSymbols[roll1 - 1];
    diceOne.textContent = symbol1;
    console.log("플레이어1:", symbol1, "플레이어2:", symbol2);
    judge();
};

diceTwo.onclick = () => {
    roll2 = Math.floor(Math.random() * 6) + 1;
    symbol2 = diceSymbols[roll2 - 1];
    diceTwo.textContent = symbol2;
    console.log("플레이어1:", symbol1, "플레이어2:", symbol2);
    judge()
};