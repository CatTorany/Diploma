import { app } from "../fb/firebase.js";
import {getSession, isLoggedIn} from "../fb/session.js";
import { getDatabase, ref, onValue, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

if (!isLoggedIn()) {
    window.location.href = '/index.html';
}

let session = getSession();
const db = getDatabase(app);


const nodeRef = ref(db, 'users/' + session.uid);

get(nodeRef).then((snapshot) => {
  const username = snapshot.val().login;
  document.getElementById('username').innerText += username;

  const puzzle30 = snapshot.val().puzzle_30;
  document.getElementById('Puzzle30').innerText += puzzle30;

  const colorPlanet = snapshot.val().color_block;
  document.getElementById('ColorPlanet').innerText += colorPlanet;

  const snakeNumbers = snapshot.val().snake_numbers;
  document.getElementById('SnakeNumbers').innerText += snakeNumbers;

  const quiz = snapshot.val().quiz;
  document.getElementById('Quiz').innerText += quiz;

}).catch((error) => {
  console.error(error);
});


document.getElementById('image').addEventListener('click', () => {
  document.getElementById('form').classList.add('block');
  document.getElementById('window').classList.remove('d_none');
}) 


document.getElementById('okey').addEventListener('click', () => {
  document.getElementById('form').classList.remove('block');
  document.getElementById('window').classList.add('d_none');
}) 







