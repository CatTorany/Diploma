import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getDatabase, set, ref } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { app } from "../fb/firebase.js";
import {startSession } from "../fb/session.js";



const auth = getAuth(app);
const db = getDatabase(app);


document.getElementById('signUp').addEventListener('click', (e) => {

    let login = document.getElementById('login').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let repeat_password = document.getElementById('repeat_password').value;

    if (password === repeat_password && login !== "" && login.indexOf(' ') == -1)
    {
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;

            set(ref(db, 'users/' + user.uid), {
                login: login,
                email: email, 
                puzzle_30: '00:00:00',
                color_block: 0,
                snake_numbers: 0,
                quiz: 0,
              });

            startSession(user);

            setTimeout(function(){
                window.location.href = '/menu.html';
              }, 2 * 1000);
            
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            alert(errorMessage);
            // ..
        });
   
    }
    else
    {
        alert('Пароли не совпадают или логин не задан корректно!');
    }

});