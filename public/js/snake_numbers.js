import { app } from "../js/fb/firebase.js";
import {getSession, isLoggedIn} from "../js/fb/session.js";
import { getDatabase, ref, set, update, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

if (!isLoggedIn()) {
    window.location.href = '/index.html';
}

let session = getSession();
const db = getDatabase();


const containerNode = document.getElementById('game-board'); 
const cellNodes = Array.from(containerNode.querySelectorAll('#cell')); 
const countItems = 36;
let numberArray = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
let startGameBool = false;
const divPoints = document.getElementById('points');
const hod = document.getElementById('hod');
const chat = document.getElementById('chat');
let points = 0;
const heards = document.getElementsByClassName("heart").length;
let death_heards = 0;

let countChain = 0;  // кол-во цепочек для сбора
let countBlock = 0;  // кол-во блоков для сбора



// проверяем количество ячеек на html-странице
if (cellNodes.length !== countItems){
    throw new Error(`Not ${countItems} items in HTML`);
}

//создаем матрицу
let matrix = getMatrix(cellNodes);

// начинаем игру, заполняем ее начальными значениями
document.getElementById('start_continue').addEventListener('click', () => {

    if (document.getElementById('start_continue').innerText === "Начать")
    {
        // очищаем поле
        clearInnerText();  
        startGameBool = true;
        document.getElementById('body2').classList.remove("d_none");

        fillingMatrix();

        divPoints.innerText = "Очки: " + points;

        document.getElementById('start_continue').innerText = "Закончить"
    }
    else if (document.getElementById('start_continue').innerText === "Закончить")
    {
        death_heards = 0;
        endGame();
    }
})

// окошко с результатом
document.getElementById('okey').addEventListener('click', () => {
    document.getElementById('number_block').classList.remove('block');
    document.getElementById('window').classList.add('d_none');
}) 


// Переменные для хранения текущих классов блоков и флага нажатия ЛКМ
let countBlock_help = 0;
let cellClasses = [];
let isMouseDown = false;
let relatedTargetCoords = {                
    x: 0,
    y: 0,
};


document.getElementById('game-board').addEventListener('mouseup', () => {
    if (startGameBool && isMouseDown) 
        {
            isMouseDown = false;
            
            // если цепочка от 1 до 10
            if (orderBool(cellClasses))
            {  
                for(let x = 0; x<cellClasses.length; x++)
                {
                    points += 1;
                    countBlock_help += 1; 
                }
            }

            // если цепочка одинаковая
            if (duplicateBool(cellClasses))
            {
                for(let x = 0; x<cellClasses.length; x++)
                {
                    points += 1;
                    countBlock_help += 1; 
                }
            }

            divPoints.innerText = "Очки: " + points;

            countChain -= 1;
            hod.innerText = "Ходов: " + countChain;
            if (countChain === 0 || countBlock_help >= countBlock)
            {
                check();
            }
            
        }
        cellClasses = [];
}) 


// Навешиваем обработчики событий на каждый блок
cellNodes.forEach(block => {
    // нажатие ЛКМ и удерживание
    block.addEventListener('mousedown', (event) => {
        if (startGameBool) 
        {            
        
            cellClasses = [];

            isMouseDown = true;
            // проверка на повторное наведение на блок
            if ((cellClasses.indexOf(event.target) === -1) && (event.target.className.indexOf("dop") === -1))
            {
                cellClasses.push(event.target);  
                event.target.classList.add("dop");    
            } 
            
        }
    });

    // при зажатой ЛКМ перемещение (увод с блока)
    block.addEventListener('mouseout', (event) => {
        if (startGameBool){
            if (isMouseDown) {      
                 
                // получаем координаты откуда увели мышь
                relatedTargetCoords = findCoordinates(event.target, matrix); 
                     
            }
        }    
    });
  
    // при зажатой ЛКМ перемещение (наведение на блок)
    block.addEventListener('mouseover', (event) => {
        if (startGameBool){
            if (isMouseDown) { 

                // получаем координаты куда навели мышь
                let targetCoords = findCoordinates(event.target, matrix); 
                // проверяем, возможно ли движение
                let isValid = isValidForSwap(targetCoords, relatedTargetCoords);
                
                // если движение не возможно
                if ((!isValid) || (event.target.className.indexOf("dop") > -1) && (cellClasses.indexOf(event.target) === -1)){
                    isMouseDown = false;
                    for(let i = 0; i < cellClasses.length; i++)
                    {
                        cellClasses[i].classList.remove("dop");
                    }
                    cellClasses = [];
                }
                
                // проверка на повторное наведение на блок
                else if ((cellClasses.indexOf(event.target) === -1) && (event.target.className.indexOf("dop") === -1))
                {
                    cellClasses.push(event.target);  
                    event.target.classList.add("dop");    
                }
               
            }
        }    
    });

    // отжимание ЛКМ
    block.addEventListener('mouseup', () => {
        if (startGameBool) 
        {
            isMouseDown = false;

            // если цепочка от 1 до 10
            if (orderBool(cellClasses))
            {
                for(let x = 0; x<cellClasses.length; x++)
                {
                    points += 1;
                    countBlock_help += 1; 
                }
            }
            // если цепочка одинаковая
            else if (duplicateBool(cellClasses))
            {
                for(let x = 0; x<cellClasses.length; x++)
                {
                    points += 1;
                    countBlock_help += 1; 
                }             
            }
            else 
            {
                for(let i = 0; i < cellClasses.length; i++)
                {
                    cellClasses[i].classList.remove("dop");
                }
            }


            divPoints.innerText = "Очки: " + points;

            if (cellClasses.length !== 0) 
            {
                countChain -= 1;
            }
            hod.innerText = "Ходов: " + countChain;

            if (countChain === 0 || countBlock_help >= countBlock)
            {
                check();

            }
            
        }
        cellClasses = [];
    });
});




/** ФУНКЦИИ */ 
// получаем матрицу ячеек
function getMatrix(arr)
{
    const matrix = [[], [], [], [], [], []];
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

// получаем целое рандомное число в промежутке
function getRandomNumber(min, max) 
{
    return Math.floor(Math.random() * (max - min) + min);
}

// отвечает на вопрос - гененрируем ли цепочку чисел или нет?
function getChainBool() 
{
    let bool = getRandomNumber(0, 3);
    if (bool === 1)  return true;
    else return false;
    
}

// получаем длину генерируемой цепочки
function getLengthChain() 
{
    return getRandomNumber(2, 11);
    
}

// получаем все возможные пусые блоки вокруг одного блока
function getPositions(x, y) 
{
    let arrayPos = [];

    if (x+1 < matrix[y].length){
        if (matrix[y][x+1].innerText === "") arrayPos.push("" + y + " " + (x+1));  
    }
    

    if (x-1 >= 0){
        if (matrix[y][x-1].innerText === "") arrayPos.push("" + y + " " + (x-1));
    }
    

    if (y+1 < matrix.length){
        if (matrix[y+1][x].innerText === "") arrayPos.push("" + (y+1) + " " + x);
    }

    if (y-1 >= 0){
        if (matrix[y-1][x].innerText === "") arrayPos.push("" + (y-1) + " " + x);
    }


    return arrayPos;
    
}

// очистка блоков поля
function clearInnerText()
{
    for(let y = 0; y < matrix.length; y++)
    {
        for(let x = 0; x < matrix[y].length; x++)
        {
            matrix[y][x].innerText = "";
            matrix[y][x].classList.remove("dop");
            let name = getNameColorClass(matrix[y][x]);
            if (name !== "") matrix[y][x].classList.remove(name);
        }
    }    
}

// получаем название класса цифры
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

// проверка цепочки - это цепочка от 1 до 10?
function orderBool(cellClasses)
{
    if (cellClasses.length > numberArray.length)
    {
        return false;
    }
    if (cellClasses.length < 2)
    {
        return false;
    }
    let count = 0;
    for(let i = 0; i < cellClasses.length; i++)
    {
        if (numberArray[i] === cellClasses[i].innerText)
        {
            count++;
        }
        else break;
    }
    if (count === cellClasses.length)
    {
        return true;
    }
    else return false;

}

// проверка цепочки - это цепочка из одинаковых элементов?
function duplicateBool(cellClasses)
{
    if (cellClasses.length < 2)
    {
        return false;
    }
    for(let i = 0; i < cellClasses.length; i++)
    {
        if (cellClasses[0].innerText !== cellClasses[i].innerText)
        {
            return false;            
        }
    }
    return true;  
}

// заполнение матрицы
function fillingMatrix()
{
    clearInnerText();
    countBlock = 0;
    countChain = 0;

    for(let y = 0; y < matrix.length; y++)
    {
        for(let x = 0; x < matrix[y].length; x++)
        {
            if (matrix[y][x].innerText === "") { 
                if (getChainBool())  
                {                   
                    let lengthChain = getLengthChain();
                    
                    let x1 = x;
                    let y1 = y;

                    for(let i = 0; i < lengthChain; i++) 
                    {
                        matrix[y1][x1].innerText = numberArray[i];
                        matrix[y1][x1].classList.add(numberArray[i]);

                        
                        countBlock +=1;
                        if (i == 1) { countChain += 1;}

                        let arrChain = getPositions(x1, y1);
                        if (arrChain.length !== 0)
                        { 
                            let str = arrChain[getRandomNumber(0, arrChain.length)];
                            let res = str.split(' ');
                            x1 = parseInt(res[1], 10);
                            y1 = parseInt(res[0], 10);                         

                        }
                        else
                        {
                            if (i == 0) { countBlock -=1;}
                            break;
                        }
                    }
                }             
                else 
                {
                    let num = getRandomNumber(0, numberArray.length);
                    let lengthChain = getLengthChain();

                    // укорачиваем цепочку из одинаковых блоков
                    if (lengthChain >= 7) {lengthChain /= 2;}
                    
                    let x1 = x;
                    let y1 = y;

                    for(let i = 0; i < lengthChain; i++) 
                    {
                        matrix[y1][x1].innerText = numberArray[num];
                        matrix[y1][x1].classList.add(numberArray[num]);

                        
                        countBlock +=1;
                        if (i == 1) { countChain += 1;}

                        let arrChain = getPositions(x1, y1);
                        if (arrChain.length !== 0)
                        { 
                            let str = arrChain[getRandomNumber(0, arrChain.length)];
                            let res = str.split(' ');
                            x1 = parseInt(res[1], 10);
                            y1 = parseInt(res[0], 10);                            

                        }
                        else 
                        {
                            if (i == 0) { countBlock -=1;}
                            break;
                        }
                    }
                }  
            }
        }
    }
    hod.innerText = "Ходов: " + countChain;
}

// вычисляем координаты нажимаемой ячейки
function findCoordinates(el, matrix){
    for(let y = 0; y < matrix.length; y++){
        for(let x = 0; x < matrix[y].length; x++){
            if(matrix[y][x] === el){
                return {x, y};
            }
        }
    }
    return null;
}

// проверяем возможность пережвижения ячейки
function isValidForSwap(coosds1, coosds2){
    const diffX = Math.abs(coosds1.x - coosds2.x);
    const diffY = Math.abs(coosds1.y - coosds2.y);

    return (diffX === 1 || diffY === 1) && (coosds1.x == coosds2.x || coosds1.y == coosds2.y);
}

// функция задержки
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// проверка при использовании ходов или собирании всех возможных блоков
function check() {
    if (countBlock_help >= countBlock) 
    {
        chat.innerText = "Ты молодец!";
        countBlock_help = 0;
        points += 100;
        divPoints.innerText = "Очки: " + points;
        containerNode.classList.add("block");
        document.getElementById("header_2").classList.add("TrueRes");
        sleep(3000).then(() => { 
            chat.innerText = "";
            fillingMatrix();
            containerNode.classList.remove("block");
            document.getElementById("header_2").classList.remove("TrueRes");
        });
        
    }
    else 
    {
        death_heards += 1;
        if (death_heards < heards)
        {
            let live_heard = document.getElementById("live_" + death_heards);
            let death_heard = document.getElementById("death_" + death_heards);
            live_heard.classList.add("d_none");
            death_heard.classList.remove("d_none");

            document.getElementById('start_continue').classList.add("block");

            chat.innerText = "Можно было лучше...";
            countBlock_help = 0;
            containerNode.classList.add("block");
            document.getElementById("header_2").classList.add("FalseRes");
            sleep(3000).then(() => { 
                chat.innerText = "";
                document.getElementById('start_continue').classList.remove("block");
                fillingMatrix();
                containerNode.classList.remove("block");
                document.getElementById("header_2").classList.remove("FalseRes");
        });
        }
        if (death_heards >= heards)
        {
            death_heards = 0;
            endGame();
        }

        
    }    
}

// алгоритм конца игры
function endGame() {

    countChain = 0;
    countBlock = 0;

    // очищаем поле
    clearInnerText();
    
    // отправляем результат в базу
    let rezult = 0;
    let dub_points = points;
    document.getElementById("record").innerText = "";

    // записываем результат в бд
    onValue(ref(db, '/users/' + session.uid), (snapshot) => {
        rezult = snapshot.val().snake_numbers;
        
        if (rezult < points) 
        {
            update(ref(db, 'users/' + session.uid),{ 
                snake_numbers: points
            })
            document.getElementById("record").innerText = "Это новый рекорд!";
        }
        document.getElementById("res").innerText = dub_points;
        document.getElementById('number_block').classList.add('block');
        document.getElementById('window').classList.remove('d_none');
        // обнуляем данные
        points = 0;
        divPoints.innerText = "";
        startGameBool = false;
    });

    for(let a = 1; a<=heards; a++)
    {
        let live_heard = document.getElementById("live_" + a);
        let death_heard = document.getElementById("death_" + a);
        live_heard.classList.remove("d_none");
        death_heard.classList.add("d_none");
    }

    document.getElementById('body2').classList.add("d_none");
    document.getElementById('start_continue').innerText = "Начать"
}
