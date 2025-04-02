"use strict";
if (!Object.values) {
    Object.values = function (obj) {
        return Object.keys(obj).map(function (key) {
            return obj[key];
        });
    };
}

// Age List
var ageList = ["0-2", "3-4", "5-7", "8-10", "11+"];

//   var grade = {
//      "PreKG": "PreK - Early Years 1",
//      "KG": "Kg - Early Years 2",
//      "3": "Grade 3-Year 4",
//      "12": "Grade 12-Year 13"
//  };
// Show message function
function showMessage(message, divId) {
    var messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    // setTimeout(function() {
    //     messageDiv.style.opacity = 0;
    // }, 3000);
}

// Function to populate the dropdown
function populateDropdown() {
    var grade = {
        "Toddler": "Toddler",
        "PreKG": "Pre-K - Early Years 1",
        "KG": "Kg - Early Years 2",
        "1": "Grade 1-Year 2",
        "2": "Grade 2-Year 3",
        "3": "Grade 3-Year 4",
        "4": "Grade 4-Year 5",
        "5": "Grade 5-Year 6",
        "6": "Grade 6-Year 7",
        "7": "Grade 7-Year 8",
        "8": "Grade 8-Year 9",
        "9": "Grade 9-Year 10",
        "10": "Grade 10-Year 11",
        "11": "Grade 11-Year 12",
        "12": "Grade 12-Year 13"
    };

    var select = document.getElementById("gradeSelect");

    if (!select) {
        console.error("Dropdown element not found!");
        return;
    }

    for (var key in grade) {
        if (Object.prototype.hasOwnProperty.call(grade, key)) {  // Safely check the property
            var option = document.createElement("option");
            option.value = key;
            option.text = grade[key];

            select.appendChild(option);
        }
    }
}

// Function to get the selected key
function getSelectedKey() {
    var select = document.getElementById("gradeSelect");
    if (!select) {
        console.error("Dropdown element not found!");
        return;
    }

    var selectedKey = select.value; // Get the selected key

    document.getElementById("selectedKey").innerHTML = "Selected Key: " + (selectedKey || "None");
}

// Initialize the dropdown when the page loads
document.addEventListener("DOMContentLoaded", function () {

    populateDropdown();
});
// Sign Up functionality
var signUp = document.getElementById('submitSignUp');
signUp.addEventListener('click', function (event) {
    event.preventDefault();
    var email = document.getElementById('rEmail').value;
    var password = document.getElementById('rPassword').value;
    var nickName = document.getElementById('userName').value;
    var grade = document.getElementById("gradeSelect").value;

    var auth = firebase.auth();
    var db = firebase.firestore();

    auth.createUserWithEmailAndPassword(email, password)
        .then(function (userCredential) {
            var user = userCredential.user;

            // Send email verification
            user.sendEmailVerification().then(function () {
                showMessage('Verification email sent! Please check your inbox.', 'signUpMessage');

                // Store user data in Firestore
                var userData = {
                    email: email,
                    nickName: nickName,
                    grade: grade,
                    lastWatchedPath: "",
                    coins: 30,
                    selectedQuizList: [],
                    favorites: []
                };

                var docRef = db.collection("users").doc(user.uid);
                docRef.set(userData)
                    .then(function () {
                        showMessage('Account created! Verify your email before logging in.', 'signUpMessage');
                        auth.signOut(); // Prevent login until email is verified
                        //window.location.href = '/verification-sent.html'; // Redirect to verification page
                    })
                    .catch(function (error) {
                        console.error("Error writing document", error);
                    });

            }).catch(function (error) {
                console.error("Error sending verification email:", error);
                showMessage('Error sending verification email. Try again later.', 'signUpMessage');
            });

        })
        .catch(function (error) {
            var errorCode = error.code;
            if (errorCode === 'auth/email-already-in-use') {
                showMessage('Email Address Already Exists !!!', 'signUpMessage');
            } else {
                showMessage('Unable to create User', 'signUpMessage');
            }
        });
});

var signIn = document.getElementById('submitSignIn');
signIn.addEventListener('click', function (event) {
    event.preventDefault();
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var auth = firebase.auth();

    auth.signInWithEmailAndPassword(email, password)
        .then(function (userCredential) {
            var user = userCredential.user;

            if (user.emailVerified) {
                var userId = user.uid;
                var db = firebase.firestore();
                var userRef = db.collection("users").doc(userId);

                userRef.get().then(function (doc) {
                    if (doc.exists) {
                        var userData = doc.data();
                        localStorage.setItem('loggedInUserId', userId);
                        localStorage.setItem('age', userData.age);
                        localStorage.setItem('nickName', userData.nickName);
                        localStorage.setItem('grade', userData.grade);
                        localStorage.setItem('coins', userData.coins);
                        localStorage.setItem('selectedQuizList', JSON.stringify(userData.selectedQuizList));
                        localStorage.setItem('favorites', JSON.stringify(userData.favorites));
                        localStorage.setItem('lastWatchedPath', userData.lastWatchedPath);
                        localStorage.setItem("isFirstLogin", "yes");
                        localStorage.setItem("questions", JSON.stringify([]));

                        showMessage('Login successful!', 'signInMessage');
                        window.location.href = '/index.html';
                    } else {
                        console.error("No such user document!");
                        showMessage('Error retrieving user data', 'signInMessage');
                    }
                }).catch(function (error) {
                    console.error("Error fetching user data:", error);
                    showMessage('Error retrieving user data', 'signInMessage');
                });

            } else {
                auth.signOut(); // Prevent unverified users from staying logged in

                var resendLink = document.getElementById('resendVerification');
                if (resendLink) {
                    resendLink.addEventListener('click', function () {
                        user.sendEmailVerification()
                            .then(function () {
                                showMessage('Verification email sent. Check your inbox.', 'signInMessage');
                            })
                            .catch(function (error) {
                                console.error("Error sending verification email:", error);
                                showMessage('Failed to send verification email. Try again later.', 'signInMessage');
                            });
                    });
                }
            }
        })
        .catch(function (error) {
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

