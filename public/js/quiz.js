import { app } from "../js/fb/firebase.js";
import {getSession, isLoggedIn} from "../js/fb/session.js";
import { getDatabase, ref, get, onValue, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

if (!isLoggedIn()) {
    window.location.href = '/index.html';
}

let session = getSession();
const db = getDatabase(app);


const divPoints = document.getElementById('points');
let points = 0;
let word_answer = [];
let word_question = "";
let question_answer = 0;
const containerNode = document.getElementById('word_a'); 
const cellNodes = Array.from(containerNode.querySelectorAll('.word_cell'));
const heards = document.getElementsByClassName("heart").length;
let death_heards = 0;

// количество записей в таблице QUIZ   
const tableRef = ref(db, "quiz");
let count = 0;
get(tableRef).then((snapshot) => {
    count = snapshot.size;
    letsPlay();
});



/* Начало игры - конец игры */
document.getElementById('start_continue').addEventListener('click', () => {

    let startButton = document.getElementById("start_continue");

    // заполяем игровое поле названиями цветов и раскрашиваем блоки
    if (startButton.innerText === "Начать")
    {
        sleep(6000).then(() => { 
            divPoints.innerText = "Очки: " + points;
            startButton.innerText = "Закончить";
            document.getElementsByClassName("header_2")[0].classList.remove("d_none");
            document.getElementById("game-board").classList.remove("d_none");

            document.getElementById("word_q").innerText = word_question;
            for(let i = 0; i < cellNodes.length; i++)
            {
                cellNodes[i].innerText = word_answer[i];
            }
         });

        
    }

    // узнаем правильные результаты
    else if (startButton.innerText === "Закончить")
    {

        divPoints.innerText = "";
        startButton.innerText = "Начать";
        document.getElementById("word_a").classList.remove("bl");
        
        endGame();
        
    }
      
})





// Навешиваем обработчики событий на каждый блок
cellNodes.forEach(block => {

    
    block.addEventListener('click', (event) => {
        
        document.getElementById("word_a").classList.add("bl");

        if (event.target.innerText === word_answer[question_answer])
        {
            points++;
            divPoints.innerText = "Очки: " + points;
            addClassResult(event.target, "TrueRes")

            word_answer = [];
            word_question = "";
            letsPlay();
            sleep(6000).then(() => { 
                document.getElementById("word_q").innerText = word_question;
                for(let i = 0; i < cellNodes.length; i++)
                {
                    cellNodes[i].innerText = word_answer[i];
                }
                document.getElementById("word_a").classList.remove("bl");
            });

        }
        else
        {
            addClassResult(event.target, "FalseRes")
            death_heards += 1;
            if (death_heards < heards)
            {
                let live_heard = document.getElementById("live_" + death_heards);
                let death_heard = document.getElementById("death_" + death_heards);
                live_heard.classList.add("d_none");
                death_heard.classList.remove("d_none");

                word_answer = [];
                word_question = ""
                letsPlay();
                sleep(6000).then(() => { 
                    document.getElementById("word_q").innerText = word_question;
                    for(let i = 0; i < cellNodes.length; i++)
                    {
                        cellNodes[i].innerText = word_answer[i];
                    }
                    document.getElementById("word_a").classList.remove("bl");
                });

                
            }
            if (death_heards >= heards)
            {
                document.getElementById("word_a").classList.remove("bl");
                death_heards = 0;
                endGame();
            }
        }

        

        

        
    });
     
});

document.getElementById('okey').addEventListener('click', () => {
    document.getElementById('block').classList.remove('bl');
    document.getElementById('window').classList.add('d_none');
}) 





/* Функции */

// получаем целое рандомное число в промежутке
function getRandomNumber(min, max) 
{
    return Math.floor(Math.random() * (max - min) + min);
}

// создаем временный класс для показателя правильности или ошибки  ???
function addClassResult(containerBlock, resClass) {
    setTimeout(() => {
        containerBlock.classList.add(resClass);

        setTimeout(() => {
            containerBlock.classList.remove(resClass);
        }, 5000)
    }, 200)
 }

// функция задержки
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


// заполнение полей для игры
function letsPlay() {

    // получаем рандомные номера пар слов
    let num_word_answer = [];
    for(let i = 0; i<3; i++){
        let num = getRandomNumber(0, count+1);
        while (num_word_answer.indexOf(num) > -1) { num = getRandomNumber(0, count+1); }
        num_word_answer.push(String (getRandomNumber(0, count+1)));
    }
    let num_word_language = getRandomNumber(0, 2);  // 1 - русский вопрос/англ ответы, 0 - английский вопрос/рус ответы
    question_answer = getRandomNumber(0, 3);  // какой элемент будет спрашиваться

    console.log(num_word_answer);

    let word_bd = "";
    let nodeRef = ref(db, 'quiz/' + num_word_answer[0]);

    
        get(nodeRef).then((snapshot) => {

            if (num_word_language == 1) {
                word_bd = snapshot.val().eng;
                if (question_answer == 0) {word_question = snapshot.val().rus;}
            }
            if (num_word_language == 0) {
                word_bd = snapshot.val().rus;
                if (question_answer == 0) {word_question = snapshot.val().eng;}
            }

            word_answer.push(word_bd);

        });

        nodeRef = ref(db, 'quiz/' + num_word_answer[1]);
        get(nodeRef).then((snapshot) => {

            if (num_word_language == 1) {
                word_bd = snapshot.val().eng;
                if (question_answer == 1) {word_question = snapshot.val().rus;}
            }
            if (num_word_language == 0) {
                word_bd = snapshot.val().rus;
                if (question_answer == 1) {word_question = snapshot.val().eng;}
            }

            word_answer.push(word_bd);
        });

        nodeRef = ref(db, 'quiz/' + num_word_answer[2]);
        get(nodeRef).then((snapshot) => {

            if (num_word_language == 1) {
                word_bd = snapshot.val().eng;
                if (question_answer == 2) {word_question = snapshot.val().rus;}
            }
            if (num_word_language == 0) {
                word_bd = snapshot.val().rus;
                if (question_answer == 2) {word_question = snapshot.val().eng;}
            }

            word_answer.push(word_bd);

        
});
    
}

// алгоритм конца игры
function endGame() {
    let rezult = 0;
    let dub_points = points;
    
     
    // записываем результат в бд
    onValue(ref(db, 'users/' + session.uid), (snapshot) => {
        rezult = snapshot.val().quiz;
        
        document.getElementById("record").innerText = "";
        if (rezult < points) 
        {
            update(ref(db, 'users/' + session.uid),{ 
                quiz: points
            })
            document.getElementById("record").innerText = "Это новый рекорд!";
        }
        document.getElementById("res").innerText = dub_points;
        document.getElementById('block').classList.add('bl');
        document.getElementById('window').classList.remove('d_none');

        // обнуление результата
        points = 0;
        divPoints.innerText = "";
    });

    
    document.getElementById("start_continue").innerText = "Начать";   

    for(let a = 1; a<=heards; a++)
    {
        let live_heard = document.getElementById("live_" + a);
        let death_heard = document.getElementById("death_" + a);
        live_heard.classList.remove("d_none");
        death_heard.classList.add("d_none");
    }

    
    document.getElementById("start_continue").classList.remove("block");
    document.getElementsByClassName("header_2")[0].classList.add("d_none");
    document.getElementById("game-board").classList.add("d_none");
    
}



