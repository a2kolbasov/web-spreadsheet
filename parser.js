/*
 * Copyright © 2020 Aleksandr Kolbasov
 */

import {Types} from "./lexer.js";

/**
 *
 * @param lexemes {Lexeme[]}
 * @returns {Lexeme[]}
 */
export function parser(lexemes) {
    /** @type {Lexeme[]} */
    let result = [],
        stack = [];

    // Перевод в обратную польскую запись

    for (let token of lexemes) {
        switch (token.type) {
            case Types.NUM:
            case Types.CELL:
                result.push(token);
                break;
            case Types.OP:
                op(token);
                break;
            default:
                throw `Неизвестный тип токена ${token} : ${token.type}`;
        }
    }

    while (stack.length > 0) {
        alert(stack.toString());
        let token = stack.pop();
        alert(typeof token);
        result.push(token);
    }
    return result;

    //// Функция в функции :-)
    function op(token) {
        /** @type {Lexeme} */
        let stackToken = null;

        switch (token.value) {
            case '(':
                stack.push(token);
                break;
            case ')':
                stackToken = stack.pop();
                while (typeof stackToken !== "undefined" && stackToken.value !== '(') {
                    result.push(stackToken);
                    stackToken = stack.pop();
                }
                if (typeof stackToken === "undefined")
                    throw "Ошибка в выражении";
                break;
            case '+':
            case '-':
                // todo: в отдельную функцию
                stackToken = stack.pop();
                while (typeof stackToken !== "undefined" && (stackToken.value === '*' || stackToken.value === '/')) {
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
