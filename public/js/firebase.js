 // Import the functions you need from the SDKs you need
 import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
 import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-analytics.js";
 import { getFirestore } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
 // TODO: Add SDKs for Firebase products that you want to use
 // https://firebase.google.com/docs/web/setup#available-libraries

 // Your web app's Firebase configuration
 // For Firebase JS SDK v7.20.0 and later, measurementId is optional
 const firebaseConfig = {
   apiKey: "AIzaSyANPXAMfh8U4lJRG4dg-bTvgBc3yqEBv-4",
   authDomain: "rooms-9ef17.firebaseapp.com",
   databaseURL: "https://rooms-9ef17-default-rtdb.firebaseio.com",
   projectId: "rooms-9ef17",
   storageBucket: "rooms-9ef17.appspot.com",
   messagingSenderId: "251660499793",
   appId: "1:251660499793:web:0c65d44fcdbc5b2ed43170",
   measurementId: "G-Y5NBDN7Y9X",
 };
 // Initialize Firebase
 const app = initializeApp(firebaseConfig);
 const analytics = getAnalytics(app);
 const db = getFirestore(app);
