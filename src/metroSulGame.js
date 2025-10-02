// ===== 유틸 =====
const sleep = (ms) => new Promise(res => setTimeout(res, ms));
const rand = (min, max) => Math.random() * (max - min) + min;
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const deg = (rad) => rad * (180 / Math.PI);

// 색 팔레트
const LINE_COLORS = ["#0052A4", "#00A84D", "#EF7C1C", "#00A5DE", "#996CAC", "#CD7C2F", "#747F00", "#E6186C", "#BDB092"];
const WORD_COLORS = [...LINE_COLORS, "#f1c40f", "#ffffff", "#ff9f43", "#2ecc71", "#e74c3c"];

// ===== DOM =====
const fade = document.querySelector('#fade');
const screens = {
    intro: document.querySelector('#intro'),
    select: document.querySelector('#select'),
    game: document.querySelector('#game')
};
const trainsBox = screens.intro.querySelector('.trains');
const beatLayer = screens.intro.querySelector('.beat-layer');

const lineBtns = [...document.querySelectorAll('.line-btn')];

const lineTitle = document.querySelector('#lineTitle');
const turnInfo = document.querySelector('#turnInfo');
const homeBtn = document.querySelector('#homeBtn');
const backBtn = document.querySelector('#backBtn');
const input = document.querySelector('#stationInput');
const submit = document.querySelector('#submitBtn');
const usedList = document.querySelector('#usedList');
const statusEl = document.querySelector('#status');

// 템포
const BPM = 120;
const Q = Math.round(60000 / BPM);

// ===== 상태 =====
let currentLineName = null;
let currentLine = [];
let used = [];
let turn = "player";

// ===== 화면 전환 =====
function showScreen(name) {
    for (const key in screens) {
        screens[key].classList.toggle('active', key === name);
    }
}
async function fadeTransition(change) {
    fade.classList.add('show');           // 페이드 인
    await sleep(400);
    await change();                       // 화면 상태 변경
    await sleep(100);
    fade.classList.remove('show');        // 페이드 아웃
}

// ===== 인트로 =====
async function runIntro() {
    showScreen('intro');
    trainsBox.replaceChildren();
    beatLayer.replaceChildren();

    // 기차 여러대
    for (let i = 0; i < 9; i++) setTimeout(spawnTrain, i * 220);

    // "지하철" 4번
    await sleep(900);
    for (let i = 0; i < 4; i++) { showWord("지하철"); await sleep(Q); }

    // "몇호선?" 4번
    await sleep(Q * 0.6);
    for (let i = 0; i < 4; i++) { showWord("몇호선?"); await sleep(Q); }

    // 선택 화면으로
    await fadeTransition(() => {
        showScreen('select');
        // 버튼 낙하
        lineBtns.forEach((btn, i) => setTimeout(() => btn.classList.add('enter'), i * 65));
    });
}

function spawnTrain() {
    // 방향과 경로 계산
    const fromSide = Math.random() < 0.5 ? 'L' : 'R';
    const fromX = fromSide === 'L' ? -20 : 120;
    const toX = fromSide === 'L' ? 120 : -20;
    const startY = rand(10, 90);
    const endY = startY + rand(-25, 25);
    const angle = deg(Math.atan2((endY - startY), (toX - fromX)));
    const dur = rand(1.6, 2.6);
    const scl = rand(0.85, 1.15);
    const clr = choice(LINE_COLORS);

    const t = document.createElement('div');
    t.className = 'train';
    t.style.setProperty('--fromX', `${fromX}vw`);
    t.style.setProperty('--fromY', `${startY}vh`);
    t.style.setProperty('--toX', `${toX}vw`);
    t.style.setProperty('--toY', `${endY}vh`);
    t.style.setProperty('--rot', `${angle}deg`);
    t.style.setProperty('--dur', `${dur}s`);
    t.style.setProperty('--scale', scl);
    t.style.setProperty('--clr', clr);

    for (let i = 0; i < 3; i++) { const car = document.createElement('span'); car.className = 'car'; t.appendChild(car); }
    const head = document.createElement('span'); head.className = 'car head'; t.appendChild(head);

    trainsBox.appendChild(t);
    setTimeout(() => t.remove(), (dur * 1000) + 600);
}

function showWord(text) {
    const w = document.createElement('div');
    w.className = 'word';
    w.textContent = text;
    w.style.left = `${rand(8, 75)}%`;
    w.style.top = `${rand(12, 78)}%`;
    w.style.color = choice(WORD_COLORS);
    beatLayer.appendChild(w);
    requestAnimationFrame(() => w.classList.add('show'));
    setTimeout(() => w.remove(), Q * 0.85);
}

// ===== 노선 데이터 (★ 네가 채우기) =====
const LINES = {
    "1호선": [ // 경원선 방면
        "소요산", "동두천", "보산", "동두천중앙", "지행", "덕정", "덕계", "양주", "녹양",
        "가능", "의정부", "회룡", "망월사", "도봉산", "도봉", "방학", "창동", "녹천",
        "월계", "광운대", "석계", "신이문", "외대앞", "회기", "청량리", "제기동", "신설동",
        "동묘앞", "동대문", "종로5가", "종로3가", "종각", "시청", "서울역", "남영", "용산",
        "노량진", "대방", "신길", "영등포", "신도림", "구로",

        // 인천 방면 (경인선)
        "구일", "개봉", "오류동", "온수", "역곡", "소사", "부천", "중동", "송내",
        "부개", "부평", "백운", "동암", "간석", "주안", "도화", "제물포", "도원",
        "동인천", "인천",

        // 천안·신창 방면 (경부선)
        "구일", "가산디지털단지", "독산", "금천구청", "석수", "관악", "안양", "명학",
        "금정", "군포", "당정", "의왕", "성균관대", "화서", "수원", "세류", "병점",
        "세마", "오산대", "오산", "진위", "송탄", "서정리", "평택", "성환", "직산",
        "두정", "천안", "봉명", "쌍용", "아산", "배방", "온양온천", "신창"],
    "2호선": ["시청", "을지로입구", "을지로3가", "을지로4가", "동대문역사문화공원",
        "신당", "상왕십리", "왕십리", "한양대", "뚝섬", "성수",
        "건대입구", "구의", "강변", "잠실나루", "잠실", "잠실새내",
        "종합운동장", "삼성", "선릉", "역삼", "강남", "교대",
        "서초", "방배", "사당", "낙성대", "서울대입구", "봉천",
        "신림", "신대방", "구로디지털단지", "대림", "신도림",
        "문래", "영등포구청", "당산", "합정", "홍대입구", "신촌",
        "이대", "아현", "충정로", "용답", "신답", "용두", "신설동", "도림천", "양천구청", "신정네거리", "까치산"],
    "3호선": ["대화", "주엽", "정발산", "마두", "백석", "대곡", "화정", "원당",
        "원흥", "삼송", "지축", "구파발", "연신내", "불광", "녹번",
        "홍제", "무악재", "독립문", "경복궁", "안국", "종로3가",
        "을지로3가", "충무로", "동대입구", "약수", "금호", "옥수",
        "압구정", "신사", "잠원", "고속터미널", "교대", "남부터미널",
        "양재", "매봉", "도곡", "대치", "학여울", "대청", "일원",
        "수서", "가락시장", "경찰병원", "오금"],
    "4호선": [ // 북부 구간 (진접~창동)
        "진접", "오남", "별내별가람", "당고개", "상계", "노원", "창동",

        // 도심 구간
        "쌍문", "수유", "미아", "미아사거리", "길음",
        "성신여대입구", "한성대입구", "혜화", "동대문", "동대문역사문화공원",
        "충무로", "명동", "회현", "서울역", "숙대입구", "삼각지",
        "신용산", "이촌", "동작", "총신대입구(이수)", "사당", "남태령",

        // 남부 구간 (과천선/안산선 방면)
        "선바위", "경마공원", "대공원", "과천", "정부과천청사",
        "인덕원", "평촌", "범계", "금정", "산본", "수리산",
        "대야미", "반월", "상록수", "한대앞", "중앙", "고잔",
        "초지", "안산", "신길온천", "정왕", "오이도"],
    "5호선": [  // 서쪽 구간 (강서구)
        "방화", "개화산", "김포공항", "송정", "마곡", "발산",
        "우장산", "화곡", "까치산", "신정", "목동", "오목교",
        "양평", "영등포구청", "영등포시장", "신길", "여의도",
        "여의나루", "마포", "공덕", "애오개", "충정로", "서대문",
        "광화문", "종로3가", "을지로4가", "동대문역사문화공원",
        "청구", "신금호", "행당", "왕십리", "마장", "답십리",
        "장한평", "군자", "아차산", "광나루", "천호", "강동",

        // 동쪽 분기 (상일동 방면)
        "길동", "굽은다리", "명일", "고덕", "상일동",

        // 동쪽 분기 (마천 방면)
        "둔촌동", "올림픽공원", "방이", "오금", "개롱", "거여", "마천"],
    "6호선": [ // 응암순환 구간
        "응암", "역촌", "불광", "독바위", "연신내", "구산",

        // 본선 구간
        "새절", "증산", "디지털미디어시티", "월드컵경기장",
        "마포구청", "망원", "합정", "상수", "광흥창", "대흥",
        "공덕", "효창공원앞", "삼각지", "녹사평", "이태원",
        "한강진", "버티고개", "약수", "청구", "신당",
        "동묘앞", "창신", "보문", "안암", "고려대",
        "월곡", "상월곡", "돌곶이", "석계", "태릉입구",
        "화랑대", "봉화산", "신내"],
    "7호선": [  // 북쪽 구간
        "장암", "도봉산", "수락산", "마들", "노원", "중계",
        "하계", "공릉(서울과학기술대)", "태릉입구", "먹골",
        "중화", "상봉", "면목", "사가정", "용마산", "중곡",
        "군자", "어린이대공원", "건대입구",

        // 강남 구간
        "뚝섬유원지", "청담", "강남구청", "학동", "논현",
        "반포", "고속터미널", "내방", "이수", "남성",
        "숭실대입구", "상도", "장승배기", "신대방삼거리",
        "보라매", "신풍", "대림", "남구로", "가산디지털단지",
        "철산", "광명사거리", "천왕", "온수",

        // 부천·인천 구간
        "까치울", "부천종합운동장", "춘의", "신중동", "부천시청",
        "상동", "삼산체육관", "굴포천", "부평구청", "산곡",
        "석남"],
    "8호선": ["암사", "천호", "강동구청", "몽촌토성", "잠실", "석촌",
        "송파", "가락시장", "문정", "장지", "복정", "산성",
        "남한산성입구", "단대오거리", "신흥", "수진", "모란"],
    "9호선": ["개화", "김포공항", "공항시장", "신방화", "마곡나루", "가양",
        "증미", "등촌", "염창", "신목동", "선유도", "당산",
        "국회의사당", "여의도", "샛강", "노량진", "노들",
        "흑석", "동작", "구반포", "신반포", "고속터미널",
        "사평", "신논현", "언주", "선정릉", "삼성중앙",
        "봉은사", "종합운동장", "삼전", "석촌고분", "석촌",
        "송파나루", "한성백제", "올림픽공원", "둔촌오륜",
        "중앙보훈병원"],
};

// ===== 선택 이벤트 =====
lineBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
        const key = btn.dataset.line;
        if (key === 'R') {
            const names = Object.keys(LINES);
            currentLineName = choice(names);
        } else {
            currentLineName = `${key}호선`;
        }
        currentLine = LINES[currentLineName] || [];

        await fadeTransition(() => {
            setupGame();
            showScreen('game');
        });
        window.scrollTo({
            top: document.body.scrollHeight - 800,
            behavior: "smooth"
        });
    });
});

// ===== 게임 로직 =====
function setupGame() {
    used = [];
    turn = "player";
    lineTitle.textContent = `${currentLineName} 지하철 게임`;
    turnInfo.textContent = "플레이어 차례";
    statusEl.textContent = currentLine.length
        ? "역 이름을 입력하세요."
        : "역 리스트가 비어 있습니다. (app.js의 LINES에 데이터를 채워주세요)";
    usedList.replaceChildren();
    input.disabled = false; submit.disabled = false;
    input.value = ""; input.focus();
}

backBtn.addEventListener('click', async () => {
    await fadeTransition(() => showScreen('select'));
    window.scrollTo({
        top: document.body.scrollHeight - 1600,
        behavior: "smooth"
    });
});

homeBtn.addEventListener('click', async () => {
    await fadeTransition(() => showScreen('intro'));
    runIntro();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

submit.addEventListener('click', handlePlayer);
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') handlePlayer(); });

function handlePlayer() {
    if (turn !== "player") return;
    const station = input.value.trim();
    input.value = "";

    if (!station) { statusEl.textContent = "역 이름을 입력하세요."; return; }
    if (!currentLine.includes(station)) {
        statusEl.innerHTML = `❌ <b>${station}</b> 는(은) ${currentLineName}에 없습니다. 플레이어 패배!`;
        endRound(); return;
    }
    if (used.includes(station)) {
        statusEl.innerHTML = `❌ <b>${station}</b> 는(은) 이미 나왔습니다. 플레이어 패배!`;
        endRound(); return;
    }

    used.push(station);
    addUsed(station, "👤");
    statusEl.textContent = "컴퓨터 차례...";
    turn = "computer";
    setTimeout(computerTurn, 900);
}

function computerTurn() {
    const candidates = currentLine.filter(st => !used.includes(st));
    if (candidates.length === 0) {
        statusEl.textContent = "🎉 컴퓨터가 낼 역이 없습니다. 플레이어 승!";
        endRound(); return;
    }
    const pick = choice(candidates);
    used.push(pick);
    addUsed(pick, "🤖");
    statusEl.textContent = "플레이어 차례";
    turn = "player";
}

function addUsed(station, who) {
    const li = document.createElement('li');
    const badge = document.createElement('span'); badge.className = 'who'; badge.textContent = who;
    const name = document.createElement('span'); name.textContent = station;
    li.appendChild(badge); li.appendChild(name);
    usedList.appendChild(li);
    usedList.scrollTop = usedList.scrollHeight;
}

function endRound() { turnInfo.textContent = "라운드 종료"; input.disabled = true; submit.disabled = true; }

// 시작
runIntro();