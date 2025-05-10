let runningTotal = 0;
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
            // // only one number entered, no operation found
            // if (last_thing === 0) {
            //     miniscreen.innerText = roundString(buffer) + " =";
            // }
            // // either a symbol (1) entered, or full binary operation (2)
            // else if (last_thing === 1 || last_thing === 2) {
            //     if (last_thing === 2) last_num = parseFloat(buffer);
            //     if (previousOperator === "÷" && last_num === 0) {
            //         displayScreen("Cannot divide by zero");
            //         reset();
            //         break;
            //     }
            //     else {
            //         miniscreen.innerText += " " + roundString(last_num) + " =";
            //         flushOperation(last_num, lenDecimal(runningTotal) + lenDecimal(last_num));
            //         // previousOperator = null;
            //         buffer = (runningTotal === 0 ? "0" : buffer = runningTotal.toString());
            //         runningTotal = 0;
            //     }
            // }
            // // last thing entered was =
            // else {
            //     if (previousOperator === "÷" && last_num === 0) {
            //         displayScreen("Cannot divide by zero");
            //         reset();
            //         break;
            //     }
            //     else if (previousOperator != null) {
            //         miniscreen.innerText = roundString(buffer) + " " + previousOperator + " " + roundString(last_num) + " =";
            //         runningTotal = parseFloat(buffer);
            //         flushOperation(last_num, lenDecimal(runningTotal) + lenDecimal(last_num));
            //         buffer = (runningTotal === 0 ? "0" : buffer = runningTotal.toString());
            //         runningTotal = 0;
            //     }
            //     else {
            //         miniscreen.innerText = roundString(buffer) + " =";
            //     }
            // }
            handleEqual();
            displayScreen(buffer);
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
    if (buffer != "0") {
        buffer = flipSign(buffer);
    }
    else if (last_thing === 1) {
        buffer = flipSign(last_num.toString());
        last_num = -last_num;
    }
}

function flipSign(numStr) {
    if (numStr.charAt(0) === '-') {
        numStr = numStr.substring(1, numStr.length);
    }
    else {
        numStr = "-" + numStr;
    }
    return numStr;
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
        miniscreen.innerText = roundString(runningTotal.toString()) + " " + symbol;
        return;
    }
    // There are many cases to consider, review the code thoroughly for this part, not complete
    else if (symbol === "+" || symbol === "−" || symbol === "×" || symbol === "÷") {
        // right now we have say "3i" as currentPart
        // what can happen: 3i + , 2 + 3i +, 2i + 3i +

        if (currentPart.includes("i")) {
            // 3i + or 2 + 3i +
            if (currIm === null) {
                // retrieves 3 to be the currIm given we have not entered imaginary part
                currIm = parseIm(currentPart);
                if (currReal === null && isPM(symbol)) {
                    buffer += " " + symbol + " ";
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
                }
                previousBinOp = symbol;
                // displayScreen(buffer);
                resetTotal();
                // make sure to put equal sign stuff in a function rather in the body
                // handlesymbol('=');
            }
        }
        // just a real number, say 2
        else {
            // 3i + 2 + or 2 +
            if (currReal === null) {
                currReal = parseFloat(roundString(currentPart));
                if (currIm === null && isPM(symbol)) {
                    buffer += " " + symbol + " ";
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
                }
                previousBinOp = symbol;
                resetTotal();
                // handlesymbol('=');
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
        // alert(currentPart);
        currentPart = "0";
        previousOperator = symbol;
    }

    // const intBuffer = parseFloat(roundString(buffer));
    // last_num = intBuffer;
    // displayScreen(intBuffer.toString());
    // if (runningTotal === 0) {
    //     runningTotal = intBuffer;
    //     if (previousOperator === '−') {
    //         runningTotal *= -1;
    //     }
    // } else {
    //     flushOperation(intBuffer, lenDecimal(runningTotal) + lenDecimal(last_num));
    // }
    // if (last_thing === 2) {
    //     displayScreen(runningTotal.toString());
    // }
    // miniscreen.innerText = roundString(runningTotal.toString()) + " " + symbol;
    // previousOperator = symbol;
    // last_thing = 1;
    // buffer = "0";
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
    if (currentPart.includes("i")) {
        let im = parseIm(currentPart);
        // Ex. 2i + 3i
        if (currIm != null) {
            addToTotal(0, currIm);
            previousBinOp = "+";
            last_thing = 2;
        }
        currIm = im;
        // alert(currIm);
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
    }
    // Ex. 2 + 3i
    else if (currReal != null && currIm != null) {
        success = flushOperation(currReal, currIm);
        if (success) {
            buffer = getComplexString(runningTotalR, runningTotalI);
            resetTotal();
        }
    }
    if (success) last_thing = 3;
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
            buffer += currentPart;
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
        buffer = "";
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
        screen.innerText = buffer;
    }
}

function reset() {
    runningTotal = 0;
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

function getComplexString(re, im) {
    // alert(re);
    // alert(im);
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