import { app } from "../js/fb/firebase.js";
import {getSession, isLoggedIn} from "../js/fb/session.js";
import { getDatabase, ref, update, onValue, set } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

if (!isLoggedIn()) {
    window.location.href = '/index.html';
}

let session = getSession();
const db = getDatabase(app);


// объект со всеми элементами игры
const gameNode = document.getElementById('game'); 
 // игровое поле для плиток 
const containerNode = document.getElementById('thirty'); 
// массив ячеек
const itemNodes = Array.from(containerNode.querySelectorAll('.item')); 
// правильное число ячеек
const countItems = 30;   
// номер пустого элемента
const blankNumder = 30;  
// элемент с секундомером
let timer2 = document.getElementById('timer');
let seconds = 0;
let minutes = 0;
let hours = 0;
let interval;

// проверяем количество ячеек на html-странице
if (itemNodes.length !== countItems){
    throw new Error(`Not ${countItems} items in HTML`);
}




/** РАСПОЛОЖЕНИЕ */ 
// скрываем последний блоки
itemNodes[countItems - 1].style.display = 'none';
//создаем матрицу
let matrix = getMatrix(itemNodes.map((item) => Number(item.dataset.matrixId)))
//распределяем ячейки
setPositionItems(matrix);




/** ПЕРЕМЕШИВАНИЕ */ 
// максимальное количество замен
const maxmixingCount = 300;
// таймер
let timer;
// флаг - идет ли сейчас перемешивание или нет
let flagMixing = false;
// имя дополнительного класса
const mixingClassName = 'gameMixing';
document.getElementById('mixing').addEventListener('click', () => {
    // началось перемешивание 
    flagMixing = true;
    // обнуление таймер
    clearInterval(timer); 
    // переменная для подсчета перемешиваний
    let mixingCount = 0;
    // добавление всему блоку с игрой дополнительного класса
    gameNode.classList.add(mixingClassName);

    // перемешивание с интервалом в 20 миллисекунд
    timer = setInterval(() => {
        randomSwap(matrix);  
        setPositionItems(matrix); 

         mixingCount += 1;

         // если количество перемешиваний достигло максимума
        if (mixingCount >= maxmixingCount){
            // удаление дополнительного класса
            gameNode.classList.remove(mixingClassName);
            // обнуление таймера
            clearInterval(timer);
            // перемешивание закончилось
            flagMixing = false;
            interval = setInterval(updateTime, 1000);
        }
    }, 20);  
})





/** ВЕРНУТЬ В ИЗНАЧАЛЬНОЕ ПОЛОЖЕНИЕ */ 
document.getElementById('begin').addEventListener('click', () => { 
    console.log(timer2.textContent);
    clearInterval(interval);
    seconds = 0;
    minutes = 0;
    hours = 0;
    timer2.textContent = '00:00:00';
    // перезаписываем матрицу
    matrix = getMatrix(itemNodes.map((item) => Number(item.dataset.matrixId)))
    //распределяем ячейки
    setPositionItems(matrix);  
})





/** ИЗМЕНЕНИЕ ПОЗИЦИИ БЛОКА ПРИ КЛИКЕ */ 
containerNode.addEventListener('click', (event) => {
    // проверяем, выполняется ли перемешивание
    if (flagMixing){
        return;
    }
    // проверяем, клинкнул ли пользователь на плитку на поле
    const buttonNode = event.target.closest('button');
    if (!buttonNode){
        return;
    }
    // получаем номер нажимаемой плитки
    const buttonNumber = Number(buttonNode.dataset.matrixId);  
    // получаем координаты нажимаемой плитки
    const buttonCoords = findCoordinatesByNumber(buttonNumber, matrix); 
    // получаем координаты пустой плитки
    const blankCoords = findCoordinatesByNumber(blankNumder, matrix); 
    // проверяем, возможно ли поменять местами нажимаемую и пустую плитки
    const isValid = isValidForSwap(buttonCoords, blankCoords);

    // если замена возможна
    if (isValid){
        // меняем местами плитки в матрице
        swap(blankCoords, buttonCoords, matrix);
        // меняем местами плитки на странице браузера
        setPositionItems(matrix);
    }
})





/** ИЗМЕНЕНИЕ ПОЗИЦИИ БЛОКА ПРИ НАЖАТИИ СТРЕЛОЧКАМИ */ 
window.addEventListener('keydown', (event) => {
    // проверяем, выполняется ли перемешивание
    if (flagMixing){
        return;
    }
    // проверяем нажатие стрелок
    if(!event.key.includes('Arrow')){
        return;
    }
    // получаем координаты пустой плитки
    const blankCoords = findCoordinatesByNumber(blankNumder, matrix); 
    // запоминаем координаты пустой ячейки
    const buttonCoords = {                
        x: blankCoords.x,
        y: blankCoords.y,
    }
    // разделяем название стрелок, убирая часть 'Arrow'
    const direction = event.key.split('Arrow')[1].toLowerCase();
    const maxIndexY = matrix.length;
    const maxIndexX = matrix[0].length;
    // получаем координаты в зависимости от нажатой стрелки
    switch (direction) {
        case 'up':
            buttonCoords.y += 1;
            break;
        case 'down':
            buttonCoords.y -= 1;
            break;
        case 'left':
            buttonCoords.x += 1;
            break;
        case 'right':
            buttonCoords.x -= 1;
                break;
    }
    // проверяем, возможно ли поменять пустую плитку с плиткой по пученным координатам
    if(buttonCoords.y >= maxIndexY || buttonCoords.y < 0 || 
        buttonCoords.x >= maxIndexX || buttonCoords.x < 0){
        return;
    }
    // меняем местами плитки в матрице
    swap(blankCoords, buttonCoords, matrix);
    // меняем местами плитки на странице браузера
    setPositionItems(matrix);
})






/** ФИНАЛ */ 
// созадем линейным массив с правильным порядком плиток
const winArray = new Array(30).fill(0).map((item, i) => i + 1);
// нахвание дополнительного класса
const winClass = 'thirtyWon';


document.getElementById('okey').addEventListener('click', () => {
    document.getElementById('game').classList.remove('block');
    document.getElementById('window').classList.add('d_none');
}) 




/** ФУНКЦИИ */ 
// получаем матрицу ячеек
function getMatrix(arr){
    const matrix = [[], [], [], [], []];
    let y = 0;
    let x = 0;

    for(let i = 0; i < arr.length; i++){
        if (x >= 6){
            y++;
            x = 0;
        }
        matrix[y][x] = arr[i];
        x++;
    }
    return matrix;
}

//расположение ячеек на страничке
function setPositionItems(matrix){
    for(let y = 0; y < matrix.length; y++){
        for(let x = 0; x < matrix[y].length; x++){
            const value = matrix[y][x];
            const node = itemNodes[value - 1];
            setNodeStyles(node, x, y);
        }
    }
}

// расчет расположения ячеек на табличке
function setNodeStyles(node, x, y){
    const shiftPs = 100;
    node.style.transform = `translate(${x * shiftPs}%, ${y * shiftPs}%)`;
}

// передвинули одну ячейку для перемешивания
let blockedCoords = null;
function randomSwap(matrix){
    const blankCoords = findCoordinatesByNumber(blankNumder, matrix); 
    const validCoords = findValidCoords({ blankCoords, matrix, blockedCoords});

    const swapCoords = validCoords[
        Math.floor(Math.random() * validCoords.length)
    ]
    swap(blankCoords, swapCoords, matrix);
    blockedCoords = blankCoords;
}

// ищем координаты ячеек, которые можно менять местами при перемешивании
function findValidCoords({blankCoords, matrix, blockedCoords}){
    const validCoords = [];

    for(let y = 0; y < matrix.length; y++){
        for(let x = 0; x < matrix[y].length; x++){
            if(isValidForSwap({x, y}, blankCoords)) {
                if(!blockedCoords || !(blockedCoords.x === x && blockedCoords.y === y)){
                    validCoords.push({x, y});
                }
            }
        }
    }
    return validCoords;
}

// проверяем возможность пережвижения ячейки
function isValidForSwap(coosds1, coosds2){
    const diffX = Math.abs(coosds1.x - coosds2.x);
    const diffY = Math.abs(coosds1.y - coosds2.y);

    return (diffX === 1 || diffY === 1) && (coosds1.x == coosds2.x || coosds1.y == coosds2.y);
}

// меняем местами ячейки
function swap(coosds1, coosds2, matrix){
    const number1 = matrix[coosds1.y][coosds1.x];
    matrix[coosds1.y][coosds1.x] = matrix[coosds2.y][coosds2.x];
    matrix[coosds2.y][coosds2.x] = number1;

    if(isWon(matrix)) {
        addwinClass();

        let dub_time = timer2.textContent;

        // записываем результат в бд
        if (timer2.textContent !== '00:00:00')
        {
            let rezult = '';
            onValue(ref(db, 'users/' + session.uid), (snapshot) => {
                rezult = snapshot.val().puzzle_30;

                document.getElementById("record").innerText = "";
                // если время меньше, чем в последний раз
                if (rezult > timer2.textContent) 
                {
                    update(ref(db, 'users/' + session.uid),{ 
                        puzzle_30: timer2.textContent
                    })
                    document.getElementById("record").innerText = "Это новый рекорд!";
                }
                // если время еще не зафиксированно
                else if (rezult === '00:00:00') 
                {
                    update(ref(db, 'users/' + session.uid),{ 
                        puzzle_30: timer2.textContent
                    })
                    document.getElementById("record").innerText = "Это новый рекорд!";
                }

                document.getElementById("res").innerText = dub_time;
                document.getElementById('game').classList.add('block');
                document.getElementById('window').classList.remove('d_none');

                // очищаем секундомер
                clearInterval(interval);
                seconds = 0;
                minutes = 0;
                hours = 0;
                timer2.textContent = '00:00:00';
                
            })  
        }
        

        
    }
}

// вычисляем координаты нажимаемой ячейки
function findCoordinatesByNumber(number, matrix){
    for(let y = 0; y < matrix.length; y++){
        for(let x = 0; x < matrix[y].length; x++){
            if(matrix[y][x] === number){
                return {x, y};
            }
        }
    }
    return null;
}

// проверяем совпадение с финальными матрицами
function isWon(matrix) {
    const flatMatrix = matrix.flat();
    for(let i = 0; i < countItems; i++){
        if (flatMatrix[i] !== winArray[i]){
            return false;
        }
    }
    return true;
}

 // создаем временный класс для показателя победы
 function addwinClass() {
    setTimeout(() => {
        containerNode.classList.add(winClass);

        setTimeout(() => {
            containerNode.classList.remove(winClass);
        }, 1000)
    }, 200)
 }

 function updateTime() {
    seconds++;
    if (seconds === 60) {
      minutes++;
      seconds = 0;
    }
    if (minutes === 60) {
      hours++;
      minutes = 0;
    }
    timer2.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }