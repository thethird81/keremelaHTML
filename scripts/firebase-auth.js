"use strict";
if (!Object.values) {
    Object.values = function(obj) {
        return Object.keys(obj).map(function(key) {
            return obj[key];
        });
    };
}
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
     var grade = ["Pre School","KG","GRADE 1 (YEAR 2)","GRADE 2 (YEAR 3)", "GRADE 3 (YEAR 4)","GRADE 4 (YEAR 5)",
     "GRADE 5 (YEAR 6)", "GRADE 6 (YEAR 7)","GRADE 8 (YEAR 9)","GRADE 9 (YEAR 10)",
     "GRADE 10 (YEAR 11)","GRADE 11 (YEAR 12)","GRADE 12 (YEAR 13)"];

     var grade2 = {
        "Pre School": "Pre School",
        "KG": "KG",
        "1-2": "GRADE 1 (YEAR 2)",
        "2-3": "GRADE 2 (YEAR 3)",
        "3-4": "GRADE 3 (YEAR 4)",
        "4-5": "GRADE 4 (YEAR 5)",
        "5-6": "GRADE 5 (YEAR 6)",
        "6-7": "GRADE 6 (YEAR 7)",
        "7-8": "GRADE 7 (YEAR 8)",
        "8-9": "GRADE 8 (YEAR 9)",
        "9-10": "GRADE 9 (YEAR 10)",
        "10-11": "GRADE 10 (YEAR 11)",
        "11-12": "GRADE 11 (YEAR 12)",
        "12-13": "GRADE 12 (YEAR 13)"
      }
     // Populate age dropdown
     var ageSelect = document.getElementById('ageSelect');
     ageList.forEach(function(ageGroup) {
         var option = document.createElement('option');
         option.value = ageGroup;
         option.textContent = ageGroup;
         ageSelect.appendChild(option);
     });
     var ageSel= document.getElementById('age');
     ageList.forEach(function(age) {
         var option = document.createElement('option');
         option.value = age;
         option.textContent = age;
         ageSel.appendChild(option);
     });

     var googleSignInButton = document.getElementById('googleSignInButton');
     googleSignInButton.addEventListener('click', function() {
        var provider = new firebase.auth.GoogleAuthProvider();

        // Add the prompt parameter to force account selection
        provider.setCustomParameters({
            prompt: 'select_account'
        });

        firebase.auth().signInWithPopup(provider)
            .then(function(result) {
                var user = result.user;
                var email = user.email;
                var nickName = email.split('@')[0]; // Get the part before '@' as the nickname

                var db = firebase.firestore();
                var userRef = db.collection("users").doc(user.uid);

                // Check if user already exists in Firestore
                userRef.get().then(function(doc) {
                    if (!doc.exists) {
                        // If it's the user's first time, show the modal to select age
                        var ageModal = document.getElementById('ageModal');
                        ageModal.style.display = "block";

                        // Close the modal when the user clicks the 'X' button
                        var closeModal = document.getElementById('closeModal');
                        closeModal.onclick = function() {
                            ageModal.style.display = "none";
                        };

                        // Submit age when user clicks the 'Submit' button
                        var submitAgeButton = document.getElementById('submitAge');
                        submitAgeButton.onclick = function() {
                            var age = document.getElementById('ageSelect').value;
                            if (age) {
                                // Save user data including age
                                var userData = {
                                    email: email,
                                    nickName: nickName,
                                    age: age // Save age as part of the user's profile
                                };

                                userRef.set(userData)
                                    .then(function() {
                                        showMessage('Google Sign-In Successful. Age Saved.', 'signInMessage');
                                        localStorage.setItem('loggedInUserId', user.uid);
                                        localStorage.setItem('nickName', nickName);
                                        localStorage.setItem('age', age);
                                        console.log("age from login:" + age);
                                        localStorage.setItem('grade', '3-4');
                                        localStorage.setItem("isFirstLogin", "yes");
                                        window.location.href = '/index.html';
                                    })
                                    .catch(function(error) {
                                        console.error("Error writing document", error);
                                        showMessage('Error saving user data', 'signInMessage');
                                    });

                                ageModal.style.display = "none"; // Close the modal after submission
                            } else {
                                showMessage('Please select your age.', 'signInMessage');
                            }
                        };
                    } else {
                        // If the user already exists, just log them in
                        var userData = doc.data();

                        showMessage('Google Sign-In Successful', 'signInMessage');
                        localStorage.setItem('loggedInUserId', user.uid);
                        localStorage.setItem('age', userData.age); // Store age in localStorage
                        localStorage.setItem('nickName', userData.nickName);
                        localStorage.setItem('grade', userData.nickName);
                        localStorage.setItem("isFirstLogin", "yes");
                        window.location.href = '/index.html';
                    }
                }).catch(function(error) {
                    console.error("Error getting document:", error);
                    showMessage('Error during Google sign-in', 'signInMessage');
                });
            })
            .catch(function(error) {
                console.error("Error during Google sign-in", error);
                showMessage('Google Sign-In Failed', 'signInMessage');
            });
    });


// Sign Up functionality
var signUp = document.getElementById('submitSignUp');
signUp.addEventListener('click', function(event) {
    event.preventDefault();
    var email = document.getElementById('rEmail').value;
    var password = document.getElementById('rPassword').value;
    var nickName = document.getElementById('nickName').value;
    var age = document.getElementById('age').value;



    var auth = firebase.auth();
    var db = firebase.firestore();

    auth.createUserWithEmailAndPassword(email, password)
        .then(function(userCredential) {
            var user = userCredential.user;
            var userData = {
                email: email,
                nickName: nickName,
                age:age

            };
            showMessage('Account Created Successfully', 'signUpMessage');
            var docRef = db.collection("users").doc(user.uid);
            docRef.set(userData)
                .then(function() {
                    localStorage.setItem('loggedInUserId', user.uid);
                    localStorage.setItem('age', userData.age); // Store age in localStorage
                    localStorage.setItem('nickName', userData.nickName);
                    localStorage.setItem('grade', '3-4');
                    localStorage.setItem("isFirstLogin", "yes");
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
                    localStorage.setItem('lastWatchedPath', userData.lastWatchedPath);
                    localStorage.setItem("isFirstLogin", "yes");
                    console.log("userData.lastWatchedPath");
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
