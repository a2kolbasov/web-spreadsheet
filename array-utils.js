/*
 * Copyright © 2020 Aleksandr Kolbasov
 */

/*
*   *
*   *
->
#   A   B
1   *   *
2   *   *
 */
export function addId(array) {
    let newArr = [['#']];

    for (let id = 0; id < array[0].length;) {
        newArr[0].push( toAlpha(++id) );
    }

    for (let row = 0; row < array.length; row++) {
        newArr[row + 1] = [String(row + 1)].concat(array[row]);
    }

    return newArr;
}

// удаляет id строк и столбцов
export function delId(array) {
    let newArray = [];
    // копируем без 1-ой строки и 1-ых элементов оставшихся строк
    for (let i = 1; i < array.length; i++) {
        newArray[i - 1] = array[i].slice(1);
    }
    return newArray;
}

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Перевод id ячейки в букву (для обозначения столбцов)
// 1 -> A, 26 -> Z, 27 -> AA...
export function toAlpha(number) {
    let result = '';

    while (number > 0) {
        number--;
        result += ALPHABET[number % ALPHABET.length];
        number = Math.floor(number / ALPHABET.length);
        // console.log(`result: ${result}, number: ${number}`);
    }

    return result.split('').reverse().join('');
}

// Перевод названия столбца в его id
// A -> 1 ...
export function toNumber(chars) {
    chars = String(chars).toUpperCase();
    // console.log(`chars: ${chars}, length: ${chars.length}`);

    let result = 0;
    for (let char of chars) {
        // console.log(`char: ${char}`);
        if (result !== 0) result *= ALPHABET.length;
        result += ALPHABET.indexOf(char) + 1;
        // console.log(`result: ${result}`);
    }

    return result;
}

export function resizeArray(arr, rows, columns) {
    let newArr = Array(rows);

    for (let row = 0; row < rows; row++) {
        newArr[row] = Array(columns);
        for (let col = 0; col < columns; col++) {
            let oldValue =
                // проверка, что ячейка существует в старом массиве
                arr.length > row && arr[row].length > col ?
                    arr[row][col] : undefined;
            // если не существует или не определён, то ''
            newArr[row][col] = oldValue !== undefined ?
                String(oldValue) : '';
        }
    }
    return newArr;
}
