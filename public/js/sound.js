// import { app } from "../js/fb/firebase";
import {getSession, isLoggedIn} from "../js/fb/session.js";


if (!isLoggedIn()) {
    window.location.href = '/index.html';
}

let session = getSession();

const container = document.getElementById('body2');
const table_num = document.getElementById('table_num');
const table_col = document.getElementById('table_col');

container.addEventListener('click', (event) => {

    const element = event.target.closest('span.alf');
    if (!element){
        return;
    }

    let sound = Array.from(element.querySelectorAll('audio'));    
    sound[0].play(); 
    
})

table_num.addEventListener('click', (event) => {

    const element = event.target.closest('tr');
    if (!element){
        return;
    }

    let sound = Array.from(element.querySelectorAll('audio'));    
    sound[0].play(); 
    
})

table_col.addEventListener('click', (event) => {

    const element = event.target.closest('td');
    if (!element){
        return;
    }

    let sound = Array.from(element.querySelectorAll('audio'));    
    sound[0].play(); 
    
})

