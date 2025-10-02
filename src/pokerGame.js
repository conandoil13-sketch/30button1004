const SUITS = [
    { symbol: '♠', color: 'black', name: 'spades' },
    { symbol: '♥', color: 'red', name: 'hearts' },
    { symbol: '♦', color: 'red', name: 'diamonds' },
    { symbol: '♣', color: 'black', name: 'clubs' }
];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function buildDeck(includeJokers) {
    let deck = [];
    for (let i = 0; i < SUITS.length; i++) {
        const s = SUITS[i];
        for (let j = 0; j < RANKS.length; j++) {
            const r = RANKS[j];
            deck.push({
                suit: s.symbol,
                rank: r,
                color: s.color,
                joker: false,
                code: r + s.symbol
            });
        }
    }
    if (includeJokers) {
        deck.push({ suit: null, rank: 'Joker', color: 'black', joker: true, code: '🃏B' });
        deck.push({ suit: null, rank: 'Joker', color: 'red', joker: true, code: '🃏R' });
    }
    return deck;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
}

function draw(deck, n) {
    const drawn = [];
    for (let k = 0; k < n && deck.length > 0; k++) {
        const idx = Math.floor(Math.random() * deck.length);
        const one = deck.splice(idx, 1)[0];
        drawn.push(one);
    }
    return drawn;
}

function renderCards(where, cards) {
    where.innerHTML = '';
    for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        const el = document.createElement('div');
        el.className = 'card' + (c.color === 'red' ? ' red' : '');
        el.textContent = c.code;
        where.appendChild(el);
    }
}

const withJokers = document.querySelector('#withJokers');
const countInput = document.querySelector('#count');
const btnNew = document.querySelector('#newdeck');
const btnDraw = document.querySelector('#draw');
const btnReset = document.querySelector('#reset');
const remainSpan = document.querySelector('#remain');
const resultBox = document.querySelector('#result');

let deck = [];

function updateRemain() {
    remainSpan.textContent = String(deck.length);
}

function newDeck() {
    deck = shuffle(buildDeck(withJokers.checked));
    updateRemain();
    resultBox.innerHTML = '';
}

function drawN() {
    let n = parseInt(countInput.value, 10);
    if (!n || n < 1) {
        alert('1장 이상 입력하세요.');
        return;
    }
    if (deck.length === 0) {
        alert('덱이 비었습니다. 새 덱을 만들어주세요.');
        return;
    }
    if (n > deck.length) {
        n = deck.length;
    }
    const picked = draw(deck, n);
    renderCards(resultBox, picked);
    updateRemain();
}

function resetAll() {
    location.reload();
}

btnNew.onclick = newDeck;
btnDraw.onclick = drawN;
btnReset.onclick = resetAll;



newDeck();