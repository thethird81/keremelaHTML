"use strict";
if (!Object.values) {
    Object.values = function(obj) {
        return Object.keys(obj).map(function(key) {
            return obj[key];
        });
    };
}
var container = document.querySelector(".container");
var signOutButton = document.getElementById('signOut');
var age ;




var db = firebase.firestore();
 var auth = firebase.auth();
   // Listen for authentication state changes
auth.onAuthStateChanged(function(user) {
    var loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
        console.log(user);
    } else {
        window.location.href = '/pages/login-register.html';
        console.log("User Id not found in local storage");
    }
});





document.addEventListener('DOMContentLoaded', function () {
    var nickName = localStorage.getItem('nickName');
    var age = localStorage.getItem('age');
    var grade = localStorage.getItem('grade');
    var storedSelectedQuizList = localStorage.getItem('selectedQuizList');

    // Step 2: Parse the retrieved data (assuming it's stored as a JSON string)
    if(storedSelectedQuizList)
    var selectedQuizList = JSON.parse(storedSelectedQuizList);
    //console.log("selectedQuizList" + selectedQuizList);
    var videoList = JSON.parse(localStorage.getItem('videoList'));
    updateVideoList(videoList);

    if (!nickName || !age) {
        alert("User data is missing. Redirecting to login page.");
        window.location.href = '/pages/login-register.html';
        return;
    }

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

    // Generate age-specific sidebar

    var savedTopic = localStorage.getItem("selectedTopic");
        var selectedTopic;

        if (savedTopic) {
            // If a topic is saved in localStorage, use it
            selectedTopic = JSON.parse(savedTopic);
        } else {
            // Otherwise, select a random topic
            selectedTopic = {topic:'All Videos'};
            localStorage.setItem("selectedTopic", JSON.stringify(selectedTopic));
        }

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


        if(selectedQuizList =!null)
        {
            if(selectedQuizList.length > 0)
            {
                fetchQuestionsForSelectedPaths(selectedQuizList);
            }




        else{
       // fetch question based on users grade
       console.log("fetch question based on users grade");
       var questionRef = db.collectionGroup("questions").where("grade", "==", grade).limit(50);
       questionRef.get().then((querySnapshot) => {
        var questions = querySnapshot.docs.map(function (doc) {
            return doc.data();

        });

        localStorage.setItem("questions", JSON.stringify(questions));

    }).catch((error) => {
        console.log("Error getting documents: ", error);
    });
        }}

});
function fetchQuestionsForSelectedPaths(selectedQuizList) {

    var db = firebase.firestore();
    var allQuestions = [];
    var fetchPromises = []; // Store all fetch promises

    for (var i = 0; i < selectedQuizList.length; i++) {
        (function(path) {
            var pathParts = path.split('/'); // Split path into hierarchy levels

            // Ensure the path has exactly 4 parts (Grade, Subject, Content, Subcontent)
            if (pathParts.length !== 4) {
                console.log("Invalid path structure: " + path);
                return;
            }

            var grade = pathParts[0];
            var subject = pathParts[1];
            var content = pathParts[2];
            var subcontent = pathParts[3];

            // Construct Firestore reference dynamically
            var questionsRef = db.collection('grades')
                .doc(grade)
                .collection('subjects')
                .doc(subject)
                .collection('contents')
                .doc(content)
                .collection('subcontents')
                .doc(subcontent)
                .collection('questions');

            // Fetch questions from Firestore
            var fetchPromise = questionsRef.get().then(function(querySnapshot) {
                if (querySnapshot.empty) {
                    console.log("No questions found for path: " + path);
                    return;
                }

                querySnapshot.forEach(function(doc) {
                    var questionData = doc.data();
                    var question = {
                        questionImage: questionData.questionImage || "",
                        createdAt: questionData.createdAt || "",
                        question: questionData.question || "",
                        options: Array.isArray(questionData.options) ? questionData.options.map(function(option) {
                            return {
                                text: option.text || "",
                                optionImage: option.optionImage || ""
                            };
                        }) : [],
                        correctAnswer: questionData.correctAnswer || 0
                    };
                    allQuestions.push(question);
                });
            }).catch(function(error) {
                console.log("Error fetching questions for path: " + path, error);
            });

            fetchPromises.push(fetchPromise);
        })(selectedQuizList[i]); // Immediately-invoked function expression (IIFE)
    }

    // Wait for all fetch operations to complete
    Promise.all(fetchPromises).then(function() {
        if (allQuestions.length > 0) {
            localStorage.setItem('questions', JSON.stringify(allQuestions));
            console.log('Questions saved to localStorage for selected paths.');
        } else {
            console.log('No questions retrieved for the selected paths.');
        }
    }).catch(function(error) {
        console.log("Error processing questions: ", error);
    });
}


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
                // Clear localStorage and sign out after Firestore update completes
                localStorage.clear();
                auth.signOut()
                    .then(function() {
                        console.log('User signed out successfully');
                        window.location.href = '/pages/login-register.html';
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
// Fetch videos from Firebase by topic
function fetchVideosFromFirebase(topic) {

    var age = localStorage.getItem('age');

    console.log("Retrieved Age:", age);
    console.log("Age Type:", typeof age);

    // Create a reference to the 'youtubeVideos' collection
    var videosRef = db.collection("youtubeVideos");
    let q;

    if (age) {
        if (topic === 'All Videos') {
            q = videosRef.where("ageGroup", "==", age).limit(50);
            console.log("Query for All Videos with Age:", age);
        } else {
            q = videosRef.where("topic", "==", topic).where("ageGroup", "==", age);
            console.log("Query for Topic:", topic, "and Age:", age);
        }

        // Get the documents that match the query
        q.get().then(function (querySnapshot) {
            if (!querySnapshot.empty) {
                var videos = querySnapshot.docs.map(function (doc) {
                    return doc.data();
                });
                console.log("Fetched Videos:", videos);
                // Save the fetched videos to localStorage
                localStorage.setItem("videoList", JSON.stringify(videos));
                updateVideoList(videos);

            } else {
                console.log("No videos found for topic:", topic);
            }
        }).catch(function (error) {
            console.error("Error Fetching Videos:", error);
        });
    } else {
        console.log("Age is null or undefined");
    }

    // Highlight the selected topic in the sidebar
    console.log("Highlighting Topic:", topic);
   // highlightSelectedTopic(topic);
}


// Highlight the selected topic
function highlightSelectedTopic(topic) {
    var sidebarLinks = document.querySelectorAll(".shortcut-links a");

    // Loop through all sidebar links
    Array.prototype.forEach.call(sidebarLinks, function (link) {
        var linkText = link.querySelector("p").textContent;

        if (linkText === topic) {
            link.style.color = "#ed3833"; // Highlight color
        } else {
            link.style.color = ""; // Reset color
        }
    });
}

// Select a random topic
function getRandomTopic() {
    var randomIndex = Math.floor(Math.random() * sideBarList.length);
    return sideBarList[randomIndex];
}

// Update video list
function updateVideoList(videos) {
    var listContainer = document.querySelector(".list-container");
    listContainer.innerHTML = ""; // Clear existing videos
if(videos != null)
    videos.forEach(function (video) {
        var videoElement = document.createElement("div");
        videoElement.classList.add("vid-list");

        // Select thumbnail resolution (prefer medium, fallback to default)
        var thumbnail = video.thumbnails && video.thumbnails.high ? video.thumbnails.medium : video.thumbnails && video.thumbnails.default;

        // Correctly append `enablejsapi=1` to the URL
        videoElement.innerHTML = "<a href='pages/play-video.html?videoId=" + video.videoId + "&enablejsapi=1'>" +
            "<img src='" + thumbnail + "' alt='' class='thumbnail'>" +
            "</a>" +
            "<div class='flex-div'>"  +
            "<div class='vid-info'>" +
            "<a href='pages/play-video.html?videoId=" + video.videoId + "' >" + video.title + "</a>" +
            "<p>" + video.channelTitle + "</p>" +
            "</div>" +
            "</div>";

        listContainer.appendChild(videoElement);
    });
}




