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
var questions = JSON.parse(localStorage.getItem("questions") || "[]");
var videoList = JSON.parse(localStorage.getItem("videoList") || "[]");
var videoId = getURLParameter("videoId") || videoList[0] || "dQw4w9WgXcQ"; // Default video ID
var currentVideoIndex = 0;
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
    console.log("YouTube IFrame API is ready!");
    player = new YT.Player("youtube-player", {
        videoId: videoId,
        host: "https://www.youtube.com", // Fix postMessage error
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
}

// The API calls this function when the player's state changes.
function onPlayerStateChange(event) {
    console.log("Player state changed:", event.data);
    if (event.data === YT.PlayerState.ENDED) {
        var nextVideoId = getNextVideoId();
        if (nextVideoId) {
            player.loadVideoById(nextVideoId);
        } else {
            console.warn("No next video found.");
        }
    }
}



// Handle DOM Content Load
document.addEventListener("DOMContentLoaded", function () {
    if (questions.length > 0) {
        displayQuestion();
    } else {
        console.warn("No questions available.");
    }

    var nickName = localStorage.getItem("nickName");
    if (nickName) {
        document.getElementById("nickName").innerText = nickName;
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
                '<a href="play-video.html?videoId=' + video.videoId + '" class="small-thumbnail">' +
                '<img src="' + thumbnail + '" alt="Thumbnail">' +
                '</a>' +
                '<div class="vid-info">' +
                '<a href="play-video.html?videoId=' + video.videoId + '">' + video.title + '</a>' +
                '<p>' + video.channelTitle + '</p>' +
                '<p>' + video.viewCount + ' Views</p>' +
                '</div>';

            rightSidebar.appendChild(videoElement);
        });
    } else {
        console.log("No videos found in localStorage.");
    }
});



//=============================================================================
// Modal and Quiz Elements
var modal = document.getElementById('quizModal');
var overlay = document.getElementById('overlay');
var questionText = document.getElementById('questionText');
var answerContainer = document.getElementById('answerContainer');
var countdownDisplay = document.getElementById('countdown');
var quizInterval;
var countdownInterval;
var signOutButton = document.getElementById('signOut');
var auth = firebase.auth();
signOutButton.addEventListener('click', function() {
    localStorage.clear();
    auth.signOut()
        .then(function() {
            console.log('User signed out successfully');

            window.location.href = '/index.html';
        })
        .catch(function(error) {
            console.error('Error signing out:', error);
        });
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
    if (currentQuestionIndex < questions.length) {
        var question = questions[currentQuestionIndex];

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
        console.log("All questions completed.");
    }
}


function showModal() {
    modal.classList.add('active');
    overlay.classList.add('active');
    // if (player && player.pauseVideo) {
    //     player.pauseVideo(); // Pause the video
    // }
    if (player.contentWindow) {
        player.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    }
}

function hideModal() {
    modal.classList.remove('active');
    overlay.classList.remove('active');
    // if (player && player.playVideo) {
    //     player.playVideo(); // Resume the video
    // }
    if (player.contentWindow) {
        player.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    }
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
    }, 5000); // Show the quiz after 5 seconds
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
        }, 5000);
    } else {
        console.log("Wrong answer clicked!");
        var buttons = answerContainer.getElementsByClassName('answer');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
        }

        var countdownTimer = 5;
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

