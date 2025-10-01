function randomColor() {
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

const boxes = document.querySelectorAll('.color-box');
const btn = document.querySelector('#generate');

btn.onclick = () => {
    boxes.forEach(box => {
        let color = randomColor();
        box.style.backgroundColor = color;
        box.textContent = color;  // 헥스값도 같이 보여주기
    });
};