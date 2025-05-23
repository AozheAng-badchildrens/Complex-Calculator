let buffer = "0"; // display
let previousOperator = null;
let previousBinOp = null;
let last_num = 0; // last number entered
let last_thing = 0; // last thing entered (0: only one num, 1: bin_op, 2: 2nd operand, 3: equal)
let roundPlaces = 12;
let lastReal = null;
let lastIm = null;
let currReal = null;
let currIm = null;
let currentPart = "0";
let runningTotalR = 0;
let runningTotalI = 0;
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
        case 'i':
            handleIm();
            displayScreen(buffer);
            break;
        case '±':
            handlePM();
            displayScreen(buffer);
            break;
        case '=':
            handleEqual();
            displayScreen(buffer);
            break;
        case '←':
            // last thing entered not a symbol
            handleBack();
            displayScreen(buffer);
            break;
        case '.':
            handleDot();
            displayScreen(buffer);
            break;
        case '+':
        case '−':
        case '×':
        case '÷':
            handleMath(symbol);
            displayScreen(buffer);
            break;
    }
}

function handlePM() {
    if (buffer != "0" && last_thing != 1) {
        buffer = flipSign(buffer);
    }
}

function flipCurPart(state) {
    if (currentPart != "0") {
        if (state === 0) {
            currentPart = "-" + currentPart;
        }
        else {
            currentPart = currentPart.substring(1);
        }
    }
}

function flipSign(numStr) {
    if (numStr.includes('+')) {
        let plus = numStr.indexOf('+');
        numStr = numStr.substring(0, plus) + '−' + numStr.substring(plus + 1);
        flipCurPart(0);
        previousOperator = '−';
    }
    else if (numStr.includes('−')) {
        let minus = numStr.indexOf('−');
        numStr = numStr.substring(0, minus) + '+' + numStr.substring(minus + 1);
        flipCurPart(1);
        previousOperator = '+';
    }
    else {
        if (numStr.at(0) === '-') {
            numStr = numStr.substring(1);
            flipCurPart(1);
        }
        else {
            numStr = "-" + numStr;
            flipCurPart(0);
        }
    }
    return numStr;
}

function unflushPM() {
    if (buffer.at(-1) === " ") {
        if (buffer.includes("i")) {
            currIm = null;
        }
        else {
            currReal = null;
        }
        previousOperator = previousBinOp;
        return true;
    }
    return false;
}

function handleBack() {
    let flushPM = false;
    if (last_thing != 1) {
        // last thing entered is a equal sign
        if (last_thing === 3) {
            if (miniscreen.innerText === "") {
                flushPM = unflushPM();
                buffer = removeLastDigit(buffer);
                if (!flushPM) {
                    currentPart = removeLastDigit(currentPart);
                }
                else {
                    currentPart = buffer;
                }
            }
            else {
                miniscreen.innerText = "";
            }
        }
        else {
            flushPM = unflushPM();
            buffer = removeLastDigit(buffer);
            if (!flushPM) {
                currentPart = removeLastDigit(currentPart);
            }
            else {
                currentPart = buffer;
            }
        }
    }
}



function handleIm() {
    if (last_thing === 1) {
        buffer = '0';
    }
    if (currentPart.at(-1) != "." && currentPart.includes('i') === false) {
        if (currentPart === "0" || currentPart === "1") {
            currentPart = '1i';
            if (last_thing != 1 && previousOperator === "−") {
                currentPart = "-1i";
            }
            if (buffer.charAt(buffer.length - 1) === '0' || buffer.charAt(buffer.length - 1) === '1' || buffer.charAt(buffer.length - 1) === '.') {
                buffer = removeLastDigit(buffer);
            }
            buffer += "i";
            if (buffer.at(0) === '0') {
                buffer = buffer.substring(1);
            }
        }
        else {
            currentPart += "i";
            buffer += 'i';
        }
    }
    if (last_thing === 1) {
        last_thing = 2;
    }
}

function handleDot() {
    if (!currentPart.includes(".") && currentPart.charAt(currentPart.length - 1) != 'i') {
        buffer += ".";
        currentPart += ".";
    }
}

function handleMath(symbol) {
    // last thing entered was same operation, nothing happens
    if (last_thing === 1 && symbol === previousOperator) {
        return;
    }
    // last thing entered was a different operation, switch to that operation
    else if (last_thing === 1) {
        previousOperator = symbol;
        previousBinOp = symbol;
        miniscreen.innerText = removeLastDigit(miniscreen.innerText) + " " + symbol + " ";
        return;
    }
    // There are many cases to consider, review the code thoroughly for this part, not complete
    else if (symbol === "+" || symbol === "−" || symbol === "×" || symbol === "÷") {
        // right now we have say "3i" as currentPart
        // what can happen: 3i + , 2 + 3i +, 2i + 3i +
        let miniDisplay = "";
        if (currentPart.includes("i")) {
            // 3i + or 2 + 3i +
            if (currIm === null) {
                // retrieves 3 to be the currIm given we have not entered imaginary part
                currIm = parseIm(currentPart);
                // 3i +
                if (currReal === null) {
                    if (isPM(symbol)) {
                        buffer += " " + symbol + " ";
                        miniDisplay = " (" + buffer + " ";
                    }
                    // Ex. 3i x
                    else {
                        miniDisplay = buffer + " " + symbol + " ";
                    }
                }
                else {
                    miniDisplay = " " + getComplexString(0, currIm) + ") " + symbol + " ";
                }
            }
            else {
                // Ex. 2i + 3i +
                // tmpIm = 3
                let tmpIm = parseIm(currentPart);
                // totalIm 2 -> 5
                addToTotal(0, currIm + tmpIm);
                currIm += tmpIm;
                lastIm = tmpIm;
                lastReal = null;
                buffer = getComplexString(runningTotalR, runningTotalI);
                if (isPM(symbol)) {
                    buffer += " " + symbol + " ";
                    miniDisplay = "(" + buffer + " ";
                }
                else {
                    miniDisplay = buffer + " " + symbol + " ";
                }
                previousBinOp = symbol;
                resetTotal();
            }
        }
        // just a real number, say 2
        else {
            // 3i + 2 + or 2 +
            if (currReal === null) {
                currReal = parseFloat(roundString(currentPart));
                if (currIm === null) {
                    if (isPM(symbol)) {
                        buffer += " " + symbol + " ";
                        miniDisplay = " (" + buffer + " ";
                    }
                    else {
                        miniDisplay = buffer + " " + symbol + " ";
                    }
                }
                else {
                    miniDisplay = " " + currReal.toString() + ") " + symbol + " ";
                }
            }
            else {
                // Ex. 2 + 3 + 
                let tmpR = parseFloat(roundString(currentPart));
                addToTotal(currReal + tmpR, 0);
                currReal += tmpR;
                lastReal = tmpR;
                lastIm = null;
                buffer = getComplexString(runningTotalR, runningTotalI);
                if (isPM(symbol)) {
                    buffer += " " + symbol + " ";
                    miniscreen.innerText = "(" + buffer + " ";
                    miniDisplay = "";
                }
                else {
                    miniscreen.innerText = buffer + " " + symbol + " ";
                    miniDisplay = "";
                }
                previousBinOp = symbol;
                resetTotal();
            }
        }
        // ready to be added to total, a full imaginary number entered, say 2 + 3i + or 3i + 2 +
        if (currIm != null && currReal != null) {
            addToTotal(currReal, currIm);
            lastIm = currIm;
            lastReal = currReal;
            currIm = null;
            currReal = null;
            previousBinOp = symbol;
            last_thing = 1;
        }
        // no real part
        else if (currReal === null && currIm != null) {
            if (isPM(symbol)) {
                lastIm = currIm;
            }
            else {
                addToTotal(0, currIm);
                lastIm = currIm;
                lastReal = null;
                currIm = null;
                currReal = null;
                previousBinOp = symbol;
                last_thing = 1;
            }
        }
        // no imaginary part
        else if (currIm === null && currReal != null) {
            if (isPM(symbol)) {
                lastReal = currReal;
            }
            else {
                addToTotal(currReal, 0);
                lastIm = null;
                lastReal = currReal;
                currIm = null;
                currReal = null;
                previousBinOp = symbol;
                last_thing = 1;
            }
        }
        else {
            alert("Error: Both REAL and IM NULL");
        }
        currentPart = "0";
        previousOperator = symbol;
        miniscreen.innerText += miniDisplay;
    }
}

function isPM(symbol) {
    return symbol === "+" || symbol === "−";
}

function getCurrIm() {
    if (currentPart.includes("i")) {
        return parseIm(currentPart);
    }
    return 0;
}

function getCurrRe() {
    if (!currentPart.includes("i")) {
        return parseFloat(currentPart);
    }
    return 0;
}

function updateCurr() {
    if (currIm === null) {
        currIm = getCurrIm();
    }
    if (currReal === null) {
        currReal = getCurrRe();
    }
}

function flushOperation(re, im) {
    if (previousBinOp === null) {
        return false;
    }
    if (previousBinOp === '+') {
        addToTotal(re, im);
    } else if (previousBinOp === '−') {
        addToTotal(-re, -im);
    } else if (previousBinOp === '×') {
        mulToTotal(runningTotalR, runningTotalI, re, im);
    } else if (previousBinOp === '÷') {
        if (re == 0 && im == 0) {
            reset();
            buffer = "Cannot Divide by 0";
            return false;
        }
        mulToTotal(runningTotalR, runningTotalI, re, -im);
        mulToTotal(runningTotalR, runningTotalI, 1 / (re * re + im * im), 0);
    }
    runningTotalR = parseFloat(roundString(runningTotalR));
    runningTotalI = parseFloat(roundString(runningTotalI));
    return true;
}

function resetTotal() {
    runningTotalR = 0;
    runningTotalI = 0;
}

function addToTotal(real, im) {
    runningTotalI += im;
    runningTotalR += real;
    runningTotalR = parseFloat(roundString(runningTotalR));
    runningTotalI = parseFloat(roundString(runningTotalI));
}

function mulToTotal(a, b, re, im) {
    runningTotalR = mul(a, re) - mul(b, im);
    runningTotalI = mul(a, im) + mul(b, re);
}

function mul(a, b) {
    let la = lenDecimal(a);
    let lb = lenDecimal(b);
    let res = a * b;
    return parseFloat(res.toFixed(la + lb));
}

function handleEqual() {
    let success = true;
    let miniDisplay = "";
    if (currentPart.includes("i")) {
        let im = parseIm(currentPart);
        // Ex. 2i + 3i
        if (currIm != null) {
            addToTotal(0, currIm);
            previousBinOp = "+";
            last_thing = 2;
        }
        currIm = im;
    }
    else {
        let re = parseFloat(currentPart);
        // Ex. 2 + 3
        if (currReal != null) {
            addToTotal(currReal, 0);
            previousBinOp = "+";
            last_thing = 2;
        }
        currReal = re;
    }
    updateCurr();
    if (last_thing === 0) {
        buffer = getComplexString(currReal, currIm);
        addToTotal(currReal, currIm);
        success = true;
    }
    // Ex. 2 + 3i
    else if (currReal != null && currIm != null) {
        miniDisplay = bracketComplex(runningTotalR, runningTotalI) + " " + previousBinOp + " " + bracketComplex(currReal, currIm);
        miniDisplay += " =";
        success = flushOperation(currReal, currIm);
        if (success) {
            buffer = getComplexString(runningTotalR, runningTotalI);
        }
    }
    if (success) {
        if (last_thing != 0) {
            last_thing = 3;
        }
        if (runningTotalI === 0) {
            currReal = null;
            currentPart = roundString(runningTotalR);
        }
        else if (runningTotalR != 0) {
            currReal = runningTotalR;
            currentPart = roundString(runningTotalI) + "i";
        }
        else {
            currReal = null;
            currentPart = roundString(runningTotalI) + "i";
        }
        currIm = null;
        miniscreen.innerText = miniDisplay;
        resetTotal();
    }
}

function handleNumber(numberString) {
    if (last_thing === 1) {
        buffer = "0";
    }
    if (last_thing === 3) {
        miniscreen.innerText = "";
    }
    if (currentPart === "0") {
        currentPart = numberString;
        if (buffer === "0" || buffer === "Cannot Divide by 0") {
            buffer = currentPart;
        }
        else {
            if (buffer.at(-1) != "0") {
                buffer += currentPart;
            }
            else {
                buffer = buffer.substring(0, buffer.length - 1) + currentPart;
            }
        }
    } else if (currentPart.length < 27) {
        if (currentPart.at(-1) != 'i') {
            currentPart += numberString;
            buffer += numberString;
        }
    }
    if (last_thing != 1 && previousOperator === "−" && currentPart.at(0) != "-") {
        currentPart = "-" + currentPart;
    }
    if (last_thing === 1) {
        last_thing = 2;
    }

}

function removeLastDigit(buffer) {
    if (buffer.length === 1) {
        buffer = "0";
    } else {
        if (buffer.at(-1) === " ") {
            buffer = buffer.slice(0, -2);
        }
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
        screen.innerText = buffer;
    }
}

function reset() {
    buffer = "0"; // display
    previousOperator = null;
    previousBinOp = null;
    last_num = 0; // last number entered
    last_thing = 0; // last thing entered (0: only one num, 1: bin_op, 2: 2nd operand, 3: equal)
    lastReal = null;
    lastIm = null;
    currReal = null;
    currIm = null;
    currentPart = "0";
    runningTotalR = 0;
    runningTotalI = 0;
    miniscreen.innerText = "";
}

/**
 * @param {string} im           Given a imaginary part only number, return it's real part rounded
 * 
 */

function parseIm(im) {
    im = im.substring(0, im.length - 1);
    return parseFloat(roundString(im));
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

function bracketComplex(re, im) {
    let res = getComplexString(re, im);
    if (re != 0 && im != 0) {
        res = "(" + res + ")";
    }
    return res;
}

function getComplexString(re, im) {
    if (re === 0) {
        if (im === 0) {
            return "0";
        }
        else if (im === 1) {
            return "i";
        }
        else if (im === -1) {
            return "− i";
        }
        return im.toString() + "i";
    }
    else if (im === 0) {
        return re.toString();
    }
    else {
        if (im === 1) {
            return re.toString() + " + " + "i";
        }
        else if (im === -1) {
            return re.toString() + " − " + "i";
        }
        else if (im < 0) {
            return re.toString() + " − " + im.toString().substring(1) + "i";
        }
        return re.toString() + " + " + im.toString() + "i";
    }
}

function init() {
    document.querySelector('.calc-buttons').addEventListener('click', function (event) {
        buttonClick(event.target.innerText);
    })
}

init();