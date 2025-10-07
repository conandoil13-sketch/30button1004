(() => {
    // ===== 재료 정의 =====
    // id: 고정키, name: 표시, cls: 색상 클래스, emoji: 미니/슬라이스 라벨
    const ING = [
        { id: 'bot', name: '바닥빵', cls: 'i-bot', emoji: '🫓' },
        { id: 'patty', name: '패티', cls: 'i-patty', emoji: '🥩' },
        { id: 'cheese', name: '치즈', cls: 'i-cheese', emoji: '🧀' },
        { id: 'lett', name: '양상추', cls: 'i-lett', emoji: '🥬' },
        { id: 'toma', name: '토마토', cls: 'i-toma', emoji: '🍅' },
        { id: 'onio', name: '양파', cls: 'i-onio', emoji: '🧅' },
        { id: 'pick', name: '피클', cls: 'i-pick', emoji: '🥒' },
        { id: 'baco', name: '베이컨', cls: 'i-baco', emoji: '🥓' },
        { id: 'sauc', name: '소스', cls: 'i-sauc', emoji: '🫙' },
        { id: 'top', name: '윗빵', cls: 'i-top', emoji: '🍞' },
    ];
    const byId = Object.fromEntries(ING.map(x => [x.id, x]));

    // ===== DOM =====
    const msgEl = document.getElementById('msg');
    const targetLenEl = document.getElementById('targetLen');
    const stackLenEl = document.getElementById('stackLen');
    const orderList = document.getElementById('orderList');
    const stackEl = document.getElementById('stack');
    const paletteEl = document.getElementById('palette');
    const submitBtn = document.getElementById('submitBtn');
    const nextBtn = document.getElementById('nextBtn');
    const scorePanel = document.getElementById('scorePanel');
    const okCountEl = document.getElementById('okCount');
    const accuracyEl = document.getElementById('accuracy');
    const scoreTable = document.getElementById('scoreTable');

    // ===== 상태 =====
    const MAX_LAYERS = 10;
    let order = [];  // 정답 (아래→위)
    let stack = [];  // 내가 쌓은 것 (아래→위)

    // ===== 유틸 =====
    const rnd = (n) => Math.floor(Math.random() * n);
    const choice = (arr) => arr[rnd(arr.length)];
    const setMsg = (t) => msgEl.textContent = t;
    const updateHUD = () => {
        targetLenEl.textContent = order.length;
        stackLenEl.textContent = stack.length;
    };

    function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1);[a[i], a[j]] = [a[j], a[i]]; } return a; }

    // ===== 주문(정답) 생성 =====
    function makeOrder() {
        // 길이: 3~10층, 항상 빵 아래/위 포함
        const len = 3 + rnd(8); // 3..10
        const middleCount = len - 2;

        const pool = ING.filter(x => x.id !== 'bot' && x.id !== 'top');
        const mids = [];
        for (let i = 0; i < middleCount; i++) {
            // 중복 허용(실제 레시피처럼 치즈 2장 같은 케이스)
            mids.push(choice(pool).id);
        }
        return ['bot', ...mids, 'top'];
    }

    // ===== 렌더링 =====
    function renderOrder() {
        orderList.innerHTML = '';
        // 미니 스택은 아래→위 순서로 보이도록 column-reverse, 따라서 그대로 append 해도 됨.
        order.forEach(id => {
            const ing = byId[id];
            const li = document.createElement('li');
            li.className = `mini-item ${ing.cls}`;
            li.textContent = `${ing.emoji} ${ing.name}`;
            orderList.appendChild(li);
        });
    }

    function renderStack() {
        stackEl.innerHTML = '';
        // 각 슬라이스를 절대배치: 아래층일수록 Y가 낮고 zIndex도 낮게
        stack.forEach((id, i) => {
            const ing = byId[id];
            const div = document.createElement('div');
            div.className = `slice ${ing.cls}`;
            div.style.bottom = `${i * parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sliceH'))}px`;
            div.style.zIndex = 10 + i;
            div.innerHTML = `<span>${ing.emoji}</span> <span>${ing.name}</span>`;
            stackEl.appendChild(div);
            // 살짝 통통 튀는 느낌
            requestAnimationFrame(() => div.classList.add('bump'));
            setTimeout(() => div.classList.remove('bump'), 120);
        });
        updateHUD();
    }

    function renderPalette() {
        paletteEl.innerHTML = '';
        // 바닥/윗빵도 선택 가능하게 해두되, 정답 비교에서 위치만 본다.
        ING.forEach(ing => {
            const b = document.createElement('button');
            b.className = 'ing-btn';
            b.textContent = `${ing.emoji} ${ing.name}`;
            b.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                addLayer(ing.id);
            });
            paletteEl.appendChild(b);
        });
    }

    // ===== 상호작용 =====
    function addLayer(id) {
        if (stack.length >= MAX_LAYERS) {
            setMsg('최대 10층까지!');
            return;
        }
        stack.push(id);
        renderStack();
        setMsg('제출 또는 계속 쌓기');
        scorePanel.classList.add('hidden'); // 새로 쌓으면 이전 점수판 숨김
    }

    function clearStack() {
        stack = [];
        renderStack();
    }

    function submit() {
        if (stack.length === 0) {
            setMsg('먼저 쌓아보자!');
            return;
        }
        // 층수 다를 수 있으니, 정답 길이 기준으로 채점
        const rows = Math.max(order.length, stack.length);
        let ok = 0;

        // 점수표 헤더
        scoreTable.innerHTML = `
      <thead>
        <tr>
          <th>층</th>
          <th>주문(정답)</th>
          <th>내 선택</th>
          <th>판정</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
        const tbody = scoreTable.querySelector('tbody');

        for (let i = 0; i < rows; i++) {
            const needId = order[i];
            const pickId = stack[i];

            const need = needId ? `${byId[needId].emoji} ${byId[needId].name}` : '—';
            const pick = pickId ? `${byId[pickId].emoji} ${byId[pickId].name}` : '—';

            const good = (needId && pickId && needId === pickId);
            if (good) ok++;

            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${need}</td>
        <td>${pick}</td>
        <td class="${good ? 'ok' : 'bad'}">${good ? 'O' : 'X'}</td>
      `;
            tbody.appendChild(tr);
        }

        const acc = Math.round((ok / order.length) * 100);
        okCountEl.textContent = ok;
        accuracyEl.textContent = acc + '%';
        scorePanel.classList.remove('hidden');

        if (acc === 100) setMsg('완벽해! 🎉 다음 햄버거로 가볼까?');
        else if (acc >= 70) setMsg('거의 완벽! 한 번 더 도전해봐!');
        else setMsg('아쉬워! 주문서를 잘 보고 다시 시도!');
    }

    function nextBurger() {
        order = makeOrder();
        renderOrder();
        clearStack();
        scorePanel.classList.add('hidden');
        setMsg('새 주문! 재료를 눌러 쌓아봐!');
        updateHUD();
    }

    // ===== 버튼 =====
    submitBtn.addEventListener('click', submit);
    nextBtn.addEventListener('click', nextBurger);

    // ===== 시작 =====
    renderPalette();
    nextBurger();
})();