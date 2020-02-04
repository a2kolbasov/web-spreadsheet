let vue = new Vue({
    el: '#app',
    data: {
        one: "some text",
        q: [1,2,3,4]
    }
});



let log = function () {
    let table = document.getElementById('t');
    let td = table.getElementsByTagName('td');
    for (let t of td) {
        console.log(t);
    }
};

setInterval(log,500);
