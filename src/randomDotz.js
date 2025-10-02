var DOT_SIZE = 10;
var PADDING = 4;

var addBtn = document.querySelector('#add');
var resetBtn = document.querySelector('#reset');


function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function addDot() {
    var w = window.innerWidth;
    var h = window.innerHeight;

    var maxX = Math.max(PADDING, w - DOT_SIZE - PADDING);
    var maxY = Math.max(PADDING, h - DOT_SIZE - PADDING);

    var x = randInt(PADDING, maxX);
    var y = randInt(PADDING, maxY);

    var d = document.createElement('div');
    d.className = 'dot';
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    d.style.width = DOT_SIZE + 'px';
    d.style.height = DOT_SIZE + 'px';
    document.body.appendChild(d);
}


function resetAll() {
    location.reload();
}