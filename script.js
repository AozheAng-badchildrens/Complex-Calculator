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
        displayScreen(buffer);
    }
}

function handlesymbol(symbol) {
    switch (symbol) {
        case 'C':
            reset();
            displayScreen("0");
            break;
        case '=':
            // only one number entered, no operation found
            if (last_thing === 0) {
                miniscreen.innerText = roundString(buffer) + " =";
            }
            else if (previousOperator === "÷" && buffer === "0") {
                displayScreen("Cannot divide by zero");
                reset();
                break;
            }
            // either a symbol (1) entered, or full binary operation (2)
            else if (last_thing === 1 || last_thing === 2) {
                if (last_thing === 2) last_num = parseFloat(buffer);
                miniscreen.innerText += " " + roundString(last_num) + " =";
                flushOperation(last_num, lenDecimal(runningTotal) + lenDecimal(last_num));
                // previousOperator = null;
                buffer = (runningTotal === 0 ? "0" : buffer = runningTotal.toString());
                runningTotal = 0;
            }
            // last thing entered was =
            else {
                if (previousOperator != null) {
                    miniscreen.innerText = roundString(buffer) + " " + previousOperator + " " + roundString(last_num) + " =";
                    runningTotal = parseFloat(buffer);
                    flushOperation(last_num, lenDecimal(runningTotal) + lenDecimal(last_num));
                    buffer = (runningTotal === 0 ? "0" : buffer = runningTotal.toString());
                    runningTotal = 0;
                }
                else {
                    miniscreen.innerText = roundString(buffer) + " =";
                }
            }
            displayScreen(buffer);
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
                displayScreen(buffer);
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
    displayScreen(buffer);
}

function handleMath(symbol) {
    // if (buffer === '0') {
    //     return;
    // }

    const intBuffer = parseFloat(roundString(buffer));
    last_num = intBuffer;
    displayScreen(intBuffer.toString());
    if (runningTotal === 0) {
        runningTotal = intBuffer;
    } else {
        flushOperation(intBuffer, lenDecimal(runningTotal) + lenDecimal(last_num));
    }
    if (last_thing === 2) {
        displayScreen(runningTotal.toString());
    }
    miniscreen.innerText = roundString(runningTotal.toString()) + " " + symbol;
    previousOperator = symbol;
    last_thing = 1;
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

function displayScreen(buffer) {
    if (buffer.length >= 23) {
        screen.style.fontSize = "29px";
    }
    else if (buffer.length >= 18) {
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
    else if (buffer === "Cannot divide by zero") {
        screen.innerText = "Cannot divide by zero";
    }
    else {
        screen.innerText = roundString(buffer);
    }
}

function reset() {
    last_num = 0;
    last_thing = 0;
    previousOperator = null;
    buffer = '0';
    runningTotal = 0;
    miniscreen.innerText = "";
}

// given a string representing a float, return a new string that represents the number to a rounded place
function roundString(numStr) {
    return parseFloat(parseFloat(numStr).toFixed(roundPlaces)).toString();
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