/*
 * Copyright © 2020 Aleksandr Kolbasov
 */

import * as utils from "./array-utils.js";
import * as csv from "./csv.js";
import * as calculate from "./calc.js";

////////////////////////////////
// Init block
////////////////////////////////
let vue = new Vue({
    el: '#tables',
    data: {
        arr: [[]],
        calcArr: [[]],
        canExportResults : false,
    },
    methods: {
    }
});
// Начальное значение
resize(5, 5);

////////////////////////////////
// Для построения таблиц
////////////////////////////////

function getArr() {
    return utils.delId(vue._data.arr);
}
function setArr(arr) {
    vue._data.arr = utils.addId(arr);
}
function getCalcArr() {
    return utils.delId(vue._data.calcArr);
}
function setCalcArr(calcArr) {
    vue._data.calcArr = utils.addId(calcArr);
}

// Меняем размер главной таблицы
export function resize(rows, columns) {
    let arr = getArr();

    if (rows === undefined || columns === undefined) {
        rows = +prompt('Кол-во строк', '5');
        columns = +prompt('Кол-во столбцов', '5');
    }
    // Минимальный размер таблицы -- 1 x 1
    rows = rows > 0 ? rows : 1;
    columns = columns > 0 ? columns : 1;

    let newArr = utils.resizeArray(arr, rows, columns);
    setArr(newArr);
}

export function calc() {
    setCalcArr( calculate.calc( getArr() ) );
    // throw 'todo' // todo calc()
}

////////////////////////////////
// CSV
////////////////////////////////

export function csvImport() {
    // https://developer.mozilla.org/ru/docs/Web/API/File/Using_files_from_web_applications

    let fileImport = document.getElementById('fileImport');
    // fileImport.click();
    let file = fileImport.files[0];

    let fileReader = new FileReader();
    fileReader.onload = (event) => setArr( csv.fromCSV(event.target.result) );
    fileReader.readAsText(file);
}

export function csvExport() {
    let link = document.getElementById('fileExport');
    let csvString = csv.toCSV(getArr());
    let href = 'data:text/csv;charset=UTF-8,' + window.encodeURIComponent(csvString);
    // console.log(`href = ${href}`);
    link.setAttribute('href', href);
    link.setAttribute('download', 'table.csv');
    link.click();
}

export function csvExportResults() {
    throw 'todo' // todo csvExportResults()
}
