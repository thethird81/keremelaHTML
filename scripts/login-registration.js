"use strict";
if (!Object.values) {
    Object.values = function(obj) {
        return Object.keys(obj).map(function(key) {
            return obj[key];
        });
    };
}
var signUpButton=document.getElementById('signUpButton');
var signInButton=document.getElementById('signInButton');
var signInForm=document.getElementById('signIn');
var signUpForm=document.getElementById('signup');


 var auth = firebase.auth();
   // Listen for authentication state changes
   auth.onAuthStateChanged(function(user) {
    var loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
        window.location.href = '/index.html';
    } else {
        console.log("User Id not found in local storage");
    }
});
signUpButton.addEventListener('click',function(){
    signInForm.style.display="none";
    signUpForm.style.display="block";
})
signInButton.addEventListener('click', function(){
    signInForm.style.display="block";
    signUpForm.style.display="none";
})