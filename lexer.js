/*
 * Copyright © 2020 Aleksandr Kolbasov
 */

import {ALPHABET} from "./array-utils.js";

export const CELL_SEPARATOR = '#';

export const Types = {
    OP: 'OP',
    NUM: 'NUM',
    CELL: 'CELL',
};

export class Lexeme {
    /** @type {string} */
    value;
    /** @type {string} */
    type;

    constructor(value, type) {
        this.value = String(value);
        this.type = type;
    }

    set value(value) {
        this.value = String(value);
    }
}


let list = [];
let counter = 0;

/**
 * Разбивает expression на лексемы (токены)
 * @param expression {string} обрабатываемое выражение
 * @returns {Lexeme[]} обнаруженные токены
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
                    isOp(ch) ? op( expression.slice(counter) ) :
                        isChar(ch) ? cell( expression.slice(counter) ) : NaN;

        if (isNaN(counter)) {
            throw `Неизвестный символ '${ch}'`;
        }
    }
    return list;
}

function isOp(ch) {
    return /[\+\-\*\/\(\)]/.test(ch);
}

function isChar(ch) {
    return /[A-Z]/.test(ch);
}

function isNum(ch) {
    return /[0-9\.]/.test(ch);
}

function op(expr) {
    push(expr[0], Types.OP);
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
    list.push( new Lexeme(value, type) );
}
