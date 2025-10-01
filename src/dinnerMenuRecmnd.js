const dinnerMenuKr = document.querySelector('#dinnerMenuKr');
const dinnerMenuJp = document.querySelector('#dinnerMenuJp');
const dinnerMenuCn = document.querySelector('#dinnerMenuCn');
const dinnerMenuUs = document.querySelector('#dinnerMenuUs');
const result_dinnerMenu = document.querySelector('#result_dinnerMenu');

const K_food = ["비빔밥", "김치찌개", "불고기", "된장찌개", "삼겹살", "떡볶이", "순두부찌개", "갈비탕", "칼국수", "김밥", "제육볶음", "냉면", "파전", "해물파전", "콩나물국밥", "감자탕", "오징어볶음", "닭갈비", "보쌈", "쌈밥", "곱창전골", "육개장", "추어탕", "갈비찜", "잡채밥", "김치볶음밥", "순대국밥", "콩국수", "삼계탕", "만두국"];
const J_food = ["초밥", "라멘", "돈부리", "우동", "소바", "가츠동", "오코노미야키", "타코야키", "야키토리", "텐동", "스키야키", "샤브샤브", "카레라이스", "모밀소바", "오뎅탕", "규동", "미소시루", "야키소바", "가라아게", "니쿠쟈가", "오야코동", "타마고동", "이카야키", "아게다시도후", "야키니쿠", "스시롤", "우나기동", "멘치카츠", "히야시추카", "가츠카레"];
const C_food = ["짜장면", "짬뽕", "탕수육", "마파두부", "깐풍기", "유산슬", "팔보채", "고추잡채", "양장피", "동파육", "훠궈", "딤섬", "볶음밥", "양꼬치", "라조기", "공심채볶음", "오향장육", "낙지볶음", "고추잡채밥", "꿔바로우", "삼선짬뽕", "유린기", "계란탕", "청경채볶음", "마라탕", "마라샹궈", "사천탕수육", "중국식냉면", "양배추볶음", "고수무침"];
const U_food = ["스테이크", "파스타", "피자", "햄버거", "샐러드", "리조또", "치킨윙", "바베큐립", "감자튀김", "클럽샌드위치", "프렌치토스트", "시저샐러드", "미트로프", "맥앤치즈", "퀘사디아", "타코", "브런치플레이트", "베이글샌드위치", "팬케이크", "로스트치킨", "감바스알아히요", "부리토", "포테이토스킨", "코브샐러드", "프라이드치킨", "비프스튜", "칠리콘카르네", "새우칵테일", "치즈버거", "BLT샌드위치"];

dinnerMenuKr.onclick = () => {
    let num = Math.floor(Math.random() * K_food.length);
    result_dinnerMenu.innerHTML = `🇰🇷${K_food[num]}!`;
};

dinnerMenuJp.onclick = () => {
    let num = Math.floor(Math.random() * J_food.length);
    result_dinnerMenu.innerHTML = `🇯🇵${J_food[num]}!`;
};

dinnerMenuCn.onclick = () => {
    let num = Math.floor(Math.random() * C_food.length);
    result_dinnerMenu.innerHTML = `🇨🇳${C_food[num]}!`;
};

dinnerMenuUs.onclick = () => {
    let num = Math.floor(Math.random() * U_food.length);
    result_dinnerMenu.innerHTML = `🇺🇸${U_food[num]}!`;
};