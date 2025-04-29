let runningTotal = 0;
let buffer = "0";
let previousOperator = null;
let last_num = 0; // last number entered
let last_thing = 0; // last thing entered (0: only one num, 1: bin_op, 2: 2nd operand, 3: equal)
let roundPlaces = 12;
const screen = document.querySelector('.screen');
const miniscreen = document.querySelector('.miniscreen');

function buttonClick(value) {
    if (screen.innerText === "Overflow") {
        handlesymbol('C');
    }
    if (isNaN(value)) {
        handlesymbol(value);
    } else {
        handleNumber(value);
        displayScreen();
    }
}

function handlesymbol(symbol) {
    switch (symbol) {
        case 'C':
            last_num = 0;
            last_thing = 0;
            previousOperator = null;
            buffer = '0';
            runningTotal = 0;
            displayScreen();
            miniscreen.innerText = "";
            break;
        case '=':
            // only one number entered, no operation found
            if (last_thing === 0) {
                miniscreen.innerText = roundBuffer() + " =";
            }
            // either a symbol (1) entered, or full binary operation (2)
            else if (last_thing === 1 || last_thing === 2) {
                if (last_thing === 2) last_num = parseFloat(buffer);
                miniscreen.innerText += " " + roundLastNum() + " =";
                flushOperation(last_num, lenDecimal(runningTotal) + lenDecimal(last_num));
                // previousOperator = null;
                buffer = (runningTotal === 0 ? "0" : buffer = runningTotal.toString());
                runningTotal = 0;
            }
            // last thing entered was =
            else {
                if (previousOperator != null) {
                    miniscreen.innerText = roundBuffer() + " " + previousOperator + " " + roundLastNum() + " =";
                    runningTotal = parseFloat(buffer);
                    flushOperation(last_num, lenDecimal(runningTotal) + lenDecimal(last_num));
                    buffer = (runningTotal === 0 ? "0" : buffer = runningTotal.toString());
                    runningTotal = 0;
                }
                else {
                    miniscreen.innerText = roundBuffer() + " =";
                }
            }
            displayScreen();
            last_thing = 3;
            break;
        case '←':
            // last thing entered not a symbol
            if (last_thing != 1) {
                // last thing entered is a equal sign
                if (last_thing === 3) {
                    if (miniscreen.innerText === "") {
                        buffer = removeLastDigit(buffer);
                    }
                    else {
                        miniscreen.innerText = "";
                    }
                }
                else {
                    buffer = removeLastDigit(buffer);
                }
                displayScreen();
            }
            break;
        case '.':
            handleDot();
            break;
        case '+':
        case '−':
        case '×':
        case '÷':
            handleMath(symbol);
            break;
    }
}

function handleDot() {
    if (!buffer.includes(".")) {
        buffer += ".";
    }
    displayScreen();
}

function handleMath(symbol) {
    // if (buffer === '0') {
    //     return;
    // }

    const intBuffer = parseFloat(roundBuffer());
    last_thing = 1;
    last_num = intBuffer;
    miniscreen.innerText = roundBuffer() + " " + symbol;
    if (runningTotal === 0) {
        runningTotal = intBuffer;
    } else {
        flushOperation(intBuffer, lenDecimal(runningTotal) + lenDecimal(last_num));
    }
    previousOperator = symbol;
    buffer = "0";
}

function flushOperation(intBuffer, lenD) {
    if (previousOperator === '+') {
        runningTotal += intBuffer;
    } else if (previousOperator === '−') {
        runningTotal -= intBuffer;
    } else if (previousOperator === '×') {
        runningTotal *= intBuffer;
        runningTotal = parseFloat(runningTotal.toFixed(lenD));
    } else if (previousOperator === '÷') {
        runningTotal /= intBuffer;
    }
    runningTotal = parseFloat(runningTotal.toFixed(roundPlaces));
}

function handleNumber(numberString) {
    if (last_thing === 1) {
        last_thing = 2;
    }
    if (last_thing === 3) {
        miniscreen.innerText = "";
    }
    if (buffer === "0") {
        buffer = numberString;
    } else if (buffer.length < 27) {
        buffer += numberString;
    }
}

function removeLastDigit(buffer) {
    if (buffer.length === 1) {
        buffer = "0";
    } else {
        buffer = buffer.slice(0, -1);
    }
    return buffer;
}

function displayScreen() {
    if (buffer.length >= 23) {
        screen.style.fontSize = "20px";
    }
    else if (buffer.length >= 19) {
        screen.style.fontSize = "25px";
    }
    else if (buffer.length >= 16) {
        screen.style.fontSize = "30px";
    }
    else {
        screen.style.fontSize = "35px";
    }
    if (buffer === "Infinity" || buffer === "-Infinity") {
        screen.innerText = "Overflow";
    }
    else if (buffer.charAt(buffer.length - 1) === "." || buffer.charAt(buffer.length - 1) === "0") {
        screen.innerText = buffer;
    }
    else {
        screen.innerText = roundBuffer();
    }
}

function roundBuffer() {
    return parseFloat(parseFloat(buffer).toFixed(roundPlaces)).toString();
}

function roundLastNum() {
    return parseFloat(parseFloat(last_num).toFixed(roundPlaces)).toString();
}

function lenDecimal(numStr) {
    numStr = numStr.toString();
    if (numStr.indexOf(".") === -1) {
        return 0;
    }
    return numStr.length - numStr.indexOf(".") - 1;
}

function init() {
    document.querySelector('.calc-buttons').addEventListener('click', function (event) {
        buttonClick(event.target.innerText);
    })
}

init();