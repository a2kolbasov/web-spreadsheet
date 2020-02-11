/*
 * Copyright © 2020 Aleksandr Kolbasov
 */

export const CELL_SEPARATOR = '#';

export const Types = {
    OP: 'OP',
    NUM: 'NUM',
    CELL: 'CELL',
    BRACKET : 'BRACKET',
};

export class Token {
    /** @type string */
    value;
    /** @type string */
    type;
    /** @type number */
    priority;

    constructor(value, type, priority = 100) {
        this.value = String(value);
        this.type = type;
        this.priority = priority;
    }

    set value(value) {
        this.value = String(value);
    }
}


let list = [];
let counter = 0;

/**
 * Разбивает expression на токены (лексемы)
 * @param expression {string} обрабатываемое выражение
 * @returns {Token[]} обнаруженные токены
 */
export function lexer(expression) {
    // init
    expression = String(expression).toUpperCase();
    list = [];
    counter = 0;

    if (isOp(expression[0])) {
        // (-A1 + 2) -> (0 - A1 + 2)
        push('0', Types.NUM);
    }

    while (counter < expression.length) {
        let ch = expression[counter];
        counter +=
            ch === ' ' ? 1 :
                isNum(ch) ? num( expression.slice(counter) ) :
                    isBracket(ch) ? bracket(ch) :
                        isOp(ch) ? op( expression.slice(counter) ) :
                            isChar(ch) ? cell( expression.slice(counter) ) : NaN;

        if (isNaN(counter)) {
            throw `Неизвестный символ '${ch}'`;
        }
    }
    return list;
}

function isBracket(ch) {
    return /[\(\)]/.test(ch);
}

function isOp(ch) {
    return /[\+\-\*\/]/.test(ch);
}

function isChar(ch) {
    return /[A-Z]/.test(ch);
}

function isNum(ch) {
    return /[0-9\.]/.test(ch);
}

function _includes(ch) {
}

function op(expr) {
    push(expr[0], Types.OP);
    return 1;
}

function bracket(ch) {
    push(ch, Types.BRACKET); // ch[0]
    return 1;
}

function cell(expr) {
    // Как пример: cell = AB12
    let cell = '';
    let position = 0;

    // Вычлиняем буквы
    do {
        cell += expr[position];
    } while (isChar( expr[++position] ));

    // Символ-разделитель
    cell += CELL_SEPARATOR;

    if (! isNum(expr[position]))
        throw syntaxError(position);

    // Вычленяем цифры
    do {
        cell += expr[position];
    } while (isNum( expr[++position] ));

    push(cell, Types.CELL);
    return position;
}

function num(expr) {
    let num = '';
    let position = 0;

    do {
        num += expr[position];
    } while (isNum(expr[++position]));

    push(num, Types.NUM);
    return position;
}

function syntaxError(position) {
    return `Синтаксическая ошибка @${counter + position}`;
}

/**
 * @param value {string}
 * @param type {string}
 */
function push(value, type) {
    list.push( new Token(value, type) );
}
