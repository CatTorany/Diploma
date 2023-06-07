import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { app } from "../fb/firebase.js";
import {startSession} from "../fb/session.js";

const auth = getAuth(app);

document.getElementById('singIn').addEventListener('click', (e) => {

    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;

        startSession(user);
        
        window.location.href = '/menu.html';
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        alert(errorMessage);
    });

});