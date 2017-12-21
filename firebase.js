var firebase = require('firebase')
require("firebase/firestore");

var config = {
  apiKey: "AIzaSyDLKzpTYZs0cyQPE2acoALLG9XopvPR9z0",
  authDomain: "weidian-413a6.firebaseapp.com",
  databaseURL: "https://weidian-413a6.firebaseio.com",
  projectId: "weidian-413a6",
  storageBucket: "weidian-413a6.appspot.com",
  messagingSenderId: "722826572793"
}

firebase.initializeApp(config)

module.exports = firebase
