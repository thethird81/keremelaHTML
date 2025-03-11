"use strict";

// Polyfill for Object.values (for older browsers)
if (!Object.values) {
    Object.values = function(obj) {
        return Object.keys(obj).map(function(key) {
            return obj[key];
        });
    };
}

// Fetch questions and video list from localStorage
var loggedInUserId = localStorage.getItem('loggedInUserId');
var questions = JSON.parse(localStorage.getItem("questions") || "[]");
var videoList = JSON.parse(localStorage.getItem("videoList") || "[]");
var videoId = getURLParameter("videoId") || videoList[0] || "dQw4w9WgXcQ"; // Default video ID
localStorage.setItem('videoId', videoId);
var iframeOverlay = document.getElementById('iframeOverlay');
var userIcon = document.getElementById('userIcon');
var searchBox = document.querySelector(".search-box");
var currentVideoIndex = 0;
var currentQuestionIndex = 0;
var player;

// Load YouTube IFrame API asynchronously
var tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

console.log("Total Questions:", questions.length);

// Function to get URL parameters
function getURLParameter(name) {
    var results = new RegExp("[?&]" + name + "=([^&#]*)").exec(window.location.href);
    return results ? decodeURIComponent(results[1].replace(/\+/g, " ")) : "";
}

// Function to load the next video
function getNextVideoId() {
    if (!videoList.length) {
        console.warn("No videos available in the list.");
        return null;
    }
    currentVideoIndex = (currentVideoIndex + 1) % videoList.length;
    return videoList[currentVideoIndex];
}

function onYouTubeIframeAPIReady() {

    console.log("YouTube IFrame API is ready!" + videoId );
    checkFavourited (videoId);
    player = new YT.Player("youtube-player", {
        videoId: videoId,
        playerVars: {
            'rel': 0, // Disable related videos
            'autoplay': 1, // Auto-play the video
            'showinfo': 0, // Optional: Hide video info at the start
            'modestbranding': 1, // Optional: Limits YouTube branding
          },

        playerVars: { enablejsapi: 1 },
        events: {
            "onReady": onPlayerReady,
            "onStateChange": onPlayerStateChange
        }
    });

}

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
    player.playVideo();
    if(loggedInUserId)
    {
        var lastWatchedPath = localStorage.getItem('lastWatchedPath');
        var lastWatchedPathParts = lastWatchedPath.split("_");
         if (lastWatchedPathParts[1]=='Entertainment')
             displayQuestion();
     }
    }


// The API calls this function when the player's state changes.
function onPlayerStateChange(event) {
    console.log("Player state changed:", event.data);
    if (event.data === YT.PlayerState.ENDED) {
        var nextVideoId = getNextVideoId();
        if (nextVideoId) {
            console.log("Player state changed:", nextVideoId.videoId);
            localStorage.setItem('videoId', nextVideoId.videoId);
            checkFavourited(nextVideoId.videoId);
            player.loadVideoById(nextVideoId);

        } else {
            console.warn("No next video found.");
        }
    }
}



// Handle DOM Content Load
document.addEventListener("DOMContentLoaded", function () {
    if(navigator.onLine){
        var signUpButton=document.getElementById('signUpButton');
        var signInButton=document.getElementById('signInButton');
        var signInForm=document.getElementById('signIn');
        var signUpForm=document.getElementById('signup');
        signUpButton.addEventListener('click',function(){
            signInForm.style.display="none";
            signUpForm.style.display="block";
        })
        signInButton.addEventListener('click', function(){
            signInForm.style.display="block";
            signUpForm.style.display="none";
        })

        var nickName = localStorage.getItem("nickName");
        if (nickName) {
            document.getElementById("nickName").innerText = nickName;
            document.getElementById("title").innerText = nickName;
        }
        if (nickName === 'abye') {
            // Change the user icon to the desired image
            document.getElementById('userIcon').src = '/images/abye.JPG';
        }
        if (nickName === 'yabran') {
            // Change the user icon to the desired image
            document.getElementById('userIcon').src = '/images/yabran.JPG';
        }
        // Populate Right Sidebar with Videos
        if (videoList.length) {
            var rightSidebar = document.querySelector(".right-sidebar");
            rightSidebar.innerHTML = "";

            videoList.forEach(function (video) {
                var videoElement = document.createElement("div");
                videoElement.classList.add("side-video-list");

                var thumbnail = (video.thumbnails && video.thumbnails.medium) ?
                                video.thumbnails.medium : (video.thumbnails && video.thumbnails.default) ?
                                video.thumbnails.default : "";

                videoElement.innerHTML =
                    '<div class="small-thumbnail" data-video-id="' + video.videoId + '">' +
                    '<img src="' + thumbnail + '" alt="Thumbnail">' +
                    '</div>' +
                    '<div class="vid-info">' +
                    '<div data-video-id="' + video.videoId + '">' + video.title + '</div>' +
                    '<p>' + video.channelTitle + '</p>' +
                    '</div>';

                rightSidebar.appendChild(videoElement);
            });

            // Add click event listeners to video elements
            var videoElements = document.querySelectorAll(".side-video-list [data-video-id]");
           // Convert NodeList to an array manually and add event listeners
                    var i;
                    for (i = 0; i < videoElements.length; i++) {
                        (function (element) {
                            element.addEventListener("click", function () {
                                var videoId = element.getAttribute("data-video-id");
                                playVideo(videoId);
                                localStorage.setItem('videoId', videoId);
                                checkFavourited(videoId);
                                 // Call the function to play the video
                            });
                        })(videoElements[i]); // IIFE to correctly capture element reference
                    }
                        } else {
                            console.log("No videos found in localStorage.");
                        }
    }
else{
    console.log("No internet!!");
}
                });


// Function to play the video in the YouTube player
function playVideo(videoId) {

    if (player && typeof player.loadVideoById === "function") {
        player.loadVideoById(videoId); // Load and play the video
    } else {
        console.error("YouTube player is not initialized.");
    }
}
//=============================================================================
// Modal and Quiz Elements
var modal = document.getElementById('quizModal');
var overlay = document.getElementById('overlay');
var questionText = document.getElementById('questionText');
var answerContainer = document.getElementById('answerContainer');
var countdownDisplay = document.getElementById('countdown');
var favoriteBtn = document.querySelector(".favorite-btn");
var quizInterval;
var countdownInterval;
var signOutButton = document.getElementById('signOut');
var auth = firebase.auth();
// Function to update lastWatchedPath on sign-out
function updateLastWatchedPathOnSignOut(userId, lastWatchedPath) {
    var db = firebase.firestore();
    var userRef = db.collection("users").doc(userId);

    return userRef.update({
        lastWatchedPath: lastWatchedPath
    })
    .then(function() {
        console.log("lastWatchedPath updated successfully!");
    })
    .catch(function(error) {
        console.error("Error updating lastWatchedPath: ", error);
    });
}

// Sign-out functionality
signOutButton.addEventListener('click', function() {
    var userId = localStorage.getItem('loggedInUserId');
    var lastWatchedPath = localStorage.getItem('lastWatchedPath');

    console.log("UserId:", userId);
    console.log("LastWatchedPath:", lastWatchedPath);

    if (userId ) {
        updateLastWatchedPathOnSignOut(userId, lastWatchedPath)
            .then(function() {
                updateFavoritesOnSignOut();
                // Clear localStorage and sign out after Firestore update completes
                localStorage.clear();
                auth.signOut()
                    .then(function() {
                        console.log('User signed out successfully');
                        window.location.href = '/index.html';
                    })
                    .catch(function(error) {
                        console.error('Error signing out:', error);
                    });
            })
            .catch(function(error) {
                console.error("Error during Firestore update:", error);
            });
    } else {
        console.error("UserId or LastWatchedPath is missing in localStorage.");
    }
});
iframeOverlay.addEventListener('click', function() {
    if (player && typeof player.getPlayerState === 'function') {
        var playerState = player.getPlayerState();

        if (playerState === YT.PlayerState.PLAYING) {
            player.pauseVideo(); // Pause the video if it's playing
            //favoriteBtn.style.display = 'block';
            console.log("Video paused");
        } else if (playerState === YT.PlayerState.PAUSED || playerState === YT.PlayerState.ENDED) {
            player.playVideo(); // Play the video if it's paused or ended
            //favoriteBtn.style.display = 'none';
            console.log("Video playing");
        }
    } else {
        console.error("YouTube player is not initialized or does not support the required methods.");
    }
});
var userIcon = document.getElementById('userIcon');

var dropdownMenu = document.getElementById('dropdownMenu');

userIcon.addEventListener('click', function () {
dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
});

// Close the dropdown when clicking outside
document.addEventListener('click', function (event) {
if (!userIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
    dropdownMenu.style.display = 'none';
}
});
function displayQuestion() {
    resetQuiz(); // Reset button states
    if (questions) {
        // Generate a random index for selecting a question
    var randomIndex = Math.floor(Math.random() * questions.length);
    var question = questions[randomIndex];  // Use the random index to get a question

        // Display question text
        questionText.innerHTML = question.question;

        // Display question image if available
        if (question.image) {
            var questionImage = document.createElement('img');
            questionImage.src = question.image;
            questionImage.alt = "Question Image";
            questionImage.className = "question-image";
            questionText.appendChild(questionImage);
        }

        // Clear previous answers
        answerContainer.innerHTML = "";

        // Populate options dynamically
        question.options.forEach(function (option, index) {
            var button = document.createElement('button');
            button.className = "answer";

            // Create a container for option text and image
            var optionContent = document.createElement('div');
            optionContent.className = "option-content";

            // Add option text
            var optionText = document.createElement('span');
            optionText.innerHTML = option.text;
            optionContent.appendChild(optionText);

            // Add option image if available
            if (option.image) {

                var optionImage = document.createElement('img');
                optionImage.src = option.image;
                optionImage.alt = "Option Image";
                optionImage.className = "option-image";
                optionContent.appendChild(optionImage);
            }else{
                console.log("image not avail");
            }

            button.appendChild(optionContent);
            button.setAttribute('data-correct', question.correctAnswer == index);
            console.log(option.text)
            console.log(question.correctAnswer == index)
            button.addEventListener('click', handleAnswerClick);
            answerContainer.appendChild(button);
        });

        showModal();
    } else {
        console.log("No question Available");
    }
}


function showModal() {
    modal.classList.add('active');
    overlay.classList.add('active');
    if (player && player.pauseVideo) {
        player.pauseVideo(); // Pause the video
    }
//     if (player.contentWindow) {
//         player.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
//     }
 }

function hideModal() {
    modal.classList.remove('active');
    overlay.classList.remove('active');
    if (player && player.playVideo) {
        player.playVideo(); // Resume the video
    }
    // if (player.contentWindow) {
    //     player.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    // }
}

function resetQuiz() {
    clearInterval(countdownInterval); // Clear any active countdown
    countdownDisplay.innerHTML = ""; // Clear countdown display
    var buttons = answerContainer.getElementsByClassName('answer');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = false;
    }
}

function startQuizInterval() {
    clearInterval(quizInterval);
    quizInterval = setTimeout(function () {
        displayQuestion();
    }, 60000); // Show the quiz after 5 seconds
}

// Handle answer clicks
function handleAnswerClick(e) {
    var isCorrect = e.currentTarget.getAttribute('data-correct') === 'true';
    console.log(e.currentTarget.getAttribute('data-correct'))

    if (isCorrect) {
        console.log("Correct answer clicked!");

        hideModal();
        resetQuiz();
        currentQuestionIndex++;
        setTimeout(function () {
            startQuizInterval(); // Show the next question after 5 seconds
        }, 60000);
    } else {
        console.log("Wrong answer clicked!");
        var buttons = answerContainer.getElementsByClassName('answer');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
        }

        var countdownTimer = 20;
        countdownDisplay.innerHTML = countdownTimer;
        countdownInterval = setInterval(function () {
            countdownTimer--;
            countdownDisplay.innerHTML = countdownTimer;

            if (countdownTimer <= 0) {
                clearInterval(countdownInterval);
                resetQuiz();
            }
        }, 1000);
    }
}

/*================================= favourites =========================================*/

favoriteBtn.addEventListener("click", function (){

toggleFavorite();
});

// Function to toggle favorite status using videoId (ES5 compatible)
function toggleFavorite() {
    var userId = localStorage.getItem('loggedInUserId');
    if (!userId) {
        console.error("User not logged in.");
        return;
    }

    var videoId = localStorage.getItem('videoId');
    var videoList = JSON.parse(localStorage.getItem('videoList')) || [];
    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    var video = null;
    for (var i = 0; i < videoList.length; i++) {
        if (videoList[i].videoId === videoId) {
            video = videoList[i]; // Found the video object
            break;
        }
    }

    if (!video) {
        console.error("Video not found in the list.");
        return;
    }

    var index = -1;
    for (var j = 0; j < favorites.length; j++) {
        if (favorites[j].videoId === videoId) {
            index = j;
            break;
        }
    }

   // var favoriteBtn = document.getElementById('favoriteBtn'); // Ensure you have a button with this ID

    if (index !== -1) {
        // Remove from favorites
        favorites.splice(index, 1);
        if (favoriteBtn) {
            favoriteBtn.innerHTML = "&#9734;";  // Empty star
            favoriteBtn.style.color = "";
        }
        console.log("Removed from favorites:", favorites);
    } else {
        // Add to favorites
        favorites.push(video);
        if (favoriteBtn) {
            favoriteBtn.innerHTML = "&#9733;";  // Filled star
            favoriteBtn.style.color = "red";
        }
        console.log("Added to favorites:", favorites);
    }

    // Save updated favorites to local storage
    localStorage.setItem('favorites', JSON.stringify(favorites));
}
// Function to update user favorites in Firestore on sign out (ES5 Compatible)
function updateFavoritesOnSignOut() {
    var userId = localStorage.getItem('loggedInUserId');
    if (!userId) {
        console.error("No user logged in.");
        return;
    }

    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // Update Firestore with the latest favorite videos
    db.collection("users").doc(userId).set(
        { favorites: favorites },
        { merge: true }  // Merge with existing data
    ).then(function () {
        console.log("Favorites successfully updated in Firestore.");



    }).catch(function (error) {
        console.error("Error updating favorites:", error);
    });
}


function checkFavourited (videoId){

    console.log("checkFavourited " + videoId);
    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    var index = -1;
    for (var j = 0; j < favorites.length; j++) {
        if (favorites[j].videoId === videoId) {
            index = j;
            break;
        }
    }

   // var favoriteBtn = document.getElementById('favoriteBtn'); // Ensure you have a button with this ID

    if (index !== -1) {
        if (favoriteBtn) {
            favoriteBtn.innerHTML = "&#9733;";  // Filled star
            favoriteBtn.style.color = "red";
        }

    } else {


        if (favoriteBtn) {
            favoriteBtn.innerHTML = "&#9734;";  // Empty star
            favoriteBtn.style.color = "";
        }

    }
}

//============================ on load ===================

document.addEventListener('DOMContentLoaded', function () {
var slidingText = document.querySelector(".sliding-text");
// Get references to necessary elements
var iframeOverlay = document.getElementById("iframeOverlay");
var youtubeLogoOverlay = document.querySelector(".youtube-logo-overlay");
var body = document.body;

// Function to toggle full screen mode
function toggleFullScreen() {
    // Check if the class is already added
    if (body.className.indexOf("fullscreen-mode") === -1) {
        body.className += " fullscreen-mode";  // Add the fullscreen-mode class
    } else {
        body.className = body.className.replace(" fullscreen-mode", "");  // Remove it
    }
}

// For Modern Browsers
if (youtubeLogoOverlay.addEventListener) {
    youtubeLogoOverlay.addEventListener("click", toggleFullScreen);
}
// For Older Browsers (IE 8 and below)
else if (youtubeLogoOverlay.attachEvent) {
    youtubeLogoOverlay.attachEvent("onclick", toggleFullScreen);
}


var slidingText = document.querySelector(".sliding-text");
if(loggedInUserId){
    joinUs.style.display = "none";
    slidingText.style.display = "none";
}
else{
    favoriteBtn.style.display = "none";
    userIcon.style.display = "none";
    searchBox.style.display = "none";
    joinUs.addEventListener("click",function(){
        var sidebar = document.querySelector(".sidebar");
        sidebar.classList.add("visible");
    });

}

});




function adjustIframeOrientation() {
    var iframeContainer = document.getElementById("youtube-player");

    if (!iframeContainer) {
        console.warn("YouTube player container not found.");
        return;
    }

    var iframe = iframeContainer.querySelector("iframe");

    if (!iframe) {
        console.warn("Iframe not found inside #youtube-player.");
        return;
    }

    if (window.innerWidth < 950) {
        // Portrait mode: Adjust height dynamically
        iframe.style.width = "100%";
        iframe.style.height = "56vw"; // Maintain 16:9 aspect ratio
    } else {
        // Landscape mode: Make it fullscreen
        iframe.style.width = "100%";
        iframe.style.height = "100vh";
    }
}

// Ensure the function runs when the page loads and on resize
window.addEventListener("resize", adjustIframeOrientation);
window.addEventListener("load", () => {
    setTimeout(adjustIframeOrientation, 500); // Wait a bit for iframe to load
});