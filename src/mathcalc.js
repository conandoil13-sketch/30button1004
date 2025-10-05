const OPS = ['+', '-', '×', '÷'];
const MAX = 999;
const ROUND_DELAY = 700;


let round = 1;
let score = 0;
let answer = null;


const $round = document.querySelector('#round');
const $score = document.querySelector('#score');
const $question = document.querySelector('#question');
const $left = document.querySelector('#choiceL');
const $right = document.querySelector('#choiceR');
const $feedback = document.querySelector('#feedback');
const $next = document.querySelector('#nextBtn');
const $reset = document.querySelector('#resetBtn');


const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];


function genNearMiss(correct) {
    const base = Math.max(5, Math.floor(Math.abs(correct) / 10) + 5);
    let delta = randInt(1, base);
    if (Math.random() < 0.5) delta = -delta;
    let miss = correct + delta;

    if (miss === correct) miss += (delta > 0 ? 1 : -1);
    return miss;
}


function makeDivision() {
    const b = randInt(1, 9);
    const k = randInt(0, Math.floor(MAX / b));
    const a = b * k;
    return [a, b, k];
}


function makeSubtraction() {
    const a = randInt(0, MAX);
    const b = randInt(0, MAX);
    if (a >= b) return [a, b, a - b];
    return [b, a, b - a];
}


function makeAddition() {
    const a = randInt(0, MAX);
    const b = randInt(0, MAX);
    return [a, b, a + b];
}
function makeMultiplication() {
    const a = randInt(0, Math.floor(MAX / 3));
    const b = randInt(0, 9);
    return [a, b, a * b];
}


function makeProblem() {
    const op = pick(OPS);

    let a, b, result;
    if (op === '+') [a, b, result] = makeAddition();
    if (op === '-') [a, b, result] = makeSubtraction();
    if (op === '×') [a, b, result] = makeMultiplication();
    if (op === '÷') [a, b, result] = makeDivision();


    const correct = result;
    let miss = genNearMiss(correct);

    while (miss === correct) miss = genNearMiss(correct);


    if (Math.random() < 0.5) {
        $left.textContent = String(correct);
        $right.textContent = String(miss);
        $left.dataset.correct = '1';
        $right.dataset.correct = '0';
    } else {
        $left.textContent = String(miss);
        $right.textContent = String(correct);
        $left.dataset.correct = '0';
        $right.dataset.correct = '1';
    }


    $question.textContent = `${a} ${op} ${b} = ?`;
    $feedback.textContent = '';
    answer = correct;
    $next.disabled = true;


    [$left, $right].forEach(btn => btn.classList.remove('correct', 'wrong'));
}

function handlePick(btn) {
    const isCorrect = btn.dataset.correct === '1';

    if (isCorrect) {
        score++;
        btn.classList.add('correct');
        $feedback.textContent = `정답! (${answer})`;
    } else {
        btn.classList.add('wrong');
        $feedback.textContent = `오답! 정답은 ${answer}`;

        const other = (btn === $left) ? $right : $left;
        if (other.dataset.correct === '1') other.classList.add('correct');
    }


    $score.textContent = String(score);
    $next.disabled = false;


    if (ROUND_DELAY > 0) {
        setTimeout(() => {
            round++;
            $round.textContent = String(round);
            makeProblem();
        }, ROUND_DELAY);
    }
}


$left.addEventListener('click', () => handlePick($left));
$right.addEventListener('click', () => handlePick($right));

$next.addEventListener('click', () => {
    round++;
    $round.textContent = String(round);
    makeProblem();
});

$reset.addEventListener('click', () => {
    round = 1; score = 0;
    $round.textContent = '1';
    $score.textContent = '0';
    makeProblem();
});


makeProblem();