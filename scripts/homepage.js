"use strict";
 // Firebase Configuration
 var firebaseConfig = {
    apiKey: "AIzaSyD2snpMQF9j3aDJZji-nmcJ_W9wzjLLQLE",
    authDomain: "keremela-508aa.firebaseapp.com",
    databaseURL: "https://keremela-508aa-default-rtdb.firebaseio.com",
    projectId: "keremela-508aa",
    storageBucket: "keremela-508aa.firebasestorage.app",
    messagingSenderId: "555590069435",
    appId: "1:555590069435:web:1296b444545a84a73c8d9e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var auth = firebase.auth();
var db = firebase.firestore();

// Listen for authentication state changes
firebase.auth().onAuthStateChanged(function(user) {
    var loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
        console.log(user);
        var docRef = db.collection("users").doc(loggedInUserId);
        docRef.get()
            .then(function(docSnap) {
                if (docSnap.exists) {
                    var userData = docSnap.data();
                    document.getElementById('loggedUserNickName').innerText = userData.nickName;
                    document.getElementById('loggedUserEmail').innerText = userData.email;
                    document.getElementById('loggedUserAge').innerText = userData.age;
                } else {
                    console.log("No document found matching id");
                }
            })
            .catch(function(error) {
                console.log("Error getting document", error);
            });
    } else {
        console.log("User Id not found in local storage");
    }
});

// Logout functionality
var logoutButton = document.getElementById('logout');

logoutButton.addEventListener('click', function() {
    localStorage.removeItem('loggedInUserId');
    auth.signOut()
        .then(function() {
            window.location.href = '/pages/login-register.html';
        })
        .catch(function(error) {
            console.error('Error signing out:', error);
        });
});
