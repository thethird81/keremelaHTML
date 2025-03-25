"use strict";
if (!Object.values) {
    Object.values = function(obj) {
        return Object.keys(obj).map(function(key) {
            return obj[key];
        });
    };
}
var loggedInUserId = localStorage.getItem('loggedInUserId');
var container = document.querySelector(".container");
var signOutButton = document.getElementById('signOut');






var db = firebase.firestore();
 var auth = firebase.auth();
 if (!window.indexedDB) {
    console.log("IndexedDB is NOT supported in this browser.");
} else {
    console.log("IndexedDB is supported!");
}
document.addEventListener('DOMContentLoaded', function () {
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

    var joinUs = document.getElementById('joinUs');
    var userIcon = document.getElementById('userIcon');
    var dropdownMenu = document.getElementById('dropdownMenu');
    var searchBox = document.querySelector(".search-box");
    var slidingText = document.querySelector(".sliding-text");
    var coinCountElement = document.getElementById("coinCount");
    var coinImgElement = document.getElementById("coinIcon");
    if(loggedInUserId)
    {



    var nickName = localStorage.getItem('nickName');
    var grade = localStorage.getItem('grade');
    var storedSelectedQuizList = localStorage.getItem('selectedQuizList');
   var videoList = JSON.parse(localStorage.getItem('videoList'));
   var coins = localStorage.getItem('coins');

   coinCountElement.textContent = coins;
    // Display nickName in the navbar
    document.getElementById('nickName').innerText = nickName;
    document.getElementById("title").innerText = nickName;
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


        const questions = JSON.parse(localStorage.getItem("questions"));
        if(questions.length == 0)
        fetchAndMergeQuizzes();
        updateVideoList(videoList);

    }
    else{
        joinUs.style.display = "block";
        slidingText.style.display = "block";
        coinCountElement.style.display = "none";
        coinImgElement.style.display = "none";
        userIcon.style.display = "none";
        searchBox.style.display = "none";
        joinUs.addEventListener("click",function(){
            displaySidebar();
        });


        // Reference to the subcontent document
      var subcontentRef = db.collection("subcontents")
      .doc( "3_2D shapes and tessellation");
    subcontentRef.get()
    .then(function (doc) {
        if (doc.exists && doc.data().videos) {
            // If videos are already available in the 'videos' field
            console.log("Fetching videos from subcontent document...");
            var videos = doc.data().videos;
            console.log("Fetched Videos:", videos);

            // Save the fetched videos to localStorage
            localStorage.setItem("videoList", JSON.stringify(videos));

            // Redirect to the main page if not already there
            if (window.location.pathname !== "/index.html") {
                window.location.href = "/index.html";
            }

            // Update the video list on the page
            updateVideoList(videos);
        }
        else{
            console.log("No last watched videos found");
        }
    }).catch(function (error) {
        console.error("Error fetching subcontent document:", error);
    });



    }

});

function displaySidebar(){
    var sidebar = document.querySelector(".sidebar");
            sidebar.classList.add("visible");
}

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

function fetchAndMergeQuizzes() {
    console.log("Fetching and merging quizzes...");

        var selectedQuizList = JSON.parse(localStorage.getItem("selectedQuizList"));
        console.log("Selected Quiz List:", selectedQuizList);

        if (selectedQuizList.length === 0) {
            console.log("No quizzes selected.");
            localStorage.setItem("questions", JSON.stringify([]));
            return;
        }

        var mergedQuestions = [];
        var fetchPromises = [];

        selectedQuizList.forEach(function (path, index) {
            console.log("Processing path:", path);

            var pathParts = path.split("_");
            if (pathParts.length < 4) {
                console.error("Invalid path format:", path);
                return;
            }

            var contentId = pathParts[0] + "_" + pathParts[1] + "_" + pathParts[2];
            var subcontentName = pathParts[3]; // Extract subcontent name from the path

            console.log("Content ID:", contentId, " | Subcontent Name:", subcontentName);

            var quizRef = db.collection("contents").doc(contentId);
            var promise = quizRef.get().then(function (subDoc) {
                if (!subDoc.exists) {
                    console.warn("Document does not exist for content ID:", contentId);
                    return;
                }

                console.log("Document found for content ID:", contentId);
                var data = subDoc.data();
                console.log("Document data:", data);

                if (data.subcontents && Array.isArray(data.subcontents)) {
                    console.log("Checking subcontents array...");

                    var foundSubcontent = data.subcontents.find(function (subcontent) {
                        return subcontent.subcontent === subcontentName;
                    });

                    if (foundSubcontent) {
                        console.log("Found matching subcontent:", foundSubcontent);

                        if (foundSubcontent.quiz && Array.isArray(foundSubcontent.quiz)) {
                            console.log("Adding quiz:", foundSubcontent.quiz);
                            mergedQuestions = mergedQuestions.concat(foundSubcontent.quiz);
                        } else {
                            console.warn("No quiz array found for subcontent:", subcontentName);
                        }
                    } else {
                        console.warn("Subcontent not found:", subcontentName);
                    }
                } else {
                    console.warn("No subcontents array in document:", contentId);
                }
            }).catch(function (error) {
                console.error("Error fetching quiz for content ID:", contentId, "Error:", error);
            });

            fetchPromises.push(promise);
        });

        Promise.all(fetchPromises).then(function () {
            console.log("All fetches complete. Final merged quiz:", mergedQuestions);
            localStorage.setItem("questions", JSON.stringify(mergedQuestions));
            console.log("Merged quiz saved to local storage.");
        });


}


// Function to update lastWatchedPath on sign-out
function updateLastWatchedPathOnSignOut(userId, lastWatchedPath) {
    var db = firebase.firestore();
    var userRef = db.collection("users").doc(userId);
    var coins = localStorage.getItem("coins");
    return userRef.update({
        lastWatchedPath: lastWatchedPath,
        coins:coins,
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
// Function to shuffle an array (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}
// Update video list
function updateVideoList(videos) {
    var listContainer = document.querySelector(".list-container");
    listContainer.innerHTML = ""; // Clear existing videos
    shuffleArray(videos);
    localStorage.setItem("videoList", JSON.stringify(videos));
    if (videos != null) {
        videos.forEach(function (video) {
            var videoElement = document.createElement("div");
            videoElement.classList.add("vid-list");

            // Select thumbnail resolution (prefer medium, fallback to default)
           // var thumbnail = video.thumbnails && video.thumbnails.high ? video.thumbnails.medium : video.thumbnails && video.thumbnails.default;
           var thumbnail = video.thumbnails && (video.thumbnails.high || video.thumbnails.medium || video.thumbnails.default);

            // Create video item
            videoElement.innerHTML = "<a href='pages/play-video.html?videoId=" + video.videoId + "&enablejsapi=1'>" +
                "<img src='" + thumbnail + "' alt='' class='thumbnail'>" +
                "</a>" +
                "<div class='flex-div-favorite'>" +
                "<div class='vid-info'>" +
                "<a href='pages/play-video.html?videoId=" + video.videoId + "'>" + video.title + "</a>" +
                "<p>" + video.channelTitle + "</p>" +
                "</div></div>";



            listContainer.appendChild(videoElement);
        });
    }
}

/*======================= user sidebar ===================*/


