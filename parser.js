/*
 * Copyright © 2020 Aleksandr Kolbasov
 */

import {Types, Token} from "./lexer.js";

/**
 * Переводит токены в обратную польскую запись
 * @param tokens {Token[]} токены из лексера
 * @returns {Token[]} обратная польская запись
 */
export function parser(tokens) {
    /** @type {Token[]} */
    let result = [],
        stack = [];

    // Перевод в обратную польскую запись

    for (let token of tokens) {
        switch (token.type) {
            case Types.NUM:
            case Types.CELL:
                result.push(token);
                debugger
                break;
            case Types.OP:
            case Types.BRACKET:
                op(token);
                break;
            default:
                throw `Неизвестный тип токена ${token} : ${token.type}`;
        }
    }

    while (stack.length > 0) {
        // alert(stack.toString());
        let token = stack.pop();
        // alert(typeof token);
        result.push(token);
    }
    return result;

    //// Функция в функции :-)
    /** @param token {Token} */
    function op(token) {
        /** @type {Token} */
        // let stackToken = null;

        switch (token.value) {
            case '(':
                token.priority = -1;
                pushToStack(token);
                return;
            case ')':
                while (stack.length > 0) {
                    let stackToken = stack.pop();
                    if (stackToken.value !== '(')
                        result.push(stackToken);
                    else
                        return;
                }
                throw "Ошибка в выражении (проверьте кол-во скобок)";
            case '*':
            case '/':
                token.priority = 10;
                pushToStack(token);
                return;
            case '+':
            case '-':
                token.priority = 5;
                pushToStack(token);
                return;
            default:
                throw `Нет инструкции к токену`
        }
    }

    /**
     * Размещает и выталкивает токены в/из стека согласно приоритету
     * @param token {Token}
     */
    function pushToStack(token) {
        while (stack.length > 0) {
            let stackToken = stack[stack.length - 1];

            if (stackToken.priority >= token.priority) {
                stack.pop();
                result.push(stackToken);
            } else {
                break;
            }
        }
        stack.push(token);
    }
}
