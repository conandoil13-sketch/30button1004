const lamp = document.querySelector('#lamp');
const btn = document.querySelector('#switchBtn');
let level = 0;

btn.onclick = () => {
    level = (level + 1) % 6;

    switch (level) {
        case 0:
            lamp.style.background = "#222";
            lamp.style.boxShadow = "none";
            break;
        case 1:
            lamp.style.background = "#333";
            lamp.style.boxShadow = "0 0 20px #444";
            break;
        case 2:
            lamp.style.background = "#666";
            lamp.style.boxShadow = "0 0 40px #777";
            break;
        case 3:
            lamp.style.background = "#aaa";
            lamp.style.boxShadow = "0 0 60px #bbb";
            break;
        case 4:
            lamp.style.background = "#ddd";
            lamp.style.boxShadow = "0 0 80px #fff";
            break;
        case 5:
            lamp.style.background = "#fff";
            lamp.style.boxShadow = "0 0 120px #fff";
            break;
    }
};