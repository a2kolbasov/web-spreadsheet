/*
 * Copyright © 2020 Aleksandr Kolbasov
 */

'use strict';

// TODO: РАЗБИТЬ ПО МОДУЛЯМ И КЛАССАМ, ДОБАВИТЬ ДОКУМЕНТАЦИЮ

const TYPES = {
    OP: 1,
    NUM: 2,
    CELL: 3,
};

class Token {
    constructor(value, type) {
        this.value = value;
        this.type = type;
    }
}

class Result {
    constructor(result = '') {
        this.result = String(result);
    }
    result = '';
    error = false;
    errorMessage = '';
    polish = []; // Token[]
}


function isOp(ch) {
    return '+-*/'.split('').includes(ch);
}
function isChar(ch) {
    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    // Проверка, что это начало токена
    return alphabet.split('').includes(ch);
}
function isNum(ch) {
    // Работаем посимвольно, про точку не забываем
    return isFinite(+(ch)) || ch === '.';
}

let list = [];
let counter = 0;
function lexer(expression) {
    list = [];
    counter = 0;
    if (isOp(expression[0])) {
        // (-A1 + 2) -> (0 - A1 + 2)
        list.push(new Token('0', TYPES.NUM));
    }
    while (counter < expression.length) {
        let ch = expression[counter];
        counter +=
            isNum(ch) ? num() :
                isOp(ch) ? op() :
                    isChar(ch) ? cell() :
                        throw `Неизвестный символ ${ch} @${counter}`;
    }
    return list;
}

function calc(arr) {
    let resultArray = arr.slice();
    for (let row = 1; row < resultArray.length; row++) {
        for (let col = 1; col < resultArray[row].length; col++) {
            resultArray[row][col] = new Result();
        }
    }
}
// fixme Зачем expr ???
function _calc(expression, resultArray) {
    let changes = false;
    for (let row = 1; row < resultArray.length; row++) {
        for (let col = 1; col < resultArray[row].length; col++){
            let result = resultArray[row[col]];

            if (result.polish === []) {
                changes = true;
                let parseResult = parser(expression);
                result.error = !!parseResult.errorMessage; // Boolean()
                result.errorMessage = parseResult.errorMessage;
                result.polish = parseResult.polish;
            }

            if (result.error || result.value !== '')
                continue;

            if (result.value === '') {
                // Вычисляем по польской записи
                let value = calculatePolish(result.polish, resultArray);
                if (value !== null) {
                    changes = true;
                    result.value = value;
                }
            }
        }
    }
    return changes;
}

// fixme: Функция из index.html, нужно импортировать!
function toNumber(alphas) {
    alphas = alphas.toString().toUpperCase().split('');
    // console.log(`alphas: ${alphas}, length: ${alphas.length}`);
    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = 0;
    for (let alpha of alphas) {
        // console.log(`alpha: ${alpha}`);
        if (result !== 0) result *= alphabet.length;
        result += alphabet.indexOf(alpha) + 1;
        // console.log(`result: ${result}`);
    }
    return result;
}

function calculatePolish(polish, resultArray) {
    // Копируем массив
    polish.slice();
    for (let i = 0; i < polish.length; i++) {
        let token = polish[i];
        if (token.type === TYPES.CELL) {
            let {row, col} = String(token.value).split('#');
            let cell = resultArray[ +toNumber(row) ][ +col ];
            if (cell.result === '') {
                // Пока не посчитали
                return null;
            } else {
                token.type = TYPES.NUM;
                token.value = cell.result;
            }
        } else if (token.type === TYPES.OP) {
            let op1 = +polish.shift();
            let op2 = +polish.shift();
            polish.shift();
            switch (token.value) {
                case '+':
                    polish.unshift(new Result(op1 + op2));
                    break;
                case '-':
                    polish.unshift(new Result(op1 - op2));
                    break;
                case "*":
                    polish.unshift(new Result(op1 * op2));
                    break;
                case "/":
                    polish.unshift(new Result(op1 / op2));
            }
            i -= 2;
        }
    }
    return polish[0];
}

function parser(expression) {
    try {
        let polish = _parser(expression);
        return {polish};
    } catch (err) {
        return {errorMessage: err};
    }
}

function _parser(expr) {
    let tokens = lexer(expr);
    let result = [],
        stack = [];

    // Расчёт через обратную польскую запись

    for (let token of tokens) {
        switch (token.type) {
            case TYPES.NUM:
            case TYPES.CELL:
                result.push(token);
                break;
            case TYPES.OP:
                calculate(token);
                break;
            default:
                throw `Неизвестный тип токена ${token} : ${token.type}`;
        }
    }

    while (stack.length > 0) {
        result.push(stack.pop());
    }
    return result;

    //// Функция в функции :-)
    function calculate(token) {
        let stackToken;
        switch (token.value) {
            case '(':
                stack.push(token);
                break;
            case ')':
                stackToken = stack.pop();
                while (stackToken.value !== '(') {
                    result.push(stackToken);
                    stackToken = stack.pop();
                }
                break;
            case '+':
            case '-':
                // todo: в отдельную функцию
                stackToken = stack.pop();
                while (stackToken.value === '*' || stackToken.value === '/') {
                    result.push(stackToken);
                    stackToken = stack.pop();
                }
                stack.push(stackToken);
                stack.push(token);
                break;
            case '*':
            case '/':
                stack.push(token);
                break;
        }
    }
}


function op(expr) {
    list.push(new Token(expr, TYPES.OP));
    if (expr.length > 2)
        return 1;
    else
        throw syntaxError(1);
}
function cell(expr) {
    // Как пример: cell = AB12
    let cell = '';
    let i = 0;
    // Вычлиняем буквы
    do {
        cell += expr[i];
    } while (isChar(++i));

    // Символ-разделитель
    cell += '#';

    if (! isNum(expr[i]))
        throw syntaxError(i);
    // Вычленяем цифры
    do {
        cell += expr[i];
    } while (isNum(expr[++i]));

    if (i === expr.length || isOp(expr[i])) {
        list.push( new Token(cell, TYPES.CELL) );
        return i;
    } else {
        throw syntaxError(i);
    }
}
function num(expr) {
    let num = '';
    let i = 0;
    do {
        num += expr[i];
    } while (isNum(expr[++i]));
    if (isOp(expr[i]) || i === expr.length)
        return i;
    else
        throw syntaxError(i);
}

function syntaxError(position) {
    return `Синтаксическая ошибка @${counter + position}`;
}
