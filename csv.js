/*
 * Copyright © 2020 Aleksandr Kolbasov
 */

import {resizeArray} from "./array-utils.js";

export function fromCSV(string) {
    let lines = string = String(string).split('\n');
    let newArray = [];
    let counter = 0, columnSize = 0;

    for (let line of lines) {
        // alert(line.includes('\r'));

        let lineArray = line
            .split(',')
            .map(
                value => String(value).replace('\r','')
            );

        // Отсеиваем пустую строку
        if (lineArray.length > 1 || lineArray[0] !== '') {
            newArray[counter++] = lineArray;
        }

        columnSize = Math.max(columnSize, lineArray.length);
    }

    return resizeArray(newArray, newArray.length, columnSize);
}

export function toCSV(array) {
    let csv = '';
    for (let row of array) {
        csv += row.join(',') + '\r\n';
    }
    return csv;
}
