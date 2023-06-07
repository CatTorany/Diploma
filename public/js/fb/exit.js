import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { app } from "../fb/firebase.js";
import {endSession} from "../fb/session.js";

const auth = getAuth(app);

document.getElementById('singOut').addEventListener('click', (e) => {

    signOut(auth).then(() => {
      endSession();
      window.location.href = '/index.html';

      }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            alert(errorMessage);
      });

});