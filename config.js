import * as firebase from 'firebase'
require('@firebase/firestore')
  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyDSmJGafzawmr0YWpjwrHHEGrt6wBSmZcs",
    authDomain: "wily-app-930f2.firebaseapp.com",
    databaseURL: "https://wily-app-930f2.firebaseio.com",
    projectId: "wily-app-930f2",
    storageBucket: "wily-app-930f2.appspot.com",
    messagingSenderId: "15792812454",
    appId: "1:15792812454:web:235f3366cc4847c574df67"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
export default firebase.firestore()