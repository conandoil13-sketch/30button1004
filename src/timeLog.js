const time_button = document.querySelector('.time_button');
const time_log = document.querySelector('.time_log');
const time_stop_button = document.querySelector('.time_stop_button');

time_stop_button.onclick = () => {
    setTimeout(() => {
        location.reload();
    }, 1);
};
time_button.onclick = () => {
    const now = new Date();
    const hhmmss = now.toLocaleTimeString('ko-KR', { hour12: false });
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    const time = `${hhmmss}.${ms}`;

    const li = document.createElement('div');
    li.textContent = time;
    time_log.appendChild(li);
};