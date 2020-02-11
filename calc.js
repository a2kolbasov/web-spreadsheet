/*
 * Copyright © 2020 Aleksandr Kolbasov
 */

// TODO: РАЗБИТЬ ПО МОДУЛЯМ И КЛАССАМ, ДОБАВИТЬ ДОКУМЕНТАЦИЮ

import {Token, Types, lexer, CELL_SEPARATOR} from "./lexer.js";
import {toNumber} from "./array-utils.js";
import {parser} from "./parser.js";

export class Result {
    constructor(result = '') {
        this.result = String(result);
    }

    set result(result) {
        this.result = String(result);
    }

    toString() {
		return this.result;
	}

    /** @type string */
    result = '';
    hasError = false;
    errorMessage = '';
    /** @type {Token[]} */
    lexemes = []; // Lexeme[]

    polish = []; // Token[]
}

/**
 * Создаёт массив с результатами вычислений выражений в ячейках
 * @param array {String[][]} главный массив
 * @returns {Result[]}
 */
export function calc(array) {
    let resultArray = buildResultArray(array);
    while (_calc(resultArray)) {}
    return resultArray
}

/**
 * Возвращает Result[] с заполнеными лексемами
 * @param array {String[][]} главный массив, обрабатывается лексером
 * @returns {Result[]}
 */
function buildResultArray(array) {
    let resultArray = Array(array.length);

    for (let row = 0; row < array.length; row++) {
        resultArray[row] = Array( array[row].length );

        for (let col = 0; col < array[row].length; col++) {
            let result = new Result();
            let expression = array[row][col];

            try {
                result.lexemes = lexer(expression);
            } catch (e) {
                result.hasError = true;
                result.errorMessage = e;
            }
            resultArray[row][col] = result;
        }
    }
    return resultArray;
}

/**
 * @param resultArray {Result[]}
 * @returns {boolean} были ли новые расчёты во время прогона
 * @private
 */
function _calc(resultArray) {
    // Указывает, были ли изменения в resultArray во время этого прогона
    let changes = false;

    for (let row = 0; row < resultArray.length; row++) {
        for (let col = 0; col < resultArray[row].length; col++) {
            /** @type {Result} */
            let result = resultArray[row][col];

            if (result.hasError || result.result !== '') {
                continue;
            }

            if (result.polish.length === 0 && result.lexemes.length !== 0) {
                changes = true;
                result.polish = parser( result.lexemes );
            }

            if (result.polish.length !== 0 && result.result === '') {
                /** @type Token */
                let value = null;
                try {
                    value = calculatePolish(result.polish, resultArray);
                } catch (e) {
                    result.hasError = true;
                    result.errorMessage = e;
                }
                if (value !== null) {
                    changes = true;
                    result.result = value.value;
                }
            }
        }
    }
    return changes;
}

/**
 * Вычисляем по польской записи
 * @param polish {Token[]}
 * @param resultArray {Result[]} нуден для получения данных из других ячеек
 * @returns {Token|null} токен с результатом или null - при отсутствии значения другой ячейки
 */
function calculatePolish(polish, resultArray) {
    /** @type {Token[]} */
    let stack = [];

    for (let token of polish) {
        if (token.type === Types.NUM) {
            stack.push(token);

        } else if (token.type === Types.CELL) {
            let [col, row] = String(token.value).split(CELL_SEPARATOR);

            /** @type {Result} */
            let [realRow, realCol] = [+row - 1, +toNumber(col) - 1];
            let cell = resultArray[realRow][realCol];

            if (cell.result === '') {
                // Пока не посчитали
                return null;
            } else {
                stack.push( new Token(cell.result, Types.NUM) );
            }

        } else if (token.type === Types.OP) {
            if (stack.length < 2)
                throw `Ошибка в выражении`;
            let op2 = + stack.pop().value,
                op1 = + stack.pop().value;

            switch (token.value) {
                case '+':
                    stack.push(new Token(op1 + op2));
                    break;
                case '-':
                    stack.push(new Token(op1 - op2));
                    break;
                case "*":
                    stack.push(new Token(op1 * op2));
                    break;
                case "/":
                    stack.push(new Token(op1 / op2));
                    break;
            }
        }
    }
    if (stack.length > 1) {
        throw `Ошибка в выражении (в стеке остались числа: ${stack.toString()})`;
    }
    return stack[0];
}
