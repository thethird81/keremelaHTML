"use strict";
if (!Object.values) {
    Object.values = function(obj) {
        return Object.keys(obj).map(function(key) {
            return obj[key];
        });
    };
}
// // Firebase Configuration
// var firebaseConfig = {
//     apiKey: "AIzaSyD2snpMQF9j3aDJZji-nmcJ_W9wzjLLQLE",
//     authDomain: "keremela-508aa.firebaseapp.com",
//     databaseURL: "https://keremela-508aa-default-rtdb.firebaseio.com",
//     projectId: "keremela-508aa",
//     storageBucket: "keremela-508aa.firebasestorage.app",
//     messagingSenderId: "555590069435",
//     appId: "1:555590069435:web:1296b444545a84a73c8d9e"
// };

// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);

// Show message function
function showMessage(message, divId) {
    var messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(function() {
        messageDiv.style.opacity = 0;
    }, 5000);
}
     // Age List
     var ageList = ["0-2","3-4","5-7","8-10","11+"];

     var grade = {
        "PreKG": "Pre-K - Early Years 1",
        "KG": "Kg - Early Years 2",
        "3": "Grade 3-Year 4",
        "12": "Grade 12-Year 13"
    };
    // var grade = {
    //     "Toddler": "Toddler",
    //     "Pre-KG": "Pre-K - Early Years 1",
    //     "KG": "Kg - Early Years 2",
    //     "1-2": "Grade 1-Year 2",
    //     "2-3": "Grade 2-Year 3",
    //     "3-4": "Grade 3-Year 4",
    //     "4-5": "Grade 4-Year 5",
    //     "5-6": "Grade 5-Year 6",
    //     "6-7": "Grade 6-Year 7",
    //     "7-8": "Grade 7-Year 8",
    //     "8-9": "Grade 8-Year 9",
    //     "9-10": "Grade 9-Year 10",
    //     "10-11": "Grade 10-Year 11",
    //     "11-12": "Grade 11-Year 12",
    //     "12-13": "Grade 12-Year 13"
    // };
    //  // Populate age dropdown
    //  var ageSelect = document.getElementById('ageSelect');
    //  ageList.forEach(function(ageGroup) {
    //      var option = document.createElement('option');
    //      option.value = ageGroup;
    //      option.textContent = ageGroup;
    //      ageSelect.appendChild(option);
    //  });
    //  var ageSel= document.getElementById('age');
    //  ageList.forEach(function(age) {
    //      var option = document.createElement('option');
    //      option.value = age;
    //      option.textContent = age;
    //      ageSel.appendChild(option);
    //  });
     // Populate the dropdown list
     function populateDropdown() {
        var select = document.getElementById("gradeSelect");
        for (var key in grade) {
            if (grade.hasOwnProperty(key)) {
                var option = document.createElement("option");
                option.value = key;  // Key as value
                option.text = grade[key];  // Display value
                select.appendChild(option);
            }
        }
    }

    // Display the selected key
    function getSelectedKey() {
        var select = document.getElementById("gradeSelect");
        var selectedKey = select.value;
       // document.getElementById("selectedKey").innerHTML = "Selected Key: " + (selectedKey || "None");
      console.log(selectedKey);
    }

    // Initialize the dropdown
    window.onload = function () {
        populateDropdown();
    };

// Sign Up functionality
var signUp = document.getElementById('submitSignUp');
signUp.addEventListener('click', function(event) {
    event.preventDefault();
    var email = document.getElementById('rEmail').value;
    var password = document.getElementById('rPassword').value;
    var nickName = document.getElementById('nickName').value;
    var grade =document.getElementById("gradeSelect").value;



    var auth = firebase.auth();
    var db = firebase.firestore();

    auth.createUserWithEmailAndPassword(email, password)
        .then(function(userCredential) {
            var user = userCredential.user;
            var userData = {
                email: email,
                nickName: nickName,
                grade:grade,
                lastWatchedPath:"",
                selectedQuizList:[],
                favorites:[]

            };

            showMessage('Account Created Successfully', 'signUpMessage');
            var docRef = db.collection("users").doc(user.uid);
            docRef.set(userData)
                .then(function() {
                    localStorage.setItem('loggedInUserId', user.uid);
                    localStorage.setItem('age', userData.age); // Store age in localStorage
                    localStorage.setItem('nickName', userData.nickName);
                    localStorage.setItem('grade', userData.grade);
                    localStorage.setItem("isFirstLogin", "yes");
                    localStorage.setItem('selectedQuizList', []);
                    localStorage.setItem('lastWatchedPath', "");
                    window.location.href = '/index.html';

                })
                .catch(function(error) {
                    console.error("Error writing document", error);
                });
        })
        .catch(function(error) {
            var errorCode = error.code;
            if (errorCode === 'auth/email-already-in-use') {
                showMessage('Email Address Already Exists !!!', 'signUpMessage');
            } else {
                showMessage('Unable to create User', 'signUpMessage');
            }
        });
});

// Sign In functionality
var signIn = document.getElementById('submitSignIn');
signIn.addEventListener('click', function(event) {
    event.preventDefault();
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var auth = firebase.auth();

    auth.signInWithEmailAndPassword(email, password)
        .then(function(userCredential) {
            var user = userCredential.user;
            var userId = user.uid;

            // Fetch additional user data from Firestore
            var db = firebase.firestore();
            var userRef = db.collection("users").doc(userId);

            userRef.get().then(function(doc) {
                if (doc.exists) {

                    var userData = doc.data();
                    localStorage.setItem('loggedInUserId', userId);
                    localStorage.setItem('age', userData.age); // Store age in localStorage
                    localStorage.setItem('nickName', userData.nickName); // Store nickname
                    showMessage('Login is successful', 'signInMessage');
                    localStorage.setItem('grade', userData.grade);

                    // Assuming userData.selectedQuizList is an array
                    localStorage.setItem('selectedQuizList', JSON.stringify(userData.selectedQuizList));
                    localStorage.setItem('favorites', JSON.stringify(userData.favorites));
                    localStorage.setItem('lastWatchedPath', userData.lastWatchedPath);
                    localStorage.setItem("isFirstLogin", "yes");

                    window.location.href = '/index.html';
                } else {
                    console.error("No such user document!");
                    showMessage('Error retrieving user data', 'signInMessage');
                }
            }).catch(function(error) {
                console.error("Error fetching user data:", error);
                showMessage('Error retrieving user data', 'signInMessage');
            });
        })
        .catch(function(error) {
            var errorCode = error.code;
            if (errorCode === 'auth/wrong-password') {
                showMessage('Incorrect Email or Password', 'signInMessage');
            } else if (errorCode === 'auth/user-not-found') {
                showMessage('Account does not Exist', 'signInMessage');
            } else {
                showMessage('Login failed', 'signInMessage');
            }
        });
});

