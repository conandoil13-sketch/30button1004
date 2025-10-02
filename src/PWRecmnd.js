var ALPH60 = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    '-', '_'
];


function makePassword(len) {
    var out = '';
    for (var i = 0; i < len; i++) {
        var idx = Math.floor(Math.random() * 60);
        out += ALPH60[idx];
    }
    return out;
}


var btn8 = document.querySelector('#gen8');
var btn12 = document.querySelector('#gen12');
var result = document.querySelector('#result');


btn8.onclick = function () {
    var pw = makePassword(8);
    result.textContent = 'pw1 (8자): ' + pw;
};

btn12.onclick = function () {
    var pw = makePassword(12);
    result.textContent = 'pw2 (12자): ' + pw;
};