import { app } from "./fb/firebase.js";
import {getSession, isLoggedIn} from "./fb/session.js";
import { getDatabase, ref, onValue, update, set } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

if (!isLoggedIn()) {
    window.location.href = '/index.html';
}

let session = getSession();
const db = getDatabase(app);

// глобальные переменные
const containerGame = document.getElementById('game-board');
containerGame.classList.add("block");  // запрещаем изначально изменять цвета блоков
const cellGame = Array.from(containerGame.querySelectorAll('#cell'));
let colorArray = ["green", "yellow", "red", "orange", "blue", "pink", "brown", "purple", "white", "gray", "black"];
const countCell = 9;
const divPoints = document.getElementById('points');
let points = 0;   // очки игры
const heards = document.getElementsByClassName("heart").length;
let death_heards = 0;

if (cellGame.length !== countCell)
{
    throw new Error(`Недостаточное количество блоков на поле!`);
}

/* Рандомное распределение названия цветов по блокам */
/* Проверка и запись баллов */
document.getElementById('start_continue').addEventListener('click', () => {

    containerGame.classList.remove("d_none");
    let startButton = document.getElementById("start_continue");

    if (startButton.innerText === "Начать") 
    {
        const header_2 = document.getElementsByClassName("header_2");
        header_2[0].classList.remove("d_none");
        document.getElementById("end").classList.remove("d_none");
    }

    // заполяем игровое поле названиями цветов и раскрашиваем блоки
    if (startButton.innerText === "Начать" || startButton.innerText === "Продолжить")
    {
        for(let i = 0; i < cellGame.length; i++)
        {
            let classColor = getNameColorClass(cellGame[i]);
            if (classColor !== "") 
            {
                cellGame[i].classList.remove(classColor);
            }
            // название
            let name = getRandomNumber(0, colorArray.length);
            cellGame[i].innerText = colorArray[name];

            //цвет
            let color = getRandomNumber(0, colorArray.length);
            cellGame[i].classList.add(colorArray[color]);
        } 

        divPoints.innerText = "Очки: " + points;

        startButton.innerText = "Проверить";

        containerGame.classList.remove("block");
    }

    // узнаем правильные результаты
    else if (startButton.innerText === "Проверить")
    {
        startButton.classList.add("block");
        document.getElementById("end").classList.add("block");

        let rightblock = 0;
        for(let i = 0; i < cellGame.length; i++)
        {
            // название
            let nameColor = cellGame[i].innerText;
            // цвет
            let classColor = getNameColorClass(cellGame[i]);

            if (nameColor === classColor)
            {
                rightblock += 1;
                addwinClass(cellGame[i]);
            }       
        }
         
        if (rightblock === countCell)
        {
            points++;

            startButton.innerText = "Продолжить";
            startButton.classList.remove("block");
            document.getElementById("end").classList.remove("block");
        } 
        else
        {
            death_heards += 1;
            if (death_heards <= heards)
            {
                let live_heard = document.getElementById("live_" + death_heards);
                let death_heard = document.getElementById("death_" + death_heards);
                live_heard.classList.add("d_none");
                death_heard.classList.remove("d_none");


                startButton.innerText = "Продолжить";
                startButton.classList.remove("block");
                document.getElementById("end").classList.remove("block");
            }
            if (death_heards > heards)
            {
                death_heards = 0;
                endGame();
            }

        }
            rightblock = 0;

            divPoints.innerText = "Очки: " + points;
        
        
        
    }
      
})


/* Изменение цвета блока*/
containerGame.addEventListener('click', (event) => {

    // проверяем, клинкнул ли пользователь на плитку на поле
    const cellItem = event.target.closest('div#cell');
    if (!cellItem){
        return;
    }

    // узнаем имя доп класса с цветом, если есть
    let nameClassColor = getNameColorClass(cellItem);    

    // ищем цвет в массиве цветов, если есть, и удаляем доп класс с цветом
    let arrayPosition = colorArray.indexOf(nameClassColor);
    if (arrayPosition > -1)
    {
        cellItem.classList.remove(nameClassColor);        
    }

    // изменяем цвет блока
    let newarrayPosition = arrayPosition + 1;
    if (newarrayPosition < 11)
    {
        cellItem.classList.add(colorArray[newarrayPosition]);
    }
    else 
    {
        cellItem.classList.add(colorArray[0]);
    }
      
    
})


/* Конец игры */
document.getElementById('end').addEventListener('click', () => {
    endGame();
})  

document.getElementById('okey').addEventListener('click', () => {
    document.getElementById('color_block').classList.remove('block');
    document.getElementById('window').classList.add('d_none');
}) 



/* Функции */

// получаем целое рандомное число в промежутке
function getRandomNumber(min, max) 
{
    return Math.floor(Math.random() * (max - min) + min);
}

// получаем название класса цвета
function getNameColorClass(cellBlock) 
{
    let className = cellBlock.className;
    let charPosition = className.indexOf(" ");
    if (charPosition > -1)
    {
        let classColor = className.slice(charPosition + 1);
        return classColor;
    }
    return "";
}

// создаем временный класс для показателя победы
function addwinClass(element) {
    let winClass = "winClass";
    setTimeout(() => {
        element.classList.add(winClass);

        setTimeout(() => {
            element.classList.remove(winClass);
        }, 200)
    }, 100)
 }

// алгоритм конца игры
function endGame() {
    let rezult = 0;
    let dub_points = points;

    const header_2 = document.getElementsByClassName("header_2");
    header_2[0].classList.add("d_none");
     
    // записываем результат в бд
    onValue(ref(db, 'users/' + session.uid), (snapshot) => {
        rezult = snapshot.val().color_block;
        
        document.getElementById("record").innerText = "";
        if (rezult < points) 
        {
            update(ref(db, 'users/' + session.uid),{ 
                color_block: points
            })
            document.getElementById("record").innerText = "Это новый рекорд!";
        }
        document.getElementById("res").innerText = dub_points;
        document.getElementById('color_block').classList.add('block');
        document.getElementById('window').classList.remove('d_none');

        // обнуление результата
        points = 0;
        divPoints.innerText = "";
    });

    // обнуляем доску игры
    for(let i = 0; i < cellGame.length; i++)
        {
            cellGame[i].innerText = ""; 
            let classColorName = getNameColorClass(cellGame[i]);
            cellGame[i].classList.remove(classColorName);

        } 
    document.getElementById("start_continue").innerText = "Начать";
    containerGame.classList.add("block");    

    for(let a = 1; a<=heards; a++)
    {
        let live_heard = document.getElementById("live_" + a);
        let death_heard = document.getElementById("death_" + a);
        live_heard.classList.remove("d_none");
        death_heard.classList.add("d_none");
    }

    containerGame.classList.add("d_none");
    document.getElementById("start_continue").classList.remove("block");
    document.getElementById("end").classList.remove("block");
    document.getElementById("end").classList.add("d_none");

    

    
}

