"use strict";
// Fetch questions from localStorage
var questions = JSON.parse(localStorage.getItem('questions')) || [];
var currentQuestionIndex = 0;
var player = document.getElementById("youtube-player");
console.log("questions = "+questions.length);
// Function to get URL parameters
function getURLParameter(name) {
    var url = window.location.href;
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// Get videoId from URL parameters
var videoId = getURLParameter('videoId');

// Set the video source dynamically based on the videoId
if (videoId) {

    player.src = "https://www.youtube.com/embed/" + videoId + "?enablejsapi=1"; // Enable JS API for control
    player.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
} else {
    console.error("No videoId found in URL.");
}
// Modal and Quiz Elements
var modal = document.getElementById('quizModal');
var overlay = document.getElementById('overlay');
var questionText = document.getElementById('questionText');
var answerContainer = document.getElementById('answerContainer');
var countdownDisplay = document.getElementById('countdown');
var quizInterval;
var countdownInterval;
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


document.addEventListener("DOMContentLoaded", function () {
    // Retrieve the video list from localStorage
    if(questions.length < 0){
        displayQuestion();
    }else{
         // Ensure the player iframe is defined
   var player = document.getElementById('youtube-player');
   if (player && player.contentWindow) {
       player.onload = function () {
           player.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
       };
   }

    }




    var videoList = JSON.parse(localStorage.getItem('videoList'));

    if (videoList) {
        var rightSidebar = document.querySelector('.right-sidebar');
        rightSidebar.innerHTML = ''; // Clear existing sidebar content

        // Loop through the video list and add each video to the sidebar
        videoList.forEach(function (video) {
            var videoElement = document.createElement('div');
            videoElement.classList.add('side-video-list');

            // Select thumbnail resolution (prefer medium, fallback to default)
            var thumbnail = video.thumbnails && video.thumbnails.medium ? video.thumbnails.medium : video.thumbnails && video.thumbnails.default;

            // Create the HTML structure for each video
            videoElement.innerHTML = `
                <a href="play-video.html?videoId=${video.videoId}" class="small-thumbnail">
                    <img src="${thumbnail}" alt="Thumbnail">
                </a>
                <div class="vid-info">
                    <a href="play-video.html?videoId=${video.videoId}">${video.title}</a>
                    <p>${video.channelTitle}</p>
                    <p>${video.viewCount} Views</p>
                </div>
            `;

            // Append the video to the sidebar
            rightSidebar.appendChild(videoElement);
        });
    } else {
        console.log("No video list found in localStorage.");
    }


});
