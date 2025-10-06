(() => {

    const PAIRS = 8;
    const LIVES_INIT = 7;
    const FLIP_BACK_DELAY = 900;
    const CLEAR_DELAY = 450;


    const ICONS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🐮', '🐷', '🐸', '🐵', '🦁', '🦄'];


    const board = document.getElementById('board');
    const msgEl = document.getElementById('msg');
    const livesEl = document.getElementById('lives');
    const matchesEl = document.getElementById('matches');
    const nextBtn = document.getElementById('nextBtn');


    let deck = [];
    let first = null;
    let lock = false;
    let lives = LIVES_INIT;
    let matches = 0;
    let over = false;


    const shuffle = (arr) => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = (Math.random() * (i + 1)) | 0;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };
    const setMsg = (t) => msgEl.textContent = t;
    const updateHUD = () => {
        livesEl.textContent = lives;
        matchesEl.textContent = matches;
    };


    function makeDeck() {
        const icons = shuffle(ICONS.slice()).slice(0, PAIRS);
        const arr = shuffle([...icons, ...icons]).map((icon, idx) => ({
            id: idx,
            icon,
            cleared: false,
        }));
        return arr;
    }

    function renderBoard() {
        board.innerHTML = '';
        deck.forEach(cardData => {
            const card = document.createElement('button');
            card.className = 'card';
            card.type = 'button';
            card.setAttribute('aria-label', '카드');
            card.dataset.id = cardData.id;
            card.dataset.icon = cardData.icon;

            card.innerHTML = `
        <div class="card-inner">
          <div class="face back">❒</div>
          <div class="face front">${cardData.icon}</div>
        </div>
      `;
            board.appendChild(card);
        });
    }


    function resetGame() {
        over = false;
        lives = LIVES_INIT;
        matches = 0;
        first = null;
        lock = false;
        deck = makeDeck();
        renderBoard();
        setMsg('두 장을 골라봐!');
        updateHUD();
    }


    function flipOpen(el) { el.classList.add('flipped'); }
    function flipClose(el) { el.classList.remove('flipped', 'good', 'bad'); }

    function handleCardClick(e) {
        const card = e.target.closest('.card');
        if (!card || over) return;

        const id = +card.dataset.id;
        const data = deck[id];
        if (!data || data.cleared) return;
        if (lock) return;
        if (card.classList.contains('flipped')) return; // 이미 열린 카드

        flipOpen(card);

        if (!first) {

            first = card;
            setMsg('이제 한 장 더!');
            return;
        }


        lock = true;
        const sameCard = (first === card);
        const match = (!sameCard && first.dataset.icon === card.dataset.icon);

        if (match) {

            first.classList.add('good');
            card.classList.add('good');
            setMsg('정답!');


            deck[+first.dataset.id].cleared = true;
            deck[+card.dataset.id].cleared = true;

            setTimeout(() => {
                first.classList.add('cleared');
                card.classList.add('cleared');
                matches++;
                updateHUD();


                if (matches === PAIRS) {
                    setMsg('🎉 클리어! 다음 게임을 눌러 계속해봐');
                    over = true;
                } else {
                    setMsg('계속 골라봐!');
                }

                first = null;
                lock = false;
            }, CLEAR_DELAY);
        } else {

            first.classList.add('bad');
            card.classList.add('bad');
            setMsg('앗, 다른 카드야…');

            setTimeout(() => {
                flipClose(first);
                flipClose(card);
                lives = Math.max(0, lives - 1);
                updateHUD();

                if (lives <= 0) {
                    setMsg('💀 게임 오버! 다음 게임으로 재도전!');
                    over = true;

                    board.querySelectorAll('.card:not(.cleared)').forEach(c => c.classList.add('locked'));
                } else {
                    setMsg('다시 시도!');
                }

                first = null;
                lock = false;
            }, FLIP_BACK_DELAY);
        }
    }


    board.addEventListener('click', handleCardClick);
    board.addEventListener('pointerdown', (e) => e.preventDefault()); // 모바일 더블탭 확대 방지
    nextBtn.addEventListener('click', resetGame);


    resetGame();
})();