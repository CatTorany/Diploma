// Import the functions you need from the SDKs you need
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
// import { getDatabase } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
// import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDLtnkwYR8ukC1kq1f673OSgVMttVsUzA",
  authDomain: "alfabet-pro.firebaseapp.com",
  databaseURL: "https://alfabet-pro-default-rtdb.firebaseio.com",
  projectId: "alfabet-pro",
  storageBucket: "alfabet-pro.appspot.com",
  messagingSenderId: "159638170059",
  appId: "1:159638170059:web:c7de879db5c6d0359e2e4e"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

