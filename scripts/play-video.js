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
var lastWatchedPath = localStorage.getItem('lastWatchedPath');
var currentVideoIndex = 0;
var currentQuestionIndex = 0;
var player;
var videoDuration = 0; // Stores video duration
var earnedCoin = false; // Prevent multiple coin rewards
var interval = null; // Interval for counting time
var watchTime = 0; // Tracks continuous watch time
var lastTime = 0; // Tracks last known time

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
    //update coin
    //check remaining coint

    if(loggedInUserId)
    {

        var coinCountElement = document.getElementById("coinCount");
        var selectedSubject = getSelectedPart(1);
         if (selectedSubject == 'Entertainment' && grade != "KG" && loggedInUserId !== "vzTIlWdmgTZTF9zpEygFlcl8yFq1"){

            var coins = subtructCoins();
            if(coins < 0 ){
                showNotEnoughCoinsModal();
                console.log("Please get more coin!!");

            }else{
                localStorage.setItem("coins",coins);
                coinCountElement.textContent = coins;
                player.playVideo();
                displayQuestion();
            }


         }else{

            player.playVideo();
         }

     }else{
        player.playVideo();
     }
    }


// The API calls this function when the player's state changes.
function onPlayerStateChange(event) {
    var selectedSubject = getSelectedPart(1);
    if (event.data === YT.PlayerState.ENDED) {
        var nextVideoId = getNextVideoId();
        if (nextVideoId) {

            localStorage.setItem('videoId', nextVideoId.videoId);
            checkFavourited(nextVideoId.videoId);
            player.loadVideoById(nextVideoId);

        } else {
            console.warn("No next video found.");
        }
    }

        if (event.data === YT.PlayerState.PLAYING) {
            if (interval === null && !earnedCoin && grade != "KG" && loggedInUserId !== "vzTIlWdmgTZTF9zpEygFlcl8yFq1") {
            lastTime = player.getCurrentTime();

            interval = setInterval(function() {
              var currentTime = player.getCurrentTime();

              // Check if the user skipped
              if (Math.abs(currentTime - lastTime) > 2) {
                watchTime = 0; // Reset watch time if skipping detected
              } else {
                watchTime += 1; // Increase watch time by 1 second
              }

              lastTime = currentTime;

              // Check if user watched 5 minutes or reached the end
              if (!earnedCoin && watchTime >= 240) {

                if(selectedSubject !== "Entertainment"){
                    addCoins();
                    earnedCoin = true;
                    clearInterval(interval);
                    interval = null;
                }else{
                    var coinCountElement = document.getElementById("coinCount");
                    if (watchTime >= 900 ) {
                        var coins = subtructCoins();
                        if(coins > 0 )
                        {
                            localStorage.setItem("coins",coins);
                            coinCountElement.textContent = coins;
                            watchTime = 0;
                             // Call the function to play the video
                        }else{
                            console.log("add coins");
                            player.pauseVideo();
                            earnedCoin = true;
                            clearInterval(interval);
                            interval = null;
                            showNotEnoughCoinsModal();
                        }
                    }

                }





              }
              console.log(watchTime);
            }, 1000);}
          }   else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
            // Pause counting
            console.log(" Pause counting");
            clearInterval(interval);
            interval = null;
        }



}



// Handle DOM Content Load
document.addEventListener("DOMContentLoaded", function () {
    if(navigator.onLine){
        var signUpButton=document.getElementById('signUpButton');
        var signInButton=document.getElementById('signInButton');
        var signInForm=document.getElementById('signIn');
        var signUpForm=document.getElementById('signup');
        var coinCountElement = document.getElementById("coinCount");
        var coinImgElement = document.getElementById("coinIcon");
        var coinContainer = document.getElementById("coinContainer");



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
        if (grade != "KG"){
            coinContainer.style.display="block";
        }
        populateRightSidebar(videoList);


        /*========================= user side bar=======================*/

   // Add click event listeners for menu items
   document.getElementById("myProfile").addEventListener('click', function() {
    console.log("Profile clicked");
});

document.getElementById("settings").addEventListener('click', function() {
    console.log("Settings clicked");
});
document.getElementById("contactUs").addEventListener('click', function() {
    window.open('/pages/contact-us.html', '_blank');
    console.log("Contact Us clicked");
});

document.getElementById("logout").addEventListener('click', function() {
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

    }
else{
    console.log("No internet!!");
}
                });

                function populateRightSidebar(videoList) {
                    if (!videoList.length) {
                        console.log("No videos found in localStorage.");
                        return;
                    }

                    var rightSidebar = document.querySelector(".right-sidebar");
                    rightSidebar.innerHTML = "";

                    videoList.forEach(function (video) {
                        var videoElement = document.createElement("div");
                        videoElement.classList.add("side-video-list");

                        var thumbnail = (video.thumbnails && video.thumbnails.medium) ?
                            video.thumbnails.medium :
                            (video.thumbnails && video.thumbnails.default) ?
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

                    addVideoClickListeners();
                }

                function addVideoClickListeners() {
                    var videoElements = document.querySelectorAll(".side-video-list [data-video-id]");

                    for (var i = 0; i < videoElements.length; i++) {
                        (function (element) {
                            element.addEventListener("click", function () {
                                console.log("inside addEventListener");
                                watchTime = 0;
                                var coinCountElement = document.getElementById("coinCount");
                                var videoId = element.getAttribute("data-video-id");
                                var coins = localStorage.getItem("coins");
                                var selectedSubject = getSelectedPart(1);

                                if (selectedSubject === 'Entertainment' && grade != "KG" && loggedInUserId !== "vzTIlWdmgTZTF9zpEygFlcl8yFq1") {
                                    coins = subtructCoins();
                                    if (coins > 0) {
                                        playVideo(videoId);
                                        localStorage.setItem('videoId', videoId);
                                        checkFavourited(videoId);
                                        localStorage.setItem("coins", coins);
                                        coinCountElement.textContent = coins;
                                    } else {
                                        showNotEnoughCoinsModal();
                                        console.log("add coins");
                                    }
                                } else {
                                    playVideo(videoId);
                                    localStorage.setItem('videoId', videoId);
                                    checkFavourited(videoId);
                                    earnedCoin = false;
                                    coinCountElement.textContent = coins;
                                }
                            });
                        })(videoElements[i]);
                    }
                }

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
    var coins = localStorage.getItem("coins");

    return userRef.update({
        lastWatchedPath: lastWatchedPath,
        coins:coins
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

        } else if (playerState === YT.PlayerState.PAUSED || playerState === YT.PlayerState.ENDED) {
            player.playVideo(); // Play the video if it's paused or ended

        }
    } else {
        console.error("YouTube player is not initialized or does not support the required methods.");
    }
});

// Close sidebar when clicking anywhere outside
document.addEventListener('click', function(event) {
    var userSidebar = document.querySelector(".userSidebar");
    var sidebar = document.querySelector(".sidebar");
    var userIcon = document.getElementById("userIcon");


    // Close the sidebar if clicked outside the user icon or the sidebar
    if (!userSidebar.contains(event.target) && event.target !== userIcon) {
        userSidebar.classList.remove("visible"); // Removes 'visible' class to hide the sidebar

    }else{
        userSidebar.classList.toggle("visible");
        sidebar.classList.remove("visible");
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
var coinImgElement = document.getElementById("coinIcon");
var coinCountElement = document.getElementById("coinCount");
var deleteBtn = document.querySelector(".delete-btn");
var syncBtn = document.querySelector(".sync-btn");

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
    var coins = localStorage.getItem('coins');
    coinCountElement.textContent = coins;
    if(loggedInUserId == "vzTIlWdmgTZTF9zpEygFlcl8yFq1"){
        deleteBtn.style.display = "block";
        syncBtn.style.display = "block";

        deleteBtn.addEventListener("click", deleteVideo);
        syncBtn.addEventListener("click", removeVideoFromFirestore);
    }

}
else{
    joinUs.style.display = "block";
    slidingText.style.display = "block";
    coinCountElement.style.display = "none";
    coinImgElement.style.display = "none";
    favoriteBtn.style.display = "none";
    userIcon.style.display = "none";
    searchBox.style.display = "none";
    joinUs.addEventListener("click",function(){
        var sidebar = document.querySelector(".sidebar");
        sidebar.classList.add("visible");
    });

}

});

function removeVideoFromFirestore() {
    var contentPath = getSelectedPart(0) + "_" + getSelectedPart(1) + "_" + getSelectedPart(2);
    var subcontent = getSelectedPart(3);
    var videoList = JSON.parse(localStorage.getItem("videoList") || "[]");

    var contentRef = db.collection("contents").doc(contentPath);

    contentRef.get().then(function (doc) {
        if (doc.exists) {
            var data = doc.data();
            var subcontents = data.subcontents || [];

            // Find the subcontent
            for (var i = 0; i < subcontents.length; i++) {
                if (subcontents[i].subcontent === subcontent) {
                    var videos = subcontents[i].videos || [];

                    // Update the subcontent's videos array
                    subcontents[i].videos = videoList;

                    // Update Firestore
                    contentRef.update({ subcontents: subcontents })
                        .then(function () {
                            console.log("Video removed successfully!");
                        })
                        .catch(function (error) {
                            console.error("Error updating Firestore:", error);
                        });

                    return; // Exit loop once subcontent is found and updated
                }
            }
            console.log("Subcontent not found.");
        } else {
            console.log("Content document does not exist.");
        }
    }).catch(function (error) {
        console.error("Error fetching document:", error);
    });
}

function removeVideoById(videos, videoId) {
    var updatedVideos = [];
    for (var i = 0; i < videos.length; i++) {
        if (videos[i].videoId !== videoId) {
            updatedVideos.push(videos[i]);
        }
    }
    return updatedVideos;
}


// Function to show the delete confirmation modal
function showDeleteConfirmationModal(onConfirm) {
    var modal = document.getElementById("quizModal");
    var overlay = document.getElementById("overlay");

    // Set the question text to the delete confirmation message
    var questionText = document.getElementById("questionText");
    var quizContent = document.querySelector(".quiz-content");
    questionText.innerHTML = "Are you sure you want to delete this video?";

    // Clear any previous content from the answer container
    var answerContainer = document.getElementById("answerContainer");
    answerContainer.innerHTML = "";

    // Create the "Yes" button
    var confirmButton = document.createElement("button");
    confirmButton.classList.add("btn");
    confirmButton.textContent = "Yes, Delete";
    confirmButton.style.background = "red";
    confirmButton.style.color = "white";

    confirmButton.addEventListener("click", function () {
        modal.classList.remove("active");
        overlay.classList.remove("active");
        onConfirm(); // Call the function passed to confirm deletion
    });

    // Create the "No" button
    var cancelButton = document.createElement("button");
    cancelButton.classList.add("btn");
    cancelButton.textContent = "Cancel";
    cancelButton.style.background = "gray";
    cancelButton.style.color = "white";

    cancelButton.addEventListener("click", function () {
        modal.classList.remove("active");
        overlay.classList.remove("active");
    });

    // Append buttons to the answer container
    answerContainer.appendChild(confirmButton);
    answerContainer.appendChild(cancelButton);

    // Show the modal and overlay
    modal.classList.add("active");
    overlay.classList.add("active");
}
// Example usage:
function deleteVideo() {
    showDeleteConfirmationModal(function () {
         //get the current videoId
    var videoId = localStorage.getItem("videoId");
    // get the current videoList
    var videoList = JSON.parse(localStorage.getItem("videoList") || "[]");
    //remove the video and update the rest and save it to local storage
    localStorage.setItem("videoList", JSON.stringify(removeVideoById(videoList,videoId)));
    var videoList = JSON.parse(localStorage.getItem("videoList") || "[]");
    populateRightSidebar(videoList) ;
    console.log(videoList.length);

    var nextVideoId = getNextVideoId();
    if (nextVideoId) {

        localStorage.setItem('videoId', nextVideoId.videoId);
        checkFavourited(nextVideoId.videoId);
        player.loadVideoById(nextVideoId);

    } else {
        console.warn("No next video found.");
    }
        console.log("Video deleted!");
        // Call your actual delete function here
    });
}

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


function addCoins(){
    var coinCountElement = document.getElementById("coinCount");
    var coins = localStorage.getItem("coins");
    coins = coins ? parseInt(coins, 10) : 0;
    coins += 3;
    localStorage.setItem("coins", coins);
    coinCountElement.textContent = coins;
}
function subtructCoins(){
    var coins = localStorage.getItem("coins");
    coins = coins ? parseInt(coins, 10) : 0;
    coins -= 5;
    return coins;
}
function getSelectedPart(index) {
    return lastWatchedPath.split("_")[index] || null;
}

// Function to show the modal with the message about not enough coins
function showNotEnoughCoinsModal() {
    var modal = document.getElementById("quizModal");
    var overlay = document.getElementById("overlay");

     // Display question image if available



    // Set the question text to be the message
    var questionText = document.getElementById("questionText");
    var quizContent = document.querySelector(".quiz-content");
    questionText.innerHTML = "You Need at least 5 Coins! "; // Custom message
    var questionImage = document.createElement('img');
    questionImage.src = "/images/coin.png";
    questionImage.alt = "Question Image";
    questionImage.className = "question-image";

    // Set width and height
    questionImage.style.width = "100px"; // Adjust the width as needed
    questionImage.style.height = "100px"; // Adjust the height as needed

    quizContent.appendChild(questionImage);
    // Clear the answerContainer (no answers for this case)
    var answerContainer = document.getElementById("answerContainer");
    answerContainer.innerHTML = ""; // No answers are needed

    // Create a "Go to Home" button
    var goToIndexButton = document.createElement("button");
    goToIndexButton.classList.add("btn");
    goToIndexButton.textContent = "Watch Other Subject!"; // Button text

    // Add event listener to the button
    goToIndexButton.addEventListener("click", function() {
        window.location.href = "/index.html"; // Redirect to index.html when clicked

    });

    // Append the button to the answer container
    answerContainer.appendChild(goToIndexButton);

    // Show the modal and overlay
    modal.classList.add("active");
    overlay.classList.add("active");
}

// Function to hide the modal
function hideNotEnoughCoinsModal() {
    var modal = document.getElementById("quizModal");
    var overlay = document.getElementById("overlay");

    // Remove the active class to hide the modal and overlay
    modal.classList.remove("active");
    overlay.classList.remove("active");
}
