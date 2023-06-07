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
let points = 0;

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
        document.getElementById('body2').classList.add("d_none");
        document.getElementById('start_continue').innerText = "Начать"
    }
})

document.getElementById('okey').addEventListener('click', () => {
    document.getElementById('number_block').classList.remove('block');
    document.getElementById('window').classList.add('d_none');
}) 


// Переменные для хранения текущих классов блоков и флага нажатия ЛКМ
let cellClasses = [];
let isMouseDown = false;

// Навешиваем обработчики событий на каждый блок
cellNodes.forEach(block => {
    // нажатие ЛКМ и удерживание
    block.addEventListener('mousedown', (event) => {
        if (startGameBool) 
        {
            isMouseDown = true;
            cellClasses.push(event.target);
            event.target.classList.add("dop");
        }
    });
  
    // при зажатой ЛКМ перемещение (наведение на блок)
    block.addEventListener('mouseover', (event) => {
        if (startGameBool){
            if (isMouseDown) {      
                // проверка на повторное наведение на блок
                if (cellClasses.indexOf(event.target) === -1)
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
            for(let i = 0; i < cellClasses.length; i++)
            {
                cellClasses[i].classList.remove("dop");
            }

            // если цепочка от 1 до 10
            if (orderBool(cellClasses))
            {
                for(let x = 0; x<cellClasses.length; x++)
                {
                    points += x+1;
                    cellClasses[x].innerText = "";
                    cellClasses[x].classList.remove(getNameColorClass(cellClasses[x])); 
                }

                fillingMatrix();
            }

            // если цепочка одинаковая
            if (duplicateBool(cellClasses))
            {
                for(let x = 0; x<cellClasses.length; x++)
                {
                    points += 1;
                    cellClasses[x].innerText = "";
                    cellClasses[x].classList.remove(getNameColorClass(cellClasses[x])); 
                }

                fillingMatrix();
            }

            divPoints.innerText = "Очки: " + points;
            
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
    return getRandomNumber(3, 11);
    
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
    if (cellClasses.length < 3)
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
    if (cellClasses.length < 3)
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

                        let arrChain = getPositions(x1, y1);
                        if (arrChain.length !== 0)
                        { 
                            let str = arrChain[getRandomNumber(0, arrChain.length)];
                            let res = str.split(' ');
                            x1 = parseInt(res[1], 10);
                            y1 = parseInt(res[0], 10);
                            

                        }
                        else break;
                    }
                }             
                else 
                {
                    let num = getRandomNumber(0, numberArray.length);
                    let lengthChain = getLengthChain();
                    
                    let x1 = x;
                    let y1 = y;

                    for(let i = 0; i < lengthChain; i++) 
                    {
                        matrix[y1][x1].innerText = numberArray[num];
                        matrix[y1][x1].classList.add(numberArray[num]);

                        let arrChain = getPositions(x1, y1);
                        if (arrChain.length !== 0)
                        { 
                            let str = arrChain[getRandomNumber(0, arrChain.length)];
                            let res = str.split(' ');
                            x1 = parseInt(res[1], 10);
                            y1 = parseInt(res[0], 10);
                            

                        }
                        else break;
                    }
                }  
            }
        }
    }
}


